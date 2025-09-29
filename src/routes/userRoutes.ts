import { Router } from 'express';
import { userController } from '../controllers/UserController';
import { validateUserCreate, validateUserUpdate } from '../middleware/validation';

const router = Router();

// GET /api/v1/users - Obtener todos los usuarios
router.get('/', userController.getAllUsers.bind(userController));

// GET /api/v1/users/:id - Obtener usuario por ID
router.get('/:id', userController.getUserById.bind(userController));

// GET /api/v1/users/email/:email - Obtener usuario por email  
router.get('/email/:email', userController.getUserByEmail.bind(userController));

// POST /api/v1/users - Crear nuevo usuario ← ESTA RUTA ES LA QUE FALLA
router.post('/', validateUserCreate, userController.createUser.bind(userController));

// PUT /api/v1/users/:id - Actualizar usuario
router.put('/:id', validateUserUpdate, userController.updateUser.bind(userController));

// POST /api/v1/users/login - Login de usuario
router.post('/login', userController.login.bind(userController));

export default router;