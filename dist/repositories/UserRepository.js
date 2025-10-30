"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const ormconfig_1 = require("../config/ormconfig");
const User_entity_1 = require("../models/User.entity");
const logger_1 = __importDefault(require("../utils/logger"));
class UserRepository {
    constructor() {
        this.repository = ormconfig_1.AppDataSource.getRepository(User_entity_1.UserEntity);
    }
    async create(userInput) {
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
    async findById(id) {
        const user = await this.repository.findOne({
            where: { idUsuario: id },
        });
        return user ? this.mapToUserDTO(user) : null;
    }
    async findByEmail(email) {
        try {
            const user = await this.repository.findOne({
                where: { correo: email.toLowerCase() },
                relations: ['usuarioIntereses', 'usuarioDistracciones']
            });
            return user ? this.mapToUserDTO(user) : null;
        }
        catch (error) {
            logger_1.default.error("Error en UserRepository.findByEmail:", error);
            return null;
        }
    }
    async findByUsername(username) {
        try {
            const user = await this.repository.findOne({
                where: { nombreUsuario: username },
                relations: ['usuarioIntereses', 'usuarioDistracciones']
            });
            return user ? this.mapToUserDTO(user) : null;
        }
        catch (error) {
            logger_1.default.error("Error en UserRepository.findByUsername:", error);
            return null;
        }
    }
    async update(id, updates) {
        const updateData = {};
        if (updates.nombre_usuario !== undefined)
            updateData.nombreUsuario = updates.nombre_usuario;
        if (updates.pais !== undefined)
            updateData.pais = updates.pais;
        if (updates.genero !== undefined)
            updateData.genero = updates.genero;
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
    async delete(id) {
        const result = await this.repository.delete(id);
        return !!(result.affected && result.affected > 0);
    }
    async findAll() {
        const users = await this.repository.find();
        return users.map((user) => this.mapToUserDTO(user));
    }
    async emailExists(email, excludeUserId) {
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
    async usernameExists(username, excludeUserId) {
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
    mapToUserDTO(entity) {
        return {
            id_usuario: entity.idUsuario,
            nombre_usuario: entity.nombreUsuario,
            pais: entity.pais,
            genero: entity.genero,
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
    async updatePassword(userId, hashedPassword) {
        try {
            const result = await this.repository.update(userId, {
                contrasena: hashedPassword
            });
            return !!(result.affected && result.affected > 0);
        }
        catch (error) {
            logger_1.default.error("Error en UserRepository.updatePassword:", error);
            return false;
        }
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
