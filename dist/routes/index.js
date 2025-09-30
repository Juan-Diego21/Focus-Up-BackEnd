"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });

const express_1 = require("express");
const userRoutes_1 = __importDefault(require("./userRoutes"));
const musicaRoutes_1 = __importDefault(require("./musicaRoutes"));
const env_1 = require("../config/env");
const metodosRutas_1 = __importDefault(require("../routes/metodosRutas"));
const eventosRutas_1 = __importDefault(require("../routes/eventosRutas"));

const router = (0, express_1.Router)();

router.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Focus Up API is running successfully",
        timestamp: new Date().toISOString(),
        environment: env_1.env.NODE_ENV,
    });
});

router.use("/users", userRoutes_1.default);
router.use("/eventos", eventosRutas_1.default);
router.use("/metodos", metodosRutas_1.default);
router.use("/musica", musicaRoutes_1.default);

router.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`,
        timestamp: new Date(),
    });
});

exports.default = router;
