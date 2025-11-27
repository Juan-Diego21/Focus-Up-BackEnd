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
exports.MusicaEntity = void 0;
const typeorm_1 = require("typeorm");
const AlbumMusica_entity_1 = require("./AlbumMusica.entity");
let MusicaEntity = class MusicaEntity {
};
exports.MusicaEntity = MusicaEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: "id_cancion" }),
    __metadata("design:type", Number)
], MusicaEntity.prototype, "idCancion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "nombre_cancion", length: 45, nullable: false }),
    __metadata("design:type", String)
], MusicaEntity.prototype, "nombreCancion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "artista_cancion", length: 45, nullable: true }),
    __metadata("design:type", String)
], MusicaEntity.prototype, "artistaCancion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "genero_cancion", length: 45, nullable: true }),
    __metadata("design:type", String)
], MusicaEntity.prototype, "generoCancion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "categoria_musica", length: 30, nullable: true }),
    __metadata("design:type", String)
], MusicaEntity.prototype, "categoriaMusica", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "id_album", type: "integer", nullable: true }),
    __metadata("design:type", Number)
], MusicaEntity.prototype, "idAlbum", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "fecha_creacion" }),
    __metadata("design:type", Date)
], MusicaEntity.prototype, "fechaCreacion", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "fecha_actualizacion" }),
    __metadata("design:type", Date)
], MusicaEntity.prototype, "fechaActualizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "url_musica", type: "text", nullable: false }),
    __metadata("design:type", String)
], MusicaEntity.prototype, "urlMusica", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => AlbumMusica_entity_1.AlbumMusicaEntity, album => album.musicas, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "id_album" }),
    __metadata("design:type", AlbumMusica_entity_1.AlbumMusicaEntity)
], MusicaEntity.prototype, "album", void 0);
exports.MusicaEntity = MusicaEntity = __decorate([
    (0, typeorm_1.Entity)("musica")
], MusicaEntity);
