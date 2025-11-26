import { Router } from "express";
import { userController } from "../controllers/UserController";
import { SessionController } from "../controllers/SessionController";
import {
  validateUserCreate,
  validateUserUpdate,
} from "../middleware/validation";
import { authenticateToken } from "../middleware/auth";

const router = Router();
const sessionController = new SessionController();

// GET /api/v1/users - Obtener todos los usuarios
router.get("/", authenticateToken, userController.getAllUsers.bind(userController));

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *       401:
 *         description: No autorizado
 */

// GET /api/v1/users/:id - Obtener usuario por ID
router.get("/:id", authenticateToken, userController.getUserById.bind(userController));

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
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
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autorizado
 */

// GET /api/v1/users/email/:email - Obtener usuario por email
router.get("/email/:email", authenticateToken, userController.getUserByEmail.bind(userController));

/**
 * @swagger
 * /users/email/{email}:
 *   get:
 *     summary: Obtener un usuario por email
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autorizado
 */

// POST /api/v1/users - Crear nuevo usuario
router.post(
  "/",
  validateUserCreate,
  userController.createUser.bind(userController)
);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_usuario
 *               - correo
 *               - contrasena
 *               - fecha_nacimiento
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 example: "johndoe"
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               contrasena:
 *                 type: string
 *                 format: password
 *                 example: "SecurePassword123"
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               pais:
 *                 type: string
 *                 example: "Colombia"
 *               genero:
 *                 type: string
 *                 enum: [Masculino, Femenino, Otro, Prefiero no decir]
 *                 example: "Masculino"
 *               horario_fav:
 *                 type: string
 *                 format: time
 *                 example: "08:00"
 *               intereses:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *               distracciones:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2]
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Datos inválidos o usuario/email ya existe
 */

// PUT /api/v1/users/:id - Actualizar usuario por id
router.put(
  "/:id",
  authenticateToken,
  validateUserUpdate,
  userController.updateUser.bind(userController)
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualizar un usuario por ID
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
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 example: "johndoe"
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               contrasena:
 *                 type: string
 *                 format: password
 *                 example: "NewSecurePassword123"
 *               pais:
 *                 type: string
 *                 example: "Colombia"
 *               genero:
 *                 type: string
 *                 enum: [Masculino, Femenino, Otro, Prefiero no decir]
 *                 example: "Masculino"
 *               horario_fav:
 *                 type: string
 *                 format: time
 *                 example: "08:00"
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       400:
 *         description: Error en la solicitud
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autorizado
 */

// POST /api/v1/users/login - Login de usuario
router.post("/login", userController.login.bind(userController));

/**
 * @swagger
 * /users/login:
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

 // ✅ Cierre correcto del bloque Swagger de login (antes estaba faltando)

// POST /api/v1/users/logout - Logout de usuario
router.post("/logout", authenticateToken, userController.logout.bind(userController));

/**
 * @swagger
 * /users/logout:
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

// DELETE /api/v1/users/:id - eliminar usuario
router.delete("/:id", authenticateToken, userController.deleteUser.bind(userController));

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Eliminar usuario por ID
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autorizado
 */

// POST /api/v1/users/request-password-reset - Solicitar código de verificación
router.post('/request-password-reset', userController.requestPasswordReset.bind(userController));

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
router.post('/reset-password-with-code', userController.resetPasswordWithCode.bind(userController));

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
