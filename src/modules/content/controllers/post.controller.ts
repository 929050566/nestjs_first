import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, SerializeOptions, UseInterceptors, ValidationPipe } from "@nestjs/common";
import { PostService } from "../services/post.service";
import { PaginateOptions } from "@/modules/database/types";
import { AppIntercepter } from "@/modules/core/prividers/app.interceptor";

// src/modules/content/controllers/post.controller.ts	
@UseInterceptors(AppIntercepter)
@Controller('posts')
export class PostController {
    constructor(protected service: PostService) {}

    @Get()
    @SerializeOptions({ groups: ['post-list']})
    async list(
        @Query(
            new ValidationPipe({
                transform: true,
                forbidUnknownValues: true,
                validationError: {target: false},
            })
        )
        options: PaginateOptions,
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
        @Body(
            new ValidationPipe({
                transform: true,
                forbidUnknownValues: true,
                validationError: {target: false},
                groups:['create'],
            })
        )
        data: Record<string, any>,
    ) {
        return this.service.create(data);
    }

    @Patch()
    @SerializeOptions({ groups: ['post-detail']})
    async update(
        @Body(
            new ValidationPipe({
                transform: true,
                forbidUnknownValues: true,
                validationError: { target: false },
                groups: ['update'],
            }),
        )
        data: Record<string, any>,
    ) {
        return this.service.update(data);
    }

    @Delete(':id')
    @SerializeOptions({ groups: ['post-detail']})
    async delete(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.service.delete(id);
    }
}