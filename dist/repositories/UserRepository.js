"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const database_1 = __importDefault(require("../config/database"));
const User_1 = require("../models/User");
class UserRepository {
    async create(userInput) {
        const user = User_1.UserModel.fromInput(userInput);
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
        const result = await database_1.default.query(query, params);
        return result.rows[0];
    }
    async findById(id) {
        const query = 'SELECT * FROM Usuario WHERE id_usuario = $1';
        const result = await database_1.default.query(query, [id]);
        return result.rows[0] || null;
    }
    async findByEmail(email) {
        const query = 'SELECT * FROM Usuario WHERE correo = $1';
        const result = await database_1.default.query(query, [email]);
        return result.rows[0] || null;
    }
    async findByUsername(username) {
        const query = 'SELECT * FROM Usuario WHERE nombre_usuario = $1';
        const result = await database_1.default.query(query, [username]);
        return result.rows[0] || null;
    }
    async update(id, updates) {
        const fields = [];
        const values = [];
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
        const result = await database_1.default.query(query, values);
        return result.rows[0] || null;
    }
    async findAll() {
        const query = 'SELECT * FROM Usuario ORDER BY fecha_creacion DESC';
        const result = await database_1.default.query(query);
        return result.rows;
    }
    async emailExists(email, excludeUserId) {
        let query = 'SELECT COUNT(*) FROM Usuario WHERE correo = $1';
        const params = [email];
        if (excludeUserId) {
            query += ' AND id_usuario != $2';
            params.push(excludeUserId);
        }
        const result = await database_1.default.query(query, params);
        return parseInt(result.rows[0].count) > 0;
    }
    async usernameExists(username, excludeUserId) {
        let query = 'SELECT COUNT(*) FROM Usuario WHERE nombre_usuario = $1';
        const params = [username];
        if (excludeUserId) {
            query += ' AND id_usuario != $2';
            params.push(excludeUserId);
        }
        const result = await database_1.default.query(query, params);
        return parseInt(result.rows[0].count) > 0;
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
