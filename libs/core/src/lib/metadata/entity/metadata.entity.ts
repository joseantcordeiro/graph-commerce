import { Node } from "neo4j-driver";

export class Metadata {
  constructor(private readonly node: Node) {}

  value() {
    return this.node.properties.value;
  }

  key() {
    return this.node.properties.key;
  }

	toJson() {
    return {
      ...this.node.properties,
    };
  }
}
