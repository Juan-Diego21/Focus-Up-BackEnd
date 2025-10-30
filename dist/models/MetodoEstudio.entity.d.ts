import { BeneficioEntity } from "./Beneficio.entity";
export declare class MetodoEstudioEntity {
    idMetodo: number;
    nombreMetodo: string;
    descripcion: string;
    urlImagen: string;
    colorHexa: string;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    beneficios?: BeneficioEntity[];
    eventos?: any[];
}
