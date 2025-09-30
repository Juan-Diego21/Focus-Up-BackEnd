import { Repository } from "typeorm";
import { AppDataSource } from "../config/ormconfig";
import { MusicaEntity } from "../models/Musica.entity";
import { AlbumMusicaEntity } from "../models/AlbumMusica.entity";
import { Musica, Album } from "../types/Musica";

export class MusicRepository {
  private musicaRepo: Repository<MusicaEntity>;
  private albumRepo: Repository<AlbumMusicaEntity>;

  constructor() {
    this.musicaRepo = AppDataSource.getRepository(MusicaEntity);
    this.albumRepo = AppDataSource.getRepository(AlbumMusicaEntity);
  }

  private mapToMusicaDTO(entity: MusicaEntity): Musica {
    return {
      id_cancion: entity.idCancion,
      nombre_cancion: entity.nombreCancion,
      artista_cancion: entity.artistaCancion ?? null,
      genero_cancion: entity.generoCancion ?? null,
      categoria_musica: entity.categoriaMusica ?? null,
      id_album: entity.idAlbum ?? null,
      fecha_creacion: entity.fechaCreacion,
      fecha_actualizacion: entity.fechaActualizacion,
    };
  }

  private mapToAlbumDTO(entity: AlbumMusicaEntity): Album {
    return {
      id_album: entity.idAlbum,
      nombre_album: entity.nombreAlbum,
      fecha_creacion: entity.fechaCreacion,
      fecha_actualizacion: entity.fechaActualizacion,
    };
  }

  async findAll(): Promise<Musica[]> {
    const rows = await this.musicaRepo.find();
    return rows.map((r) => this.mapToMusicaDTO(r));
  }

  async findById(id: number): Promise<Musica | null> {
    const row = await this.musicaRepo.findOne({ where: { idCancion: id } });
    return row ? this.mapToMusicaDTO(row) : null;
  }

  async findByNombre(nombre: string): Promise<Musica[]> {
    // ILIKE para búsqueda case-insensitive en Postgres
    const rows = await this.musicaRepo
      .createQueryBuilder("m")
      .where("LOWER(m.nombre_cancion) LIKE :nombre", {
        nombre: `%${nombre.toLowerCase()}%`,
      })
      .getMany();
    return rows.map((r) => this.mapToMusicaDTO(r));
  }

  async findByAlbumId(albumId: number): Promise<Musica[]> {
    const rows = await this.musicaRepo.find({ where: { idAlbum: albumId } });
    return rows.map((r) => this.mapToMusicaDTO(r));
  }

  async findAllAlbums(): Promise<Album[]> {
    const rows = await this.albumRepo.find();
    return rows.map((r) => this.mapToAlbumDTO(r));
  }

  async findAlbumById(id: number): Promise<Album | null> {
    const row = await this.albumRepo.findOne({ where: { idAlbum: id } });
    return row ? this.mapToAlbumDTO(row) : null;
  }

  async findAlbumByNombre(nombre: string): Promise<Album | null> {
    const row = await this.albumRepo.findOne({
      where: { nombreAlbum: nombre },
    });
    return row ? this.mapToAlbumDTO(row) : null;
  }
}

export const musicRepository = new MusicRepository();
