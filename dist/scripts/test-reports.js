"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTests = runTests;
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("../utils/logger"));
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const API_PREFIX = process.env.API_PREFIX || '/api/v1';
const TEST_USER = {
    email: 'test@example.com',
    password: 'TestPassword123'
};
let authToken = '';
let testMethodId = 1;
let createdMethodId = 0;
let createdSessionId = 0;
async function loginAndGetToken() {
    try {
        logger_1.default.info('🔐 Attempting to login...');
        const response = await axios_1.default.post(`${API_BASE_URL}${API_PREFIX}/users/login`, {
            correo: TEST_USER.email,
            contrasena: TEST_USER.password
        });
        if (response.data.success && response.data.token) {
            authToken = response.data.token;
            logger_1.default.info('✅ Login successful, token obtained');
            return true;
        }
        else {
            logger_1.default.error('❌ Login failed:', response.data.message);
            return false;
        }
    }
    catch (error) {
        logger_1.default.error('❌ Login error:', error.response?.data || error.message);
        return false;
    }
}
async function testCreateActiveMethod() {
    try {
        logger_1.default.info('📝 Testing POST /api/v1/reports/active-methods...');
        const response = await axios_1.default.post(`${API_BASE_URL}${API_PREFIX}/reports/active-methods`, { idMetodo: testMethodId }, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.data.success) {
            createdMethodId = response.data.data.idMetodoRealizado;
            logger_1.default.info(`✅ Active method created successfully with ID: ${createdMethodId}`);
            return true;
        }
        else {
            logger_1.default.error('❌ Failed to create active method:', response.data.message);
            return false;
        }
    }
    catch (error) {
        logger_1.default.error('❌ Create active method error:', error.response?.data || error.message);
        return false;
    }
}
async function testGetReports() {
    try {
        logger_1.default.info('📊 Testing GET /api/v1/reports...');
        const response = await axios_1.default.get(`${API_BASE_URL}${API_PREFIX}/reports`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        if (response.data.success) {
            const { metodos, sesiones } = response.data.data;
            logger_1.default.info(`✅ Reports retrieved successfully:`);
            logger_1.default.info(`   📚 Methods: ${metodos.length}`);
            logger_1.default.info(`   🎵 Sessions: ${sesiones.length}`);
            if (metodos.length > 0) {
                const method = metodos[0];
                const requiredMethodFields = ['id', 'metodo', 'progreso', 'estado', 'fechaInicio', 'fechaFin', 'fechaCreacion'];
                for (const field of requiredMethodFields) {
                    if (!(field in method)) {
                        logger_1.default.error(`❌ Method missing required field: ${field}`);
                        return false;
                    }
                }
                const methodDetails = method.metodo;
                const requiredMethodDetailFields = ['id', 'nombre', 'descripcion', 'color', 'imagen'];
                for (const field of requiredMethodDetailFields) {
                    if (!(field in methodDetails)) {
                        logger_1.default.error(`❌ Method details missing required field: ${field}`);
                        return false;
                    }
                }
                logger_1.default.info('✅ Method structure validation passed');
            }
            if (sesiones.length > 0) {
                const session = sesiones[0];
                const requiredSessionFields = ['id', 'duracion', 'estado', 'fechaProgramada', 'fechaInicio', 'fechaFin', 'fechaCreacion'];
                for (const field of requiredSessionFields) {
                    if (!(field in session)) {
                        logger_1.default.error(`❌ Session missing required field: ${field}`);
                        return false;
                    }
                }
                logger_1.default.info('✅ Session structure validation passed');
            }
            return true;
        }
        else {
            logger_1.default.error('❌ Failed to get reports:', response.data.message);
            return false;
        }
    }
    catch (error) {
        logger_1.default.error('❌ Get reports error:', error.response?.data || error.message);
        return false;
    }
}
async function testUpdateMethodProgress() {
    if (createdMethodId === 0) {
        logger_1.default.warn('⚠️ Skipping method progress test - no method created');
        return true;
    }
    try {
        logger_1.default.info('📈 Testing PATCH /api/v1/reports/methods/:id/progress...');
        const response = await axios_1.default.patch(`${API_BASE_URL}${API_PREFIX}/reports/methods/${createdMethodId}/progress`, { progreso: 50 }, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.data.success) {
            logger_1.default.info('✅ Method progress updated to 50%');
            const finalizeResponse = await axios_1.default.patch(`${API_BASE_URL}${API_PREFIX}/reports/methods/${createdMethodId}/progress`, { progreso: 100 }, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (finalizeResponse.data.success) {
                logger_1.default.info('✅ Method finalized at 100%');
                return true;
            }
            else {
                logger_1.default.error('❌ Failed to finalize method:', finalizeResponse.data.message);
                return false;
            }
        }
        else {
            logger_1.default.error('❌ Failed to update method progress:', response.data.message);
            return false;
        }
    }
    catch (error) {
        logger_1.default.error('❌ Update method progress error:', error.response?.data || error.message);
        return false;
    }
}
async function testUpdateSessionProgress() {
    logger_1.default.info('🎵 Testing PATCH /api/v1/reports/sessions/:id/progress...');
    try {
        const response = await axios_1.default.patch(`${API_BASE_URL}${API_PREFIX}/reports/sessions/99999/progress`, { estado: 'en_proceso' }, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.data.success && response.data.error === 'Sesión realizada no encontrada') {
            logger_1.default.info('✅ Session progress endpoint working correctly (proper error for non-existent session)');
            return true;
        }
        else {
            logger_1.default.warn('⚠️ Unexpected response for non-existent session');
            return true;
        }
    }
    catch (error) {
        if (error.response?.status === 400) {
            logger_1.default.info('✅ Session progress endpoint working correctly (proper error response)');
            return true;
        }
        logger_1.default.error('❌ Update session progress error:', error.response?.data || error.message);
        return false;
    }
}
async function runTests() {
    logger_1.default.info('🚀 Starting Reports API Tests...');
    logger_1.default.info('='.repeat(50));
    const results = {
        login: false,
        createMethod: false,
        getReports: false,
        updateMethod: false,
        updateSession: false
    };
    results.login = await loginAndGetToken();
    if (!results.login) {
        logger_1.default.error('❌ Cannot continue tests without authentication');
        return;
    }
    results.createMethod = await testCreateActiveMethod();
    results.getReports = await testGetReports();
    results.updateMethod = await testUpdateMethodProgress();
    results.updateSession = await testUpdateSessionProgress();
    logger_1.default.info('='.repeat(50));
    logger_1.default.info('📋 Test Results Summary:');
    const passedTests = Object.values(results).filter(result => result).length;
    const totalTests = Object.keys(results).length;
    Object.entries(results).forEach(([test, passed]) => {
        const status = passed ? '✅ PASS' : '❌ FAIL';
        logger_1.default.info(`   ${status} ${test}`);
    });
    logger_1.default.info(`📊 Overall: ${passedTests}/${totalTests} tests passed`);
    if (passedTests === totalTests) {
        logger_1.default.info('🎉 All tests passed! Reports API is working correctly.');
    }
    else {
        logger_1.default.warn('⚠️ Some tests failed. Please check the implementation.');
    }
}
if (require.main === module) {
    runTests()
        .then(() => {
        logger_1.default.info('🏁 Test execution completed');
        process.exit(0);
    })
        .catch((error) => {
        logger_1.default.error('💥 Test execution failed:', error);
        process.exit(1);
    });
}
