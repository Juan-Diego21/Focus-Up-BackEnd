// Test script to check date handling
const dateInput = "2025-11-21";

// Test 1: Direct Date constructor
console.log("=== Test 1: Direct Date constructor ===");
const date1 = new Date(dateInput);
console.log("Input:", dateInput);
console.log("Date object:", date1);
console.log("toISOString():", date1.toISOString());
console.log("toString():", date1.toString());
console.log("toLocaleString():", date1.toLocaleString());

// Test 2: Manual parsing with UTC
console.log("\n=== Test 2: Manual parsing with UTC ===");
const [year, month, day] = dateInput.split("-").map(Number);
const date2 = new Date(Date.UTC(year, month - 1, day));
console.log("Input:", dateInput);
console.log("Parsed year:", year, "month:", month, "day:", day);
console.log("Date object:", date2);
console.log("toISOString():", date2.toISOString());
console.log("toString():", date2.toString());
console.log("toLocaleString():", date2.toLocaleString());

// Test 3: What happens when we store and retrieve from DB
console.log("\n=== Test 3: Simulating DB storage/retrieval ===");
const dbStored = date2.toISOString().split("T")[0]; // DATE type stores as YYYY-MM-DD
console.log("What DB would store (DATE type):", dbStored);

// When retrieved, JavaScript recreates Date object
const retrievedDate = new Date(dbStored + "T00:00:00.000Z"); // Assume UTC midnight
console.log("Retrieved from DB:", retrievedDate);
console.log("Retrieved toISOString():", retrievedDate.toISOString());
console.log("Retrieved toString():", retrievedDate.toString());
console.log("Retrieved toLocaleString():", retrievedDate.toLocaleString());
