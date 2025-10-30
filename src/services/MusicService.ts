import { musicRepository } from "../repositories/MusicRepository";
import { Musica, Album } from "../types/Musica";

/**
 * Servicio para la gestión de música y álbumes
 * Maneja consultas de canciones y álbumes para la funcionalidad de música de fondo
 */
export class MusicService {
  async getAllCanciones(): Promise<{
    success: boolean;
    canciones?: Musica[];
    error?: string;
  }> {
    try {
      const canciones = await musicRepository.findAll();
      return { success: true, canciones };
    } catch (error) {
      console.error("Error en MusicService.getAllCanciones:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error interno",
      };
    }
  }

  async getCancionById(
    id: number
  ): Promise<{ success: boolean; cancion?: Musica; error?: string }> {
    try {
      const cancion = await musicRepository.findById(id);
      if (!cancion) return { success: false, error: "Canción no encontrada" };
      return { success: true, cancion };
    } catch (error) {
      console.error("Error en MusicService.getCancionById:", error);
      return { success: false, error: "Error al consultar canción" };
    }
  }

  async getCancionByNombre(
    nombre: string
  ): Promise<{ success: boolean; canciones?: Musica[]; error?: string }> {
    try {
      const canciones = await musicRepository.findByNombre(nombre);
      return { success: true, canciones };
    } catch (error) {
      console.error("Error en MusicService.getCancionByNombre:", error);
      return { success: false, error: "Error en búsqueda" };
    }
  }

  async getAllAlbums(): Promise<{
    success: boolean;
    albums?: Album[];
    error?: string;
  }> {
    try {
      const albums = await musicRepository.findAllAlbums();
      return { success: true, albums };
    } catch (error) {
      console.error("Error en MusicService.getAllAlbums:", error);
      return { success: false, error: "Error al obtener álbumes" };
    }
  }

  async getCancionesByAlbum(
    idAlbum: number
  ): Promise<{ success: boolean; canciones?: Musica[]; error?: string }> {
    try {
      const canciones = await musicRepository.findByAlbumId(idAlbum);
      return { success: true, canciones };
    } catch (error) {
      console.error("Error en MusicService.getCancionesByAlbum:", error);
      return { success: false, error: "Error al obtener canciones por álbum" };
    }
  }

  async getAlbumById(
    id: number
  ): Promise<{ success: boolean; album?: Album; error?: string }> {
    try {
      const album = await musicRepository.findAlbumById(id);
      if (!album) return { success: false, error: "Álbum no encontrado" };
      return { success: true, album };
    } catch (error) {
      console.error("Error en MusicService.getAlbumById:", error);
      return { success: false, error: "Error al obtener álbum" };
    }
  }

  async getAlbumByNombre(
    nombre: string
  ): Promise<{ success: boolean; album?: Album; error?: string }> {
    try {
      const album = await musicRepository.findAlbumByNombre(nombre);
      if (!album) return { success: false, error: "Álbum no encontrado" };
      return { success: true, album };
    } catch (error) {
      console.error("Error en MusicService.getAlbumByNombre:", error);
      return { success: false, error: "Error al obtener álbum" };
    }
  }
}

export const musicService = new MusicService();
