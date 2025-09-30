"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
class UserModel {
    constructor(id_usuario, nombre_usuario = '', pais, genero, fecha_nacimiento, horario_fav, correo = '', contrasena = '', intereses, distracciones, fecha_creacion = new Date(), fecha_actualizacion = new Date()) {
        this.id_usuario = id_usuario;
        this.nombre_usuario = nombre_usuario;
        this.pais = pais;
        this.genero = genero;
        this.fecha_nacimiento = fecha_nacimiento;
        this.horario_fav = horario_fav;
        this.correo = correo;
        this.contrasena = contrasena;
        this.intereses = intereses;
        this.distracciones = distracciones;
        this.fecha_creacion = fecha_creacion;
        this.fecha_actualizacion = fecha_actualizacion;
    }
    static fromInput(input) {
        return new UserModel(undefined, input.nombre_usuario, input.pais, input.genero, input.fecha_nacimiento, input.horario_fav, input.correo, input.contrasena, input.intereses, input.distracciones, new Date(), new Date());
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
            fecha_creacion: this.fecha_creacion,
            fecha_actualizacion: this.fecha_actualizacion,
            intereses: this.intereses,
            distracciones: this.distracciones
        };
    }
}
exports.UserModel = UserModel;
