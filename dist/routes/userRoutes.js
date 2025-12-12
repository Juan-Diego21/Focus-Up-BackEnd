"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = require("../controllers/UserController");
const SessionController_1 = require("../controllers/SessionController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const sessionController = new SessionController_1.SessionController();
router.get("/", auth_1.authenticateToken, UserController_1.userController.getProfile.bind(UserController_1.userController));
router.get("/:id", auth_1.authenticateToken, UserController_1.userController.getUserById.bind(UserController_1.userController));
router.get("/email/:email", auth_1.authenticateToken, UserController_1.userController.getUserByEmail.bind(UserController_1.userController));
router.post("/", (req, res) => {
    res.status(410).json({
        success: false,
        message: "This endpoint has been disabled. User registration now requires email verification. Use POST /api/v1/auth/register after verifying your email.",
        timestamp: new Date(),
    });
});
router.put("/:id", auth_1.authenticateToken, validation_1.validateUserUpdate, UserController_1.userController.updateUser.bind(UserController_1.userController));
router.patch("/:id/password", auth_1.authenticateToken, validation_1.validatePasswordChange, UserController_1.userController.changePassword.bind(UserController_1.userController));
router.post("/login", UserController_1.userController.login.bind(UserController_1.userController));
router.post("/logout", auth_1.authenticateToken, UserController_1.userController.logout.bind(UserController_1.userController));
router.delete("/:id", auth_1.authenticateToken, UserController_1.userController.deleteUser.bind(UserController_1.userController));
router.post('/request-password-reset', UserController_1.userController.requestPasswordReset.bind(UserController_1.userController));
router.post('/reset-password-with-code', UserController_1.userController.resetPasswordWithCode.bind(UserController_1.userController));
router.get('/:userId/sessions', auth_1.authenticateToken, sessionController.listUserSessions.bind(sessionController));
exports.default = router;
