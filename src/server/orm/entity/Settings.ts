import {Column, PrimaryColumn, Entity} from "typeorm";

@Entity()
export class Settings {
	@PrimaryColumn()
	key!: string;

	@Column()
	value!: string;
}
