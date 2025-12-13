"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
require("reflect-metadata");
const routes_1 = __importDefault(require("./routes"));
const env_1 = require("./config/env");
const swagger_1 = require("./config/swagger");
const ormconfig_1 = require("./config/ormconfig");
const logger_1 = __importDefault(require("./utils/logger"));
const envValidation_1 = require("./utils/envValidation");
(0, envValidation_1.validateEnvironment)();
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'"],
        },
    },
    hsts: env_1.env.NODE_ENV === "production" ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    } : false,
}));
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin)
            return callback(null, true);
        const allowedOrigins = [
            "http://localhost:8081",
            "http://localhost:5173",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
        ];
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        if (origin.match(/^http:\/\/localhost:\d+$/) || origin.match(/^http:\/\/127\.0\.0\.1:\d+$/)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization,X-Requested-With",
    optionsSuccessStatus: 200,
}));
app.use((0, morgan_1.default)(env_1.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(env_1.env.API_PREFIX, routes_1.default);
app.use("/api-docs", swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.swaggerSpec, swagger_1.swaggerUiOptions));
app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swagger_1.swaggerSpec);
});
app.use((error, req, res, next) => {
    logger_1.default.error("Error global:", error);
    res.status(error.status || 500).json({
        success: false,
        message: "Error interno del servidor",
        error: env_1.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
        timestamp: new Date(),
    });
});
const PORT = env_1.env.PORT;
app.listen(PORT, async () => {
    try {
        await (0, ormconfig_1.initializeDatabase)();
        logger_1.default.info(`🚀 Focus Up API server is running on port ${PORT}`);
        logger_1.default.info(`📍 Environment: ${env_1.env.NODE_ENV}`);
        logger_1.default.info(`🌐 Health check: http://localhost:${PORT}${env_1.env.API_PREFIX}/health`);
        logger_1.default.info(`📊 TypeORM connected: ${ormconfig_1.AppDataSource.isInitialized}`);
    }
    catch (error) {
        logger_1.default.error("❌ Failed to start server:", error);
        process.exit(1);
    }
});
exports.default = app;
