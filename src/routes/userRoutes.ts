import { Router } from "express";
import { userController } from "../controllers/UserController";
import {
  validateUserCreate,
  validateUserUpdate,
} from "../middleware/validation";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// GET /api/v1/users - Obtener todos los usuarios (protegido)
router.get(
  "/",
  authenticateToken,
  userController.getAllUsers.bind(userController)
);

// GET /api/v1/users/profile - Obtener perfil del usuario autenticado
router.get(
  "/profile",
  authenticateToken,
  userController.getProfile.bind(userController)
);

// GET /api/v1/users/:id - Obtener usuario por ID (protegido)
router.get(
  "/:id",
  authenticateToken,
  userController.getUserById.bind(userController)
);

// ... (otras rutas existentes)

export default router;
