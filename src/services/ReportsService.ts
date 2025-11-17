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

export interface ReportItem {
  id_reporte: number;
  id_usuario: number;
  nombre_metodo: string;
  progreso?: number;
  estado: string;
  fecha_creacion: Date;
}

export interface ReportData {
  metodos: any[];
  sesiones: any[];
  combined: ReportItem[];
}

// Funciones auxiliares para validación específica por método
/**
 * Normaliza el texto: convierte a minúsculas, elimina espacios extra, remueve acentos
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/\s+/g, ' '); // Normalizar espacios
}

/**
 * Aliases válidos para el método Pomodoro
 */
const pomodoroAliases = [
  'pomodoro',
  'metodo pomodoro',
  'método pomodoro',
  'pomodoro technique'
];

/**
 * Aliases válidos para el método Mind Maps
 */
const mindmapsAliases = [
  'mapas mentales',
  'mapa mental',
  'mind maps',
  'mind map',
  'método mapas mentales'
];

/**
 * Detecta el tipo de método basado en el nombre, usando normalización y aliases
 */
function getMethodType(nombreMetodo: string): 'pomodoro' | 'mindmaps' {
  const normalized = normalize(nombreMetodo);
  if (pomodoroAliases.includes(normalized)) return 'pomodoro';
  if (mindmapsAliases.includes(normalized)) return 'mindmaps';
  logger.warn(`Tipo de método no reconocido: "${nombreMetodo}" (normalizado: "${normalized}")`);
  throw new Error(`Tipo de método no reconocido: ${nombreMetodo}`);
}

function getValidProgress(type: 'pomodoro' | 'mindmaps'): number[] {
  if (type === 'pomodoro') return [0, 50, 100];
  if (type === 'mindmaps') return [20, 40, 60, 80, 100];
  return [];
}

/**
 * Normaliza el estado entrante a valores canónicos en inglés para validación interna
 * Acepta tanto español como inglés y los mapea a valores estándar
 */
function normalizeStatus(status: string, method: 'pomodoro' | 'mindmaps'): string {
  const normalized = normalize(status);
  const mappings: { [key: string]: { [key: string]: string } } = {
    pomodoro: {
      'en_progreso': 'in_progress',
      'completado': 'completed',
      'in_progress': 'in_progress',
      'completed': 'completed'
    },
    mindmaps: {
      'en_proceso': 'in_process',
      'casi_terminando': 'almost_done',
      'terminado': 'done',
      'in_process': 'in_process',
      'almost_done': 'almost_done',
      'done': 'done'
    }
  };

  const methodMappings = mappings[method];
  if (!methodMappings) {
    throw new Error(`Método no soportado: ${method}`);
  }

  const canonical = methodMappings[normalized];
  if (!canonical) {
    logger.warn(`Estado no reconocido para método ${method}: "${status}" (normalizado: "${normalized}")`);
    throw new Error(`Estado no reconocido para este método: ${status}`);
  }

  logger.debug(`Estado normalizado: "${status}" → "${canonical}" para método ${method}`);
  return canonical;
}

/**
 * Mapea el estado canónico en inglés al valor correspondiente en la base de datos
 */
function mapStatusToDB(canonical: string, method: 'pomodoro' | 'mindmaps'): string {
  const dbMappings: { [key: string]: { [key: string]: string } } = {
    pomodoro: {
      'in_progress': 'en_progreso',
      'completed': 'completado'
    },
    mindmaps: {
      'in_process': 'En_proceso',
      'almost_done': 'Casi_terminando',
      'done': 'Terminado'
    }
  };

  const methodMappings = dbMappings[method];
  return methodMappings[canonical] || canonical;
}

function getValidStatusMethods(type: 'pomodoro' | 'mindmaps'): string[] {
  if (type === 'pomodoro') return ['in_progress', 'completed'];
  if (type === 'mindmaps') return ['in_process', 'almost_done', 'done'];
  return [];
}

function getValidStatusSessions(type: 'pomodoro' | 'mindmaps'): string[] {
  return getValidStatusMethods(type); // Misma lógica para sesiones
}

