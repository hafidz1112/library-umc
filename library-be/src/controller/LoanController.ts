import { type Request, type Response } from "express";
import { LoanService } from "../service/loan.service";

const loanService = new LoanService();

export class LoanController {
  // 1. Request Loan
  async createRequest(req: Request, res: Response) {
    try {
      const { itemId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const memberId = await loanService.getMemberIdByUserId(userId);
      if (!memberId) {
        res.status(400).json({
          message:
            "Member profile not found. Please complete your profile first.",
        });
        return;
      }

      if (!itemId) {
        res.status(400).json({ message: "Item ID is required" });
        return;
      }

      const result = await loanService.requestLoan(memberId, itemId);
      res.status(200).json(result);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("[LoanController] Error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // 2. Verify Token
  async verifyToken(req: Request, res: Response) {
    try {
      const { token } = req.params as { token: string };

      if (!token) {
        res.status(400).json({ message: "Token is required" });
        return;
      }

      const result = await loanService.verifyToken(token);
      res.status(200).json(result);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("[LoanController] Error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // 3. Approve Loan
  async approveLoan(req: Request, res: Response) {
    try {
      const user = req.user;

      if (!user || (user.role !== "super_admin" && user.role !== "staff")) {
        res.status(403).json({ message: "Unauthorized - Admin/Staff only" });
        return;
      }

      const { requestId } = req.params as { requestId: string };

      const result = await loanService.approveLoan(requestId, user.id);
      res.status(200).json(result);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("[LoanController] Error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // 4. Reject Loan
  async rejectLoan(req: Request, res: Response) {
    try {
      const user = req.user;

      if (!user || (user.role !== "super_admin" && user.role !== "staff")) {
        res.status(403).json({ message: "Unauthorized - Admin/Staff only" });
        return;
      }

      const { requestId } = req.params as { requestId: string };

      const result = await loanService.rejectLoan(requestId, user.id);
      res.status(200).json(result);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("[LoanController] Error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // 4.5 Return Loan (NEW)
  async returnLoan(req: Request, res: Response) {
    try {
      const user = req.user;

      if (!user || (user.role !== "super_admin" && user.role !== "staff")) {
        res.status(403).json({ message: "Unauthorized - Admin/Staff only" });
        return;
      }

      const { loanId } = req.params as { loanId: string };

      const result = await loanService.returnLoan(loanId, user.id);
      res.status(200).json(result);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("[LoanController] Error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // 5. Get My Loans (Member)
  async getMyLoans(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const memberId = await loanService.getMemberIdByUserId(userId);
      if (!memberId) {
        res.status(400).json({ message: "Member profile not found" });
        return;
      }

      const result = await loanService.getAllLoans({
        memberId,
        limit: 100,
      });

      res.status(200).json(result);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("[LoanController] Error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // 6. Get All Loans (Admin)
  async getAllLoans(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user || (user.role !== "super_admin" && user.role !== "staff")) {
        res.status(403).json({ message: "Unauthorized" });
        return;
      }

      const { status, memberId } = req.query;

      const result = await loanService.getAllLoans({
        status: status as any,
        memberId: memberId as string,
        limit: 100,
      });

      res.status(200).json(result);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("[LoanController] Error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
