import { Injectable } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j";
import { Category } from "./entity/category.entity";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { toNativeTypes } from "@graph-commerce/common";

@Injectable()
export class CategoryService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async create(properties: CreateCategoryDto): Promise<unknown> {
    const res = await this.neo4jService.write(
      `
      MATCH (o:Organization { id: $properties.organizationId })
      WITH o, randomUUID() AS uuid
      CREATE (c:Category { id: uuid })
      SET c += $properties
      CREATE (c)-[r:BELONGS_TO { createdBy: $userId, createdAt: datetime(), active: true, deleted: false }]->(o)

      RETURN c {
        .*,
        active: r.active,
        deleted: r.deleted,
        createdBy: r.createdBy,
        createdAt: r.createdAt
      } AS category
    `,
      { properties },
    );
    return res.records.length ? toNativeTypes(res.records[0].get('category')) : false;
  }

  async get(eventId: string): Promise<unknown> {
    const res = await this.neo4jService.read(
      `
      MATCH (c:Category)-[:BELONGS_TO { active: true, deleted: false }]->(e:Event { id: $eventId })
      RETURN c
    `,
      { eventId },
    );
    return res.records.length ? res.records.map((row) => new Category(row.get('c'))) : false;
  }

  async update(categoryId: string, properties: CreateCategoryDto): Promise<unknown> {
    const res = await this.neo4jService.write(
      `
      MATCH (c:Category { id: $categoryId })
      SET c += $properties
      RETURN c {
        .*,
        active: r.active,
        updatedAt: r.updatedAt
      } AS category
    `,
      { categoryId, properties },
    );
    return res.records.length ? toNativeTypes(res.records[0].get('category')) : false;
  }

  async delete(categoryId: string): Promise<unknown> {
    const res = await this.neo4jService.write(
      `
      MATCH (c:Category { id: $categoryId })-[r:BELONGS_TO]->(e:Event)
      SET r.deleted = true
      RETURN c {
        .*,
        deleted: r.deleted
      } AS category
    `,
      { categoryId },
    );
    return res.records.length ? toNativeTypes(res.records[0].get('category')) : false;
  }

}
