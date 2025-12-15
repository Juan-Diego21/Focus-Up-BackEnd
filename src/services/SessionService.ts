import { AppDataSource } from "../config/ormconfig";
import { SesionConcentracionEntity } from "../models/SesionConcentracion.entity";
import { UserEntity } from "../models/User.entity";
import { EventoEntity } from "../models/Evento.entity";
import { MetodoEstudioEntity } from "../models/MetodoEstudio.entity";
import { AlbumMusicaEntity } from "../models/AlbumMusica.entity";
import { MetodoRealizadoEntity } from "../models/MetodoRealizado.entity";
import { CreateSessionDto, UpdateSessionDto, SessionResponseDto, SessionFilters, SessionListResponse } from "../types/Session";
import logger from "../utils/logger";

/**
 * Servicio para la gestión de sesiones de concentración
 * Maneja operaciones CRUD, temporizadores y lógica de negocio de sesiones
 */
export class SessionService {
  private readonly sessionRepository = AppDataSource.getRepository(SesionConcentracionEntity);
  private readonly userRepository = AppDataSource.getRepository(UserEntity);
  private readonly eventoRepository = AppDataSource.getRepository(EventoEntity);
  private readonly metodoRepository = AppDataSource.getRepository(MetodoEstudioEntity);
  private readonly albumRepository = AppDataSource.getRepository(AlbumMusicaEntity);
  private readonly metodoRealizadoRepository = AppDataSource.getRepository(MetodoRealizadoEntity);

  /**
   * Convierte intervalo de PostgreSQL a milisegundos
   * @param intervalValue - String del intervalo (ej: "01:30:45") o objeto Interval de PostgreSQL
   * @returns Milisegundos
   */
  private intervalToMs(intervalValue: any): number {
    // Si es un string, parsearlo como HH:MM:SS
    if (typeof intervalValue === 'string') {
      const parts = intervalValue.split(':');
      const hours = Number.parseInt(parts[0]) || 0;
      const minutes = Number.parseInt(parts[1]) || 0;
      const seconds = Number.parseInt(parts[2]) || 0;
      return (hours * 3600 + minutes * 60 + seconds) * 1000;
    }

    // Si es un objeto Interval de PostgreSQL, extraer las propiedades
    if (typeof intervalValue === 'object' && intervalValue !== null) {
      const hours = intervalValue.hours || 0;
      const minutes = intervalValue.minutes || 0;
      const seconds = intervalValue.seconds || 0;
      const milliseconds = intervalValue.milliseconds || 0;
      return (hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds;
    }

    // Fallback: asumir 0 si no se puede parsear
    logger.warn('No se pudo parsear el intervalo, usando 0', { intervalValue });
    return 0;
  }

  /**
   * Convierte milisegundos a formato de intervalo HH:MM:SS
   * @param ms - Milisegundos
   * @returns String en formato HH:MM:SS
   */
  private msToInterval(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Convierte entidad de sesión a DTO de respuesta
   * @param session - Entidad de sesión
   * @returns DTO de respuesta
   */
  private entityToDto(session: SesionConcentracionEntity): SessionResponseDto {
    const elapsedMs = this.intervalToMs(session.tiempoTranscurrido);

    // Asegurar que elapsedInterval sea siempre un string en formato HH:MM:SS
    let elapsedInterval: string;
    const tiempoTranscurrido = session.tiempoTranscurrido as any; // Type assertion para manejar tanto string como objeto

    if (typeof tiempoTranscurrido === 'string') {
      elapsedInterval = tiempoTranscurrido;
    } else if (typeof tiempoTranscurrido === 'object' && tiempoTranscurrido !== null) {
      // Si es un objeto Interval de PostgreSQL, convertirlo a string
      const hours = tiempoTranscurrido.hours || 0;
      const minutes = tiempoTranscurrido.minutes || 0;
      const seconds = tiempoTranscurrido.seconds || 0;
      elapsedInterval = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      elapsedInterval = "00:00:00"; // fallback
    }

    return {
      sessionId: session.idSesion,
      userId: session.idUsuario,
      title: session.titulo,
      description: session.descripcion,
      type: session.tipo,
      status: session.estado,
      eventId: session.idEvento,
      methodId: session.idMetodo,
      albumId: session.idAlbum,
      elapsedInterval,
      elapsedMs,
      createdAt: session.fechaCreacion.toISOString(),
      updatedAt: session.fechaActualizacion.toISOString(),
      lastInteractionAt: session.ultimaInteraccion.toISOString(),
    };
  }

  /**
   * Valida que el usuario existe
   * @param userId - ID del usuario
   * @throws Error si el usuario no existe
   */
  private async validateUserExists(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { idUsuario: userId } });
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
  }

