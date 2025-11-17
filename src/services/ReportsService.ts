import { AppDataSource } from "../config/ormconfig";
import { MetodoRealizadoEntity, MetodoProgreso, MetodoEstado } from "../models/MetodoRealizado.entity";
import { SesionConcentracionRealizadaEntity, SesionEstado } from "../models/SesionConcentracionRealizada.entity";
import { UserEntity } from "../models/User.entity";
import { MetodoEstudioEntity } from "../models/MetodoEstudio.entity";
import { MusicaEntity } from "../models/Musica.entity";
import logger from "../utils/logger";

// Centralized configuration for study methods
interface MethodConfig {
  name: string;
  aliases: string[];
  validProgress: number[];
  states: {
    [normalizedState: string]: {
      canonical: string;
      dbValue: string;
    };
  };
  progressToStateMapping: {
    [progress: number]: string; // maps progress to normalized state
  };
}

const METHODS_CONFIG: { [methodKey: string]: MethodConfig } = {
  pomodoro: {
    name: "pomodoro",
    aliases: [
      'pomodoro',
      'metodo pomodoro',
      'método pomodoro',
      'pomodoro technique'
    ],
    validProgress: [0, 20, 40, 50, 60, 80, 100],
    states: {
      'en_progreso': { canonical: 'in_progress', dbValue: 'en_progreso' },
      'completado': { canonical: 'completed', dbValue: 'completado' },
      'in_progress': { canonical: 'in_progress', dbValue: 'en_progreso' },
      'completed': { canonical: 'completed', dbValue: 'completado' }
    },
    progressToStateMapping: {
      0: 'en_progreso',
      20: 'en_progreso',
      40: 'en_progreso',
      50: 'en_progreso',
      60: 'en_progreso',
      80: 'en_progreso',
      100: 'completado'
    }
  },
  mindmaps: {
    name: "mindmaps",
    aliases: [
      'mapas mentales',
      'mapa mental',
      'mind maps',
      'mind map',
      'método mapas mentales',
      'repaso espaciado',
      'spaced repetition'
    ],
    validProgress: [20, 40, 60, 80, 100],
    states: {
      'en_proceso': { canonical: 'in_process', dbValue: 'En_proceso' },
      'casi_terminando': { canonical: 'almost_done', dbValue: 'Casi_terminando' },
      'terminado': { canonical: 'done', dbValue: 'Terminado' },
      'in_process': { canonical: 'in_process', dbValue: 'En_proceso' },
      'almost_done': { canonical: 'almost_done', dbValue: 'Casi_terminando' },
      'done': { canonical: 'done', dbValue: 'Terminado' }
    },
    progressToStateMapping: {
      20: 'en_proceso',
      40: 'en_proceso',
      60: 'casi_terminando',
      80: 'casi_terminando',
      100: 'terminado'
    }
  },
  practica_activa: {
    name: "practica_activa",
    aliases: [
      'práctica activa',
      'practica activa',
      'práctica_activa',
      'practica_activa',
      'método práctica activa',
      'metodo practica activa'
    ],
    validProgress: [0, 20, 40, 50, 60, 80, 100],
    states: {
      'en_proceso': { canonical: 'in_process', dbValue: 'En_proceso' },
      'casi_terminando': { canonical: 'almost_done', dbValue: 'Casi_terminando' },
      'terminado': { canonical: 'done', dbValue: 'Terminado' },
      'en_progreso': { canonical: 'in_progress', dbValue: 'en_progreso' },
      'completado': { canonical: 'completed', dbValue: 'completado' },
      'in_process': { canonical: 'in_process', dbValue: 'En_proceso' },
      'almost_done': { canonical: 'almost_done', dbValue: 'Casi_terminando' },
      'done': { canonical: 'done', dbValue: 'Terminado' },
      'in_progress': { canonical: 'in_progress', dbValue: 'en_progreso' },
      'completed': { canonical: 'completed', dbValue: 'completado' }
    },
    progressToStateMapping: {
      0: 'en_progreso',
      20: 'en_progreso',
      40: 'en_progreso',
      50: 'en_progreso',
      60: 'en_progreso',
      80: 'en_progreso',
      100: 'completado'
    }
  }
};

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

// Dynamic validation system using centralized configuration

/**
 * Normaliza el texto: convierte a minúsculas, elimina espacios extra, remueve acentos
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/\s+/g, ' ') // Normalizar espacios
    .replace(/\s+/g, '_'); // Convertir espacios a underscores para consistencia
}

/**
 * Detecta el tipo de método basado en el nombre usando la configuración dinámica
 */
