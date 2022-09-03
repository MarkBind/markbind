import clone from 'lodash/clone';

const _ = { clone };

interface Src {
  to: string,
}

export class PageSources {
  dynamicIncludeSrc: Src[] = [];
  staticIncludeSrc: Src[] = [];
  missingIncludeSrc: Src[] = [];

  getDynamicIncludeSrc(): Src[] {
    return _.clone(this.dynamicIncludeSrc);
  }

  addAllToSet(set: Set<String>): void {
    this.dynamicIncludeSrc.forEach(dependency => set.add(dependency.to));
    this.staticIncludeSrc.forEach(dependency => set.add(dependency.to));
    this.missingIncludeSrc.forEach(dependency => set.add(dependency.to));
  }
}
