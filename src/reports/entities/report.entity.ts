import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  AfterInsert,
  AfterRemove,
  AfterUpdate,
} from 'typeorm';

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  price: number;

  @Column()
  make: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column()
  lng: number;

  @Column()
  lat: number;

  @Column()
  mileage: number;

  @Column({ default: false })
  approved: boolean;

  @ManyToOne(() => User, (user) => user.reports)
  user: User;

  @AfterInsert()
  logInsert() {
    console.log('Insered report with id: ', this.id);
  }

  @AfterUpdate()
  logUpdate() {
    console.log('Updated report with id: ', this.id);
  }

  @AfterRemove()
  logRemove() {
    console.log('Removed report with id: ', this.id);
  }
}
