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
exports.SesionConcentracionEntity = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("./User.entity");
const Evento_entity_1 = require("./Evento.entity");
const MetodoEstudio_entity_1 = require("./MetodoEstudio.entity");
const AlbumMusica_entity_1 = require("./AlbumMusica.entity");
let SesionConcentracionEntity = class SesionConcentracionEntity {
};
exports.SesionConcentracionEntity = SesionConcentracionEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: "id_sesion" }),
    __metadata("design:type", Number)
], SesionConcentracionEntity.prototype, "idSesion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "id_usuario", type: "integer" }),
    __metadata("design:type", Number)
], SesionConcentracionEntity.prototype, "idUsuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "titulo", type: "varchar", length: 150, nullable: true }),
    __metadata("design:type", String)
], SesionConcentracionEntity.prototype, "titulo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "descripcion", type: "text", nullable: true }),
    __metadata("design:type", String)
], SesionConcentracionEntity.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "estado",
        type: "varchar",
        length: 20,
        default: "pendiente",
    }),
    __metadata("design:type", String)
], SesionConcentracionEntity.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "tipo",
        type: "varchar",
        length: 20,
    }),
    __metadata("design:type", String)
], SesionConcentracionEntity.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "id_evento", type: "integer", nullable: true }),
    __metadata("design:type", Number)
], SesionConcentracionEntity.prototype, "idEvento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "id_metodo", type: "integer", nullable: true }),
    __metadata("design:type", Number)
], SesionConcentracionEntity.prototype, "idMetodo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "id_album", type: "integer", nullable: true }),
    __metadata("design:type", Number)
], SesionConcentracionEntity.prototype, "idAlbum", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "tiempo_transcurrido",
        type: "interval",
        default: "00:00:00",
    }),
    __metadata("design:type", String)
], SesionConcentracionEntity.prototype, "tiempoTranscurrido", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "fecha_creacion" }),
    __metadata("design:type", Date)
], SesionConcentracionEntity.prototype, "fechaCreacion", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "fecha_actualizacion" }),
    __metadata("design:type", Date)
], SesionConcentracionEntity.prototype, "fechaActualizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "ultima_interaccion",
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], SesionConcentracionEntity.prototype, "ultimaInteraccion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.UserEntity),
    (0, typeorm_1.JoinColumn)({ name: "id_usuario", referencedColumnName: "idUsuario" }),
    __metadata("design:type", User_entity_1.UserEntity)
], SesionConcentracionEntity.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Evento_entity_1.EventoEntity),
    (0, typeorm_1.JoinColumn)({ name: "id_evento", referencedColumnName: "idEvento" }),
    __metadata("design:type", Evento_entity_1.EventoEntity)
], SesionConcentracionEntity.prototype, "evento", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => MetodoEstudio_entity_1.MetodoEstudioEntity),
    (0, typeorm_1.JoinColumn)({ name: "id_metodo", referencedColumnName: "idMetodo" }),
    __metadata("design:type", MetodoEstudio_entity_1.MetodoEstudioEntity)
], SesionConcentracionEntity.prototype, "metodo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => AlbumMusica_entity_1.AlbumMusicaEntity),
    (0, typeorm_1.JoinColumn)({ name: "id_album", referencedColumnName: "idAlbum" }),
    __metadata("design:type", AlbumMusica_entity_1.AlbumMusicaEntity)
], SesionConcentracionEntity.prototype, "album", void 0);
exports.SesionConcentracionEntity = SesionConcentracionEntity = __decorate([
    (0, typeorm_1.Entity)("sesiones_concentracion")
], SesionConcentracionEntity);
