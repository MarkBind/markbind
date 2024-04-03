// eslint-disable-next-line max-classes-per-file
import * as cheerio from 'cheerio';
import * as logger from './logger';

const rules: Rule[] = [];

export function validateHtmlWithRules(content: string, path: string): void {
  const $ = cheerio.load(content);
  rules.forEach((rule) => {
    rule.validateAndLog($, path);
  });
}

class Rule {
  description: string = '';
  causeHydration: boolean = false;
  // eslint-disable-next-line lodash/prefer-constant
  isValidDom: (rootNode: cheerio.Root) => boolean = () => true;
  validateAndLog(rootNode: cheerio.Root, path: string) {
    if (!this.isValidDom(rootNode)) {
      if (this.causeHydration) {
        logger.error(`Invalid HTML in ${path}. ${this.description}`);
      } else {
        logger.warn(`Invalid HTML in ${path}. ${this.description}`);
      }
    }
  }
}

class RuleBuilder {
  rule: Rule = new Rule();

  causeHydration(causeHydration: boolean = true) {
    this.rule.causeHydration = causeHydration;
    return this;
  }

  description(description: string) {
    this.rule.description = description;
    return this;
  }

  validator(Validator: (rootNode: cheerio.Root) => boolean) {
    this.rule.isValidDom = Validator;
    return this;
  }

  pushRuleAndReset() {
    rules.push(this.rule);
    this.rule = new Rule();
  }

  reset() {
    this.rule = new Rule();
  }
}

const ruleBuilder = new RuleBuilder();

// To add a new rule, use the following template:
ruleBuilder.description('Table must have a tbody tag')
  .causeHydration(true)
  .validator((rootNode: cheerio.Root) => {
    const tables = rootNode('table');
    for (let i = 0; i < tables.length; i += 1) {
      const table = rootNode(tables[i]);
      if (table.find('tbody').length === 0) {
        return false;
      }
    }
    return true;
  })
  .pushRuleAndReset();
