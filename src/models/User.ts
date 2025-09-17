import { User, UserCreateInput, UserUpdateInput } from '../types/User';

export class UserModel {
  constructor(
    public id_usuario?: number,
    public nombre_usuario: string = '',
    public pais: string = '',
    public genero: 'Masculino' | 'Femenino' | 'Otro' | 'Prefiero no decir' = 'Prefiero no decir',
    public fecha_nacimiento: Date = new Date(),
    public horario_fav: string = '',
    public correo: string = '',
    public contrasena: string = '',
    public id_objetivo_estudio?: number,
    public fecha_creacion: Date = new Date(),
    public fecha_actualizacion: Date = new Date()
  ) {}

  // Validar edad mínima (13 años)
  static isValidAge(fechaNacimiento: Date): boolean {
    const hoy = new Date();
    const edadMinima = new Date();
    edadMinima.setFullYear(hoy.getFullYear() - 13);
    return fechaNacimiento <= edadMinima;
  }

  // Método para crear desde input con validación
  static fromInput(input: UserCreateInput): UserModel {
    if (!this.isValidAge(input.fecha_nacimiento)) {
      throw new Error('El usuario debe tener al menos 13 años');
    }

    return new UserModel(
      undefined,
      input.nombre_usuario,
      input.pais || '',
      input.genero || 'Prefiero no decir',
      input.fecha_nacimiento,
      input.horario_fav || '',
      input.correo,
      input.contrasena,
      input.id_objetivo_estudio,
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
      id_objetivo_estudio: this.id_objetivo_estudio,
      fecha_creacion: this.fecha_creacion,
      fecha_actualizacion: this.fecha_actualizacion
    };
  }
}