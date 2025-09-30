"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.musicController = exports.MusicController = void 0;
const MusicService_1 = require("../services/MusicService");
class MusicController {
    async getAllCanciones(req, res) {
        const result = await MusicService_1.musicService.getAllCanciones();
        const response = {
            success: result.success,
            message: result.success
                ? "Canciones obtenidas"
                : "Error al obtener canciones",
            data: result.canciones,
            error: result.error,
            timestamp: new Date(),
        };
        res.status(result.success ? 200 : 500).json(response);
    }
    async getCancionById(req, res) {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido",
                timestamp: new Date(),
            });
        }
        const result = await MusicService_1.musicService.getCancionById(id);
        const status = result.success ? 200 : 404;
        const response = {
            success: result.success,
            message: result.success ? "Canción encontrada" : "Canción no encontrada",
            data: result.cancion,
            error: result.error,
            timestamp: new Date(),
        };
        res.status(status).json(response);
    }
    async getCancionByNombre(req, res) {
        const { nombre } = req.params;
        if (!nombre)
            return res.status(400).json({
                success: false,
                message: "Nombre requerido",
                timestamp: new Date(),
            });
        const result = await MusicService_1.musicService.getCancionByNombre(nombre);
        const response = {
            success: result.success,
            message: result.success ? "Resultados de búsqueda" : "Error en búsqueda",
            data: result.canciones,
            error: result.error,
            timestamp: new Date(),
        };
        res.status(result.success ? 200 : 500).json(response);
    }
    async getAllAlbums(req, res) {
        const result = await MusicService_1.musicService.getAllAlbums();
        const response = {
            success: result.success,
            message: result.success
                ? "Álbumes obtenidos"
                : "Error al obtener álbumes",
            data: result.albums,
            error: result.error,
            timestamp: new Date(),
        };
        res.status(result.success ? 200 : 500).json(response);
    }
    async getCancionesByAlbum(req, res) {
        const id = parseInt(req.params.id);
        if (isNaN(id))
            return res.status(400).json({
                success: false,
                message: "ID inválido",
                timestamp: new Date(),
            });
        const result = await MusicService_1.musicService.getCancionesByAlbum(id);
        const response = {
            success: result.success,
            message: result.success
                ? "Canciones por álbum obtenidas"
                : "Error al obtener canciones por álbum",
            data: result.canciones,
            error: result.error,
            timestamp: new Date(),
        };
        res.status(result.success ? 200 : 500).json(response);
    }
    async getAlbumById(req, res) {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res
                .status(400)
                .json({
                success: false,
                message: "ID inválido",
                timestamp: new Date(),
            });
        }
        const result = await MusicService_1.musicService.getAlbumById(id);
        res.status(result.success ? 200 : 404).json({
            success: result.success,
            message: result.success ? "Álbum encontrado" : "Álbum no encontrado",
            data: result.album,
            error: result.error,
            timestamp: new Date(),
        });
    }
    async getAlbumByNombre(req, res) {
        const { nombre } = req.params;
        if (!nombre) {
            return res
                .status(400)
                .json({
                success: false,
                message: "Nombre requerido",
                timestamp: new Date(),
            });
        }
        const result = await MusicService_1.musicService.getAlbumByNombre(nombre);
        res.status(result.success ? 200 : 404).json({
            success: result.success,
            message: result.success ? "Álbum encontrado" : "Álbum no encontrado",
            data: result.album,
            error: result.error,
            timestamp: new Date(),
        });
    }
}
exports.MusicController = MusicController;
exports.musicController = new MusicController();
