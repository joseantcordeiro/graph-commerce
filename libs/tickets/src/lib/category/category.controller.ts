import { AuthGuard, Role, Roles, RolesGuard } from "@graph-commerce/auth";
import { Body, CacheInterceptor, Controller, Delete, HttpException, HttpStatus, Param, Patch, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";

@Controller('team')
@UseInterceptors(CacheInterceptor)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(Role.MANAGE_EVENTS)
  @UseGuards(RolesGuard)
  async postCategory(@Body() properties: CreateCategoryDto) {
    const category = await this.categoryService.create(properties);
    if (category !== false) {
      return category;
    }
    throw new HttpException('Category couldn\'t be created', HttpStatus.NOT_MODIFIED);
  }

  @Patch(':categoryId')
  @UseGuards(AuthGuard)
  @Roles(Role.MANAGE_EVENTS)
  @UseGuards(RolesGuard)
  async updateCategory(
    @Param('categoryId') categoryId: string,
    @Body() properties: CreateCategoryDto) {
    const category = await this.categoryService.update(categoryId, properties);
    if (category !== false) {
      return category;
    }
    throw new HttpException('Category couldn\'t be updated', HttpStatus.NOT_MODIFIED);
  }

  @Delete(':categoryId')
  @UseGuards(AuthGuard)
  @Roles(Role.MANAGE_EVENTS)
  @UseGuards(RolesGuard)
  async deleteCategory(@Param('categoryId') categoryId: string) {
    const category = await this.categoryService.delete(categoryId);
    if (category !== false) {
      return category;
    }
    throw new HttpException('Category couldn\'t be deleted', HttpStatus.NOT_MODIFIED);
  }

}
