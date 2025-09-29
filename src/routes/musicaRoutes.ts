import { Router } from "express";
import { musicController } from "../controllers/MusicController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Música
 *   description: Endpoints para consultar canciones y álbumes
 */

// GET /api/v1/musica - Obtener todas las canciones
router.get("/", musicController.getAllCanciones.bind(musicController));

/**
 * @swagger
 * /musica:
 *   get:
 *     summary: Obtener todas las canciones
 *     tags: [Música]
 *     responses:
 *       200:
 *         description: Lista de canciones
 */

// GET /api/v1/musica/nombre/:nombre - Obtener cancion por nombre
router.get(
  "/nombre/:nombre",
  musicController.getCancionByNombre.bind(musicController)
);

/**
 * @swagger
 * /musica/nombre/{nombre}:
 *   get:
 *     summary: Buscar canciones por nombre
 *     tags: [Música]
 *     parameters:
 *       - in: path
 *         name: nombre
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultados de la búsqueda
 */

// GET /api/v1/musica/albums - Obtener todos los albums
router.get("/albums", musicController.getAllAlbums.bind(musicController));

/**
 * @swagger
 * /musica/albums:
 *   get:
 *     summary: Obtener todos los álbumes
 *     tags: [Música]
 *     responses:
 *       200:
 *         description: Lista de álbumes
 */

// GET /api/v1/musica/albums/:id/canciones - Obtener canciones por id de álbum
router.get(
  "/albums/:id/canciones",
  musicController.getCancionesByAlbum.bind(musicController)
);

/**
 * @swagger
 * /musica/albums/{id}:
 *   get:
 *     summary: Obtener canciones por id de álbum
 *     tags: [Música]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Canciones del álbum
 */

// GET /api/v1/musica/:id - Obtener cancion por id
router.get("/:id", musicController.getCancionById.bind(musicController));
/**
 * @swagger
 * /musica/{id}:
 *   get:
 *     summary: Obtener canción por ID
 *     tags: [Música]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Canción encontrada
 *       404:
 *         description: No encontrada
 */

// GET /api/v1/musica/albums/:id - Obtener álbum por ID
router.get("/albums/:id", musicController.getAlbumById.bind(musicController));

/**
 * @swagger
 * /musica/albums/{id}:
 *   get:
 *     summary: Obtener un álbum por ID
 *     tags: [Música]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Álbum encontrado
 *       404:
 *         description: No encontrado
 */

// GET /api/v1/musica/albums/nombre/:nombre - Obtener álbum por nombre
router.get(
  "/albums/nombre/:nombre",
  musicController.getAlbumByNombre.bind(musicController)
);

/**
 * @swagger
 * /musica/albums/nombre/{nombre}:
 *   get:
 *     summary: Obtener un álbum por nombre
 *     tags: [Música]
 *     parameters:
 *       - in: path
 *         name: nombre
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Álbum encontrado
 *       404:
 *         description: No encontrado
 */

export default router;
