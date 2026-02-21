import { type Request, type Response } from "express";
import { NotificationService } from "../service/notification.service";

const notificationService = new NotificationService();

export async function sendFinesNotification(req: Request, res: Response) {
  try {
    const { email, name, amount, bookTitle } = req.body;
    await notificationService.sendFinesNotification(
      email,
      name,
      amount,
      bookTitle,
    );
    res.status(200).json({ message: "Fine notification sent successfully" });
  } catch (error) {
    console.error(
      "[NotificationController] Failed to send fine notification:",
      error,
    );
    res.status(500).json({ message: "Failed to send fine notification" });
  }
}

export async function sendLoansNotification(req: Request, res: Response) {
  try {
    const { email, name, bookTitle, tanggalPengembalian } = req.body;

    await notificationService.sendLoansNotification(
      email,
      name,
      bookTitle,
      tanggalPengembalian,
    );

    res.status(200).json({ message: "Loan notification sent successfully" });
  } catch (error) {
    console.error(
      "[NotificationController] Failed to send loan notification:",
      error,
    );
    res.status(500).json({ message: "Failed to send loan notification" });
  }
}
