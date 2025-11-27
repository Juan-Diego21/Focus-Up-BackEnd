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
exports.EventoEntity = void 0;
const typeorm_1 = require("typeorm");
const MetodoEstudio_entity_1 = require("./MetodoEstudio.entity");
const User_entity_1 = require("./User.entity");
const AlbumMusica_entity_1 = require("./AlbumMusica.entity");
let EventoEntity = class EventoEntity {
};
exports.EventoEntity = EventoEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: "id_evento" }),
    __metadata("design:type", Number)
], EventoEntity.prototype, "idEvento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "nombre_evento", length: 100, nullable: false }),
    __metadata("design:type", String)
], EventoEntity.prototype, "nombreEvento", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "fecha_evento",
        type: "date",
        nullable: false,
        transformer: {
            to: (value) => value,
            from: (value) => value
        }
    }),
    __metadata("design:type", String)
], EventoEntity.prototype, "fechaEvento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "hora_evento", type: "time", nullable: false }),
    __metadata("design:type", String)
], EventoEntity.prototype, "horaEvento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", name: "descripcion_evento", nullable: true }),
    __metadata("design:type", String)
], EventoEntity.prototype, "descripcionEvento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", name: "tipo_evento", nullable: true }),
    __metadata("design:type", String)
], EventoEntity.prototype, "tipoEvento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", name: "estado", nullable: true }),
    __metadata("design:type", Object)
], EventoEntity.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.UserEntity, usuario => usuario.eventos),
    (0, typeorm_1.JoinColumn)({ name: "id_usuario" }),
    __metadata("design:type", User_entity_1.UserEntity)
], EventoEntity.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => MetodoEstudio_entity_1.MetodoEstudioEntity, metodo => metodo.eventos),
    (0, typeorm_1.JoinColumn)({ name: "id_metodo" }),
    __metadata("design:type", MetodoEstudio_entity_1.MetodoEstudioEntity)
], EventoEntity.prototype, "metodoEstudio", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => AlbumMusica_entity_1.AlbumMusicaEntity, album => album.eventos),
    (0, typeorm_1.JoinColumn)({ name: "id_album" }),
    __metadata("design:type", AlbumMusica_entity_1.AlbumMusicaEntity)
], EventoEntity.prototype, "album", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "fecha_creacion" }),
    __metadata("design:type", Date)
], EventoEntity.prototype, "fechaCreacion", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "fecha_actualizacion" }),
    __metadata("design:type", Date)
], EventoEntity.prototype, "fechaActualizacion", void 0);
exports.EventoEntity = EventoEntity = __decorate([
    (0, typeorm_1.Entity)("eventos")
], EventoEntity);