  /**
   * Valida que el evento existe y pertenece al usuario
   * @param eventId - ID del evento
   * @param userId - ID del usuario
   * @throws Error si el evento no existe o no pertenece al usuario
   */
  private async validateEventExists(eventId: number, userId: number): Promise<void> {
    const evento = await this.eventoRepository.findOne({
      where: { idEvento: eventId },
      relations: ['usuario']
    });
    if (!evento || evento.usuario?.idUsuario !== userId) {
      throw new Error("Evento no encontrado o no pertenece al usuario");
    }
  }

  /**
   * Valida que el método existe
   * @param methodId - ID del método
   * @throws Error si el método no existe
   */
  private async validateMethodExists(methodId: number): Promise<void> {
    const metodo = await this.metodoRepository.findOne({ where: { idMetodo: methodId } });
    if (!metodo) {
      throw new Error("Método de estudio no encontrado");
    }
  }

  /**
   * Valida que el álbum existe
   * @param albumId - ID del álbum
   * @throws Error si el álbum no existe
   */
  private async validateAlbumExists(albumId: number): Promise<void> {
    const album = await this.albumRepository.findOne({ where: { idAlbum: albumId } });
    if (!album) {
      throw new Error("Álbum de música no encontrado");
    }
  }

  /**
   * Crea una nueva sesión de concentración
   * @param dto - Datos para crear la sesión
   * @param userId - ID del usuario autenticado
   * @returns Sesión creada
   */
  async createSession(dto: CreateSessionDto, userId: number): Promise<SessionResponseDto> {
    logger.info(`Creando sesión para usuario ${userId}`, { dto });

    // Validar usuario
    await this.validateUserExists(userId);

    // Validar relaciones opcionales
    if (dto.eventId) {
      await this.validateEventExists(dto.eventId, userId);
    }
    if (dto.methodId) {
      await this.validateMethodExists(dto.methodId);
    }
    if (dto.albumId) {
      await this.validateAlbumExists(dto.albumId);
    }

    // Crear entidad
    const session = this.sessionRepository.create({
      idUsuario: userId,
      titulo: dto.title,
      descripcion: dto.description,
      tipo: dto.type,
      idEvento: dto.eventId,
      idMetodo: dto.methodId,
      idAlbum: dto.albumId,
      tiempoTranscurrido: "00:00:00",
      ultimaInteraccion: new Date(),
    });

    // Guardar en BD
    const savedSession = await this.sessionRepository.save(session);

    logger.info(`Sesión creada exitosamente`, { sessionId: savedSession.idSesion });

    return this.entityToDto(savedSession);
  }

  /**
   * Obtiene una sesión por ID
   * @param sessionId - ID de la sesión
   * @param userId - ID del usuario (para verificar propiedad)
   * @returns Sesión encontrada
   * @throws Error si no se encuentra o no pertenece al usuario
   */
  async getSession(sessionId: number, userId: number): Promise<SessionResponseDto> {
    logger.info(`Obteniendo sesión ${sessionId} para usuario ${userId}`);

    const session = await this.sessionRepository.findOne({
      where: { idSesion: sessionId, idUsuario: userId }
    });

    if (!session) {
      throw new Error("Sesión no encontrada o no pertenece al usuario");
    }

    return this.entityToDto(session);
  }

