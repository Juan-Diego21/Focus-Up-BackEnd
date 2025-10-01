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
exports.MetodoBeneficiosEntity = void 0;
const typeorm_1 = require("typeorm");
const MetodoEstudio_entity_1 = require("./MetodoEstudio.entity");
const Beneficio_entity_1 = require("./Beneficio.entity");
let MetodoBeneficiosEntity = class MetodoBeneficiosEntity {
};
exports.MetodoBeneficiosEntity = MetodoBeneficiosEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "id_metodo" }),
    __metadata("design:type", Number)
], MetodoBeneficiosEntity.prototype, "idMetodo", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: "id_beneficio" }),
    __metadata("design:type", Number)
], MetodoBeneficiosEntity.prototype, "idBeneficio", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => MetodoEstudio_entity_1.MetodoEstudioEntity, metodo => metodo.beneficios, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "id_metodo" }),
    __metadata("design:type", MetodoEstudio_entity_1.MetodoEstudioEntity)
], MetodoBeneficiosEntity.prototype, "metodo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Beneficio_entity_1.BeneficioEntity, beneficio => beneficio.metodos, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "id_beneficio" }),
    __metadata("design:type", Beneficio_entity_1.BeneficioEntity)
], MetodoBeneficiosEntity.prototype, "beneficio", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "fecha_creacion" }),
    __metadata("design:type", Date)
], MetodoBeneficiosEntity.prototype, "fechaCreacion", void 0);
exports.MetodoBeneficiosEntity = MetodoBeneficiosEntity = __decorate([
    (0, typeorm_1.Entity)("metodobeneficios")
], MetodoBeneficiosEntity);
