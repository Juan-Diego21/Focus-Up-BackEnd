"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetodoEstudioController = void 0;
const MetodoEstudioService_1 = require("../services/MetodoEstudioService");
exports.MetodoEstudioController = {
    async getMetodoList(req, res) {
        console.log('COntrolador funcionnado');
        try {
            const resul = await MetodoEstudioService_1.MetodoEstudioService.getMetodoList();
            if (resul.success) {
                return res.status(200).json(resul);
            }
            else {
                return res.status(404).json(resul);
            }
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message || error });
        }
    },
    async getMetodoByname(req, res) {
        try {
            const nombreMetodo = req.params.nombre;
            const result = await MetodoEstudioService_1.MetodoEstudioService.getMetodoByname(nombreMetodo);
            if (result?.success) {
                return res.status(200).json(result);
            }
            else {
                return res.status(404).json(result);
            }
        }
        catch (error) {
            return res.status(500).json({ success: false, error: error.message || error });
        }
    },
    async getMetodoById(req, res) {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ success: false, error: 'Id no valido' });
        }
        const result = await MetodoEstudioService_1.MetodoEstudioService.getMetodoById(id);
        if (result.success) {
            return res.status(200).json(result);
        }
        else {
            return res.status(404).json(result);
        }
    }
};
exports.default = exports.MetodoEstudioController;
