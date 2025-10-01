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
exports.BeneficioEntity = void 0;
const typeorm_1 = require("typeorm");
const MetodoEstudio_entity_1 = require("./MetodoEstudio.entity");
let BeneficioEntity = class BeneficioEntity {
};
exports.BeneficioEntity = BeneficioEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: "id_beneficio" }),
    __metadata("design:type", Number)
], BeneficioEntity.prototype, "idBeneficio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "descripcion_beneficio", type: "text", nullable: false }),
    __metadata("design:type", String)
], BeneficioEntity.prototype, "descripcionBeneficio", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "fecha_creacion" }),
    __metadata("design:type", Date)
], BeneficioEntity.prototype, "fechaCreacion", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "fecha_actualizacion" }),
    __metadata("design:type", Date)
], BeneficioEntity.prototype, "fechaActualizacion", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => MetodoEstudio_entity_1.MetodoEstudioEntity, metodo => metodo.beneficios),
    __metadata("design:type", Array)
], BeneficioEntity.prototype, "metodos", void 0);
exports.BeneficioEntity = BeneficioEntity = __decorate([
    (0, typeorm_1.Entity)("beneficios")
], BeneficioEntity);
