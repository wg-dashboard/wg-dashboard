import {Index, Column, PrimaryGeneratedColumn, Entity} from "typeorm";

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id!: number;

	@Index({unique: true})
	@Column()
	name!: string;

	@Column()
	password!: string;

	@Column()
	admin!: boolean;
}
