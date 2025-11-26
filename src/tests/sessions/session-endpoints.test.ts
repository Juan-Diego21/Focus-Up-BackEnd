/**
 * Tests de integración para endpoints de sesiones de concentración
 * Verifica el comportamiento de los endpoints modificados según la nueva especificación
 */

import { AppDataSource } from '../../config/ormconfig';
import { SessionService } from '../../services/SessionService';
import { ReportsService } from '../../services/ReportsService';
import { UserEntity } from '../../models/User.entity';
import { SesionConcentracionEntity } from '../../models/SesionConcentracion.entity';
import logger from '../../utils/logger';

const TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE4LCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJ0b2tlblZlcnNpb24iOjI4LCJpYXQiOjE3NjQwODc1ODEsImV4cCI6MTc2NDE3Mzk4MX0.0Xblg_ILAWJmsg9rmRCoLkcs0uNyDk_Ifqr6SHSKkL0";

/**
 * Test para GET /users/{userId}/sessions
 * Verifica que retorna sesiones en formato snake_case sin filtros adicionales
 */
async function testGetUserSessions() {
  console.log('\n🧪 Testing GET /users/{userId}/sessions...');

  try {
    const sessionService = new SessionService();

    // Crear una sesión de prueba
    const testSession = await sessionService.createSession({
      type: 'rapid',
      title: 'Sesión de prueba para test'
    }, 18); // userId 18 del token

    console.log('✅ Created test session:', testSession.sessionId);

    // Obtener sesiones del usuario
    const sessions = await sessionService.listUserSessionsPaginated(18, 1, 10);

    console.log('✅ Retrieved sessions:', sessions.length);

    // Verificar formato snake_case
    if (sessions.length > 0) {
      const session = sessions[0];
      const requiredFields = ['id_sesion', 'titulo', 'descripcion', 'estado', 'tipo', 'id_evento', 'id_metodo', 'id_album', 'tiempo_transcurrido', 'fecha_creacion', 'fecha_actualizacion', 'ultima_interaccion'];

      for (const field of requiredFields) {
        if (!(field in session)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Verificar que tiempo_transcurrido es string en formato HH:MM:SS
      if (typeof session.tiempo_transcurrido !== 'string' || !/^\d{2}:\d{2}:\d{2}$/.test(session.tiempo_transcurrido)) {
        throw new Error(`tiempo_transcurrido should be HH:MM:SS string, got: ${session.tiempo_transcurrido}`);
      }

      console.log('✅ Session format validation passed');
    }

    console.log('✅ GET /users/{userId}/sessions test passed');

  } catch (error) {
    console.error('❌ GET /users/{userId}/sessions test failed:', error);
    throw error;
  }
}

/**
 * Test para PATCH /reports/sessions/{id}/progress
 * Verifica que marca sesión como completada y actualiza tiempo
 */
async function testUpdateSessionProgress() {
  console.log('\n🧪 Testing PATCH /reports/sessions/{id}/progress...');

  try {
    const sessionService = new SessionService();
    const reportsService = new ReportsService();

    // Crear una sesión de prueba
    const testSession = await sessionService.createSession({
      type: 'rapid',
      title: 'Sesión para completar en test'
    }, 18);

    console.log('✅ Created test session for completion:', testSession.sessionId);

    // Marcar como completada con tiempo
    const result = await reportsService.updateSessionProgress(testSession.sessionId, 18, {
      status: 'completed',
      elapsedMs: 3600000, // 1 hora
      notes: 'Completada desde test'
    });

    if (!result.success) {
      throw new Error(`Failed to update session progress: ${result.error}`);
    }

    console.log('✅ Session marked as completed');

    // Verificar en BD que se actualizó correctamente
    const updatedSession = await sessionService.getSession(testSession.sessionId, 18);

    if (updatedSession.status !== 'completada') {
      throw new Error(`Session status should be 'completada', got: ${updatedSession.status}`);
    }

    if (updatedSession.elapsedInterval !== '01:00:00') {
      throw new Error(`Session elapsed time should be '01:00:00', got: ${updatedSession.elapsedInterval}`);
    }

    console.log('✅ Session progress update test passed');

  } catch (error) {
    console.error('❌ PATCH /reports/sessions/{id}/progress test failed:', error);
    throw error;
  }
}

/**
 * Test para GET /sessions/pending/aged
 * Verifica que retorna sesiones pendientes antiguas
 */
async function testGetPendingAgedSessions() {
  console.log('\n🧪 Testing GET /sessions/pending/aged...');

  try {
    const sessionService = new SessionService();

    // Obtener sesiones pendientes más antiguas que 30 días (debería haber pocas o ninguna)
    const sessions = await sessionService.getPendingSessionsOlderThan(30);

    console.log(`✅ Found ${sessions.length} sessions older than 30 days`);

    // Verificar que todas son pendientes
    for (const session of sessions) {
      if (session.estado !== 'pendiente') {
        throw new Error(`Session ${session.idSesion} should be 'pendiente', got: ${session.estado}`);
      }
    }

    console.log('✅ GET /sessions/pending/aged test passed');

  } catch (error) {
    console.error('❌ GET /sessions/pending/aged test failed:', error);
    throw error;
  }
}

/**
 * Función principal para ejecutar todos los tests
 */
async function runTests() {
  console.log('🚀 Starting Session Endpoints Tests...');

  try {
    // Inicializar conexión a BD
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    // Ejecutar tests
    await testGetUserSessions();
    await testUpdateSessionProgress();
    await testGetPendingAgedSessions();

    console.log('\n🎉 All session endpoint tests passed!');

  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  } finally {
    // Cerrar conexión
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Database connection closed');
    }
  }
}

// Ejecutar tests si se llama directamente
if (require.main === module) {
  runTests();
}

export { runTests };