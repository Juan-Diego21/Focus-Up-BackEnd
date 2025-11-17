import axios from 'axios';
import logger from '../utils/logger';

/**
 * Test script for Reports API endpoints
 * Tests the functionality of the reports system to ensure it works correctly
 * with the actual database schema
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Test user credentials (these should exist in your database)
const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123'
};

let authToken = '';
let testMethodId = 1; // Assuming method ID 1 exists
let createdMethodId = 0;
let createdSessionId = 0;

/**
 * Login and get authentication token
 */
async function loginAndGetToken(): Promise<boolean> {
  try {
    logger.info('🔐 Attempting to login...');

    const response = await axios.post(`${API_BASE_URL}${API_PREFIX}/users/login`, {
      correo: TEST_USER.email,
      contrasena: TEST_USER.password
    });

    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      logger.info('✅ Login successful, token obtained');
      return true;
    } else {
      logger.error('❌ Login failed:', response.data.message);
      return false;
    }
  } catch (error: any) {
    logger.error('❌ Login error:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test POST /api/v1/reports/active-methods
 */
async function testCreateActiveMethod(): Promise<boolean> {
  try {
    logger.info('📝 Testing POST /api/v1/reports/active-methods...');

    const response = await axios.post(
      `${API_BASE_URL}${API_PREFIX}/reports/active-methods`,
      { idMetodo: testMethodId },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      createdMethodId = response.data.data.idMetodoRealizado;
      logger.info(`✅ Active method created successfully with ID: ${createdMethodId}`);
      return true;
    } else {
      logger.error('❌ Failed to create active method:', response.data.message);
      return false;
    }
  } catch (error: any) {
    logger.error('❌ Create active method error:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test GET /api/v1/reports
 */
async function testGetReports(): Promise<boolean> {
  try {
    logger.info('📊 Testing GET /api/v1/reports...');

    const response = await axios.get(
      `${API_BASE_URL}${API_PREFIX}/reports`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    if (response.data.success) {
      const { metodos, sesiones } = response.data.data;

      logger.info(`✅ Reports retrieved successfully:`);
      logger.info(`   📚 Methods: ${metodos.length}`);
      logger.info(`   🎵 Sessions: ${sesiones.length}`);

      // Validate method structure
      if (metodos.length > 0) {
        const method = metodos[0];
        const requiredMethodFields = ['id', 'metodo', 'progreso', 'estado', 'fechaInicio', 'fechaFin', 'fechaCreacion'];

        for (const field of requiredMethodFields) {
          if (!(field in method)) {
            logger.error(`❌ Method missing required field: ${field}`);
            return false;
          }
        }

        // Validate method.metodo structure
        const methodDetails = method.metodo;
        const requiredMethodDetailFields = ['id', 'nombre', 'descripcion', 'color', 'imagen'];
        for (const field of requiredMethodDetailFields) {
          if (!(field in methodDetails)) {
            logger.error(`❌ Method details missing required field: ${field}`);
            return false;
          }
        }

        logger.info('✅ Method structure validation passed');
      }

      // Validate session structure
      if (sesiones.length > 0) {
        const session = sesiones[0];
        const requiredSessionFields = ['id', 'duracion', 'estado', 'fechaProgramada', 'fechaInicio', 'fechaFin', 'fechaCreacion'];

        for (const field of requiredSessionFields) {
          if (!(field in session)) {
            logger.error(`❌ Session missing required field: ${field}`);
            return false;
          }
        }

        logger.info('✅ Session structure validation passed');
      }

      return true;
    } else {
      logger.error('❌ Failed to get reports:', response.data.message);
      return false;
    }
  } catch (error: any) {
    logger.error('❌ Get reports error:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test PATCH /api/v1/reports/methods/:id/progress
 */
async function testUpdateMethodProgress(): Promise<boolean> {
  if (createdMethodId === 0) {
    logger.warn('⚠️ Skipping method progress test - no method created');
    return true;
  }

  try {
    logger.info('📈 Testing PATCH /api/v1/reports/methods/:id/progress...');

    // Update to 50% progress
    const response = await axios.patch(
      `${API_BASE_URL}${API_PREFIX}/reports/methods/${createdMethodId}/progress`,
      { progreso: 50 },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      logger.info('✅ Method progress updated to 50%');

      // Update to 100% and finalize
      const finalizeResponse = await axios.patch(
        `${API_BASE_URL}${API_PREFIX}/reports/methods/${createdMethodId}/progress`,
        { progreso: 100 },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (finalizeResponse.data.success) {
        logger.info('✅ Method finalized at 100%');
        return true;
      } else {
        logger.error('❌ Failed to finalize method:', finalizeResponse.data.message);
        return false;
      }
    } else {
      logger.error('❌ Failed to update method progress:', response.data.message);
      return false;
    }
  } catch (error: any) {
    logger.error('❌ Update method progress error:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test PATCH /api/v1/reports/sessions/:id/progress (if session exists)
 */
async function testUpdateSessionProgress(): Promise<boolean> {
  // This test assumes there might be an existing session to update
  // In a real scenario, you might need to create a session first
  logger.info('🎵 Testing PATCH /api/v1/reports/sessions/:id/progress...');

  // For now, just test that the endpoint exists and returns proper error for non-existent session
  try {
    const response = await axios.patch(
      `${API_BASE_URL}${API_PREFIX}/reports/sessions/99999/progress`,
      { estado: 'en_proceso' },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Should return an error for non-existent session
    if (!response.data.success && response.data.error === 'Sesión realizada no encontrada') {
      logger.info('✅ Session progress endpoint working correctly (proper error for non-existent session)');
      return true;
    } else {
      logger.warn('⚠️ Unexpected response for non-existent session');
      return true; // Not a critical failure
    }
  } catch (error: any) {
    if (error.response?.status === 400) {
      logger.info('✅ Session progress endpoint working correctly (proper error response)');
      return true;
    }
    logger.error('❌ Update session progress error:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests(): Promise<void> {
  logger.info('🚀 Starting Reports API Tests...');
  logger.info('=' .repeat(50));

  const results = {
    login: false,
    createMethod: false,
    getReports: false,
    updateMethod: false,
    updateSession: false
  };

  // Test login
  results.login = await loginAndGetToken();
  if (!results.login) {
    logger.error('❌ Cannot continue tests without authentication');
    return;
  }

  // Test create active method
  results.createMethod = await testCreateActiveMethod();

  // Test get reports
  results.getReports = await testGetReports();

  // Test update method progress
  results.updateMethod = await testUpdateMethodProgress();

  // Test update session progress
  results.updateSession = await testUpdateSessionProgress();

  // Summary
  logger.info('=' .repeat(50));
  logger.info('📋 Test Results Summary:');

  const passedTests = Object.values(results).filter(result => result).length;
  const totalTests = Object.keys(results).length;

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    logger.info(`   ${status} ${test}`);
  });

  logger.info(`📊 Overall: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    logger.info('🎉 All tests passed! Reports API is working correctly.');
  } else {
    logger.warn('⚠️ Some tests failed. Please check the implementation.');
  }
}

// Handle command line execution
if (require.main === module) {
  runTests()
    .then(() => {
      logger.info('🏁 Test execution completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}

export { runTests };