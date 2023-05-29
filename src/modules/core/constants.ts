// src/modules/core/constants.ts
/**
 * DTOValidation装饰器选项
 */
export const DTO_VALIDATION_OPTIONS = 'dto_validation_options';

// src/modules/database/constants.ts
/**
 * 软删除数据查询类型
 */
export enum SelectTrashMode{
    ALL = 'all',
    ONLY = 'only',
    NONE = 'none',
}