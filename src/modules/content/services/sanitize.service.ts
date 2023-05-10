import { Injectable } from "@nestjs/common";
import sanitizeHtml from "sanitize-html";
import {merge} from "lodash";


 // src/modules/content/services/sanitize.service.ts
 @Injectable()
 export class SanitizeService {
     protected config: sanitizeHtml.IOptions = {};
 
     constructor() {
         this.config = {
             allowedTags: ['img', 'code'],
             allowedAttributes: {
                 '*': ['class', 'style', 'height', 'width']
             },
             parser: {
                 lowerCaseTags: true,
             },
         };
     }
 
     sanitize(body: string, options?: sanitizeHtml.IOptions) {
         return sanitizeHtml(
             body,
             merge(this.config, options ?? {}, {
                 arrayMerge: (_d, s, _o) => s,
             }),
         );
     }
 }