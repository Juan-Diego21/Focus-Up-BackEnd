import { Repository, DeleteResult } from "typeorm";
import { AppDataSource } from "../config/ormconfig";
import { UserEntity } from "../models/User.entity";
import {
  User,
  UserCreateInput,
  UserUpdateInput,
  IUserRepository,
} from "../types/User";

export class UserRepository implements IUserRepository {
  private repository: Repository<UserEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserEntity);
  }

  async create(userInput: UserCreateInput): Promise<User> {
    const user = this.repository.create({
      nombreUsuario: userInput.nombre_usuario,
      pais: userInput.pais,
      genero: userInput.genero,
      fechaNacimiento: userInput.fecha_nacimiento || undefined,
      horarioFav: userInput.horario_fav,
      correo: userInput.correo.toLowerCase(),
      contrasena: userInput.contrasena,
    });

    const savedUser = await this.repository.save(user);
    return this.mapToUserDTO(savedUser);
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.repository.findOne({
      where: { idUsuario: id },
    });
    return user ? this.mapToUserDTO(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.repository.findOne({
      where: { correo: email.toLowerCase() },
      relations: ['usuarioIntereses', 'usuarioDistracciones']
    });
    return user ? this.mapToUserDTO(user) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.repository.findOne({
      where: { nombreUsuario: username },
      relations: ['usuarioIntereses', 'usuarioDistracciones']
    });
    return user ? this.mapToUserDTO(user) : null;
  }

  async update(id: number, updates: UserUpdateInput): Promise<User | null> {
    const updateData: any = {};

    if (updates.nombre_usuario !== undefined)
      updateData.nombreUsuario = updates.nombre_usuario;
    if (updates.pais !== undefined) updateData.pais = updates.pais;
    if (updates.genero !== undefined) updateData.genero = updates.genero;
    if (updates.fecha_nacimiento !== undefined)
      updateData.fechaNacimiento = updates.fecha_nacimiento;
    if (updates.horario_fav !== undefined)
      updateData.horarioFav = updates.horario_fav;
    if (updates.correo !== undefined)
      updateData.correo = updates.correo.toLowerCase();
    if (updates.contrasena !== undefined)
      updateData.contrasena = updates.contrasena;
    if (updates.id_objetivo_estudio !== undefined)
      updateData.idObjetivoEstudio = updates.id_objetivo_estudio;

    const result = await this.repository.update(id, updateData);

    if (result.affected && result.affected > 0) {
      return this.findById(id);
    }
    return null;
  }

  async delete(id: number): Promise<boolean> {
    const result: DeleteResult = await this.repository.delete(id);
    return !!(result.affected && result.affected > 0);
  }

  async findAll(): Promise<User[]> {
    const users = await this.repository.find();
    return users.map((user) => this.mapToUserDTO(user));
  }

  async emailExists(email: string, excludeUserId?: number): Promise<boolean> {
    const queryBuilder = this.repository
      .createQueryBuilder("user")
      .where("user.correo = :email", { email: email.toLowerCase() });

    if (excludeUserId) {
      queryBuilder.andWhere("user.idUsuario != :excludeUserId", {
        excludeUserId,
      });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  async usernameExists(
    username: string,
    excludeUserId?: number
  ): Promise<boolean> {
    const queryBuilder = this.repository
      .createQueryBuilder("user")
      .where("user.nombreUsuario = :username", { username });

    if (excludeUserId) {
      queryBuilder.andWhere("user.idUsuario != :excludeUserId", {
        excludeUserId,
      });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  private mapToUserDTO(entity: UserEntity): User {
    return {
      id_usuario: entity.idUsuario,
      nombre_usuario: entity.nombreUsuario,
      pais: entity.pais,
      genero: entity.genero as any,
      fecha_nacimiento: entity.fechaNacimiento,
      horario_fav: entity.horarioFav,
      correo: entity.correo,
      contrasena: entity.contrasena,
      fecha_creacion: entity.fechaCreacion,
      fecha_actualizacion: entity.fechaActualizacion,
      intereses: entity.usuarioIntereses?.map(ui => ui.idInteres) || [],
      distracciones: entity.usuarioDistracciones?.map(ud => ud.idDistraccion) || [],
    };
  }
}

// Exportar con tipo específico
export const userRepository: IUserRepository = new UserRepository();
