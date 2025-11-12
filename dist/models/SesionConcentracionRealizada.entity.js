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
exports.SesionConcentracionRealizadaEntity = exports.SesionEstado = void 0;
const typeorm_1 = require("typeorm");
const Musica_entity_1 = require("./Musica.entity");
const MetodoRealizado_entity_1 = require("./MetodoRealizado.entity");
var SesionEstado;
(function (SesionEstado) {
    SesionEstado["PENDIENTE"] = "pendiente";
    SesionEstado["EN_PROCESO"] = "en_proceso";
    SesionEstado["COMPLETADA"] = "completada";
    SesionEstado["CANCELADA"] = "cancelada";
})(SesionEstado || (exports.SesionEstado = SesionEstado = {}));
let SesionConcentracionRealizadaEntity = class SesionConcentracionRealizadaEntity {
};
exports.SesionConcentracionRealizadaEntity = SesionConcentracionRealizadaEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: "id_sesion_realizada" }),
    __metadata("design:type", Number)
], SesionConcentracionRealizadaEntity.prototype, "idSesionRealizada", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "id_metodo_realizado", type: "integer", nullable: true }),
    __metadata("design:type", Number)
], SesionConcentracionRealizadaEntity.prototype, "idMetodoRealizado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "id_cancion", type: "integer", nullable: true }),
    __metadata("design:type", Number)
], SesionConcentracionRealizadaEntity.prototype, "idCancion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecha_programada", type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], SesionConcentracionRealizadaEntity.prototype, "fechaProgramada", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "estado",
        type: "varchar",
        length: 20,
        default: SesionEstado.PENDIENTE,
    }),
    __metadata("design:type", String)
], SesionConcentracionRealizadaEntity.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "fecha_creacion" }),
    __metadata("design:type", Date)
], SesionConcentracionRealizadaEntity.prototype, "fechaCreacion", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "fecha_actualizacion" }),
    __metadata("design:type", Date)
], SesionConcentracionRealizadaEntity.prototype, "fechaActualizacion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => MetodoRealizado_entity_1.MetodoRealizadoEntity),
    (0, typeorm_1.JoinColumn)({ name: "id_metodo_realizado", referencedColumnName: "idMetodoRealizado" }),
    __metadata("design:type", MetodoRealizado_entity_1.MetodoRealizadoEntity)
], SesionConcentracionRealizadaEntity.prototype, "metodoRealizado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Musica_entity_1.MusicaEntity),
    (0, typeorm_1.JoinColumn)({ name: "id_cancion", referencedColumnName: "idCancion" }),
    __metadata("design:type", Musica_entity_1.MusicaEntity)
], SesionConcentracionRealizadaEntity.prototype, "musica", void 0);
exports.SesionConcentracionRealizadaEntity = SesionConcentracionRealizadaEntity = __decorate([
    (0, typeorm_1.Entity)("sesiones_concentracion_realizadas")
], SesionConcentracionRealizadaEntity);
