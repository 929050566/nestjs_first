import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, SerializeOptions, UseInterceptors, ValidationPipe } from "@nestjs/common";
import { PostService } from "../services/post.service";
import { PaginateOptions } from "@/modules/database/types";
import { AppIntercepter } from "@/modules/core/prividers/app.interceptor";
import { CreatePostDto, QueryPostDto, UpdatePostDto } from "../dtos/post.dto";

// src/modules/content/controllers/post.controller.ts	
// @UseInterceptors(AppIntercepter)
@Controller('posts')
export class PostController {
    constructor(protected service: PostService) {}

    @Get()
    @SerializeOptions({ groups: ['post-list']})
    async list(
        @Query()
        options: QueryPostDto,
    ) {
        return this.service.paginate(options);
    }

    @Get(':id')
    @SerializeOptions({ groups: ['post-detail']})
    async detail(
        @Param('id', new ParseUUIDPipe())
        id: string,
    ) {
        return this.service.detail(id);
    }

    @Post()
    @SerializeOptions({ groups: ['post-detail']})
    async store(
        @Body()
        data: CreatePostDto,
    ) {
        return this.service.create(data);
    }

    @Patch()
    @SerializeOptions({ groups: ['post-detail']})
    async update(
        @Body()
        data: UpdatePostDto,
    ) {
        return this.service.update(data);
    }

    @Delete(':id')
    @SerializeOptions({ groups: ['post-detail']})
    async delete(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.service.delete(id);
    }
}