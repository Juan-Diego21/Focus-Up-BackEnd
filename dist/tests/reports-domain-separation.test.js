"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../app");
const ormconfig_1 = require("../config/ormconfig");
const TEST_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE4LCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJ0b2tlblZlcnNpb24iOjI4LCJpYXQiOjE3NjQwODc1ODEsImV4cCI6MTc2NDE3Mzk4MX0.0Xblg_ILAWJmsg9rmRCoLkcs0uNyDk_Ifqr6SHSKkL0';
describe('Reports Domain Separation Integration Tests', () => {
    beforeAll(async () => {
        if (!ormconfig_1.AppDataSource.isInitialized) {
            await ormconfig_1.AppDataSource.initialize();
        }
    });
    afterAll(async () => {
        if (ormconfig_1.AppDataSource.isInitialized) {
            await ormconfig_1.AppDataSource.destroy();
        }
    });
    describe('GET /api/v1/reports/sessions', () => {
        it('debe retornar solo reportes de sesiones de concentración', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .get('/api/v1/reports/sessions')
                .set('Authorization', `Bearer ${TEST_JWT}`)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Reportes de sesiones');
            expect(Array.isArray(response.body.data)).toBe(true);
            if (response.body.data.length > 0) {
                const session = response.body.data[0];
                expect(session).toHaveProperty('id_reporte');
                expect(session).toHaveProperty('id_sesion');
                expect(session).toHaveProperty('id_usuario');
                expect(session).toHaveProperty('nombre_sesion');
                expect(session).toHaveProperty('descripcion');
                expect(session).toHaveProperty('estado');
                expect(session).toHaveProperty('tiempo_total');
                expect(session).toHaveProperty('fecha_creacion');
                expect(session).not.toHaveProperty('progreso');
                expect(session).not.toHaveProperty('id_metodo');
                expect(typeof session.id_reporte).toBe('number');
                expect(typeof session.id_sesion).toBe('number');
                expect(typeof session.id_usuario).toBe('number');
                expect(typeof session.nombre_sesion).toBe('string');
                expect(typeof session.descripcion).toBe('string');
                expect(['pendiente', 'completado']).toContain(session.estado);
                expect(typeof session.tiempo_total).toBe('number');
                expect(typeof session.fecha_creacion).toBe('string');
                if (session.metodo_asociado) {
                    expect(session.metodo_asociado).toHaveProperty('id_metodo');
                    expect(session.metodo_asociado).toHaveProperty('nombre_metodo');
                }
                if (session.album_asociado) {
                    expect(session.album_asociado).toHaveProperty('id_album');
                    expect(session.album_asociado).toHaveProperty('nombre_album');
                }
            }
        });
        it('debe requerir autenticación JWT', async () => {
            await (0, supertest_1.default)(app_1.app)
                .get('/api/v1/reports/sessions')
                .expect(401);
        });
    });
    describe('GET /api/v1/reports/methods', () => {
        it('debe retornar solo reportes de métodos de estudio', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .get('/api/v1/reports/methods')
                .set('Authorization', `Bearer ${TEST_JWT}`)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Reportes de métodos');
            expect(Array.isArray(response.body.data)).toBe(true);
            if (response.body.data.length > 0) {
                const method = response.body.data[0];
                expect(method).toHaveProperty('id_reporte');
                expect(method).toHaveProperty('id_metodo');
                expect(method).toHaveProperty('id_usuario');
                expect(method).toHaveProperty('nombre_metodo');
                expect(method).toHaveProperty('progreso');
                expect(method).toHaveProperty('estado');
                expect(method).toHaveProperty('fecha_creacion');
                expect(method).not.toHaveProperty('tiempo_total');
                expect(method).not.toHaveProperty('metodo_asociado');
                expect(method).not.toHaveProperty('album_asociado');
                expect(typeof method.id_reporte).toBe('number');
                expect(typeof method.id_metodo).toBe('number');
                expect(typeof method.id_usuario).toBe('number');
                expect(typeof method.nombre_metodo).toBe('string');
                expect(typeof method.progreso).toBe('number');
                expect(method.progreso).toBeGreaterThanOrEqual(0);
                expect(method.progreso).toBeLessThanOrEqual(100);
                expect(typeof method.estado).toBe('string');
                expect(typeof method.fecha_creacion).toBe('string');
            }
        });
        it('debe requerir autenticación JWT', async () => {
            await (0, supertest_1.default)(app_1.app)
                .get('/api/v1/reports/methods')
                .expect(401);
        });
    });
    describe('GET /api/v1/reports (Aggregator - Deprecated)', () => {
        it('debe retornar ambas categorías en arrays separados', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .get('/api/v1/reports')
                .set('Authorization', `Bearer ${TEST_JWT}`)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('DEPRECATED');
            expect(response.body.data).toHaveProperty('sessions');
            expect(response.body.data).toHaveProperty('methods');
            expect(Array.isArray(response.body.data.sessions)).toBe(true);
            expect(Array.isArray(response.body.data.methods)).toBe(true);
            expect(response.headers['x-deprecated']).toBe('true');
            expect(response.headers['x-deprecation-message']).toContain('use GET /api/v1/reports/sessions');
        });
        it('debe requerir autenticación JWT', async () => {
            await (0, supertest_1.default)(app_1.app)
                .get('/api/v1/reports')
                .expect(401);
        });
    });
    describe('Domain Separation Validation', () => {
        it('debe asegurar que sessions y methods retornen datos diferentes', async () => {
            const [sessionsResponse, methodsResponse] = await Promise.all([
                (0, supertest_1.default)(app_1.app)
                    .get('/api/v1/reports/sessions')
                    .set('Authorization', `Bearer ${TEST_JWT}`),
                (0, supertest_1.default)(app_1.app)
                    .get('/api/v1/reports/methods')
                    .set('Authorization', `Bearer ${TEST_JWT}`)
            ]);
            expect(sessionsResponse.body.success).toBe(true);
            expect(methodsResponse.body.success).toBe(true);
            const sessions = sessionsResponse.body.data;
            const methods = methodsResponse.body.data;
            expect(Array.isArray(sessions)).toBe(true);
            expect(Array.isArray(methods)).toBe(true);
            if (sessions.length > 0 && methods.length > 0) {
                const sessionKeys = Object.keys(sessions[0]).sort();
                const methodKeys = Object.keys(methods[0]).sort();
                expect(sessionKeys).not.toEqual(methodKeys);
                expect(sessions[0]).toHaveProperty('tiempo_total');
                expect(sessions[0]).toHaveProperty('metodo_asociado');
                expect(methods[0]).toHaveProperty('progreso');
                expect(methods[0]).not.toHaveProperty('tiempo_total');
                expect(methods[0]).not.toHaveProperty('metodo_asociado');
            }
        });
    });
    describe('Error Handling', () => {
        it('debe manejar usuarios inexistentes', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .get('/api/v1/reports/sessions')
                .set('Authorization', `Bearer ${TEST_JWT}`)
                .expect(200);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });
});
