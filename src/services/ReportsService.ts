import { AppDataSource } from "../config/ormconfig";
import { MetodoRealizadoEntity, MetodoProgreso, MetodoEstado } from "../models/MetodoRealizado.entity";
import { SesionConcentracionRealizadaEntity, SesionEstado } from "../models/SesionConcentracionRealizada.entity";
import { UserEntity } from "../models/User.entity";
import { MetodoEstudioEntity } from "../models/MetodoEstudio.entity";
import { MusicaEntity } from "../models/Musica.entity";
import logger from "../utils/logger";

export interface CreateActiveMethodData {
  idMetodo: number;
  estado?: string;
  progreso?: number;
  idUsuario: number;
}

export interface UpdateMethodProgressData {
  progreso?: MetodoProgreso;
  finalizar?: boolean;
}

export interface UpdateSessionProgressData {
  estado?: SesionEstado;
}

export interface ReportData {
  metodos: any[];
  sesiones: any[];
}

/**
 * Servicio para la gestión de reportes de métodos de estudio y sesiones de concentración
 * Maneja operaciones CRUD y lógica de negocio para reportes
 */
export class ReportsService {

  private metodoRealizadoRepository = AppDataSource.getRepository(MetodoRealizadoEntity);
  private sesionRealizadaRepository = AppDataSource.getRepository(SesionConcentracionRealizadaEntity);
  private userRepository = AppDataSource.getRepository(UserEntity);
  private metodoRepository = AppDataSource.getRepository(MetodoEstudioEntity);
  private musicaRepository = AppDataSource.getRepository(MusicaEntity);

  /**
   * Crea un nuevo método activo para un usuario
   * Inicializa el método con progreso 0 y estado en progreso
   */
  async createActiveMethod(data: CreateActiveMethodData): Promise<{
    success: boolean;
    metodoRealizado?: MetodoRealizadoEntity;
    message?: string;
    error?: string;
  }> {
    try {
      // Verificar que el usuario existe
      const user = await this.userRepository.findOne({
        where: { idUsuario: data.idUsuario }
      });

      if (!user) {
        return {
          success: false,
          error: "Usuario no encontrado"
        };
      }

      // Verificar que el método existe
      const metodo = await this.metodoRepository.findOne({
        where: { idMetodo: data.idMetodo }
      });

      if (!metodo) {
        return {
          success: false,
          error: "Método de estudio no encontrado"
        };
      }

      // Verificar si ya existe un método activo para este usuario
      const existingActiveMethod = await this.metodoRealizadoRepository.findOne({
        where: {
          idUsuario: data.idUsuario,
          estado: MetodoEstado.EN_PROGRESO
        }
      });

      if (existingActiveMethod) {
        return {
          success: false,
          error: "Ya existe un método activo para este usuario"
        };
      }

      // Crear el método realizado
      const metodoRealizado = this.metodoRealizadoRepository.create({
        idUsuario: data.idUsuario,
        idMetodo: data.idMetodo,
        progreso: data.progreso !== undefined ? data.progreso : MetodoProgreso.INICIADO,
        estado: data.estado ? data.estado as MetodoEstado : MetodoEstado.EN_PROGRESO,
        fechaInicio: new Date(),
      });

      const savedMetodo = await this.metodoRealizadoRepository.save(metodoRealizado);

      return {
        success: true,
        metodoRealizado: savedMetodo,
        message: "Método activo creado exitosamente"
      };

    } catch (error) {
      logger.error("Error en ReportsService.createActiveMethod:", error);
      return {
        success: false,
        error: "Error interno del servidor"
      };
    }
  }

  /**
   * Obtiene todos los reportes de un usuario (métodos y sesiones)
   * Incluye información completa de métodos y sesiones con sus relaciones
   */
  async getUserReports(userId: number): Promise<{
    success: boolean;
    reports?: ReportData;
    error?: string;
  }> {
    try {
      // Obtener métodos realizados del usuario
      const metodosRealizados = await this.metodoRealizadoRepository.find({
        where: { idUsuario: userId },
        relations: ["metodo"],
        order: { fechaCreacion: "DESC" }
      });

      // Obtener sesiones realizadas del usuario (a través de métodos realizados)
      const sesionesRealizadas = await this.sesionRealizadaRepository
        .createQueryBuilder("sesion")
        .leftJoinAndSelect("sesion.musica", "musica")
        .leftJoin("sesion.metodoRealizado", "metodoRealizado")
        .where("metodoRealizado.idUsuario = :userId", { userId })
        .orderBy("sesion.fechaCreacion", "DESC")
        .getMany();

      // Formatear datos de métodos
      const metodos = metodosRealizados.map(metodoRealizado => ({
        id: metodoRealizado.idMetodoRealizado,
        metodo: {
          id: metodoRealizado.metodo?.idMetodo,
          nombre: metodoRealizado.metodo?.nombreMetodo,
          descripcion: metodoRealizado.metodo?.descripcion,
          color: metodoRealizado.metodo?.colorHexa,
          imagen: metodoRealizado.metodo?.urlImagen,
        },
        progreso: metodoRealizado.progreso,
        estado: metodoRealizado.estado,
        fechaInicio: metodoRealizado.fechaInicio,
        fechaFin: metodoRealizado.fechaFin,
        fechaCreacion: metodoRealizado.fechaCreacion,
      }));

      // Formatear datos de sesiones
      const sesiones = sesionesRealizadas.map(sesionRealizada => ({
        id: sesionRealizada.idSesionRealizada,
        musica: sesionRealizada.musica ? {
          id: sesionRealizada.musica.idCancion,
          nombre: sesionRealizada.musica.nombreCancion,
          artista: sesionRealizada.musica.artistaCancion,
          genero: sesionRealizada.musica.generoCancion,
        } : null,
        duracion: null, // Duration not available in current schema
        fechaProgramada: sesionRealizada.fechaProgramada,
        estado: sesionRealizada.estado,
        fechaInicio: null, // Start date not available in current schema
        fechaFin: null, // End date not available in current schema
        fechaCreacion: sesionRealizada.fechaCreacion,
      }));

      return {
        success: true,
        reports: {
          metodos,
          sesiones
        }
      };

    } catch (error) {
      logger.error("Error en ReportsService.getUserReports:", error);
      return {
        success: false,
        error: "Error al obtener reportes"
      };
    }
  }

