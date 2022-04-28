import { Node } from 'neo4j-driver';

export class Person {
  constructor(private readonly node: Node) {}

  getId(): string {
    return (<Record<string, any>>this.node.properties).id;
  }

  getName(): string {
    return (<Record<string, any>>this.node.properties).name;
  }

	getEmail(): string {
    return (<Record<string, any>>this.node.properties).email;
  }

  toJson() {
    return {
      ...this.node.properties,
    };
  }
}
