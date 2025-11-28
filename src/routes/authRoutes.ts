import { Router } from "express";
import { authController } from "../controllers/AuthController";
import {
  validateRequestVerificationCode,
  validateVerifyCode,
  validateRegister,
} from "../middleware/validation";

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

export default router;