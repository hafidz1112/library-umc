import { type Request, type Response } from "express";
import { AuthService } from "../service/auth.service";
import {
  loginSchema,
  registerSchema,
  loginCredentialSchema,
} from "../validation";
import { UserService } from "../service/user.service";

const authService = new AuthService();

export class AuthController {
  /**
   * Register Controller - Register user with name, email, password
   */
  async register(req: Request, res: Response) {
    try {
      const validation = registerSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation Error",
          data: validation.error.flatten(),
        });
        return;
      }

      const { name, email, password } = validation.data;

      const result = await authService.registerWithCredentials(
        name,
        email,
        password,
      );

      if (!result.success) {
        res.status(409).json(result);
        return;
      }

      res.status(201).json(result);
    } catch (error) {
      console.error("[AuthController] Error in register:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        data: null,
      });
    }
  }

  /**
   * Login Controller - Login with email & password
   */
  async loginCredential(req: Request, res: Response) {
    try {
      const validation = loginCredentialSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation Error",
          data: validation.error.flatten(),
        });
        return;
      }

      const { email, password } = validation.data;

      const result = await authService.loginWithCredentials(email, password);

      if (!result.success) {
        res.status(401).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("[AuthController] Error in loginCredential:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        data: null,
      });
    }
  }

  /**
   * Login Controller - Verify user with Campus API (Google OAuth callback)
   */
  async login(req: Request, res: Response) {
    try {
      const validation = loginSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation Error",
          data: validation.error.flatten(),
        });
        return;
      }

      const { email } = validation.data;

      const result = await authService.verifyWithCampus(email);

      if (!result.success) {
        res.status(401).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("[AuthController] Error in login:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        data: null,
      });
    }
  }

  /**
   * Get All Users (Admin Only)
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      // Session & Role check sudah ditangani oleh Middleware
      const result = await UserService.getAllUsers();

      if (!result.success) {
        res.status(500).json({
          success: false,
          message: "Failed to get users",
          data: null,
        });
        return;
      }

      res.status(200).json(result);
    } catch (err) {
      console.error("[AuthController] Error getting all users:", err);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        data: null,
      });
    }
  }
}