const statusNormalization: { [key: string]: string } = {
  'in_process': 'en_proceso',
  'completed': 'completada',
  'En_proceso': 'en_proceso',
  'Casi_terminando': 'casi_terminando',
  'Terminado': 'terminado',
};

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

      // Validate progress based on method type
      if (data.progreso !== undefined) {
        try {
          const type = getMethodType(metodo.nombreMetodo);
          if (!getValidProgress(type).includes(data.progreso)) {
            return {
              success: false,
              message: "Progreso inválido para este método"
            };
          }
        } catch (error) {
          return {
            success: false,
            error: (error as Error).message
          };
        }
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

      // Normalizar estado si se proporciona
      let estadoNormalizado: MetodoEstado = MetodoEstado.EN_PROGRESO;
      if (data.estado) {
        try {
          const type = getMethodType(metodo.nombreMetodo);
          const canonical = normalizeStatus(data.estado, type);
          const dbValue = mapStatusToDB(canonical, type);
          estadoNormalizado = dbValue as MetodoEstado;
        } catch (error) {
          return {
            success: false,
            error: (error as Error).message
          };
        }
      }

      // Crear el método realizado
      const metodoRealizado = this.metodoRealizadoRepository.create({
        idUsuario: data.idUsuario,
        idMetodo: data.idMetodo,
        progreso: data.progreso !== undefined ? data.progreso : MetodoProgreso.INICIADO,
        estado: estadoNormalizado,
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
      // Asegurar que userId sea un número
      const numericUserId = Number(userId);
      logger.info("Buscando reportes para usuario ID:", numericUserId);

      // Verificar que el usuario existe
      const user = await this.userRepository.findOne({
        where: { idUsuario: numericUserId }
      });

      if (!user) {
        return {
          success: false,
          error: "Usuario no encontrado"
        };
      }

      // Obtener métodos realizados del usuario usando query builder
      const metodosRealizados = await this.metodoRealizadoRepository
        .createQueryBuilder("mr")
        .leftJoinAndSelect("mr.metodo", "m")
        .where("mr.idUsuario = :userId", { userId: numericUserId })
        .orderBy("mr.fechaCreacion", "DESC")
        .getMany();

      logger.info(`Encontrados ${metodosRealizados.length} métodos realizados para usuario ${numericUserId}`);

      // Obtener sesiones realizadas del usuario (directas o a través de métodos realizados)
      const sesionesRealizadas = await this.sesionRealizadaRepository
        .createQueryBuilder("sesion")
        .leftJoinAndSelect("sesion.musica", "musica")
        .leftJoin("sesion.metodoRealizado", "metodoRealizado")
        .where("sesion.idUsuario = :userId OR metodoRealizado.idUsuario = :userId", { userId: numericUserId })
        .orderBy("sesion.fechaCreacion", "DESC")
        .getMany();

      // Formatear datos de métodos
      const metodos = metodosRealizados.map(metodoRealizado => ({
        id: metodoRealizado.idMetodoRealizado,
        metodo: {
          id: metodoRealizado.metodo?.idMetodo,
          nombre: metodoRealizado.metodo?.nombreMetodo,
          descripcion: metodoRealizado.metodo?.descripcion,
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
        duracion: null, // Not available in current database schema
        fechaProgramada: sesionRealizada.fechaProgramada,
        estado: sesionRealizada.estado,
        fechaInicio: null, // Not available in current database schema
        fechaFin: null, // Not available in current database schema
        fechaCreacion: sesionRealizada.fechaCreacion,
      }));

      // Crear array combinado para el formato simplificado
      const combined: ReportItem[] = [
        ...metodos.map(metodo => ({
          id_reporte: metodo.id,
          id_usuario: numericUserId,
          nombre_metodo: metodo.metodo.nombre || 'Método desconocido',
          progreso: metodo.progreso,
          estado: metodo.estado,
          fecha_creacion: metodo.fechaCreacion,
        })),
        ...sesiones.map(sesion => ({
          id_reporte: sesion.id,
          id_usuario: numericUserId,
          nombre_metodo: sesion.musica ? `Sesión: ${sesion.musica.nombre}` : 'Sesión de concentración',
          progreso: undefined, // Sessions don't have progress
          estado: sesion.estado,
          fecha_creacion: sesion.fechaCreacion,
        }))
      ].sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime());

      return {
        success: true,
        reports: {
          metodos,
          sesiones,
          combined
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
      // Asegurar que los IDs sean números
      const numericMethodId = Number(methodId);
      const numericUserId = Number(userId);

      // Buscar el método realizado usando query builder
      const metodoRealizado = await this.metodoRealizadoRepository
        .createQueryBuilder("mr")
        .leftJoinAndSelect("mr.metodo", "m")
        .where("mr.idMetodoRealizado = :methodId", { methodId: numericMethodId })
        .andWhere("mr.idUsuario = :userId", { userId: numericUserId })
        .getOne();

      if (!metodoRealizado) {
        return {
          success: false,
          error: "Método realizado no encontrado"
        };
      }

      // Validate progress based on method type
      if (data.progreso !== undefined) {
        const metodo = metodoRealizado.metodo;
        if (!metodo) {
          return {
            success: false,
            error: "Método de estudio no encontrado"
          };
        }
        try {
          const type = getMethodType(metodo.nombreMetodo);
          if (!getValidProgress(type).includes(data.progreso)) {
            return {
              success: false,
              message: "Progreso inválido para este método"
            };
          }
        } catch (error) {
          return {
            success: false,
            error: (error as Error).message
          };
        }
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
        message: "Progreso actualizado correctamente"
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
      // Asegurar que los IDs sean números
      const numericSessionId = Number(sessionId);
      const numericUserId = Number(userId);

      // Buscar la sesión realizada (directa o a través de métodos realizados)
      const sesionRealizada = await this.sesionRealizadaRepository
        .createQueryBuilder("sesion")
        .leftJoinAndSelect("sesion.metodoRealizado", "metodoRealizado")
        .leftJoinAndSelect("metodoRealizado.metodo", "metodo")
        .where("sesion.idSesionRealizada = :sessionId", { sessionId: numericSessionId })
        .andWhere("(sesion.idUsuario = :userId OR metodoRealizado.idUsuario = :userId)", { userId: numericUserId })
        .getOne();

      if (!sesionRealizada) {
        return {
          success: false,
          error: "Sesión realizada no encontrada"
        };
      }

      // Validate and update status based on method type
      if (data.estado !== undefined) {
        const metodoRealizado = sesionRealizada.metodoRealizado;
        if (!metodoRealizado || !metodoRealizado.metodo) {
          return {
            success: false,
            error: "Método de estudio no encontrado para la sesión"
          };
        }
        try {
          const type = getMethodType(metodoRealizado.metodo.nombreMetodo);
          const canonical = normalizeStatus(data.estado, type);
          const dbValue = mapStatusToDB(canonical, type);
          sesionRealizada.estado = dbValue as SesionEstado;
        } catch (error) {
          return {
            success: false,
            error: (error as Error).message
          };
        }
      }

      const updatedSesion = await this.sesionRealizadaRepository.save(sesionRealizada);

      return {
        success: true,
        sesionRealizada: updatedSesion,
        message: "Sesión retomada correctamente"
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
      // Asegurar que los IDs sean números
      const numericMethodId = Number(methodId);
      const numericUserId = Number(userId);

      const metodoRealizado = await this.metodoRealizadoRepository
        .createQueryBuilder("mr")
        .leftJoinAndSelect("mr.metodo", "m")
        .where("mr.idMetodoRealizado = :methodId", { methodId: numericMethodId })
        .andWhere("mr.idUsuario = :userId", { userId: numericUserId })
        .getOne();

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
      // Asegurar que los IDs sean números
      const numericSessionId = Number(sessionId);
      const numericUserId = Number(userId);

      const sesionRealizada = await this.sesionRealizadaRepository
        .createQueryBuilder("sesion")
        .leftJoinAndSelect("sesion.musica", "musica")
        .leftJoin("sesion.metodoRealizado", "metodoRealizado")
        .where("sesion.idSesionRealizada = :sessionId", { sessionId: numericSessionId })
        .andWhere("(sesion.idUsuario = :userId OR metodoRealizado.idUsuario = :userId)", { userId: numericUserId })
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

  /**
   * Elimina un reporte (método realizado) por ID y usuario
   * Solo permite eliminar reportes que pertenecen al usuario autenticado
   */
  async deleteReport(reportId: number, userId: number): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      // Asegurar que los IDs sean números
      const numericReportId = Number(reportId);
      const numericUserId = Number(userId);

      logger.info("Buscando reporte con ID:", numericReportId, "para usuario:", numericUserId);

      // Verificar que el reporte existe y pertenece al usuario usando query builder
      const report = await this.metodoRealizadoRepository
        .createQueryBuilder("mr")
        .where("mr.idMetodoRealizado = :reportId", { reportId: numericReportId })
        .andWhere("mr.idUsuario = :userId", { userId: numericUserId })
        .getOne();

      if (!report) {
        logger.warn(`Reporte ${numericReportId} no encontrado para usuario ${numericUserId}`);
        return {
          success: false,
          error: "Reporte no encontrado o no autorizado"
        };
      }

      logger.info(`Eliminando reporte ${numericReportId} del usuario ${numericUserId}`);

      // Eliminar el reporte
      await this.metodoRealizadoRepository.remove(report);

      logger.info(`Reporte ${numericReportId} eliminado correctamente`);

      return {
        success: true,
        message: "Reporte eliminado correctamente"
      };

    } catch (error) {
      logger.error("Error en ReportsService.deleteReport:", error);
      return {
        success: false,
        error: "Error al eliminar reporte"
      };
    }
  }
}

export const reportsService = new ReportsService();