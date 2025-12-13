import { JwtPayload } from "../../utils/jwt";

/**
 * Extensión de tipos Express - req.user tipado
 * Extiende la interfaz Request de Express para incluir la propiedad user tipada
 */

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}