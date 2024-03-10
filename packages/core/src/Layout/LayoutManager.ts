import fs from 'fs-extra';
import path from 'path';
import { Layout, LayoutConfig, PageNjkAssets } from './Layout';
import * as logger from '../utils/logger';

const FRONTMATTER_NONE_ATTR = 'none';

export class LayoutManager {
  private config: LayoutConfig;
  private layoutsRootPath: string;
  private layouts: { [name: string]: Layout };

  constructor(config: LayoutConfig) {
    this.config = config;
    this.layoutsRootPath = path.join(config.rootPath, '_markbind', 'layouts');
    this.layouts = {};
  }

  /**
   * Flag all layouts for (re)generation when requested
   */
  removeLayouts(): void {
    this.layouts = {};
  }

  /**
   * Update layouts which have the provided filePaths as dependencies
   */
  updateLayouts(filePaths: string[]): Promise<void[]> {
    const layoutsToRegenerate = Object.entries(this.layouts)
      .filter(([, layout]) => layout.shouldRegenerate(filePaths));

    return Promise.all(layoutsToRegenerate.map(([name, layout]) => {
      this.layouts[name] = new Layout(layout.sourceFilePath, this.config);
      return this.layouts[name].generate();
    }));
  }

  generateLayoutIfNeeded(name: string): Promise<void> | undefined {
    if (this.layouts[name]) {
      return this.layouts[name].generatePromise;
    }

    const layoutPath = path.join(this.layoutsRootPath, name);
    if (!fs.existsSync(layoutPath)) {
      logger.error(`'${name}' layout does not exist`);
      return Promise.resolve();
    }

    this.layouts[name] = new Layout(layoutPath, this.config);
    this.layouts[name].generatePromise = this.layouts[name].generate();
    return this.layouts[name].generatePromise;
  }

  layoutHasPageNav(name: string): boolean {
    if (name === FRONTMATTER_NONE_ATTR) {
      return false;
    }

    return !!this.layouts[name] && !!this.layouts[name].layoutPageNavUuid;
  }

  combineLayoutWithPage(name: string,
                        pageContent: string,
                        pageNav: string,
                        pageIncludedFiles: Set<string>): string {
    if (name === FRONTMATTER_NONE_ATTR) {
      return pageContent;
    }

    if (!this.layouts[name]) {
      return pageContent;
    }

    return this.layouts[name].insertPage(pageContent, pageNav, pageIncludedFiles);
  }

  getLayoutPageNjkAssets(name: string): PageNjkAssets | {} {
    if (name === FRONTMATTER_NONE_ATTR || !this.layouts[name]) {
      return {};
    }

    return this.layouts[name].getPageNjkAssets();
  }
}
