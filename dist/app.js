"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: env_1.env.NODE_ENV === "production"
        ? "https://frontend.com"
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
}));
app.use((0, morgan_1.default)(env_1.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(env_1.env.API_PREFIX, routes_1.default);
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
app.listen(PORT, () => {
    console.log(`🚀 Focus Up API server is running on port ${PORT}`);
    console.log(`📍 Environment: ${env_1.env.NODE_ENV}`);
    console.log(`🌐 Health check: http://localhost:${PORT}${env_1.env.API_PREFIX}/health`);
    console.log(`👥 Users API: http://localhost:${PORT}${env_1.env.API_PREFIX}/users`);
});
exports.default = app;
