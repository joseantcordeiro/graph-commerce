import { Node } from 'neo4j-driver';

export class Organization {
  constructor(private readonly node: Node) {}

  getId() {
    return this.node.properties.id;
  }

  getName() {
    return this.node.properties.name;
  }

  toJson() {
    return {
      ...this.node.properties,
    };
  }
}
