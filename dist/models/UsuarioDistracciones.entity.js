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
exports.UsuarioDistraccionesEntity = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("./User.entity");
const Distraction_entity_1 = require("./Distraction.entity");
let UsuarioDistraccionesEntity = class UsuarioDistraccionesEntity {
};
exports.UsuarioDistraccionesEntity = UsuarioDistraccionesEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "id_usuario" }),
    __metadata("design:type", Number)
], UsuarioDistraccionesEntity.prototype, "idUsuario", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "id_distraccion" }),
    __metadata("design:type", Number)
], UsuarioDistraccionesEntity.prototype, "idDistraccion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.UserEntity, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "id_usuario" }),
    __metadata("design:type", User_entity_1.UserEntity)
], UsuarioDistraccionesEntity.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Distraction_entity_1.DistractionEntity, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "id_distraccion" }),
    __metadata("design:type", Distraction_entity_1.DistractionEntity)
], UsuarioDistraccionesEntity.prototype, "distraccion", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "fecha_creacion" }),
    __metadata("design:type", Date)
], UsuarioDistraccionesEntity.prototype, "fechaCreacion", void 0);
exports.UsuarioDistraccionesEntity = UsuarioDistraccionesEntity = __decorate([
    (0, typeorm_1.Entity)("usuariodistracciones")
], UsuarioDistraccionesEntity);
