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
exports.CodigosVerificacionEntity = void 0;
const typeorm_1 = require("typeorm");
let CodigosVerificacionEntity = class CodigosVerificacionEntity {
};
exports.CodigosVerificacionEntity = CodigosVerificacionEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: "id_codigo_verificacion" }),
    __metadata("design:type", Number)
], CodigosVerificacionEntity.prototype, "idCodigoVerificacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "email", length: 255, nullable: false }),
    __metadata("design:type", String)
], CodigosVerificacionEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "codigo", length: 6, nullable: false }),
    __metadata("design:type", String)
], CodigosVerificacionEntity.prototype, "codigo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "fecha_creacion" }),
    __metadata("design:type", Date)
], CodigosVerificacionEntity.prototype, "fechaCreacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "expira_en", type: "timestamp", nullable: false }),
    __metadata("design:type", Date)
], CodigosVerificacionEntity.prototype, "expiraEn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "intentos", type: "integer", default: 0 }),
    __metadata("design:type", Number)
], CodigosVerificacionEntity.prototype, "intentos", void 0);
exports.CodigosVerificacionEntity = CodigosVerificacionEntity = __decorate([
    (0, typeorm_1.Entity)("codigos_verificacion")
], CodigosVerificacionEntity);
