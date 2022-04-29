import { Node } from 'neo4j-driver';
/**
 * @class Category
 * @description Category entity
 * A ticket category is a group of tickets. You may want to define different categories if:
 *
 * The ticket price changes over time. E.g. “Blind Bird”, “Early Bird”, “Full Price”
 * You have different prices for members/non-members of your association
 *
 * At least one category is required to sell/distribute tickets. To add it, click on the “Add new” button.
 *
 * @param {Node} node
 * @returns {Category}
 * @constructor
 * @memberof module:libs/tickets/src/lib/category/entity
 * @see {@link https://neo4j.com/docs/api/java-driver/current/org/neo4j/driver/v1/types/Node.html}
 */
export class Category {
  constructor(private readonly node: Node) {}

  toJson() {
    return {
      ...this.node.properties,
    };
  }
}