  /**
   * Lista sesiones del usuario
   * @param filters - Filtros simplificados (solo paginación)
   * @param userId - ID del usuario
   * @returns Lista paginada de sesiones
   */
  async listSessions(filters: SessionFilters, userId: number): Promise<SessionListResponse> {
    logger.info(`Listando sesiones para usuario ${userId}`, { filters });

    const queryBuilder = this.sessionRepository.createQueryBuilder("s")
      .where("s.idUsuario = :userId", { userId });

    // Solo aplicar paginación, sin otros filtros según nueva especificación
    const page = filters.page || 1;
    const perPage = filters.perPage || 10;
    const skip = (page - 1) * perPage;

    queryBuilder
      .orderBy("s.fechaCreacion", "DESC")
      .skip(skip)
      .take(perPage);

    const [sessions, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / perPage);

    return {
      sessions: sessions.map(s => this.entityToDto(s)),
      total,
      page,
      perPage,
      totalPages,
    };
  }

  /**
   * Actualiza una sesión existente
   * @param sessionId - ID de la sesión
   * @param dto - Datos a actualizar
   * @param userId - ID del usuario
   * @returns Sesión actualizada
   */
  async updateSession(sessionId: number, dto: UpdateSessionDto, userId: number): Promise<SessionResponseDto> {
    logger.info(`Actualizando sesión ${sessionId} para usuario ${userId}`, { dto });

    // Verificar que la sesión existe y pertenece al usuario
    const session = await this.sessionRepository.findOne({
      where: { idSesion: sessionId, idUsuario: userId }
    });

    if (!session) {
      throw new Error("Sesión no encontrada o no pertenece al usuario");
    }

    // Validar relaciones si se proporcionan
    if (dto.methodId) {
      await this.validateMethodExists(dto.methodId);
    }
    if (dto.albumId) {
      await this.validateAlbumExists(dto.albumId);
    }

    // Actualizar campos permitidos
    if (dto.title !== undefined) session.titulo = dto.title;
    if (dto.description !== undefined) session.descripcion = dto.description;
    if (dto.methodId !== undefined) session.idMetodo = dto.methodId;
    if (dto.albumId !== undefined) session.idAlbum = dto.albumId;

    // Guardar cambios
    const updatedSession = await this.sessionRepository.save(session);

    logger.info(`Sesión ${sessionId} actualizada exitosamente`);

    return this.entityToDto(updatedSession);
  }



  /**
   * Obtiene sesiones pendientes más antiguas que los días especificados
   * @param days - Número de días
   * @returns Array de sesiones
   */
  async getPendingSessionsOlderThan(days: number): Promise<SesionConcentracionEntity[]> {
    logger.info(`Obteniendo sesiones pendientes más antiguas que ${days} días`);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const sessions = await this.sessionRepository
      .createQueryBuilder("s")
      .where("s.estado = :status", { status: "pendiente" })
      .andWhere("(s.ultimaInteraccion < :cutoffDate OR (s.ultimaInteraccion IS NULL AND s.fechaActualizacion < :cutoffDate))", { cutoffDate })
      .orderBy("s.fechaCreacion", "ASC")
      .getMany();

    logger.info(`Encontradas ${sessions.length} sesiones pendientes antiguas`);

    return sessions;
  }

