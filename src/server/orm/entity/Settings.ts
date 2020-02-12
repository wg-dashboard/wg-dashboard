import {Column, PrimaryColumn, Index, Entity} from "typeorm";

@Entity()
export class Settings {
	@PrimaryColumn()
	@Index({unique: true})
	key!: string;

	@Column()
	value!: string;
}
