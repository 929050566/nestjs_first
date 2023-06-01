import { PostEntity } from "../entities/post.entity";

// src/modules/content/types.ts
export type SearchType = 'like' | 'against' | 'elastic';

// src/modules/content/types.ts
export interface ContentConfig {
    searchType?: SearchType;
}

// src/config/content.config.ts
export const content = (): ContentConfig => ({
    searchType: 'elastic',
});

// src/modules/content/types.ts
export type PostSearchBody = Pick<ClassToPlain<PostEntity>, 'title' | 'body' | 'summary'> & {
    // categories: string;
};