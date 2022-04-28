import { Node } from 'neo4j-driver';

export class Channel {
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
