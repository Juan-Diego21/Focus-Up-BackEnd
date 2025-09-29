"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetodoEstudioService = void 0;
const MetodoEstudioRepository_1 = require("../repositories/MetodoEstudioRepository");
exports.MetodoEstudioService = {
    async getMetodoById(idMetodo) {
        try {
            const metodo = await MetodoEstudioRepository_1.MetodoEstudioRepository.findOneBy({ idMetodo: idMetodo });
            if (!metodo) {
                return { success: false, error: 'Método de estudio no encontrado por id ' };
            }
            return { success: true, metodo };
        }
        catch (error) {
            console.error('Error en getMetodoById:', error);
            return { success: false, error: 'Error interno al buscar el método' };
        }
    },
    async getMetodoByname(nombreMetodo) {
        try {
            const metodoNombre = await MetodoEstudioRepository_1.MetodoEstudioRepository.findBy({ nombreMetodo });
            if (metodoNombre.length === 0) {
                return { success: false, error: 'No se encontraron métodos con ese nombre' };
            }
        }
        catch (error) {
            console.error('Error en getMetodoByname:', error);
            return { success: false, error: 'Error interno al buscar por nombre' };
        }
    },
    async getMetodoList() {
        try {
            const lista = await MetodoEstudioRepository_1.MetodoEstudioRepository.find();
            return { success: true, data: lista };
        }
        catch (error) {
            console.error('Error al traer todos los metodos:', error);
            return { success: false, error: 'Error al listar métodos' };
        }
    }
};
exports.default = exports.MetodoEstudioService;
