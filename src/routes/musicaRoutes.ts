import { Router } from "express";
import { musicController } from "../controllers/MusicController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Música
 *   description: Endpoints para consultar canciones y álbumes
 */

// GET /api/v1/musica - Obtener todas las canciones
router.get("/", authenticateToken, musicController.getAllCanciones.bind(musicController));

/**
 * @swagger
 * /musica:
 *   get:
 *     summary: Obtener todas las canciones
 *     description: Retorna lista completa de todas las canciones disponibles
 *     tags: [Música]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de canciones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: No autorizado
 */

// GET /api/v1/musica/nombre/:nombre - Obtener cancion por nombre
router.get(
  "/nombre/:nombre",
  authenticateToken,
  musicController.getCancionByNombre.bind(musicController)
);

/**
 * @swagger
 * /musica/nombre/{nombre}:
 *   get:
 *     summary: Buscar canciones por nombre
 *     description: Busca canciones que coincidan parcialmente con el nombre especificado
 *     tags: [Música]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: nombre
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre o parte del nombre de la canción
 *     responses:
 *       200:
 *         description: Resultados de la búsqueda obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: No autorizado
 */

// GET /api/v1/musica/albums - Obtener todos los albums
router.get("/albums", authenticateToken, musicController.getAllAlbums.bind(musicController));

/**
 * @swagger
 * /musica/albums:
 *   get:
 *     summary: Obtener todos los álbumes
 *     description: Retorna lista completa de todos los álbumes musicales disponibles
 *     tags: [Música]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de álbumes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: No autorizado
 */

// GET /api/v1/musica/albums/:id/canciones - Obtener canciones por id de álbum
router.get(
  "/albums/:id/canciones",
  authenticateToken,
  musicController.getCancionesByAlbum.bind(musicController)
);

/**
 * @swagger
 * /musica/albums/{id}/canciones:
 *   get:
 *     summary: Obtener canciones de un álbum
 *     description: Retorna todas las canciones pertenecientes al álbum especificado
 *     tags: [Música]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del álbum
 *     responses:
 *       200:
 *         description: Canciones del álbum obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Álbum no encontrado
 *       401:
 *         description: No autorizado
 */

// GET /api/v1/musica/:id - Obtener cancion por id
router.get("/:id", authenticateToken, musicController.getCancionById.bind(musicController));
/**
 * @swagger
 * /musica/{id}:
 *   get:
 *     summary: Obtener canción por ID
 *     description: Retorna información completa de una canción específica
 *     tags: [Música]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la canción
 *     responses:
 *       200:
 *         description: Canción encontrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Canción no encontrada
 *       401:
 *         description: No autorizado
 */

// GET /api/v1/musica/albums/:albumId - Obtener canciones por ID de álbum
router.get("/albums/:albumId", authenticateToken, musicController.getCancionesByAlbum.bind(musicController));

/**
 * @swagger
 * /musica/albums/{albumId}:
 *   get:
 *     summary: Obtener canciones por ID de álbum
 *     description: Retorna todas las canciones pertenecientes al álbum especificado
 *     tags: [Música]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: albumId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del álbum
 *     responses:
 *       200:
 *         description: Canciones del álbum obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Álbum no encontrado o sin canciones
 *       401:
 *         description: No autorizado
 */

// GET /api/v1/musica/albums/nombre/:nombre - Obtener álbum por nombre
router.get(
  "/albums/nombre/:nombre",
  authenticateToken,
  musicController.getAlbumByNombre.bind(musicController)
);

/**
 * @swagger
 * /musica/albums/nombre/{nombre}:
 *   get:
 *     summary: Buscar álbum por nombre
 *     description: Busca un álbum que coincida exactamente con el nombre especificado
 *     tags: [Música]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: nombre
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre exacto del álbum
 *     responses:
 *       200:
 *         description: Álbum encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Álbum no encontrado
 *       401:
 *         description: No autorizado
 */

export default router;
