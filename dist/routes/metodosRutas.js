"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MetodoEstudioController_1 = require("../controllers/MetodoEstudioController");
const router = (0, express_1.Router)();
router.get('/', MetodoEstudioController_1.MetodoEstudioController.getMetodoList.bind(MetodoEstudioController_1.MetodoEstudioController));
router.get('/:id', MetodoEstudioController_1.MetodoEstudioController.getMetodoById.bind(MetodoEstudioController_1.MetodoEstudioController));
router.get('/nombre/:nombre', MetodoEstudioController_1.MetodoEstudioController.getMetodoByname.bind(MetodoEstudioController_1.MetodoEstudioController));
exports.default = router;
