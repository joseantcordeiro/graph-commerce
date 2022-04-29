import { Node } from 'neo4j-driver';

export class Ticket {
  constructor(private readonly node: Node) {}

  toJson() {
    return {
      ...this.node.properties,
    };
  }
}
