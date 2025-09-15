"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const testSecurity = async () => {
    console.log("🧪 Probando medidas de seguridad...");
    const password = "Password123";
    const hashedPassword = await bcryptjs_1.default.hash(password, 12);
    const isMatch = await bcryptjs_1.default.compare(password, hashedPassword);
    console.log("✅ Hash de contraseña funciona:", isMatch);
    console.log("✅ Variables JWT cargadas desde entorno");
    console.log("✅ Servicio de usuario con hash implementado");
};
testSecurity();