  /**
   * Lista sesiones del usuario sin filtros (solo paginación básica)
   * Retorna sesiones en formato snake_case según especificación del endpoint
   * @param userId - ID del usuario
   * @param page - Número de página (default: 1)
   * @param perPage - Elementos por página (default: 10)
   * @returns Array de sesiones en formato snake_case
   */
  async listUserSessionsPaginated(userId: number, page: number = 1, perPage: number = 10): Promise<any[]> {
    logger.info(`Listando sesiones paginadas para usuario ${userId}`, { page, perPage });

    const skip = (page - 1) * perPage;

    const sessions = await this.sessionRepository
      .createQueryBuilder("s")
      .where("s.idUsuario = :userId", { userId })
      .orderBy("s.fechaCreacion", "DESC")
      .skip(skip)
      .take(perPage)
      .getMany();

    // Convertir a formato snake_case según especificación
    return sessions.map(session => {
      // Convertir tiempo_transcurrido a string HH:MM:SS
      let tiempoTranscurridoStr: string;
      const tiempoTranscurrido = session.tiempoTranscurrido as any;

      if (typeof tiempoTranscurrido === 'string') {
        tiempoTranscurridoStr = tiempoTranscurrido;
      } else if (typeof tiempoTranscurrido === 'object' && tiempoTranscurrido !== null) {
        // Si es un objeto Interval de PostgreSQL, convertirlo a string
        const hours = tiempoTranscurrido.hours || 0;
        const minutes = tiempoTranscurrido.minutes || 0;
        const seconds = tiempoTranscurrido.seconds || 0;
        tiempoTranscurridoStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        tiempoTranscurridoStr = "00:00:00"; // fallback
      }

      return {
        id_sesion: session.idSesion,
        titulo: session.titulo,
        descripcion: session.descripcion,
        estado: session.estado,
        tipo: session.tipo,
        id_evento: session.idEvento,
        id_metodo: session.idMetodo,
        id_album: session.idAlbum,
        tiempo_transcurrido: tiempoTranscurridoStr,
        fecha_creacion: session.fechaCreacion.toISOString(),
        fecha_actualizacion: session.fechaActualizacion.toISOString(),
        ultima_interaccion: session.ultimaInteraccion.toISOString(),
      };
    });
  }

  /**
   * Crea una sesión de concentración desde un evento
   * @param eventId - ID del evento
   * @param userId - ID del usuario
   * @returns Sesión creada
   * @throws Error si el evento no existe, no pertenece al usuario, no es de tipo concentración o ya tiene una sesión
   */
  async createSessionFromEvent(eventId: number, userId: number): Promise<SessionResponseDto> {
    logger.info(`Creando sesión desde evento ${eventId} para usuario ${userId}`);

    // Validar usuario
    await this.validateUserExists(userId);

    // Obtener evento con relaciones
    const evento = await this.eventoRepository.findOne({
      where: { idEvento: eventId },
      relations: ['usuario', 'metodoEstudio', 'album']
    });

    if (!evento) {
      throw new Error("Evento no encontrado");
    }

    // Verificar que el evento pertenece al usuario
    if (evento.usuario?.idUsuario !== userId) {
      throw new Error("Evento no pertenece al usuario");
    }

    // Verificar que el evento es de tipo concentración
    if (evento.tipoEvento !== 'concentracion') {
      throw new Error("El evento no es de tipo concentración");
    }

    // Verificar que no existe ya una sesión para este evento
    const existingSession = await this.sessionRepository.findOne({
      where: { idEvento: eventId, idUsuario: userId }
    });

    if (existingSession) {
      throw new Error("Ya existe una sesión para este evento");
    }

    // Crear la sesión usando los datos del evento
    const session = this.sessionRepository.create({
      idUsuario: userId,
      titulo: evento.nombreEvento,
      descripcion: evento.descripcionEvento,
      tipo: "scheduled",
      estado: "pendiente",
      idEvento: eventId,
      idMetodo: evento.metodoEstudio?.idMetodo,
      idAlbum: evento.album?.idAlbum,
      tiempoTranscurrido: "00:00:00",
      ultimaInteraccion: new Date(),
    });

    // Guardar en BD
    const savedSession = await this.sessionRepository.save(session);

    logger.info(`Sesión creada exitosamente desde evento ${eventId}`, { sessionId: savedSession.idSesion });

    return this.entityToDto(savedSession);
  }
}