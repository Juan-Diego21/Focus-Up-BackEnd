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
exports.NotificacionesProgramadasEntity = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("./User.entity");
let NotificacionesProgramadasEntity = class NotificacionesProgramadasEntity {
};
exports.NotificacionesProgramadasEntity = NotificacionesProgramadasEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: "id_notificacion" }),
    __metadata("design:type", Number)
], NotificacionesProgramadasEntity.prototype, "idNotificacion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.UserEntity),
    (0, typeorm_1.JoinColumn)({ name: "id_usuario" }),
    __metadata("design:type", User_entity_1.UserEntity)
], NotificacionesProgramadasEntity.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "id_usuario" }),
    __metadata("design:type", Number)
], NotificacionesProgramadasEntity.prototype, "idUsuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "tipo", type: "varchar", length: 50, nullable: false }),
    __metadata("design:type", String)
], NotificacionesProgramadasEntity.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "titulo", type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], NotificacionesProgramadasEntity.prototype, "titulo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "mensaje", type: "text", nullable: true }),
    __metadata("design:type", String)
], NotificacionesProgramadasEntity.prototype, "mensaje", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecha_programada", type: "timestamp", nullable: false }),
    __metadata("design:type", Date)
], NotificacionesProgramadasEntity.prototype, "fechaProgramada", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "enviada", type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], NotificacionesProgramadasEntity.prototype, "enviada", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecha_envio", type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], NotificacionesProgramadasEntity.prototype, "fechaEnvio", void 0);
exports.NotificacionesProgramadasEntity = NotificacionesProgramadasEntity = __decorate([
    (0, typeorm_1.Entity)("notificaciones_programadas")
], NotificacionesProgramadasEntity);
