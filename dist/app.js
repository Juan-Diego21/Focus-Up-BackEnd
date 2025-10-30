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
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true,
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
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
    console.error("Error global:", error);
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
        console.log(`🚀 Focus Up API server is running on port ${PORT}`);
        console.log(`📍 Environment: ${env_1.env.NODE_ENV}`);
        console.log(`🌐 Health check: http://localhost:${PORT}${env_1.env.API_PREFIX}/health`);
        console.log(`📊 TypeORM connected: ${ormconfig_1.AppDataSource.isInitialized}`);
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
});
exports.default = app;
