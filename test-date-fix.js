// Simple test to verify date fix
const axios = require("axios");

async function testDateFix() {
  try {
    // First, get a valid token by logging in
    const loginResponse = await axios.post(
      "http://localhost:3001/api/v1/user/login",
      {
        email: "jdmend21@gmail.com",
        password: "123456",
      }
    );

    const token = loginResponse.data.data.token;
    console.log("✅ Got token");

    // Create an event with a specific date
    const testDate = "2025-11-22";
    const createResponse = await axios.post(
      "http://localhost:3001/api/v1/eventos/crear",
      {
        nombreEvento: "Test Date Fix",
        fechaEvento: testDate,
        horaEvento: "15:30:00",
        descripcionEvento: "Testing date fix",
        idUsuario: 18,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Event created");
    console.log("Sent date:", testDate);
    console.log("Returned date:", createResponse.data.data.fechaEvento);

    if (createResponse.data.data.fechaEvento === testDate) {
      console.log("🎉 SUCCESS: Date returned exactly as sent!");
    } else {
      console.log("❌ FAILURE: Date was modified");
    }

    // Get events to verify
    const getResponse = await axios.get(
      "http://localhost:3001/api/v1/eventos/",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const event = getResponse.data.data.find(
      (e) => e.nombreEvento === "Test Date Fix"
    );
    if (event) {
      console.log("GET returned date:", event.fechaEvento);
      if (event.fechaEvento === testDate) {
        console.log("🎉 SUCCESS: GET also returns correct date!");
      } else {
        console.log("❌ FAILURE: GET returned wrong date");
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

testDateFix();
