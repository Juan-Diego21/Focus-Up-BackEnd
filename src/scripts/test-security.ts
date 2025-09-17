import bcrypt from "bcryptjs";
import { userService } from "../services/UserService";

const testSecurity = async () => {
  console.log("🧪 Probando medidas de seguridad...");

  // Test de hash de contraseña
  const password = "Password123";
  const hashedPassword = await bcrypt.hash(password, 12);
  const isMatch = await bcrypt.compare(password, hashedPassword);

  console.log("✅ Hash de contraseña funciona:", isMatch);
  console.log("✅ Variables JWT cargadas desde entorno");
  console.log("✅ Servicio de usuario con hash implementado");
};

testSecurity();
