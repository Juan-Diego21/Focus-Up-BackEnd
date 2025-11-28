"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.musicRepository = exports.MusicRepository = void 0;
const ormconfig_1 = require("../config/ormconfig");
const Musica_entity_1 = require("../models/Musica.entity");
const AlbumMusica_entity_1 = require("../models/AlbumMusica.entity");
class MusicRepository {
    constructor() {
        this.musicaRepo = ormconfig_1.AppDataSource.getRepository(Musica_entity_1.MusicaEntity);
        this.albumRepo = ormconfig_1.AppDataSource.getRepository(AlbumMusica_entity_1.AlbumMusicaEntity);
    }
    mapToMusicaDTO(entity) {
        return {
            idCancion: entity.idCancion,
            nombreCancion: entity.nombreCancion,
            artistaCancion: entity.artistaCancion ?? null,
            generoCancion: entity.generoCancion ?? null,
            categoriaMusica: entity.categoriaMusica ?? null,
            idAlbum: entity.idAlbum ?? null,
            fechaCreacion: entity.fechaCreacion,
            fechaActualizacion: entity.fechaActualizacion,
            urlMusica: entity.urlMusica,
        };
    }
    mapToAlbumDTO(entity) {
        return {
            id_album: entity.idAlbum,
            nombre_album: entity.nombreAlbum,
            fecha_creacion: entity.fechaCreacion,
            fecha_actualizacion: entity.fechaActualizacion,
            descripcion: entity.descripcion ?? null,
            genero: entity.genero ?? null,
        };
    }
    async findAll() {
        const rows = await this.musicaRepo.find();
        return rows.map((r) => this.mapToMusicaDTO(r));
    }
    async findById(id) {
        const row = await this.musicaRepo.findOne({ where: { idCancion: id } });
        return row ? this.mapToMusicaDTO(row) : null;
    }
    async findByNombre(nombre) {
        const rows = await this.musicaRepo
            .createQueryBuilder("m")
            .where("LOWER(m.nombre_cancion) LIKE :nombre", {
            nombre: `%${nombre.toLowerCase()}%`,
        })
            .getMany();
        return rows.map((r) => this.mapToMusicaDTO(r));
    }
    async findByAlbumId(albumId) {
        const rows = await this.musicaRepo.find({ where: { idAlbum: albumId } });
        return rows.map((r) => this.mapToMusicaDTO(r));
    }
    async findAllAlbums() {
        const rows = await this.albumRepo.find();
        return rows.map((r) => this.mapToAlbumDTO(r));
    }
    async findAlbumById(id) {
        const row = await this.albumRepo.findOne({ where: { idAlbum: id } });
        return row ? this.mapToAlbumDTO(row) : null;
    }
    async findAlbumByNombre(nombre) {
        const row = await this.albumRepo.findOne({
            where: { nombreAlbum: nombre },
        });
        return row ? this.mapToAlbumDTO(row) : null;
    }
}
exports.MusicRepository = MusicRepository;
exports.musicRepository = new MusicRepository();
