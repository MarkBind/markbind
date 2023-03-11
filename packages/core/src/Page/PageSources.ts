import clone from 'lodash/clone';

const _ = { clone };

interface Src {
  to: string,
  from?: string,
}

export interface DynamicSrc {
  to: string,
  asIfTo: string,
  from?: string,
}

export class PageSources {
  dynamicIncludeSrc: DynamicSrc[] = [];
  staticIncludeSrc: Src[] = [];
  missingIncludeSrc: Src[] = [];

  getDynamicIncludeSrc(): DynamicSrc[] {
    return _.clone(this.dynamicIncludeSrc);
  }

  addAllToSet(set: Set<String>): void {
    this.dynamicIncludeSrc.forEach(dependency => set.add(dependency.to));
    this.staticIncludeSrc.forEach(dependency => set.add(dependency.to));
    this.missingIncludeSrc.forEach(dependency => set.add(dependency.to));
  }
}
