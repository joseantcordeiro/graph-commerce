import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { AuthGuard } from '@graph-commerce/auth';
import { CreateIndexDto } from './dto/createindex.dto';
import { SearchDocumentsDto } from './dto/searchdocument.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

	@Get()
	@UseGuards(AuthGuard)
	async get() {
		return this.searchService.health();
	}

	@Get('indexes/:index/documents')
	@UseGuards(AuthGuard)
	async getIndexDocuments(@Param('index') index: string) {
		return this.searchService.getIndexDocuments(index);
	}

	@Post('indexes')
	@UseGuards(AuthGuard)
	async addIndex(@Body() properties: CreateIndexDto) {
		return this.searchService.addIndex(properties);
	}

	@Post('indexes/:index/documents')
	@UseGuards(AuthGuard)
	async addDocuments(@Param('index') index: string, @Body() documents: any[]) {
		return this.searchService.addDocuments(index, documents);
	}

	@Get('indexes/:index/documents')
	@UseGuards(AuthGuard)
	async getDocuments(@Param('index') index: string) {
		return this.searchService.getDocuments(index);
	}

	@Get('tasks')
	@UseGuards(AuthGuard)
	async getTasks() {
		return this.searchService.getTasks();
	}

	@Get('tasks/:taskId')
	@UseGuards(AuthGuard)
	async getTask(@Param('taskId') taskId: number) {
		return this.searchService.getTask(taskId);
	}

	@Get('indexes/:indexId/tasks')
	@UseGuards(AuthGuard)
	async getIndexTasks(@Param('indexId') indexId: string) {
		return this.searchService.getIndexTasks(indexId);
	}

	@Get('indexes/:indexId/tasks/:taskId')
	@UseGuards(AuthGuard)
	async getIndexTask(@Param('indexId') indexId: string, @Param('taskId') taskId: number) {
		return this.searchService.getIndexTask(indexId, taskId);
	}

	@Get('indexes/:indexId/search')
	@UseGuards(AuthGuard)
	async search(@Param('indexId') indexId: string, @Query() query: SearchDocumentsDto) {
		return this.searchService.searchDocuments(indexId, query.q);
	}

	@Delete('indexes/:indexId')
	@UseGuards(AuthGuard)
	async deleteIndex(@Param('indexId') indexId: string) {
		return this.searchService.deleteIndex(indexId);
	}

	@Get('indexes/:indexId/settings/searchable-attributes')
	@UseGuards(AuthGuard)
	async getSearchableAttributes(@Param('indexId') indexId: string) {
		return this.searchService.getSearchableAttributes(indexId);
	}

	@Post('indexes/:indexId/settings/searchable-attributes')
	@UseGuards(AuthGuard)
	async setSearchableAttributes(@Param('indexId') indexId: string, @Body() attributes: string[]) {
		return this.searchService.setSearchableAttributes(indexId, attributes);
	}

	@Delete('indexes/:indexId/settings/searchable-attributes')
	@UseGuards(AuthGuard)
	async deleteSearchableAttributes(@Param('indexId') indexId: string) {
		return this.searchService.resetSearchableAttributes(indexId);
	}

	@Get('indexes/:indexId/settings/filterable-attributes')
	@UseGuards(AuthGuard)
	async getFilterableAttributes(@Param('indexId') indexId: string) {
		return this.searchService.getFilterableAttributes(indexId);
	}

	@Post('indexes/:indexId/settings/filterable-attributes')
	@UseGuards(AuthGuard)
	async setFilterableAttributes(@Param('indexId') indexId: string, @Body() attributes: string[]) {
		return this.searchService.setFilterableAttributes(indexId, attributes);
	}

	@Delete('indexes/:indexId/settings/filterable-attributes')
	@UseGuards(AuthGuard)
	async deleteFilterableAttributes(@Param('indexId') indexId: string) {
		return this.searchService.resetFilterableAttributes(indexId);
	}

}
