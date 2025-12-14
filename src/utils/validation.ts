/**
 * Utilidades de validación para entradas de usuario
 * Proporciona métodos para validar emails, contraseñas, nombres de usuario y otros formatos
 */
export class ValidationUtils {
  // Validar formato de email
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar fortaleza de contraseña (mínimo 8 caracteres, 1 mayúscula, 1 número)
  static isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  }

  // Validar formato de hora (HH:MM)
  static isValidTime(time: string): boolean {
    const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d$/;
    return timeRegex.test(time);
  }

  // Validar formato de nombre de usuario (solo alfanumérico, _ y -)
  static isValidUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    return usernameRegex.test(username) && !/\s/.test(username);
  }

  // Sanitizar entrada de texto (prevención básica de XSS)
  static sanitizeText(text: string): string {
    /*Correccion con ALL*/
    return text
    .replace("<", "&lt;")
    .replace(">", "&gt;")
    .replace("'", "&#x27;")
    .replace('"', "&quot;");
  }
}
