import { UserEntity } from "./User.entity";
import { DistractionEntity } from "./Distraction.entity";
export declare class UsuarioDistraccionesEntity {
    idUsuario: number;
    idDistraccion: number;
    usuario: UserEntity;
    distraccion: DistractionEntity;
    fechaCreacion: Date;
}
