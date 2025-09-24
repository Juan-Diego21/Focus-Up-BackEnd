"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.musicService = exports.MusicService = void 0;
const MusicRepository_1 = require("../repositories/MusicRepository");
class MusicService {
    async getAllCanciones() {
        try {
            const canciones = await MusicRepository_1.musicRepository.findAll();
            return { success: true, canciones };
        }
        catch (error) {
            console.error("Error en MusicService.getAllCanciones:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Error interno",
            };
        }
    }
    async getCancionById(id) {
        try {
            const cancion = await MusicRepository_1.musicRepository.findById(id);
            if (!cancion)
                return { success: false, error: "Canción no encontrada" };
            return { success: true, cancion };
        }
        catch (error) {
            console.error("Error en MusicService.getCancionById:", error);
            return { success: false, error: "Error al consultar canción" };
        }
    }
    async getCancionByNombre(nombre) {
        try {
            const canciones = await MusicRepository_1.musicRepository.findByNombre(nombre);
            return { success: true, canciones };
        }
        catch (error) {
            console.error("Error en MusicService.getCancionByNombre:", error);
            return { success: false, error: "Error en búsqueda" };
        }
    }
    async getAllAlbums() {
        try {
            const albums = await MusicRepository_1.musicRepository.findAllAlbums();
            return { success: true, albums };
        }
        catch (error) {
            console.error("Error en MusicService.getAllAlbums:", error);
            return { success: false, error: "Error al obtener álbumes" };
        }
    }
    async getCancionesByAlbum(idAlbum) {
        try {
            const canciones = await MusicRepository_1.musicRepository.findByAlbumId(idAlbum);
            return { success: true, canciones };
        }
        catch (error) {
            console.error("Error en MusicService.getCancionesByAlbum:", error);
            return { success: false, error: "Error al obtener canciones por álbum" };
        }
    }
    async getAlbumById(id) {
        try {
            const album = await MusicRepository_1.musicRepository.findAlbumById(id);
            if (!album)
                return { success: false, error: "Álbum no encontrado" };
            return { success: true, album };
        }
        catch (error) {
            console.error("Error en MusicService.getAlbumById:", error);
            return { success: false, error: "Error al obtener álbum" };
        }
    }
    async getAlbumByNombre(nombre) {
        try {
            const album = await MusicRepository_1.musicRepository.findAlbumByNombre(nombre);
            if (!album)
                return { success: false, error: "Álbum no encontrado" };
            return { success: true, album };
        }
        catch (error) {
            console.error("Error en MusicService.getAlbumByNombre:", error);
            return { success: false, error: "Error al obtener álbum" };
        }
    }
}
exports.MusicService = MusicService;
exports.musicService = new MusicService();
