import { AppDataSource } from "../config/ormconfig";
import { MetodoRealizadoEntity, MetodoProgreso, MetodoEstado } from "../models/MetodoRealizado.entity";
import { SesionConcentracionRealizadaEntity, SesionEstado } from "../models/SesionConcentracionRealizada.entity";
import { UserEntity } from "../models/User.entity";
import { MetodoEstudioEntity } from "../models/MetodoEstudio.entity";
import { MusicaEntity } from "../models/Musica.entity";
import logger from "../utils/logger";

// Load method configurations from external file
const { studyMethodRegistry, methodAliases } = require("../config/methods.config");

// Extended interface for methods with additional properties (like Feynman)
interface StudyMethodConfig {
  validCreationProgress: number[];
  validUpdateProgress: number[];
  validResumeProgress: number[];
  statusMap: { [progress: number]: string };
  processes?: string[];  // Feynman-specific
  states?: string[];     // Feynman-specific
  totalSteps?: number;   // Feynman-specific
  routePrefix?: string;  // Feynman-specific
}

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
 * Normaliza el progreso: convierte strings a números, elimina espacios, valida que sea entero
 */
function normalizeProgress(progress: any): number {
  if (typeof progress === 'number') {
    return progress;
  }

  if (typeof progress === 'string') {
    const trimmed = progress.trim();
    const parsed = Number(trimmed);

    if (isNaN(parsed)) {
      throw new Error(`Progreso inválido: no se puede convertir "${progress}" a número`);
    }

    if (!Number.isInteger(parsed)) {
      throw new Error(`Progreso inválido: debe ser un número entero, recibido ${parsed}`);
    }

    return parsed;
  }

  throw new Error(`Progreso inválido: tipo de dato no soportado ${typeof progress}`);
}

/**
 * Normaliza el texto: convierte a minúsculas, elimina espacios extra, remueve acentos
 * Maneja variaciones comunes de estados (español/inglés, con/sin acentos, etc.)
 */
function normalizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';

  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/\s+/g, ' ') // Normalizar espacios múltiples
    .replace(/\s+/g, '_') // Convertir espacios a underscores
    .replace(/_+/g, '_') // Normalizar underscores múltiples
    .replace(/^_+|_+$/g, ''); // Remover underscores al inicio/fin
}

/**
 * Detecta el tipo de método basado en el nombre usando el registro unificado
 */
function getMethodType(nombreMetodo: string): string {
  const normalized = normalizeText(nombreMetodo);

  // Check if the normalized name directly matches a method slug
  if (studyMethodRegistry[normalized]) {
    return normalized;
  }

  // Check aliases - try both original and normalized versions
  let methodSlug = methodAliases[nombreMetodo]; // Check original case first
  if (methodSlug && studyMethodRegistry[methodSlug]) {
    return methodSlug;
  }

  methodSlug = methodAliases[normalized]; // Then check normalized
  if (methodSlug && studyMethodRegistry[methodSlug]) {
    return methodSlug;
  }

  logger.warn(`Tipo de método no reconocido: "${nombreMetodo}" (normalizado: "${normalized}"). Métodos disponibles: ${Object.keys(studyMethodRegistry).join(', ')}`);
  throw new Error(`Tipo de método no reconocido: ${nombreMetodo}`);
}

/**
 * Obtiene la configuración de un método por su tipo del registro unificado
 */
function getMethodConfig(methodType: string): StudyMethodConfig {
  const config = studyMethodRegistry[methodType];
  if (!config) {
    logger.error(`Configuración no encontrada para el método: ${methodType}. Métodos disponibles: ${Object.keys(studyMethodRegistry).join(', ')}`);
    throw new Error(`Configuración no encontrada para el método: ${methodType}`);
  }

  // Debug log to validate registry configuration
  logger.debug(`Registry config for ${methodType}: ${JSON.stringify({
    validCreationProgress: config.validCreationProgress,
    validUpdateProgress: config.validUpdateProgress,
    validResumeProgress: config.validResumeProgress,
    statusMap: config.statusMap
  })}`);

  return config;
}

