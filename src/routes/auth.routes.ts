import { Router } from "express";
import { userController } from "../controllers/UserController";
import { authController } from "../controllers/AuthController";
import {
  validateRequestVerificationCode,
  validateVerifyCode,
  validateRegister,
  validateLogin,
} from "../middleware/validation";
import { authenticateToken } from "../middleware/auth";
import { authRateLimit } from "../middleware/rateLimit";

const router = Router();

/**
 * @swagger
 * /auth/request-verification-code:
 *   post:
 *     summary: Solicitar código de verificación para email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Código de verificación enviado exitosamente
 *       400:
 *         description: Email inválido o error en la solicitud
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  "/request-verification-code",
  validateRequestVerificationCode,
  authController.requestVerificationCode.bind(authController)
);

/**
 * @swagger
 * /auth/verify-code:
 *   post:
 *     summary: Verificar código de verificación
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - codigo
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               codigo:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Código verificado exitosamente
 *       400:
 *         description: Código inválido, expirado o error en la solicitud
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  "/verify-code",
  validateVerifyCode,
  authController.verifyCode.bind(authController)
);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo usuario con email verificado
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePassword123"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Datos inválidos, email no verificado o usuario ya existe
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  "/register",
  validateRegister,
  authController.register.bind(authController)
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contrasena
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 description: "Email del usuario"
 *                 example: "john@example.com"
 *               nombre_usuario:
 *                 type: string
 *                 description: "Nombre de usuario (alternativo al correo)"
 *                 example: "johndoe"
 *               contrasena:
 *                 type: string
 *                 format: password
 *                 example: "SecurePassword123"
 *     responses:
 *       200:
 *         description: Autenticación exitosa
 *       401:
 *         description: Credenciales inválidas
 */
router.post("/login", authRateLimit, validateLogin, userController.login.bind(userController));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión del usuario
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *       401:
 *         description: No autorizado
 */
router.post("/logout", authenticateToken, userController.logout.bind(userController));

// TODO: Implementar endpoint de refresh-token cuando sea necesario

export default router;