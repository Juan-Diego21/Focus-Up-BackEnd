import { User, UserCreateInput, UserUpdateInput } from '../types/User';

export class UserModel {
   constructor(
     public id_usuario?: number,
     public nombre_usuario: string = '',
     public pais?: string,
     public genero?: 'Masculino' | 'Femenino' | 'Otro' | 'Prefiero no decir',
     public fecha_nacimiento?: Date,
     public horario_fav?: string,
     public correo: string = '',
     public contrasena: string = '',
     public intereses?: number[],
     public distracciones?: number[],
     public fecha_creacion: Date = new Date(),
     public fecha_actualizacion: Date = new Date()
   ) {}

  // Método para crear desde input con validación
  static fromInput(input: UserCreateInput): UserModel {
    return new UserModel(
      undefined,
      input.nombre_usuario,
      input.pais,
      input.genero,
      input.fecha_nacimiento,
      input.horario_fav,
      input.correo,
      input.contrasena,
      input.intereses,
      input.distracciones,
      new Date(),
      new Date()
    );
  }

  // Método para convertir a objeto plano
  toJSON(): User {
    return {
      id_usuario: this.id_usuario,
      nombre_usuario: this.nombre_usuario,
      pais: this.pais,
      genero: this.genero,
      fecha_nacimiento: this.fecha_nacimiento,
      horario_fav: this.horario_fav,
      correo: this.correo,
      contrasena: this.contrasena,
      fecha_creacion: this.fecha_creacion,
      fecha_actualizacion: this.fecha_actualizacion,
      intereses: this.intereses,
      distracciones: this.distracciones
    };
  }
}