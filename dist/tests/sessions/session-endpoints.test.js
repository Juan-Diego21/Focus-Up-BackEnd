"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTests = runTests;
const ormconfig_1 = require("../../config/ormconfig");
const SessionService_1 = require("../../services/SessionService");
const ReportsService_1 = require("../../services/ReportsService");
const TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE4LCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJ0b2tlblZlcnNpb24iOjI4LCJpYXQiOjE3NjQwODc1ODEsImV4cCI6MTc2NDE3Mzk4MX0.0Xblg_ILAWJmsg9rmRCoLkcs0uNyDk_Ifqr6SHSKkL0";
async function testGetUserSessions() {
    console.log('\n🧪 Testing GET /users/{userId}/sessions...');
    try {
        const sessionService = new SessionService_1.SessionService();
        const testSession = await sessionService.createSession({
            type: 'rapid',
            title: 'Sesión de prueba para test'
        }, 18);
        console.log('✅ Created test session:', testSession.sessionId);
        const sessions = await sessionService.listUserSessionsPaginated(18, 1, 10);
        console.log('✅ Retrieved sessions:', sessions.length);
        if (sessions.length > 0) {
            const session = sessions[0];
            const requiredFields = ['id_sesion', 'titulo', 'descripcion', 'estado', 'tipo', 'id_evento', 'id_metodo', 'id_album', 'tiempo_transcurrido', 'fecha_creacion', 'fecha_actualizacion', 'ultima_interaccion'];
            for (const field of requiredFields) {
                if (!(field in session)) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }
            if (typeof session.tiempo_transcurrido !== 'string' || !/^\d{2}:\d{2}:\d{2}$/.test(session.tiempo_transcurrido)) {
                throw new Error(`tiempo_transcurrido should be HH:MM:SS string, got: ${session.tiempo_transcurrido}`);
            }
            console.log('✅ Session format validation passed');
        }
        console.log('✅ GET /users/{userId}/sessions test passed');
    }
    catch (error) {
        console.error('❌ GET /users/{userId}/sessions test failed:', error);
        throw error;
    }
}
async function testUpdateSessionProgress() {
    console.log('\n🧪 Testing PATCH /reports/sessions/{id}/progress...');
    try {
        const sessionService = new SessionService_1.SessionService();
        const reportsService = new ReportsService_1.ReportsService();
        const testSession = await sessionService.createSession({
            type: 'rapid',
            title: 'Sesión para completar en test'
        }, 18);
        console.log('✅ Created test session for completion:', testSession.sessionId);
        const result = await reportsService.updateSessionProgress(testSession.sessionId, 18, {
            status: 'completed',
            elapsedMs: 3600000,
            notes: 'Completada desde test'
        });
        if (!result.success) {
            throw new Error(`Failed to update session progress: ${result.error}`);
        }
        console.log('✅ Session marked as completed');
        const updatedSession = await sessionService.getSession(testSession.sessionId, 18);
        if (updatedSession.status !== 'completada') {
            throw new Error(`Session status should be 'completada', got: ${updatedSession.status}`);
        }
        if (updatedSession.elapsedInterval !== '01:00:00') {
            throw new Error(`Session elapsed time should be '01:00:00', got: ${updatedSession.elapsedInterval}`);
        }
        console.log('✅ Session progress update test passed');
    }
    catch (error) {
        console.error('❌ PATCH /reports/sessions/{id}/progress test failed:', error);
        throw error;
    }
}
async function testGetPendingAgedSessions() {
    console.log('\n🧪 Testing GET /sessions/pending/aged...');
    try {
        const sessionService = new SessionService_1.SessionService();
        const sessions = await sessionService.getPendingSessionsOlderThan(30);
        console.log(`✅ Found ${sessions.length} sessions older than 30 days`);
        for (const session of sessions) {
            if (session.estado !== 'pendiente') {
                throw new Error(`Session ${session.idSesion} should be 'pendiente', got: ${session.estado}`);
            }
        }
        console.log('✅ GET /sessions/pending/aged test passed');
    }
    catch (error) {
        console.error('❌ GET /sessions/pending/aged test failed:', error);
        throw error;
    }
}
async function runTests() {
    console.log('🚀 Starting Session Endpoints Tests...');
    try {
        await ormconfig_1.AppDataSource.initialize();
        console.log('✅ Database connection established');
        await testGetUserSessions();
        await testUpdateSessionProgress();
        await testGetPendingAgedSessions();
        console.log('\n🎉 All session endpoint tests passed!');
    }
    catch (error) {
        console.error('\n💥 Test suite failed:', error);
        process.exit(1);
    }
    finally {
        if (ormconfig_1.AppDataSource.isInitialized) {
            await ormconfig_1.AppDataSource.destroy();
            console.log('✅ Database connection closed');
        }
    }
}
if (require.main === module) {
    runTests();
}
