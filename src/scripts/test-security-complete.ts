import bcrypt from "bcryptjs";
import { JwtUtils } from "../utils/jwt";
import { ValidationUtils } from "../utils/validation";

const testSecurityComplete = async () => {
  console.log("🔒 TEST COMPLETO DE SEGURIDAD");
  console.log("=".repeat(50));

  // 1. Test de hash de contraseñas
  console.log("\n1. Testing hash de contraseñas...");
  try {
    const password = "SecurePassword123";
    const hashedPassword = await bcrypt.hash(password, 12);
    const isMatch = await bcrypt.compare(password, hashedPassword);
    const isWrongMatch = await bcrypt.compare("wrongpassword", hashedPassword);

    console.log("✅ Hash correcto:", isMatch);
    console.log("✅ Rechazo de password incorrecto:", !isWrongMatch);
  } catch (error) {
    console.error("❌ Error en hash de contraseñas:", error);
  }

  // 2. Test de validación de contraseñas
  console.log("\n2. Testing validación de contraseñas...");
  try {
    const strongPassword = "SecurePassword123";
    const weakPassword = "weak";
    const noUpperCase = "securepassword123";
    const noNumber = "SecurePassword";

    console.log(
      "✅ Contraseña fuerte:",
      ValidationUtils.isValidPassword(strongPassword)
    );
    console.log(
      "✅ Contraseña débil rechazada:",
      !ValidationUtils.isValidPassword(weakPassword)
    );
    console.log(
      "✅ Sin mayúscula rechazada:",
      !ValidationUtils.isValidPassword(noUpperCase)
    );
    console.log(
      "✅ Sin número rechazada:",
      !ValidationUtils.isValidPassword(noNumber)
    );
  } catch (error) {
    console.error("❌ Error en validación de contraseñas:", error);
  }

  // 3. Test de JWT tokens
  console.log("\n3. Testing JWT tokens...");
  try {
    const payload = { userId: 1, email: "test@example.com" };

    // Generar tokens
    const accessToken = JwtUtils.generateAccessToken(payload);
    const refreshToken = JwtUtils.generateRefreshToken(payload);

    console.log("✅ Access token generado:", accessToken.length > 50);
    console.log("✅ Refresh token generado:", refreshToken.length > 50);
    console.log("✅ Tokens diferentes:", accessToken !== refreshToken);

    // Verificar tokens
    const decodedAccess = JwtUtils.verifyAccessToken(accessToken);
    const decodedRefresh = JwtUtils.verifyRefreshToken(refreshToken);

    console.log("✅ Access token verificado:", decodedAccess.userId === 1);
    console.log("✅ Refresh token verificado:", decodedRefresh.userId === 1);
  } catch (error) {
    console.error("❌ Error en JWT tokens:", error);
  }

  // 4. Test de sanitización
  console.log("\n4. Testing sanitización...");
  try {
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitized = ValidationUtils.sanitizeText(maliciousInput);

    console.log("✅ Input malicioso sanitizado:", sanitized);
    console.log("✅ Script tags removidos:", !sanitized.includes("<script>"));
  } catch (error) {
    console.error("❌ Error en sanitización:", error);
  }

  // 5. Test de extracción de token
  console.log("\n5. Testing extracción de token...");
  try {
    const validHeader = "Bearer abc123";
    const invalidHeader = "Basic abc123";
    const noHeader = undefined;

    console.log(
      "✅ Token extraído de header válido:",
      JwtUtils.extractTokenFromHeader(validHeader) === "abc123"
    );
    console.log(
      "✅ Header inválido rechazado:",
      JwtUtils.extractTokenFromHeader(invalidHeader) === null
    );
    console.log(
      "✅ Header ausente rechazado:",
      JwtUtils.extractTokenFromHeader(noHeader) === null
    );
  } catch (error) {
    console.error("❌ Error en extracción de token:", error);
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ TEST DE SEGURIDAD COMPLETADO");
};

// Ejecutar el test
testSecurityComplete().catch(console.error);
