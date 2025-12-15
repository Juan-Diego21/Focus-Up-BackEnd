"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const ormconfig_1 = require("../config/ormconfig");
const SesionConcentracion_entity_1 = require("../models/SesionConcentracion.entity");
const User_entity_1 = require("../models/User.entity");
const Evento_entity_1 = require("../models/Evento.entity");
const MetodoEstudio_entity_1 = require("../models/MetodoEstudio.entity");
const AlbumMusica_entity_1 = require("../models/AlbumMusica.entity");
const MetodoRealizado_entity_1 = require("../models/MetodoRealizado.entity");
const logger_1 = __importDefault(require("../utils/logger"));
class SessionService {
    constructor() {
        this.sessionRepository = ormconfig_1.AppDataSource.getRepository(SesionConcentracion_entity_1.SesionConcentracionEntity);
        this.userRepository = ormconfig_1.AppDataSource.getRepository(User_entity_1.UserEntity);
        this.eventoRepository = ormconfig_1.AppDataSource.getRepository(Evento_entity_1.EventoEntity);
        this.metodoRepository = ormconfig_1.AppDataSource.getRepository(MetodoEstudio_entity_1.MetodoEstudioEntity);
        this.albumRepository = ormconfig_1.AppDataSource.getRepository(AlbumMusica_entity_1.AlbumMusicaEntity);
        this.metodoRealizadoRepository = ormconfig_1.AppDataSource.getRepository(MetodoRealizado_entity_1.MetodoRealizadoEntity);
    }
    intervalToMs(intervalValue) {
        if (typeof intervalValue === 'string') {
            const parts = intervalValue.split(':');
            const hours = Number.parseInt(parts[0]) || 0;
            const minutes = Number.parseInt(parts[1]) || 0;
            const seconds = Number.parseInt(parts[2]) || 0;
            return (hours * 3600 + minutes * 60 + seconds) * 1000;
        }
        if (typeof intervalValue === 'object' && intervalValue !== null) {
            const hours = intervalValue.hours || 0;
            const minutes = intervalValue.minutes || 0;
            const seconds = intervalValue.seconds || 0;
            const milliseconds = intervalValue.milliseconds || 0;
            return (hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds;
        }
        logger_1.default.warn('No se pudo parsear el intervalo, usando 0', { intervalValue });
        return 0;
    }
    msToInterval(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    entityToDto(session) {
        const elapsedMs = this.intervalToMs(session.tiempoTranscurrido);
        let elapsedInterval;
        const tiempoTranscurrido = session.tiempoTranscurrido;
        if (typeof tiempoTranscurrido === 'string') {
            elapsedInterval = tiempoTranscurrido;
        }
        else if (typeof tiempoTranscurrido === 'object' && tiempoTranscurrido !== null) {
            const hours = tiempoTranscurrido.hours || 0;
            const minutes = tiempoTranscurrido.minutes || 0;
            const seconds = tiempoTranscurrido.seconds || 0;
            elapsedInterval = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        else {
            elapsedInterval = "00:00:00";
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
    async validateUserExists(userId) {
        const user = await this.userRepository.findOne({ where: { idUsuario: userId } });
        if (!user) {
            throw new Error("Usuario no encontrado");
        }
    }
    async validateEventExists(eventId, userId) {
        const evento = await this.eventoRepository.findOne({
            where: { idEvento: eventId },
            relations: ['usuario']
        });
        if (!evento || evento.usuario?.idUsuario !== userId) {
            throw new Error("Evento no encontrado o no pertenece al usuario");
        }
    }
    async validateMethodExists(methodId) {
        const metodo = await this.metodoRepository.findOne({ where: { idMetodo: methodId } });
        if (!metodo) {
            throw new Error("Método de estudio no encontrado");
        }
    }
    async validateAlbumExists(albumId) {
        const album = await this.albumRepository.findOne({ where: { idAlbum: albumId } });
        if (!album) {
            throw new Error("Álbum de música no encontrado");
        }
    }
    async createSession(dto, userId) {
        logger_1.default.info(`Creando sesión para usuario ${userId}`, { dto });
        await this.validateUserExists(userId);
        if (dto.eventId) {
            await this.validateEventExists(dto.eventId, userId);
        }
        if (dto.methodId) {
            await this.validateMethodExists(dto.methodId);
        }
        if (dto.albumId) {
            await this.validateAlbumExists(dto.albumId);
        }
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
        const savedSession = await this.sessionRepository.save(session);
        logger_1.default.info(`Sesión creada exitosamente`, { sessionId: savedSession.idSesion });
        return this.entityToDto(savedSession);
    }
    async getSession(sessionId, userId) {
        logger_1.default.info(`Obteniendo sesión ${sessionId} para usuario ${userId}`);
        const session = await this.sessionRepository.findOne({
            where: { idSesion: sessionId, idUsuario: userId }
        });
        if (!session) {
            throw new Error("Sesión no encontrada o no pertenece al usuario");
        }
        return this.entityToDto(session);
    }
    async listSessions(filters, userId) {
        logger_1.default.info(`Listando sesiones para usuario ${userId}`, { filters });
        const queryBuilder = this.sessionRepository.createQueryBuilder("s")
            .where("s.idUsuario = :userId", { userId });
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
    async updateSession(sessionId, dto, userId) {
        logger_1.default.info(`Actualizando sesión ${sessionId} para usuario ${userId}`, { dto });
        const session = await this.sessionRepository.findOne({
            where: { idSesion: sessionId, idUsuario: userId }
        });
        if (!session) {
            throw new Error("Sesión no encontrada o no pertenece al usuario");
        }
        if (dto.methodId) {
            await this.validateMethodExists(dto.methodId);
        }
        if (dto.albumId) {
            await this.validateAlbumExists(dto.albumId);
        }
        if (dto.title !== undefined)
            session.titulo = dto.title;
        if (dto.description !== undefined)
            session.descripcion = dto.description;
        if (dto.methodId !== undefined)
            session.idMetodo = dto.methodId;
        if (dto.albumId !== undefined)
            session.idAlbum = dto.albumId;
        const updatedSession = await this.sessionRepository.save(session);
        logger_1.default.info(`Sesión ${sessionId} actualizada exitosamente`);
        return this.entityToDto(updatedSession);
    }
    async getPendingSessionsOlderThan(days) {
        logger_1.default.info(`Obteniendo sesiones pendientes más antiguas que ${days} días`);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const sessions = await this.sessionRepository
            .createQueryBuilder("s")
            .where("s.estado = :status", { status: "pendiente" })
            .andWhere("(s.ultimaInteraccion < :cutoffDate OR (s.ultimaInteraccion IS NULL AND s.fechaActualizacion < :cutoffDate))", { cutoffDate })
            .orderBy("s.fechaCreacion", "ASC")
            .getMany();
        logger_1.default.info(`Encontradas ${sessions.length} sesiones pendientes antiguas`);
        return sessions;
    }
    async listUserSessionsPaginated(userId, page = 1, perPage = 10) {
        logger_1.default.info(`Listando sesiones paginadas para usuario ${userId}`, { page, perPage });
        const skip = (page - 1) * perPage;
        const sessions = await this.sessionRepository
            .createQueryBuilder("s")
            .where("s.idUsuario = :userId", { userId })
            .orderBy("s.fechaCreacion", "DESC")
            .skip(skip)
            .take(perPage)
            .getMany();
        return sessions.map(session => {
            let tiempoTranscurridoStr;
            const tiempoTranscurrido = session.tiempoTranscurrido;
            if (typeof tiempoTranscurrido === 'string') {
                tiempoTranscurridoStr = tiempoTranscurrido;
            }
            else if (typeof tiempoTranscurrido === 'object' && tiempoTranscurrido !== null) {
                const hours = tiempoTranscurrido.hours || 0;
                const minutes = tiempoTranscurrido.minutes || 0;
                const seconds = tiempoTranscurrido.seconds || 0;
                tiempoTranscurridoStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
            else {
                tiempoTranscurridoStr = "00:00:00";
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
    async createSessionFromEvent(eventId, userId) {
        logger_1.default.info(`Creando sesión desde evento ${eventId} para usuario ${userId}`);
        await this.validateUserExists(userId);
        const evento = await this.eventoRepository.findOne({
            where: { idEvento: eventId },
            relations: ['usuario', 'metodoEstudio', 'album']
        });
        if (!evento) {
            throw new Error("Evento no encontrado");
        }
        if (evento.usuario?.idUsuario !== userId) {
            throw new Error("Evento no pertenece al usuario");
        }
        if (evento.tipoEvento !== 'concentracion') {
            throw new Error("El evento no es de tipo concentración");
        }
        const existingSession = await this.sessionRepository.findOne({
            where: { idEvento: eventId, idUsuario: userId }
        });
        if (existingSession) {
            throw new Error("Ya existe una sesión para este evento");
        }
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
        const savedSession = await this.sessionRepository.save(session);
        logger_1.default.info(`Sesión creada exitosamente desde evento ${eventId}`, { sessionId: savedSession.idSesion });
        return this.entityToDto(savedSession);
    }
}
exports.SessionService = SessionService;
