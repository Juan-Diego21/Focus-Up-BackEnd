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
exports.MetodoRealizadoEntity = exports.MetodoEstado = exports.MetodoProgreso = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("./User.entity");
const MetodoEstudio_entity_1 = require("./MetodoEstudio.entity");
var MetodoProgreso;
(function (MetodoProgreso) {
    MetodoProgreso[MetodoProgreso["INICIADO"] = 0] = "INICIADO";
    MetodoProgreso[MetodoProgreso["MITAD"] = 50] = "MITAD";
    MetodoProgreso[MetodoProgreso["COMPLETADO"] = 100] = "COMPLETADO";
})(MetodoProgreso || (exports.MetodoProgreso = MetodoProgreso = {}));
var MetodoEstado;
(function (MetodoEstado) {
    MetodoEstado["EN_PROGRESO"] = "en_progreso";
    MetodoEstado["COMPLETADO"] = "completado";
    MetodoEstado["CANCELADO"] = "cancelado";
})(MetodoEstado || (exports.MetodoEstado = MetodoEstado = {}));
let MetodoRealizadoEntity = class MetodoRealizadoEntity {
};
exports.MetodoRealizadoEntity = MetodoRealizadoEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: "id_metodo_realizado" }),
    __metadata("design:type", Number)
], MetodoRealizadoEntity.prototype, "idMetodoRealizado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "id_usuario", type: "integer" }),
    __metadata("design:type", Number)
], MetodoRealizadoEntity.prototype, "idUsuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "id_metodo", type: "integer" }),
    __metadata("design:type", Number)
], MetodoRealizadoEntity.prototype, "idMetodo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "progreso",
        type: "integer",
        default: MetodoProgreso.INICIADO,
    }),
    __metadata("design:type", Number)
], MetodoRealizadoEntity.prototype, "progreso", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "estado",
        type: "varchar",
        length: 20,
        default: MetodoEstado.EN_PROGRESO,
    }),
    __metadata("design:type", String)
], MetodoRealizadoEntity.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecha_inicio", type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], MetodoRealizadoEntity.prototype, "fechaInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecha_fin", type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], MetodoRealizadoEntity.prototype, "fechaFin", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "fecha_creacion" }),
    __metadata("design:type", Date)
], MetodoRealizadoEntity.prototype, "fechaCreacion", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "fecha_actualizacion" }),
    __metadata("design:type", Date)
], MetodoRealizadoEntity.prototype, "fechaActualizacion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.UserEntity),
    (0, typeorm_1.JoinColumn)({ name: "id_usuario", referencedColumnName: "idUsuario" }),
    __metadata("design:type", User_entity_1.UserEntity)
], MetodoRealizadoEntity.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => MetodoEstudio_entity_1.MetodoEstudioEntity),
    (0, typeorm_1.JoinColumn)({ name: "id_metodo", referencedColumnName: "idMetodo" }),
    __metadata("design:type", MetodoEstudio_entity_1.MetodoEstudioEntity)
], MetodoRealizadoEntity.prototype, "metodo", void 0);
exports.MetodoRealizadoEntity = MetodoRealizadoEntity = __decorate([
    (0, typeorm_1.Entity)("metodos_realizados")
], MetodoRealizadoEntity);
