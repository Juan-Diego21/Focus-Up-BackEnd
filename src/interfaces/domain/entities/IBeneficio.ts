/**
 * Interfaz que representa un beneficio de estudio en el dominio
 * Define la estructura de datos de un beneficio sin dependencias de TypeORM
 */
export interface IBeneficio {
  /** ID único del beneficio */
  idBeneficio: number;

  /** Descripción del beneficio */
  descripcionBeneficio: string;

  /** Fecha de creación del beneficio */
  fechaCreacion: Date;

  /** Fecha de última actualización */
  fechaActualizacion: Date;
}

/**
 * Interfaz para crear un nuevo beneficio
 */
export interface ICreateBeneficio {
  descripcionBeneficio: string;
}

/**
 * Interfaz para actualizar un beneficio existente
 */
export interface IUpdateBeneficio {
  descripcionBeneficio?: string;
}