import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("password_reset_tokens")
export class PasswordResetToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  token: string;

  @Column()
  expiresAt: Date;
}