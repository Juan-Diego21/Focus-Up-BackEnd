"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MetodoEstudioController_1 = require("../controllers/MetodoEstudioController");
const router = (0, express_1.Router)();
router.get('/', MetodoEstudioController_1.MetodoEstudioController.getMetodoList);
router.get('/:id', MetodoEstudioController_1.MetodoEstudioController.getMetodoById);
router.get('/nombre/:nombre', MetodoEstudioController_1.MetodoEstudioController.getMetodoByname);
exports.default = router;
