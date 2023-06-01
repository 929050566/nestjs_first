import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { PostEntity } from "../entities/post.entity";
import { PostSearchBody } from "../types/types";
import { pick } from "lodash";
import { instanceToPlain } from "class-transformer";
import { PostBodyType } from "../constants";

// src/modules/content/services/search.service.ts
@Injectable()
export class SearchService {
    index = 'post';

    constructor(protected esService: ElasticsearchService) {}

    /**
     * 根据传入的字符串搜索文章
     * @param text
     */
    async search(text: string) {
        this.esService.bulk
        const { hits } = await this.esService.search<PostEntity>({
            index: this.index,
            query: {
                multi_match: { query: text, fields: ['node'] },
                // multi_match: { query: text, fields: ['title', 'body', 'summary', 'categories'] },
            },
        });
        return hits.hits.map((item) => item._source);
    }

    /**
     * 当创建一篇文章时创建它的es索引
     * @param post
     */
    async create(post: PostEntity) : Promise<any> {
        this.esService.indices.create({
            index: "test",
            body: {
              mappings: {
                properties: {
                  '@timestamp': {
                    type: 'date',
                  },
                  budget: {
                    type: 'long',
                  },
                  genres: {
                    type: 'text',
                  },
                  homepage: {
                    type: 'keyword',
                  },
                  id: {
                    type: 'long',
                  },
                  keywords: {
                    type: 'text',
                  },
                  original_language: {
                    type: 'keyword',
                  },
                  original_title: {
                    type: 'text',
                  },
                  overview: {
                    type: 'text',
                  },
                  popularity: {
                    type: 'double',
                  },
                  production_companies: {
                    type: 'text',
                  },
                  production_countries: {
                    type: 'text',
                  },
                  release_date: {
                    type: 'date',
                    format: 'iso8601',
                  },
                  revenue: {
                    type: 'long',
                  },
                  runtime: {
                    type: 'long',
                  },
                  spoken_languages: {
                    type: 'text',
                  },
                  status: {
                    type: 'keyword',
                  },
                  tagline: {
                    type: 'text',
                  },
                  title: {
                    type: 'text',
                  },
                  vote_average: {
                    type: 'double',
                  },
                  vote_count: {
                    type: 'long',
                  },
                },
              },
            },
        });
        return this.esService.index<PostSearchBody>({
            index: this.index,
            document: {
                ...pick(instanceToPlain(post), ['id', 'title', 'body', 'summary'])
            },
        });
    }

    /**
     * 更新文章时更新它的es字段
     * @param post
     */
    async update(post: PostEntity): Promise<any> {
        const newBody: PostSearchBody = {
            ...pick(instanceToPlain(post), ['title', 'body', 'author', 'summary'])
        };
        const script = Object.entries(newBody).reduce(
            (result, [key, value]) => `${result} ctx._source.${key}=>'${value}';`,
            '',
        );
        return this.esService.updateByQuery({
            index: this.index,
            query: { match: { id: post.id } },
            script,
        });
    }

    /**
     * 删除文章的同时在es中删除这篇文章
     * @param postId
     */
    async remove(postId: string): Promise<any> {
        return this.esService.deleteByQuery({
            index: this.index,
            query: { match: { id: postId } },
        });
    }
}