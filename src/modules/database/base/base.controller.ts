import { ListWithTrashedQueryDto } from '@/modules/content/restful/query.dto';
import { Body, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { BaseService } from './base.service';
import { BaseEntity } from 'typeorm';
import { BaseRepository } from './base.repository';
import { DeleteDto } from '@/modules/content/dtos/delete.dto';
import {
  DeleteWithTrashDto,
  RestoreDto,
} from '@/modules/content/dtos/deletewithtrash.dto';

/**
 * 基础控制器
 */
export abstract class BaseController<
  S extends BaseService<BaseEntity, BaseRepository<BaseEntity>>,
> {
  protected service: S;

  constructor(service: S) {
    this.setService(service);
  }

  private setService(service: S) {
    this.service = service;
  }

  async list(@Query() options: ListWithTrashedQueryDto, ...args: any[]) {
    return (this.service as any).paginate(options);
  }

  async detail(
    @Param('id', new ParseUUIDPipe())
    id: string,
    ...args: any[]
  ) {
    return this.service.detail(id);
  }

  async store(
    @Body()
    data: any,
    ...args: any[]
  ) {
    return (this.service as any).create(data);
  }

  async update(
    @Body()
    data: any,
    ...args: any[]
  ) {
    return (this.service as any).update(data);
  }

  async delete(
    @Body()
    { ids }: DeleteDto,
    ...args: any[]
  ) {
    return (this.service as any).delete(ids);
  }
}

/**
 * 带软删除验证的控制器
 */
export abstract class BaseControllerWithTrash<
  S extends BaseService<BaseEntity, BaseRepository<BaseEntity>>,
> {
  protected service: S;

  constructor(service: S) {
    this.setService(service);
  }

  private setService(service: S) {
    this.service = service;
  }
  // ...
  async list(@Query() options: ListWithTrashedQueryDto, ...args: any[]) {
    return this.service.paginate(options);
  }

  async delete(
    @Body()
    { ids, trash }: DeleteWithTrashDto,
    ...args: any[]
  ) {
    return (this.service as any).delete(ids, trash);
  }

  async restore(
    @Body()
    { ids }: RestoreDto,
    ...args: any[]
  ) {
    return (this.service as any).restore(ids);
  }
}
