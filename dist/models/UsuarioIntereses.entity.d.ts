import { UserEntity } from "./User.entity";
import { InterestEntity } from "./Interest.entity";
export declare class UsuarioInteresesEntity {
    idUsuario: number;
    idInteres: number;
    usuario: UserEntity;
    interes: InterestEntity;
    fechaCreacion: Date;
}
