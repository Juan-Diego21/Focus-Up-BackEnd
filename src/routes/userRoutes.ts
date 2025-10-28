import { Router } from "express";
import { userController } from "../controllers/UserController";
import {
  validateUserCreate,
  validateUserUpdate,
} from "../middleware/validation";

const router = Router();

// GET /api/v1/users - Obtener todos los usuarios
router.get("/", userController.getAllUsers.bind(userController));

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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 */

// GET /api/v1/users/:id - Obtener usuario por ID
router.get("/:id", userController.getUserById.bind(userController));

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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 */

// GET /api/v1/users/email/:email - Obtener usuario por email
router.get("/email/:email", userController.getUserByEmail.bind(userController));

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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autorizado
 */

// POST /api/v1/users - Crear nuevo usuario ← ESTA RUTA ES LA QUE FALLA
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
 *                 description: "Contraseña debe tener al menos 8 caracteres, una mayúscula y un número. Se compara con la versión hasheada en la base de datos."
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos de entrada inválidos o usuario/email ya existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation error"
 *                 error:
 *                   type: string
 *                   example: "El nombre de usuario ya existe"
 */

// PUT /api/v1/users/:id - Actualizar usuario por id
router.put(
  "/:id",
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
 *                 description: "Nueva contraseña (opcional). Debe tener al menos 8 caracteres, una mayúscula y un número."
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
 *             schema:
 *               type: object
 *             required:
 *               - contrasena
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 description: "Email del usuario (requerido si no se proporciona nombre_usuario)"
 *                 example: "john@example.com"
 *               nombre_usuario:
 *                 type: string
 *                 description: "Nombre de usuario (requerido si no se proporciona correo)"
 *                 example: "johndoe"
 *               contrasena:
 *                 type: string
 *                 format: password
 *                 example: "SecurePassword123"
 *             example:
 *               correo: "john@example.com"
 *               contrasena: "SecurePassword123"
 *     responses:
 *       200:
 *         description: Autenticación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Autenticación exitosa"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 userId:
 *                   type: integer
 *                   example: 1
 *                 username:
 *                   type: string
 *                   example: "johndoe"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Credenciales inválidas"
 *                 error:
 *                   type: string
 *                   example: "El correo o la contraseña no son correctos"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */

// DELETE /api/v1/users/:id - eliminar usuario
router.delete("/:id", userController.deleteUser.bind(userController));

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario eliminado correctamente"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error eliminando usuario"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: No autorizado
 */

// POST /api/v1/users/forgot-password - Solicitar restablecimiento de contraseña
router.post('/forgot-password', userController.forgotPassword.bind(userController));

/**
 * @swagger
 * /users/forgot-password:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
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
 *                 description: "Email o nombre de usuario del usuario"
 *                 example: "john@example.com"
 *             example:
 *               emailOrUsername: "john@example.com"
 *     responses:
 *       200:
 *         description: Enlace de restablecimiento enviado al email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Se ha enviado un enlace de restablecimiento a tu email."
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Email o nombre de usuario requerido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Email o nombre de usuario es requerido"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */

// POST /api/v1/users/reset-password - Restablecer contraseña con token
router.post('/reset-password', userController.resetPassword.bind(userController));

/**
 * @swagger
 * /users/reset-password:
 *   post:
 *     summary: Restablecer contraseña con token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: "Token de restablecimiento recibido por email"
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: "Nueva contraseña. Debe tener al menos 8 caracteres, una mayúscula y un número."
 *                 example: "NewSecurePassword123"
 *             example:
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               newPassword: "NewSecurePassword123"
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Contraseña restablecida exitosamente"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Token inválido o contraseña no cumple requisitos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token inválido o expirado"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */


export default router;
