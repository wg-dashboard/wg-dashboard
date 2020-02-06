import {SessionEntity} from "typeorm-store";
import {BaseEntity, Column, Entity, PrimaryColumn} from "typeorm";

@Entity()
export class Session extends BaseEntity implements SessionEntity {
	@PrimaryColumn()
	id!: string;

	@Column()
	expiresAt!: number;

	@Column()
	data!: string;
}
