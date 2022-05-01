import { Node } from 'neo4j-driver';
import { Person } from '../../person/entity/person.entity';

export class Team {
  constructor(private readonly node: Node) {}

  toJson() {
    return {
      ...this.node.properties,
    };
  }

}
