import { Router } from "express";
import { AuthController } from "../controller/AuthController";
import { isAuthenticated, requireRole } from "../middlewares/auth.middleware";
import { authLimiter } from "../middlewares/rateLimiter";

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * /auth/google-callback:
 *   post:
 *     summary: User Login
 *     description: Verify user login with Campus API Using Email.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@umc.ac.id"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Validation Error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */
router.post("/auth/google-callback", authLimiter, authController.login);

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Get All Users (Super Admin Only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super Admin only
 */
router.get(
  "/auth/users",
  isAuthenticated,
  requireRole(["super_admin"]),
  authController.getAllUsers,
);

export const authRoutes = router;
