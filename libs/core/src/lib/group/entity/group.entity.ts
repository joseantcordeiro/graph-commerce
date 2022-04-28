import { Node } from 'neo4j-driver';

export class Group {
  constructor(private readonly node: Node) {}

	getId() {
		return this.node.properties.id;
	}

  toJson() {
    return {
      ...this.node.properties,
    };
  }
}
