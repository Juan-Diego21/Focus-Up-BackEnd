import { MetodoEstudioEntity } from "./MetodoEstudio.entity";
import { BeneficioEntity } from "./Beneficio.entity";
export declare class MetodoBeneficiosEntity {
    idMetodo: number;
    idBeneficio: number;
    metodo: MetodoEstudioEntity;
    beneficio: BeneficioEntity;
    fechaCreacion: Date;
}
