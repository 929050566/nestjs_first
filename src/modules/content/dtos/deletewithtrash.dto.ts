// src/modules/restful/dtos

import { DtoValidation } from "@/modules/core/decorators/dto-validation.decorator";
import { DeleteDto } from "./delete.dto";
import { toBoolean } from "@/modules/core/helpers";
import { Transform } from "class-transformer";
import { IsBoolean, IsDefined, IsOptional, IsUUID } from "class-validator";

/**
 * 带软删除的批量删除验证
 */
@DtoValidation()
export class DeleteWithTrashDto extends DeleteDto {
    @Transform(({ value }) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    trash?: boolean;
}

/**
 * 批量恢复验证
 */
@DtoValidation()
export class RestoreDto {
    @IsUUID(undefined, {
        each: true,
        message: 'ID格式错误',
    })
    @IsDefined({
        each: true,
        message: 'ID必须指定',
    })
    ids: string[] = [];
}