  /**
   * Actualiza el progreso de un método realizado
   * Maneja la lógica de finalización automática cuando llega al 100%
   */
  async updateMethodProgress(
    methodId: number,
    userId: number,
    data: UpdateMethodProgressData
  ): Promise<{
    success: boolean;
    metodoRealizado?: MetodoRealizadoEntity;
    message?: string;
    error?: string;
  }> {
    try {
      // Buscar el método realizado
      const metodoRealizado = await this.metodoRealizadoRepository.findOne({
        where: {
          idMetodoRealizado: methodId,
          idUsuario: userId
        }
      });

      if (!metodoRealizado) {
        return {
          success: false,
          error: "Método realizado no encontrado"
        };
      }

      // Actualizar campos
      if (data.progreso !== undefined) {
        metodoRealizado.progreso = data.progreso;
      }

      // Si se solicita finalizar o el progreso llega al 100%, marcar como completado
      if (data.finalizar || (data.progreso === MetodoProgreso.COMPLETADO)) {
        metodoRealizado.estado = MetodoEstado.COMPLETADO;
        metodoRealizado.fechaFin = new Date();
        metodoRealizado.progreso = MetodoProgreso.COMPLETADO;
      }

      const updatedMetodo = await this.metodoRealizadoRepository.save(metodoRealizado);

      return {
        success: true,
        metodoRealizado: updatedMetodo,
        message: "Progreso del método actualizado exitosamente"
      };

    } catch (error) {
      logger.error("Error en ReportsService.updateMethodProgress:", error);
      return {
        success: false,
        error: "Error al actualizar progreso del método"
      };
    }
  }

  /**
   * Actualiza el progreso de una sesión de concentración
   * Maneja cambios de estado y timestamps
   */
  async updateSessionProgress(
    sessionId: number,
    userId: number,
    data: UpdateSessionProgressData
  ): Promise<{
    success: boolean;
    sesionRealizada?: SesionConcentracionRealizadaEntity;
    message?: string;
    error?: string;
  }> {
    try {
      // Buscar la sesión realizada (a través de métodos realizados)
      const sesionRealizada = await this.sesionRealizadaRepository
        .createQueryBuilder("sesion")
        .leftJoin("sesion.metodoRealizado", "metodoRealizado")
        .where("sesion.idSesionRealizada = :sessionId", { sessionId })
        .andWhere("metodoRealizado.idUsuario = :userId", { userId })
        .getOne();

      if (!sesionRealizada) {
        return {
          success: false,
          error: "Sesión realizada no encontrada"
        };
      }

      // Actualizar campos
      if (data.estado !== undefined) {
        sesionRealizada.estado = data.estado;
      }

      const updatedSesion = await this.sesionRealizadaRepository.save(sesionRealizada);

      return {
        success: true,
        sesionRealizada: updatedSesion,
        message: "Progreso de la sesión actualizado exitosamente"
      };

    } catch (error) {
      logger.error("Error en ReportsService.updateSessionProgress:", error);
      return {
        success: false,
        error: "Error al actualizar progreso de la sesión"
      };
    }
  }

  /**
   * Obtiene un método realizado específico por ID y usuario
   */
  async getMethodById(methodId: number, userId: number): Promise<{
    success: boolean;
    metodoRealizado?: MetodoRealizadoEntity;
    error?: string;
  }> {
    try {
      const metodoRealizado = await this.metodoRealizadoRepository.findOne({
        where: {
          idMetodoRealizado: methodId,
          idUsuario: userId
        },
        relations: ["metodo"]
      });

      if (!metodoRealizado) {
        return {
          success: false,
          error: "Método realizado no encontrado"
        };
      }

      return {
        success: true,
        metodoRealizado
      };

    } catch (error) {
      logger.error("Error en ReportsService.getMethodById:", error);
      return {
        success: false,
        error: "Error al obtener método"
      };
    }
  }

  /**
   * Obtiene una sesión realizada específica por ID y usuario
   */
  async getSessionById(sessionId: number, userId: number): Promise<{
    success: boolean;
    sesionRealizada?: SesionConcentracionRealizadaEntity;
    error?: string;
  }> {
    try {
      const sesionRealizada = await this.sesionRealizadaRepository
        .createQueryBuilder("sesion")
        .leftJoinAndSelect("sesion.musica", "musica")
        .leftJoin("sesion.metodoRealizado", "metodoRealizado")
        .where("sesion.idSesionRealizada = :sessionId", { sessionId })
        .andWhere("metodoRealizado.idUsuario = :userId", { userId })
        .getOne();

      if (!sesionRealizada) {
        return {
          success: false,
          error: "Sesión realizada no encontrada"
        };
      }

      return {
        success: true,
        sesionRealizada
      };

    } catch (error) {
      logger.error("Error en ReportsService.getSessionById:", error);
      return {
        success: false,
        error: "Error al obtener sesión"
      };
    }
  }
}

export const reportsService = new ReportsService();