function getMethodType(nombreMetodo: string): string {
  const normalized = normalizeText(nombreMetodo);

  for (const [methodKey, config] of Object.entries(METHODS_CONFIG)) {
    const normalizedAliases = config.aliases.map(alias => normalizeText(alias));
    if (normalizedAliases.includes(normalized)) {
      return methodKey;
    }
  }

  logger.warn(`Tipo de método no reconocido: "${nombreMetodo}" (normalizado: "${normalized}")`);
  logger.warn(`Métodos configurados disponibles: ${Object.keys(METHODS_CONFIG).join(', ')}`);
  throw new Error(`Tipo de método no reconocido: ${nombreMetodo}`);
}

/**
 * Obtiene la configuración de un método por su tipo
 */
function getMethodConfig(methodType: string): MethodConfig {
  const config = METHODS_CONFIG[methodType];
  if (!config) {
    logger.error(`Configuración no encontrada para el método: ${methodType}`);
    throw new Error(`Configuración no encontrada para el método: ${methodType}`);
  }
  return config;
}

/**
 * Valida si un progreso es válido para un método
 */
function getValidProgress(methodType: string): number[] {
  const config = getMethodConfig(methodType);
  return config.validProgress;
}

/**
 * Normaliza el estado entrante a valores canónicos usando la configuración dinámica
 */
function normalizeStatus(status: string, methodType: string): string {
  const normalized = normalizeText(status);
  const config = getMethodConfig(methodType);

  const stateConfig = config.states[normalized];
  if (!stateConfig) {
    logger.warn(`Estado no reconocido para método ${methodType}: "${status}" (normalizado: "${normalized}")`);
    logger.warn(`Estados válidos para ${methodType}: ${Object.keys(config.states).join(', ')}`);
    throw new Error(`Estado no reconocido para este método: ${status}`);
  }

  logger.debug(`Estado normalizado: "${status}" → "${stateConfig.canonical}" para método ${methodType}`);
  return stateConfig.canonical;
}

/**
 * Mapea el estado canónico al valor correspondiente en la base de datos
 */
function mapStatusToDB(canonical: string, methodType: string): string {
  const config = getMethodConfig(methodType);

  // Find the state config that has this canonical value
  for (const stateConfig of Object.values(config.states)) {
    if (stateConfig.canonical === canonical) {
      return stateConfig.dbValue;
    }
  }

  logger.warn(`No se encontró mapping DB para estado canónico "${canonical}" en método ${methodType}`);
  return canonical; // fallback
}

/**
 * Obtiene el estado correspondiente al progreso para un tipo de método usando configuración
 */
function getStatusForProgress(methodType: string, progress: number): string {
  const config = getMethodConfig(methodType);
  const normalizedState = config.progressToStateMapping[progress];

  if (!normalizedState) {
    logger.warn(`No se encontró estado para progreso ${progress} en método ${methodType}`);
    return 'en_progreso'; // fallback
  }

  return config.states[normalizedState].dbValue;
}

/**
 * Obtiene los estados válidos para un método
 */
function getValidStatusMethods(methodType: string): string[] {
  const config = getMethodConfig(methodType);
  return Object.values(config.states).map(state => state.canonical);
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
    * Permite múltiples métodos activos simultáneamente - cada uno con su propia sesión independiente
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

      // Nota: Se permite crear múltiples métodos activos por usuario.
      // Anteriormente se restringía a uno solo, pero esto causaba errores al recargar la página
      // o iniciar nuevos métodos. Ahora cada método tiene su propia sesión independiente
      // identificada por id_metodo_realizado, permitiendo múltiples sesiones activas simultáneamente.
      // La lógica de continuación debe usar el ID específico de cada sesión, no depender de un estado global "activo".

      // Determinar estado basado en progreso y tipo de método
      let estadoNormalizado: MetodoEstado = MetodoEstado.EN_PROGRESO;
      try {
        const type = getMethodType(metodo.nombreMetodo);
        if (data.estado) {
          // Si se proporciona estado explícitamente, normalizarlo
          const canonical = normalizeStatus(data.estado, type);
          const dbValue = mapStatusToDB(canonical, type);
          estadoNormalizado = dbValue as MetodoEstado;
        } else if (data.progreso !== undefined) {
          // Si no se proporciona estado pero sí progreso, determinar estado automáticamente
          estadoNormalizado = getStatusForProgress(type, data.progreso) as MetodoEstado;
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message
        };
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

        // Actualizar estado basado en el progreso y tipo de método
        try {
          const type = getMethodType(metodo.nombreMetodo);
          metodoRealizado.estado = getStatusForProgress(type, data.progreso) as MetodoEstado;
        } catch (error) {
          // Si no se puede determinar el tipo, mantener estado actual
          logger.warn("No se pudo actualizar estado basado en progreso:", error);
        }
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