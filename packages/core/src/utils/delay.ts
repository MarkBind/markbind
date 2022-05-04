import Promise from 'bluebird';

/**
* Creates a function that delays invoking `func` until after `wait` milliseconds have elapsed
* and the running `func` has resolved/rejected.
* @param func the promise-returning function to delay,
*        func should take in a single array
* @param wait the number of milliseconds to delay
* @returns delayedFunc that takes in a single argument (either an array or a single value)
*/
export function delay<T>(func: (arg: T[]) => Promise<unknown>, wait: number) {
  let context: any;
  let pendingArgs: T[] = [];
  let runningPromise: Promise<unknown> = Promise.resolve();
  let waitingPromise: Promise<unknown> | null = null;

  return function (this: any, arg: T | T[]) {
    context = this;
    if (Array.isArray(arg)) {
      pendingArgs = pendingArgs.concat(arg);
    } else {
      pendingArgs.push(arg);
    }

    if (waitingPromise === null) {
      waitingPromise = Promise.all([Promise.delay(wait), runningPromise])
        .then(() => {
          runningPromise = waitingPromise || Promise.resolve();
          waitingPromise = null;
          const funcPromise = func.apply(context, [pendingArgs]);
          pendingArgs = [];
          return funcPromise;
        });
    }

    return waitingPromise;
  };
}
