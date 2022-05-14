export class ID {
  stage: string;
  prefix: string;

  constructor(stage: string, prefix: string) {
    this.prefix = prefix;
    this.stage = stage;
  }

  gen(name: string): string {
    return `${this.stage}-${this.prefix}-${name}`;
  }
}
