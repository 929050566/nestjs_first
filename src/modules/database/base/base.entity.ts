import { Expose } from 'class-transformer';
import { BaseEntity as TypeormBaseEntity, PrimaryGeneratedColumn } from 'typeorm';

export class MyBaseEntity extends TypeormBaseEntity {
    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id: string;
}