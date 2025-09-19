"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
class UserModel {
    constructor(id_usuario, nombre_usuario = '', pais = '', genero = 'Prefiero no decir', fecha_nacimiento = new Date(), horario_fav = '', correo = '', contrasena = '', id_objetivo_estudio, fecha_creacion = new Date(), fecha_actualizacion = new Date()) {
        this.id_usuario = id_usuario;
        this.nombre_usuario = nombre_usuario;
        this.pais = pais;
        this.genero = genero;
        this.fecha_nacimiento = fecha_nacimiento;
        this.horario_fav = horario_fav;
        this.correo = correo;
        this.contrasena = contrasena;
        this.id_objetivo_estudio = id_objetivo_estudio;
        this.fecha_creacion = fecha_creacion;
        this.fecha_actualizacion = fecha_actualizacion;
    }
    static isValidAge(fechaNacimiento) {
        const hoy = new Date();
        const edadMinima = new Date();
        edadMinima.setFullYear(hoy.getFullYear() - 13);
        return fechaNacimiento <= edadMinima;
    }
    static fromInput(input) {
        if (!this.isValidAge(input.fecha_nacimiento)) {
            throw new Error('El usuario debe tener al menos 13 años');
        }
        return new UserModel(undefined, input.nombre_usuario, input.pais || '', input.genero || 'Prefiero no decir', input.fecha_nacimiento, input.horario_fav || '', input.correo, input.contrasena, input.id_objetivo_estudio, new Date(), new Date());
    }
    toJSON() {
        return {
            id_usuario: this.id_usuario,
            nombre_usuario: this.nombre_usuario,
            pais: this.pais,
            genero: this.genero,
            fecha_nacimiento: this.fecha_nacimiento,
            horario_fav: this.horario_fav,
            correo: this.correo,
            contrasena: this.contrasena,
            id_objetivo_estudio: this.id_objetivo_estudio,
            fecha_creacion: this.fecha_creacion,
            fecha_actualizacion: this.fecha_actualizacion
        };
    }
}
exports.UserModel = UserModel;
