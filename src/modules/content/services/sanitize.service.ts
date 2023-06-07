import { Injectable } from "@nestjs/common";
import { merge } from "lodash";
import sanitizeHtml from "sanitize-html";

@Injectable()
export class SanitizeService {
    protected config: sanitizeHtml.IOptions = {};
    constructor() {
        this.config = {
            allowedTags: ['img', 'code'],
            allowedAttributes: {
                '*': ['class', 'style', 'height', 'width'],
            },
            parser: {
                lowerCaseTags: true,
            },
        };
    }
    sanitize(body: string, options?: sanitizeHtml.IOptions) {
        return sanitizeHtml(
            body,
            this.config
        );
    }
}