/* eslint-disable */
/*
 * Patch #1 for node-progress to fix display issue in certain terminals.
 * Issue related: https://github.com/MarkBind/markbind/issues/416
 * The **only** changes are based on the following PR and its comments:
 * https://github.com/visionmedia/node-progress/pull/168
 * As the above PR is not merged since 2017, this is a temporary patch
 * to fix the issue for markbind's usecase.
 */

/*
 * Patch #2 for node-progress to allow logging without disturbing the progress bar.
 * The changes are based on the following PR:
 * https://github.com/visionmedia/node-progress/pull/155
 */

/*
 * Patch #3 Rewrite the progress bar into TypeScript and make it ESM compatible.
 */

/*!
 * node-progress
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

import { WriteStream } from 'tty';

/**
 * Progress bar options interface
 */
export interface ProgressBarOptions {
  /** Current completed index */
  curr?: number;
  /** Total number of ticks to complete */
  total: number;
  /** The displayed width of the progress bar defaulting to total */
  width?: number;
  /** The output stream defaulting to stderr */
  stream?: NodeJS.WriteStream;
  /** Head character defaulting to complete character */
  head?: string;
  /** Completion character defaulting to "=" */
  complete?: string;
  /** Incomplete character defaulting to "-" */
  incomplete?: string;
  /** Minimum time between updates in milliseconds defaulting to 16 */
  renderThrottle?: number;
  /** Optional function to call when the progress bar completes */
  callback?: (progressBar: ProgressBar) => void;
  /** Will clear the progress bar upon termination */
  clear?: boolean;
  /** Optional boolean to force stderr to be TTY */
  forceTTY?: boolean;
}

/**
 * Token object for progress bar template replacement
 */
export interface ProgressBarTokens {
  [key: string]: string | number;
}

/**
 * Character configuration for progress bar display
 */
interface ProgressBarChars {
  complete: string;
  incomplete: string;
  head: string;
}

/**
 * ProgressBar class for displaying progress in terminal
 * 
 * Tokens:
 *   - `:bar` the progress bar itself
 *   - `:current` current tick number
 *   - `:total` total ticks
 *   - `:elapsed` time elapsed in seconds
 *   - `:percent` completion percentage
 *   - `:eta` eta in seconds
 *   - `:rate` rate of ticks per second
 */
export class ProgressBar {
  public fmt: string;
  public curr: number;
  public total: number;
  public width: number;
  public clear: boolean;
  public chars: ProgressBarChars;
  public renderThrottle: number;
  public lastRender: number;
  public callback: (progressBar: ProgressBar) => void;
  public tokens: ProgressBarTokens;
  public lastDraw: string;
  public stream: NodeJS.WriteStream;
  public start?: Date;
  public complete?: boolean;

  /**
   * Initialize a ProgressBar with the given format string and options
   * @param fmt Format string for the progress bar
   * @param options Configuration options or total number
   */
  constructor(fmt: string, options: ProgressBarOptions | number) {
    // Handle options parameter - can be number (total) or options object
    let opts: ProgressBarOptions;
    if (typeof options === 'number') {
      opts = { total: options };
    } else {
      opts = options || {} as ProgressBarOptions;
      if (typeof fmt !== 'string') throw new Error('format required');
      if (typeof opts.total !== 'number') throw new Error('total required');
    }

    this.stream = opts.stream || process.stderr;

    // patch #1
    // options.forceTTY is undefined in git-bash on mintty Windows
    if (!process.stderr.isTTY) {
      const tty = WriteStream.prototype;
      Object.getOwnPropertyNames(tty).forEach((key: string) => {
        (process.stderr as any)[key] = (tty as any)[key];
      });
      (process.stderr as any).columns = 80;
    } // end patch

    this.fmt = fmt;
    this.curr = opts.curr || 0;
    this.total = opts.total;
    this.width = opts.width || this.total;
    this.clear = opts.clear || false;
    this.chars = {
      complete: opts.complete || '=',
      incomplete: opts.incomplete || '-',
      head: opts.head || (opts.complete || '=')
    };
    this.renderThrottle = opts.renderThrottle !== 0 ? (opts.renderThrottle || 16) : 0;
    this.lastRender = -Infinity;
    this.callback = opts.callback || (() => {});
    this.tokens = {};
    this.lastDraw = '';
  }

  /**
   * "tick" the progress bar with optional `len` and optional `tokens`.
   * @param len Length to increment or tokens object
   * @param tokens Optional tokens for template replacement
   */
  public tick(len?: number | ProgressBarTokens, tokens?: ProgressBarTokens): void {
    let increment: number = 1;
    
    if (len !== 0) {
      increment = (typeof len === 'number' ? len : 1) || 1;
    }

    // swap tokens
    if (typeof len === 'object') {
      tokens = len;
      increment = 1;
    }
    if (tokens) this.tokens = tokens;

    // start time for eta
    if (this.curr === 0) this.start = new Date();

    this.curr += increment;

    // try to render
    this.render();

    // progress complete
    if (this.curr >= this.total) {
      this.render(undefined, true);
      this.complete = true;
      this.terminate();
      this.callback(this);
      return;
    }
  }