/**
 * Unified progress validators using registry
 */
function isValidProgressForCreation(methodType: string, progress: number): boolean {
  const config = getMethodConfig(methodType);

  // Normalize progress before validation
  let normalizedProgress: number;
  try {
    normalizedProgress = normalizeProgress(progress);
  } catch (error) {
    logger.warn(`Error normalizing progress for ${methodType} creation: ${(error as Error).message}`);
    return false;
  }

  return config.validCreationProgress.includes(normalizedProgress);
}

function isValidProgressForUpdate(methodType: string, progress: number): boolean {
  const config = getMethodConfig(methodType);

  // Normalize progress before validation
  let normalizedProgress: number;
  try {
    normalizedProgress = normalizeProgress(progress);
  } catch (error) {
    logger.warn(`Error normalizing progress for ${methodType}: ${(error as Error).message}`);
    return false;
  }

  // Debug log to validate progress validation
  logger.debug(`Progress validation for ${methodType}: received=${progress}, normalized=${normalizedProgress}, allowed=${JSON.stringify(config.validUpdateProgress)}, isValid=${config.validUpdateProgress.includes(normalizedProgress)}`);

  return config.validUpdateProgress.includes(normalizedProgress);
}

function isValidProgressForResume(methodType: string, progress: number): boolean {
  const config = getMethodConfig(methodType);

  // Normalize progress before validation
  let normalizedProgress: number;
  try {
    normalizedProgress = normalizeProgress(progress);
  } catch (error) {
    logger.warn(`Error normalizing progress for ${methodType} resume: ${(error as Error).message}`);
    return false;
  }

  return config.validResumeProgress.includes(normalizedProgress);
}

/**
 * Obtiene el estado correspondiente al progreso usando el registro
 */
function getStatusForProgress(methodType: string, progress: number): string {
  const config = getMethodConfig(methodType);
  const status = config.statusMap[progress];

  if (!status) {
    logger.warn(`Estado no encontrado para progreso ${progress} en método ${methodType}. Mapeos disponibles: ${Object.keys(config.statusMap).join(', ')}`);
    return 'en_progreso'; // fallback
  }

  return status;
}

/**
 * Normaliza el estado entrante - en el nuevo sistema, los estados se determinan por progreso
 * Esta función valida que el estado sea consistente con el progreso esperado
 * Acepta variaciones en español/inglés, con/sin acentos, espacios vs underscores
 */
function validateStatusForProgress(status: string, methodType: string, progress: number): boolean {
  const expectedStatus = getStatusForProgress(methodType, progress);
  const normalizedInput = normalizeText(status);
  const normalizedExpected = normalizeText(expectedStatus);

  logger.debug(`Status validation: input="${status}" -> normalized="${normalizedInput}", expected="${expectedStatus}" -> normalized="${normalizedExpected}"`);

  // For backward compatibility, accept multiple variations
  const acceptableStatuses = [
    normalizedExpected,                                    // en_proceso
    normalizedExpected.replace(/_/g, ' '),               // en proceso
    normalizedExpected.replace(/_/g, ''),                // enproceso
    normalizedExpected.toUpperCase(),                    // EN_PROCESO
    normalizedExpected.replace(/_/g, ' ').toUpperCase(), // EN PROCESO
    expectedStatus,                                       // original case
    expectedStatus.replace(/_/g, ' '),                   // with spaces
    expectedStatus.toLowerCase(),                        // lowercase
    expectedStatus.toUpperCase(),                        // uppercase
  ];

  // Remove duplicates
  const uniqueStatuses = [...new Set(acceptableStatuses)];

  const isValid = uniqueStatuses.includes(normalizedInput);
  logger.debug(`Status validation result: ${isValid ? 'VALID' : 'INVALID'}, accepted variations: [${uniqueStatuses.join(', ')}]`);

  return isValid;
}

