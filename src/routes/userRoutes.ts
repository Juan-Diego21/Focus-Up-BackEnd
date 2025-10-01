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
 *             $ref: '#/components/schemas/User'
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
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: "Email o nombre de usuario"
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePassword123"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/forgot-password", userController.forgotPassword.bind(userController));
/**
 * @swagger
 * /users/forgot-password:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: "brayan22@example.com"
 *     responses:
 *       200:
 *         description: Enlace de recuperación enviado al correo
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
 *                   example: "Correo de recuperación enviado"
 *       404:
 *         description: Correo no registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */


router.post("/reset-password", userController.resetPassword.bind(userController));
/**
 * @swagger
 * /users/reset-password:
 *   post:
 *     summary: Restablecer contraseña usando token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - nuevaContrasena
 *             properties:
 *               token:
 *                 type: string
 *                 example: "abc123"
 *               nuevaContrasena:
 *                 type: string
 *                 format: password
 *                 example: "FocusUp123!"
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
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
 *                   example: "Contraseña actualizada"
 *       400:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export default router;
