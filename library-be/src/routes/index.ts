import { Router } from "express";
import { authRoutes } from "./auth.route";
import { memberRoutes } from "./member.route";
import { collectionRoutes } from "./collection.route";
import { categoryRoutes } from "./category.route";
import { guestRoutes } from "./guest.route";
import { loanRoutes } from "./loan.route";
import { itemRoutes } from "./item.route";

const router = Router();

// Auth & Users
router.use(authRoutes);

// Member
router.use(memberRoutes);

// Collections
router.use(collectionRoutes);

// Categories
router.use(categoryRoutes);

// Items (Physical Copies)
router.use(itemRoutes);

// Guests
router.use(guestRoutes);

// Loans
router.use(loanRoutes);

export const routes = router;
