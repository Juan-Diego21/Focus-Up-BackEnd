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
let EventoEntity = class EventoEntity {
};
exports.EventoEntity = EventoEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: "id_evento" }),
    __metadata("design:type", Number)
], EventoEntity.prototype, "idEvento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "nombre_evento" }),
    __metadata("design:type", String)
], EventoEntity.prototype, "nombreEvento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fecha_evento" }),
    __metadata("design:type", Date)
], EventoEntity.prototype, "fechaEvento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "hora_evento" }),
    __metadata("design:type", String)
], EventoEntity.prototype, "horaEvento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", name: "descripcion_evento" }),
    __metadata("design:type", String)
], EventoEntity.prototype, "descripcionEvento", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => MetodoEstudio_entity_1.MetodoEstudioEntity, metodo => metodo.eventos),
    (0, typeorm_1.JoinColumn)({ name: "id_metodo" }),
    __metadata("design:type", MetodoEstudio_entity_1.MetodoEstudioEntity)
], EventoEntity.prototype, "metodoEstudio", void 0);
exports.EventoEntity = EventoEntity = __decorate([
    (0, typeorm_1.Entity)("eventos")
], EventoEntity);
