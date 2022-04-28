import { Injectable } from '@nestjs/common';
import { Document, MeiliSearch, EnqueuedTask } from 'meilisearch';
import { InjectMeiliSearch } from './decorator/search.decorator';
import { CreateIndexDto } from './dto/createindex.dto';

@Injectable()
export class SearchService {
  constructor(
    @InjectMeiliSearch() private readonly meiliSearchClient: MeiliSearch,
  ) {}

	async health(): Promise<any> {
		return this.meiliSearchClient.health();
	}

	async getIndexDocuments(index: string): Promise<any> {
		return (await this.meiliSearchClient.getIndex(index)).getDocuments();
	}

	async addIndex(properties: CreateIndexDto): Promise<EnqueuedTask> {
		const uid = properties.uid;
		const primaryKey = properties.primaryKey;
		return this.meiliSearchClient.createIndex(uid, { primaryKey: primaryKey });
	}

  async addDocuments(
    index: string,
    documents: Array<Document<any>>,
  ): Promise<any> {
		return this.meiliSearchClient.index(index).addDocuments(documents);
  }

  async getDocuments(index: string): Promise<any> {
    return (await this.meiliSearchClient.getIndex(index)).getDocuments();
  }

  async updateDocuments(
    index: string,
    documents: Array<Document<any>>,
  ): Promise<EnqueuedTask> {
    return this.meiliSearchClient.index(index).updateDocuments(documents);
  }

  async deleteDocument(index: string, docId: string | number): Promise<EnqueuedTask> {
    return this.meiliSearchClient.index(index).deleteDocument(docId);
  }

	async getTasks(): Promise<any> {
		return this.meiliSearchClient.getTasks();
	}

	async getTask(taskId: number): Promise<any> {
		return this.meiliSearchClient.getTask(taskId);
	}

	async getIndexTasks(indexId: string): Promise<any> {
		return this.meiliSearchClient.index(indexId).getTasks();
	}

	async getIndexTask(indexId: string, taskId: number): Promise<any> {
		return this.meiliSearchClient.index(indexId).getTask(taskId);
	}

	async deleteIndex(indexId: string): Promise<EnqueuedTask> {
		return this.meiliSearchClient.deleteIndex(indexId);
	}

	async searchDocuments(indexId: string, query: string): Promise<any> {
		return this.meiliSearchClient.index(indexId).search(query, { filter: ['deleted = false'] });
	}

	async getSearchableAttributes(indexId: string): Promise<any> {
		return this.meiliSearchClient.index(indexId).getSearchableAttributes();
	}

	async setSearchableAttributes(indexId: string, attributes: Array<string>): Promise<any> {
		return this.meiliSearchClient.index(indexId).updateSearchableAttributes(attributes);
	}

	async resetSearchableAttributes(indexId: string): Promise<any> {
		return this.meiliSearchClient.index(indexId).resetSearchableAttributes();
	}

	async getFilterableAttributes(indexId: string): Promise<any> {
		return this.meiliSearchClient.index(indexId).getFilterableAttributes();
	}

	async setFilterableAttributes(indexId: string, attributes: Array<string>): Promise<any> {
		return this.meiliSearchClient.index(indexId).updateFilterableAttributes(attributes);
	}

	async resetFilterableAttributes(indexId: string): Promise<any> {
		return this.meiliSearchClient.index(indexId).resetFilterableAttributes();
	}

}
