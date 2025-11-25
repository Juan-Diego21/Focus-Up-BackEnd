import { Request, Response } from "express";
import { musicService } from "../services/MusicService";
import { ApiResponse } from "../types/ApiResponse";

/**
 * Controlador para la gestión de música y álbumes
 * Maneja consultas de canciones y álbumes para la funcionalidad de música de fondo
 */
export class MusicController {
  async getAllCanciones(req: Request, res: Response) {
    const result = await musicService.getAllCanciones();
    const response: ApiResponse = {
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

  async getCancionById(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID inválido",
        timestamp: new Date(),
      });
    }
    const result = await musicService.getCancionById(id);
    const status = result.success ? 200 : 404;
    const response: ApiResponse = {
      success: result.success,
      message: result.success ? "Canción encontrada" : "Canción no encontrada",
      data: result.cancion,
      error: result.error,
      timestamp: new Date(),
    };
    res.status(status).json(response);
  }

  async getCancionByNombre(req: Request, res: Response) {
    const { nombre } = req.params;
    if (!nombre)
      return res.status(400).json({
        success: false,
        message: "Nombre requerido",
        timestamp: new Date(),
      });

    const result = await musicService.getCancionByNombre(nombre);
    const response: ApiResponse = {
      success: result.success,
      message: result.success ? "Resultados de búsqueda" : "Error en búsqueda",
      data: result.canciones,
      error: result.error,
      timestamp: new Date(),
    };
    res.status(result.success ? 200 : 500).json(response);
  }

  async getAllAlbums(req: Request, res: Response) {
    const result = await musicService.getAllAlbums();
    const response: ApiResponse = {
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

  async getCancionesByAlbum(req: Request, res: Response) {
    const albumId = parseInt(req.params.albumId);
    if (isNaN(albumId))
      return res.status(400).json({
        success: false,
        message: "ID de álbum inválido",
        timestamp: new Date(),
      });

    const result = await musicService.getCancionesByAlbum(albumId);
    const hasSongs = result.canciones && result.canciones.length > 0;
    const response: ApiResponse = {
      success: result.success,
      message: result.success
        ? (hasSongs ? "Songs fetched successfully" : "No songs found for this album")
        : "Error al obtener canciones por álbum",
      data: result.canciones,
      error: result.error,
      timestamp: new Date(),
    };
    res.status(result.success ? 200 : 500).json(response);
  }

  async getAlbumById(req: Request, res: Response) {
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

    const result = await musicService.getAlbumById(id);
    res.status(result.success ? 200 : 404).json({
      success: result.success,
      message: result.success ? "Álbum encontrado" : "Álbum no encontrado",
      data: result.album,
      error: result.error,
      timestamp: new Date(),
    });
  }

  async getAlbumByNombre(req: Request, res: Response) {
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

    const result = await musicService.getAlbumByNombre(nombre);
    res.status(result.success ? 200 : 404).json({
      success: result.success,
      message: result.success ? "Álbum encontrado" : "Álbum no encontrado",
      data: result.album,
      error: result.error,
      timestamp: new Date(),
    });
  }
}

export const musicController = new MusicController();
