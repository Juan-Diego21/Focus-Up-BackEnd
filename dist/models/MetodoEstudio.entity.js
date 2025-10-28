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
exports.MetodoEstudioEntity = void 0;
const typeorm_1 = require("typeorm");
const Beneficio_entity_1 = require("./Beneficio.entity");
let MetodoEstudioEntity = class MetodoEstudioEntity {
};
exports.MetodoEstudioEntity = MetodoEstudioEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: "id_metodo" }),
    __metadata("design:type", Number)
], MetodoEstudioEntity.prototype, "idMetodo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "nombre_metodo", length: 255, nullable: false }),
    __metadata("design:type", String)
], MetodoEstudioEntity.prototype, "nombreMetodo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], MetodoEstudioEntity.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "url_imagen", type: "text", nullable: false }),
    __metadata("design:type", String)
], MetodoEstudioEntity.prototype, "urlImagen", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "color_hexa", type: "text", nullable: false }),
    __metadata("design:type", String)
], MetodoEstudioEntity.prototype, "colorHexa", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "fecha_creacion" }),
    __metadata("design:type", Date)
], MetodoEstudioEntity.prototype, "fechaCreacion", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "fecha_actualizacion" }),
    __metadata("design:type", Date)
], MetodoEstudioEntity.prototype, "fechaActualizacion", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Beneficio_entity_1.BeneficioEntity, (beneficio) => beneficio.metodos),
    (0, typeorm_1.JoinTable)({
        name: "metodobeneficios",
        joinColumn: { name: "id_metodo", referencedColumnName: "idMetodo" },
        inverseJoinColumn: {
            name: "id_beneficio",
            referencedColumnName: "idBeneficio",
        },
    }),
    __metadata("design:type", Array)
], MetodoEstudioEntity.prototype, "beneficios", void 0);
exports.MetodoEstudioEntity = MetodoEstudioEntity = __decorate([
    (0, typeorm_1.Entity)("bibliotecametodosestudio")
], MetodoEstudioEntity);
