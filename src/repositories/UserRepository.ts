import pool from '../config/database';
import { User, UserCreateInput, UserUpdateInput } from '../types/User';
import { UserModel } from '../models/User';

export class UserRepository {
  // Crear un nuevo usuario
  async create(userInput: UserCreateInput): Promise<User> {
    const user = UserModel.fromInput(userInput);
    const query = `
      INSERT INTO Usuario (
        nombre_usuario, pais, genero, fecha_nacimiento, 
        horario_fav, correo, contrasena, id_objetivo_estudio,
        fecha_creacion, fecha_actualizacion
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const params = [
      user.nombre_usuario,
      user.pais,
      user.genero,
      user.fecha_nacimiento,
      user.horario_fav,
      user.correo,
      user.contrasena,
      user.id_objetivo_estudio,
      user.fecha_creacion,
      user.fecha_actualizacion
    ];

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  // Encontrar usuario por ID
  async findById(id: number): Promise<User | null> {
    const query = 'SELECT * FROM Usuario WHERE id_usuario = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Encontrar usuario por email
  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM Usuario WHERE correo = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  // Encontrar usuario por nombre de usuario
  async findByUsername(username: string): Promise<User | null> {
    const query = 'SELECT * FROM Usuario WHERE nombre_usuario = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0] || null;
  }

  // Actualizar usuario
  async update(id: number, updates: UserUpdateInput): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    values.push(id);
    const query = `
      UPDATE Usuario 
      SET ${fields.join(', ')}, fecha_actualizacion = NOW()
      WHERE id_usuario = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Obtener todos los usuarios (para administración)
  async findAll(): Promise<User[]> {
    const query = 'SELECT * FROM Usuario ORDER BY fecha_creacion DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  // Verificar si el email ya existe
  async emailExists(email: string, excludeUserId?: number): Promise<boolean> {
    let query = 'SELECT COUNT(*) FROM Usuario WHERE correo = $1';
    const params: any[] = [email];

    if (excludeUserId) {
      query += ' AND id_usuario != $2';
      params.push(excludeUserId);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count) > 0;
  }

  // Verificar si el nombre de usuario ya existe
  async usernameExists(username: string, excludeUserId?: number): Promise<boolean> {
    let query = 'SELECT COUNT(*) FROM Usuario WHERE nombre_usuario = $1';
    const params: any[] = [username];

    if (excludeUserId) {
      query += ' AND id_usuario != $2';
      params.push(excludeUserId);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count) > 0;
  }
}

export const userRepository = new UserRepository();