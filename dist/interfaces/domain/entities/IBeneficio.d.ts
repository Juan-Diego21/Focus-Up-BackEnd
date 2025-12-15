export interface IBeneficio {
    idBeneficio: number;
    descripcionBeneficio: string;
    fechaCreacion: Date;
    fechaActualizacion: Date;
}
export interface ICreateBeneficio {
    descripcionBeneficio: string;
}
export interface IUpdateBeneficio {
    descripcionBeneficio?: string;
}
