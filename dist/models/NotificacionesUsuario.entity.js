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
exports.NotificacionesUsuarioEntity = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("./User.entity");
let NotificacionesUsuarioEntity = class NotificacionesUsuarioEntity {
};
exports.NotificacionesUsuarioEntity = NotificacionesUsuarioEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "id_usuario" }),
    __metadata("design:type", Number)
], NotificacionesUsuarioEntity.prototype, "idUsuario", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_entity_1.UserEntity),
    (0, typeorm_1.JoinColumn)({ name: "id_usuario" }),
    __metadata("design:type", User_entity_1.UserEntity)
], NotificacionesUsuarioEntity.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "eventos", type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], NotificacionesUsuarioEntity.prototype, "eventos", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "metodos_pendientes", type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], NotificacionesUsuarioEntity.prototype, "metodosPendientes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "sesiones_pendientes", type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], NotificacionesUsuarioEntity.prototype, "sesionesPendientes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "motivacion", type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], NotificacionesUsuarioEntity.prototype, "motivacion", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "fecha_actualizacion" }),
    __metadata("design:type", Date)
], NotificacionesUsuarioEntity.prototype, "fechaActualizacion", void 0);
exports.NotificacionesUsuarioEntity = NotificacionesUsuarioEntity = __decorate([
    (0, typeorm_1.Entity)("notificaciones_usuario")
], NotificacionesUsuarioEntity);
