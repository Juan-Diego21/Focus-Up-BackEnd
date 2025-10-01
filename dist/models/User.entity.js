"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEntity = void 0;
const typeorm_1 = require("typeorm");
const UsuarioIntereses_entity_1 = require("./UsuarioIntereses.entity");
const UsuarioDistracciones_entity_1 = require("./UsuarioDistracciones.entity");
let UserEntity = class UserEntity {
};
exports.UserEntity = UserEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: "id_usuario" }),
    __metadata("design:type", Number)
], UserEntity.prototype, "idUsuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "nombre_usuario", length: 50, nullable: false }),
    __metadata("design:type", String)
], UserEntity.prototype, "nombreUsuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "pais", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar",
        length: 15,
        nullable: true,
    }),
    __metadata("design:type", String)
], UserEntity.prototype, "genero", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecha_nacimiento", type: "date", nullable: true }),
    __metadata("design:type", Date)
], UserEntity.prototype, "fechaNacimiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "horario_fav", type: "time", nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "horarioFav", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, unique: true, nullable: false }),
    __metadata("design:type", String)
], UserEntity.prototype, "correo", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: false }),
    __metadata("design:type", String)
], UserEntity.prototype, "contrasena", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "id_objetivo_estudio", type: "integer", nullable: true }),
    __metadata("design:type", Number)
], UserEntity.prototype, "idObjetivoEstudio", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "fecha_creacion" }),
    __metadata("design:type", Date)
], UserEntity.prototype, "fechaCreacion", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "fecha_actualizacion" }),
    __metadata("design:type", Date)
], UserEntity.prototype, "fechaActualizacion", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UsuarioIntereses_entity_1.UsuarioInteresesEntity, usuarioInteres => usuarioInteres.usuario),
    __metadata("design:type", Array)
], UserEntity.prototype, "usuarioIntereses", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UsuarioDistracciones_entity_1.UsuarioDistraccionesEntity, usuarioDistraccion => usuarioDistraccion.usuario),
    __metadata("design:type", Array)
], UserEntity.prototype, "usuarioDistracciones", void 0);
exports.UserEntity = UserEntity = __decorate([
    (0, typeorm_1.Entity)("usuario")
], UserEntity);
