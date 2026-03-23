"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const email_automation_1 = require("./email-automation");
void (0, email_automation_1.runEmailAutomationScript)().then((exitCode) => {
    process.exit(exitCode);
});