  /**
   * Method to render the progress bar with optional `tokens` to place in the
   * progress bar's `fmt` field.
   * @param tokens Optional tokens for template replacement
   * @param force Force rendering even if throttled
   */
  public render(tokens?: ProgressBarTokens, force?: boolean): void {
    const forceRender = force !== undefined ? force : false;
    if (tokens) this.tokens = tokens;

    if (!this.stream.isTTY) return;

    const now = Date.now();
    const delta = now - this.lastRender;
    if (!forceRender && (delta < this.renderThrottle)) {
      return;
    } else {
      this.lastRender = now;
    }

    let ratio = this.curr / this.total;
    ratio = Math.min(Math.max(ratio, 0), 1);

    const percent = Math.floor(ratio * 100);
    let incomplete: string, complete: string, completeLength: number;
    const elapsed = this.start ? new Date().getTime() - this.start.getTime() : 0;
    const eta = (percent === 100) ? 0 : elapsed * (this.total / this.curr - 1);
    const rate = this.curr / (elapsed / 1000);

    /* populate the bar template with percentages and timestamps */
    let str = this.fmt
      .replace(':current', this.curr.toString())
      .replace(':total', this.total.toString())
      .replace(':elapsed', isNaN(elapsed) ? '0.0' : (elapsed / 1000).toFixed(1))
      .replace(':eta', (isNaN(eta) || !isFinite(eta)) ? '0.0' : (eta / 1000).toFixed(1))
      .replace(':percent', percent.toFixed(0) + '%')
      .replace(':rate', Math.round(rate).toString());

    /* compute the available space (non-zero) for the bar */
    let availableSpace = Math.max(0, (this.stream as any).columns - str.replace(':bar', '').length);
    if (availableSpace && process.platform === 'win32') {
      availableSpace = availableSpace - 1;
    }

    const width = Math.min(this.width, availableSpace);

    /* TODO: the following assumes the user has one ':bar' token */
    completeLength = Math.round(width * ratio);
    complete = Array(Math.max(0, completeLength + 1)).join(this.chars.complete);
    incomplete = Array(Math.max(0, width - completeLength + 1)).join(this.chars.incomplete);

    /* add head to the complete string */
    if (completeLength > 0) {
      complete = complete.slice(0, -1) + this.chars.head;
    }

    /* fill in the actual progress bar */
    str = str.replace(':bar', complete + incomplete);

    /* replace the extra tokens */
    if (this.tokens) {
      for (const key in this.tokens) {
        str = str.replace(':' + key, this.tokens[key].toString());
      }
    }

    if (this.lastDraw !== str) {
      (this.stream as any).cursorTo(0);
      this.stream.write(str);
      (this.stream as any).clearLine(1);
      this.lastDraw = str;
    }
  }

  /**
   * "update" the progress bar to represent an exact percentage.
   * The ratio (between 0 and 1) specified will be multiplied by `total` and
   * floored, representing the closest available "tick." For example, if a
   * progress bar has a length of 3 and `update(0.5)` is called, the progress
   * will be set to 1.
   *
   * A ratio of 0.5 will attempt to set the progress to halfway.
   * @param ratio The ratio (between 0 and 1 inclusive) to set the overall completion to
   * @param tokens Optional tokens for template replacement
   */
  public update(ratio: number, tokens?: ProgressBarTokens): void {
    const goal = Math.floor(ratio * this.total);
    const delta = goal - this.curr;

    this.tick(delta, tokens);
  }

  /**
   * "interrupt" the progress bar and write a message above it.
   * @param message The message to write
   */
  public interrupt(message: string): void {
    // clear the current line
    (this.stream as any).clearLine();
    // move the cursor to the start of the line
    (this.stream as any).cursorTo(0);
    // write the message text
    this.stream.write(message);
    // terminate the line after writing the message
    this.stream.write('\n');
    // re-display the progress bar with its lastDraw
    this.stream.write(this.lastDraw);
  }

  /**
   * Terminates a progress bar.
   */
  public terminate(): void {
    if (this.clear) {
      if ((this.stream as any).clearLine) {
        (this.stream as any).clearLine();
        (this.stream as any).cursorTo(0);
      }
    } else {
      this.stream.write('\n');
    }
  }

  // patch #2 Add interruptBegin & interruptEnd
  /**
   * Begin a interrupt so the user can manually write messages above the bar.
   */
  public interruptBegin(): void {
    (this.stream as any).clearLine();
    (this.stream as any).cursorTo(0);
  }

  /**
   * End a interrupt, rendering the last draw again.
   */
  public interruptEnd(): void {
    this.stream.write(this.lastDraw);
  } // end patch
}
