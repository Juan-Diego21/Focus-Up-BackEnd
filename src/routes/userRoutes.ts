import { Router } from "express";
import { userController } from "../controllers/UserController";
import { SessionController } from "../controllers/SessionController";
import {
  validateUserCreate,
  validateUserUpdate,
  validatePasswordChange,
  validateLogin,
  validateRequestPasswordReset,
  validateResetPasswordWithCode,
} from "../middleware/validation";
import { authenticateToken } from "../middleware/auth";

const router = Router();
const sessionController = new SessionController();

// GET /api/v1/users - Obtener perfil del usuario autenticado
router.get("/", authenticateToken, userController.getProfile.bind(userController));

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario obtenido exitosamente
 *       401:
 *         description: No autorizado
 */

// PUT /api/v1/users - Actualizar perfil del usuario autenticado
router.put("/", authenticateToken, validateUserUpdate, userController.updateProfile.bind(userController));

/**
 * @swagger
 * /users:
 *   put:
 *     summary: Actualizar perfil del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 description: "Username"
 *                 example: "johndoe"
 *               pais:
 *                 type: string
 *                 description: "Country"
 *                 example: "Colombia"
 *               genero:
 *                 type: string
 *                 description: "Gender"
 *                 enum: [Masculino, Femenino, Otro, "Prefiero no decir"]
 *                 example: "Masculino"
 *               fecha_nacimiento:
 *                 type: string
 *                 description: "Date of birth"
 *                 format: date
 *                 example: "2000-01-01"
 *               horario_fav:
 *                 type: string
 *                 description: "Favorite time"
 *                 format: time
 *                 example: "08:00"
 *               intereses:
 *                 type: array
 *                 description: "Interests"
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *               distracciones:
 *                 type: array
 *                 description: "Distractions"
 *                 items:
 *                   type: integer
 *                 example: [1, 2]
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *       400:
 *         description: Error en la solicitud
 *       401:
 *         description: No autorizado
 */

// DELETE /api/v1/users/me - Eliminar cuenta del usuario autenticado
router.delete("/me", authenticateToken, userController.deleteMyAccount.bind(userController));

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Eliminar la cuenta del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Elimina permanentemente la cuenta del usuario autenticado y todas las sesiones asociadas.
 *       Esta acción no se puede deshacer.
 *     responses:
 *       200:
 *         description: Cuenta eliminada exitosamente
 *       400:
 *         description: Error al eliminar la cuenta (usuario no encontrado o restricciones de integridad)
 *       401:
 *         description: No autorizado - token JWT requerido
 *       500:
 *         description: Error interno del servidor
 */

// POST /api/v1/users - DESHABILITADO: Usar /api/v1/auth/register en su lugar
// La verificación por Email es necesaria para el registro
router.post("/", (req, res) => {
  res.status(410).json({
    success: false,
    message: "This endpoint has been disabled. User registration now requires email verification. Use POST /api/v1/auth/register after verifying your email.",
    timestamp: new Date(),
  });
});



// PATCH /api/v1/users/:id/password - Cambiar contraseña
router.patch(
  "/:id/password",
  authenticateToken,
  validatePasswordChange,
  userController.changePassword.bind(userController)
);

/**
 * @swagger
 * /users/{id}/password:
 *   patch:
 *     summary: Cambiar contraseña del usuario
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: "Contraseña actual"
 *                 format: password
 *                 example: "CurrentPassword123"
 *               newPassword:
 *                 type: string
 *                 description: "Nueva contraseña"
 *                 format: password
 *                 example: "NewSecurePassword123"
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 *       400:
 *         description: Error en la solicitud (contraseña actual incorrecta o nueva inválida)
 *       403:
 *         description: No autorizado para cambiar la contraseña de este usuario
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autorizado
 */

// Auth routes moved to /auth prefix in auth.routes.ts


// POST /api/v1/users/request-password-reset - Solicitar código de verificación
router.post('/request-password-reset', validateRequestPasswordReset, userController.requestPasswordReset.bind(userController));

/**
 * @swagger
 * /users/request-password-reset:
 *   post:
 *     summary: Solicitar código de verificación para restablecer contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailOrUsername
 *             properties:
 *               emailOrUsername:
 *                 type: string
 *                 example: "john@example.com"
 *     responses:
 *       200:
 *         description: Código enviado al correo
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno
 */

// POST /api/v1/users/reset-password-with-code - Restablecer contraseña
router.post('/reset-password-with-code', validateResetPasswordWithCode, userController.resetPasswordWithCode.bind(userController));

// GET /api/v1/users/:userId/sessions - Listar sesiones de un usuario
router.get('/:userId/sessions', authenticateToken, sessionController.listUserSessions.bind(sessionController));

/**
 * @swagger
 * /users/reset-password-with-code:
 *   post:
 *     summary: Verificar código y restablecer contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               code:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "NewSecurePassword123"
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *       400:
 *         description: Código inválido o expirado
 *       500:
 *         description: Error interno
 */

export default router;