/**
 * Obtiene los estados válidos para un método (todos los valores posibles del statusMap)
 */
function getValidStatusMethods(methodType: string): string[] {
  const config = getMethodConfig(methodType);
  return [...new Set(Object.values(config.statusMap))]; // Remove duplicates
}

/**
 * Calcula el progreso basado en pasos completados para métodos como Feynman
 */
function calculateProgressFromSteps(methodType: string, completedSteps: number): number {
  const config = getMethodConfig(methodType);
  if (!config.totalSteps) {
    throw new Error(`Método ${methodType} no tiene configuración de pasos`);
  }

  if (completedSteps < 0 || completedSteps > config.totalSteps) {
    throw new Error(`Número de pasos inválido: ${completedSteps}. Debe estar entre 0 y ${config.totalSteps}`);
  }

  return Math.round((completedSteps / config.totalSteps) * 100);
}

/**
 * Calcula el paso actual basado en el progreso para métodos como Feynman
 */
function calculateCurrentStepFromProgress(methodType: string, progress: number): number {
  const config = getMethodConfig(methodType);
  if (!config.totalSteps) {
    return 0; // Not a step-based method
  }

  return Math.round((progress / 100) * config.totalSteps);
}

/**
 * Obtiene la ruta de redirección para reanudar un método específico
 */
function getResumeRoute(methodType: string, progress: number): string {
  const config = getMethodConfig(methodType);

  if (config.routePrefix) {
    // For Feynman-style methods
    const currentStep = calculateCurrentStepFromProgress(methodType, progress);
    return `${config.routePrefix}?step=${currentStep}&progress=${progress}`;
  }

  // Default fallback for other methods
  return `/metodos/${methodType}/ejecucion?progress=${progress}`;
}

/**
 * Obtiene información de reanudación para un método específico
 */
