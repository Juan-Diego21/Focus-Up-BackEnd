// Regression tests for Feynman method progress validation
// Tests the new progress flow: 20%, 40%, 60%, 80%, 100%

const axios = require("axios");

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";
const API_PREFIX = process.env.API_PREFIX || "/api/v1";

// Test user credentials
const TEST_USER = {
  email: "test@example.com",
  password: "TestPassword123",
};

let authToken = "";
let feynmanMethodId = 5; // Assuming Feynman method ID is 5
let createdMethodId = 0;

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
 * Create a Feynman method instance
 */
async function createFeynmanMethod() {
  try {
    console.log("📝 Creating Feynman method instance...");

    const response = await axios.post(
      `${API_BASE_URL}${API_PREFIX}/reports/active-methods`,
      { id_metodo: feynmanMethodId },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      createdMethodId = response.data.data.id_metodo_realizado;
      console.log(`✅ Feynman method created with ID: ${createdMethodId}`);
      return true;
    } else {
      console.error(
        "❌ Failed to create Feynman method:",
        response.data.message
      );
      return false;
    }
  } catch (error) {
    console.error(
      "❌ Create Feynman method error:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test updating progress to a specific value
 */
async function testProgressUpdate(progressValue, expectedSuccess = true) {
  try {
    console.log(`📈 Testing PATCH to ${progressValue}%...`);

    const response = await axios.patch(
      `${API_BASE_URL}${API_PREFIX}/reports/methods/${createdMethodId}/progress`,
      { progreso: progressValue },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (expectedSuccess) {
      if (response.data.success) {
        console.log(`✅ Successfully updated to ${progressValue}%`);
        return true;
      } else {
        console.error(
          `❌ Failed to update to ${progressValue}%:`,
          response.data.message
        );
        return false;
      }
    } else {
      if (!response.data.success) {
        console.log(`✅ Correctly rejected ${progressValue}% (as expected)`);
        return true;
      } else {
        console.error(`❌ Unexpectedly accepted ${progressValue}%`);
        return false;
      }
    }
  } catch (error) {
    if (expectedSuccess) {
      console.error(
        `❌ Update to ${progressValue}% error:`,
        error.response?.data || error.message
      );
      return false;
    } else {
      if (error.response?.status === 400) {
        console.log(`✅ Correctly rejected ${progressValue}% (as expected)`);
        return true;
      } else {
        console.error(
          `❌ Unexpected error for ${progressValue}%:`,
          error.response?.data || error.message
        );
        return false;
      }
    }
  }
}

/**
 * Run all regression tests
 */
async function runRegressionTests() {
  console.log("🚀 Starting Feynman Regression Tests...");
  console.log("=".repeat(50));

  const results = {
    login: false,
    createMethod: false,
    update20: false,
    update40: false,
    update60: false,
    update80: false,
    update100: false,
    reject25: false,
    reject50: false,
    reject75: false,
  };

  // Login
  results.login = await loginAndGetToken();
  if (!results.login) {
    console.error("❌ Cannot continue tests without authentication");
    return;
  }

  // Create Feynman method
  results.createMethod = await createFeynmanMethod();
  if (!results.createMethod) {
    console.error("❌ Cannot continue tests without Feynman method");
    return;
  }

  // Test valid progress updates
  results.update20 = await testProgressUpdate(20);
  results.update40 = await testProgressUpdate(40);
  results.update60 = await testProgressUpdate(60);
  results.update80 = await testProgressUpdate(80);
  results.update100 = await testProgressUpdate(100);

  // Test invalid progress values (old values that should be rejected)
  results.reject25 = await testProgressUpdate(25, false);
  results.reject50 = await testProgressUpdate(50, false);
  results.reject75 = await testProgressUpdate(75, false);

  // Summary
  console.log("=".repeat(50));
  console.log("📋 Regression Test Results:");

  const passedTests = Object.values(results).filter((result) => result).length;
  const totalTests = Object.keys(results).length;

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? "✅ PASS" : "❌ FAIL";
    console.log(`   ${status} ${test}`);
  });

  console.log(`📊 Overall: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log(
      "🎉 All regression tests passed! Feynman progress validation is working correctly."
    );
  } else {
    console.warn("⚠️ Some tests failed. Please check the implementation.");
  }
}

// Handle command line execution
if (require.main === module) {
  runRegressionTests()
    .then(() => {
      console.log("🏁 Regression test execution completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Regression test execution failed:", error);
      process.exit(1);
    });
}

module.exports = { runRegressionTests };
