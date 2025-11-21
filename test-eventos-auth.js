// Test script to check event authorization issues

const axios = require("axios");

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";
const API_PREFIX = process.env.API_PREFIX || "/api/v1";

// Test user credentials
const TEST_USER = {
  email: "test@example.com",
  password: "TestPassword123",
};

let authToken = "";
let createdEventId = 0;

/**
 * Register a test user
 */
async function registerTestUser() {
  try {
    console.log("📝 Attempting to register test user...");

    const response = await axios.post(`${API_BASE_URL}${API_PREFIX}/users`, {
      nombre_usuario: "testuser",
      correo: TEST_USER.email,
      contrasena: TEST_USER.password,
      fecha_nacimiento: "1990-01-01",
      pais: "Colombia",
      genero: "Masculino",
    });

    if (response.data.success) {
      console.log("✅ User registration successful");
      return true;
    } else {
      console.log("ℹ️ User might already exist, trying login...");
      return false; // User might already exist
    }
  } catch (error) {
    console.log(
      "ℹ️ User registration failed (might already exist), trying login..."
    );
    return false;
  }
}

/**
 * Login and get authentication token
 */
async function loginAndGetToken() {
  try {
    console.log("🔐 Attempting to login...");

    const response = await axios.post(
      `${API_BASE_URL}${API_PREFIX}/users/login`,
      {
        correo: TEST_USER.email,
        contrasena: TEST_USER.password,
      }
    );

    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      console.log("✅ Login successful, token obtained");
      return true;
    } else {
      console.error("❌ Login failed:", response.data.message);
      return false;
    }
  } catch (error) {
    console.error("❌ Login error:", error.response?.data || error.message);
    return false;
  }
}

/**
 * Create a test event
 */
async function createTestEvent() {
  try {
    console.log("📝 Creating test event...");

    const response = await axios.post(
      `${API_BASE_URL}${API_PREFIX}/eventos/crear`,
      {
        nombreEvento: "Test Event for Auth",
        fechaEvento: "2025-12-01",
        horaEvento: "10:00:00",
        descripcionEvento: "Test event for authorization testing",
        idUsuario: 1, // Assuming test user ID is 1
        idMetodo: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      createdEventId = response.data.data.idEvento;
      console.log(`✅ Test event created with ID: ${createdEventId}`);
      return true;
    } else {
      console.error("❌ Failed to create test event:", response.data.error);
      return false;
    }
  } catch (error) {
    console.error(
      "❌ Create test event error:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test PATCH endpoint authorization
 */
async function testPatchAuthorization() {
  try {
    console.log(`🔧 Testing PATCH /eventos/${createdEventId}/completed...`);

    const response = await axios.patch(
      `${API_BASE_URL}${API_PREFIX}/eventos/${createdEventId}/completed`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      console.log("✅ PATCH request successful");
      console.log("Response:", response.data);
      return true;
    } else {
      console.error("❌ PATCH request failed:", response.data.error);
      return false;
    }
  } catch (error) {
    console.error(
      "❌ PATCH request error:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Run the authorization test
 */
async function runAuthTest() {
  console.log("🚀 Starting Event Authorization Test...");
  console.log("=".repeat(50));

  // Register user (if needed) and login
  await registerTestUser();
  const loginSuccess = await loginAndGetToken();
  if (!loginSuccess) {
    console.error("❌ Cannot continue test without authentication");
    return;
  }

  // Create test event
  const createSuccess = await createTestEvent();
  if (!createSuccess) {
    console.error("❌ Cannot continue test without test event");
    return;
  }

  // Test PATCH authorization
  const patchSuccess = await testPatchAuthorization();

  console.log("=".repeat(50));
  console.log("📋 Authorization Test Results:");
  console.log(`   ${loginSuccess ? "✅ PASS" : "❌ FAIL"} Login`);
  console.log(`   ${createSuccess ? "✅ PASS" : "❌ FAIL"} Create Event`);
  console.log(`   ${patchSuccess ? "✅ PASS" : "❌ FAIL"} PATCH Authorization`);

  const totalTests = 3;
  const passedTests = [loginSuccess, createSuccess, patchSuccess].filter(
    Boolean
  ).length;

  console.log(`📊 Overall: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log("🎉 All authorization tests passed!");
  } else {
    console.warn(
      "⚠️ Some tests failed. Check server logs for debug information."
    );
  }
}

// Handle command line execution
if (require.main === module) {
  runAuthTest()
    .then(() => {
      console.log("🏁 Authorization test execution completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Authorization test execution failed:", error);
      process.exit(1);
    });
}

module.exports = { runAuthTest };