function getResumeInfo(methodType: string, progress: number): {
  route: string;
  currentStep?: number;
  progress: number;
  methodType: string;
} {
  const config = getMethodConfig(methodType);
  const route = getResumeRoute(methodType, progress);

  const result: any = {
    route,
    progress,
    methodType
  };

  // Add step info for step-based methods
  if (config.totalSteps) {
    result.currentStep = calculateCurrentStepFromProgress(methodType, progress);
  }

  return result;
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
   * Obtiene información para reanudar un método específico
   */
  getResumeInfo(methodType: string, progress: number): {
    route: string;
    currentStep?: number;
    progress: number;
    methodType: string;
  } {
    return getResumeInfo(methodType, progress);
  }

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

      // Validate progress based on method type for creation
      if (data.progreso !== undefined) {
        try {
          const type = getMethodType(metodo.nombreMetodo);
          if (!isValidProgressForCreation(type, data.progreso)) {
            const validProgressValues = getMethodConfig(type).validCreationProgress;
            logger.warn(JSON.stringify({
              event: "invalid_progress_creation",
              method: type,
              receivedProgress: data.progreso,
              allowed: validProgressValues
            }));
            return {
              success: false,
              message: "Progreso inválido para creación de este método"
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

      // Determinar estado basado en progreso usando el registro unificado
      let estadoNormalizado: MetodoEstado = MetodoEstado.EN_PROGRESO;
      try {
        const type = getMethodType(metodo.nombreMetodo);
        if (data.estado) {
          // Validar que el estado proporcionado sea consistente con el progreso esperado
          const expectedProgress = data.progreso !== undefined ? data.progreso : 0;
          if (!validateStatusForProgress(data.estado, type, expectedProgress)) {
            logger.warn(`Estado inconsistente: "${data.estado}" para progreso ${expectedProgress} en método ${type}. Estado esperado: "${getStatusForProgress(type, expectedProgress)}"`);
            return {
              success: false,
              message: "Estado no consistente con el progreso para este método"
            };
          }
          estadoNormalizado = getStatusForProgress(type, expectedProgress) as MetodoEstado;
        } else if (data.progreso !== undefined) {
          // Determinar estado automáticamente basado en progreso
          estadoNormalizado = getStatusForProgress(type, data.progreso) as MetodoEstado;
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message
        };
      }

      // Crear el método realizado
      let progresoNormalizado = MetodoProgreso.INICIADO;
      if (data.progreso !== undefined) {
        try {
          progresoNormalizado = normalizeProgress(data.progreso);
        } catch (error) {
          return {
            success: false,
            error: `Error al normalizar progreso: ${(error as Error).message}`
          };
        }
      }

      const metodoRealizado = this.metodoRealizadoRepository.create({
        idUsuario: data.idUsuario,
        idMetodo: data.idMetodo,
        progreso: progresoNormalizado,
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

      // Diagnostic logging - log incoming request details
      logger.info(`PATCH /api/v1/reports/methods/${numericMethodId}/progress - User: ${numericUserId}, Body: ${JSON.stringify(data)}`);

      // Buscar el método realizado usando query builder
      const metodoRealizado = await this.metodoRealizadoRepository
        .createQueryBuilder("mr")
        .leftJoinAndSelect("mr.metodo", "m")
        .where("mr.idMetodoRealizado = :methodId", { methodId: numericMethodId })
        .andWhere("mr.idUsuario = :userId", { userId: numericUserId })
        .getOne();

      if (!metodoRealizado) {
        logger.warn(`Método realizado no encontrado: id=${numericMethodId}, user=${numericUserId}`);
        return {
          success: false,
          error: "Método realizado no encontrado"
        };
      }

      // Diagnostic logging - log DB query results
      logger.info(`DB Query Result: methodId=${metodoRealizado.idMetodoRealizado}, currentProgress=${metodoRealizado.progreso}, methodName="${metodoRealizado.metodo?.nombreMetodo}", dbMethodId=${metodoRealizado.idMetodo}`);

      // Validate progress based on method type for updates
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
          logger.info(`Method type detected: "${metodo.nombreMetodo}" -> "${type}"`);

          if (!isValidProgressForUpdate(type, data.progreso)) {
            const validProgressValues = getMethodConfig(type).validUpdateProgress;
            logger.warn(JSON.stringify({
              event: "invalid_progress_update",
              method: type,
              receivedProgress: data.progreso,
              allowed: validProgressValues,
              methodId: numericMethodId
            }));
            return {
              success: false,
              message: `Progreso inválido para actualización: received=${data.progreso}, allowed=${validProgressValues.join(', ')}, method=${type}`
            };
          }
        } catch (error) {
          logger.error(`Error during method type detection/validation: ${(error as Error).message}`);
          return {
            success: false,
            error: (error as Error).message
          };
        }

        // Normalize progress before saving
        try {
          metodoRealizado.progreso = normalizeProgress(data.progreso);
        } catch (error) {
          return {
            success: false,
            error: `Error al normalizar progreso: ${(error as Error).message}`
          };
        }

        // Actualizar estado basado en el progreso usando el registro
        try {
          const type = getMethodType(metodo.nombreMetodo);
          metodoRealizado.estado = getStatusForProgress(type, data.progreso) as MetodoEstado;
        } catch (error) {
          // Si no se puede determinar el tipo, mantener estado actual
          logger.warn(`Error al actualizar estado para método ${numericMethodId}: ${(error as Error).message}`);
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

      // Validate and update status based on method type using registry
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
          // For sessions, we validate that the status is acceptable for the method
          const validStatuses = getValidStatusMethods(type);
          const normalizedStatus = normalizeText(data.estado);

          if (!validStatuses.some(status => normalizeText(status) === normalizedStatus)) {
            logger.warn(`Estado inválido para sesión ${numericSessionId}: "${data.estado}". Estados válidos para ${type}: ${validStatuses.join(', ')}`);
            return {
              success: false,
              message: "Estado inválido para este tipo de método"
            };
          }

          // Map to database format - for sessions, we use the same status values
          sesionRealizada.estado = data.estado as SesionEstado;
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