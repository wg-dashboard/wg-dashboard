import {Column, PrimaryGeneratedColumn, Index, Entity} from "typeorm";

@Entity()
export class Peer {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	active!: boolean;

	@Index({unique: true})
	@Column()
	device!: string;

	@Column()
	public_key!: string;

	@Column()
	private_key!: string;

	@Column()
	virtual_ip!: string;
}
