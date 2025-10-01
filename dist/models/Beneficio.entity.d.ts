import { MetodoEstudioEntity } from "./MetodoEstudio.entity";
export declare class BeneficioEntity {
    idBeneficio: number;
    descripcionBeneficio: string;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    metodos?: MetodoEstudioEntity[];
}
