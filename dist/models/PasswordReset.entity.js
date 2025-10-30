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
exports.PasswordResetEntity = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("./User.entity");
let PasswordResetEntity = class PasswordResetEntity {
};
exports.PasswordResetEntity = PasswordResetEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PasswordResetEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "user_id", type: "int" }),
    __metadata("design:type", Number)
], PasswordResetEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], PasswordResetEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "expires_at", type: "timestamp" }),
    __metadata("design:type", Date)
], PasswordResetEntity.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], PasswordResetEntity.prototype, "used", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], PasswordResetEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.UserEntity, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    __metadata("design:type", User_entity_1.UserEntity)
], PasswordResetEntity.prototype, "user", void 0);
exports.PasswordResetEntity = PasswordResetEntity = __decorate([
    (0, typeorm_1.Entity)("password_resets")
], PasswordResetEntity);
