import { db } from "../db";
import {
  collections,
  items,
  loans,
  members,
  Users,
  fines,
  guestLogs,
} from "../db/schema";
import { eq, sql, and, desc } from "drizzle-orm";

export class ReportService {
  /**
   * Get main dashboard statistics summary
   */
  async getDashboardStats() {
    try {
      // 1. Total Collections (Titles)
      const [totalCollections] = await db
        .select({ count: sql<number>`count(*)` })
        .from(collections);

      // 2. Total Physical Items (Copies)
      const [totalItems] = await db
        .select({ count: sql<number>`count(*)` })
        .from(items);

      // 3. Total Active Loans (approved/pending/extended)
      const [activeLoans] = await db
        .select({ count: sql<number>`count(*)` })
        .from(loans)
        .where(sql`${loans.status} IN ('approved', 'pending', 'extended')`);

      // 4. Total Overdue Loans
      const [overdueLoans] = await db
        .select({ count: sql<number>`count(*)` })
        .from(loans)
        .where(
          and(
            eq(loans.status, "approved"),
            sql`${loans.dueDate} < CURRENT_DATE`,
          ),
        );

      // 5. Total Active Members
      const [totalMembers] = await db
        .select({ count: sql<number>`count(*)` })
        .from(members);

      return {
        success: true,
        data: {
          totalCollections: Number(totalCollections.count),
          totalItems: Number(totalItems.count),
          activeLoans: Number(activeLoans.count),
          overdueLoans: Number(overdueLoans.count),
          totalMembers: Number(totalMembers.count),
        },
      };
    } catch (error) {
      console.error("[ReportService] Error getting dashboard stats:", error);
      throw error;
    }
  }

  /**
   * Get top most borrowed books
   */
  async getPopularBooks(limit = 5) {
    try {
      const result = await db
        .select({
          id: collections.id,
          title: collections.title,
          author: collections.author,
          image: collections.image,
          loanCount: sql<number>`count(${loans.id})`,
        })
        .from(collections)
        .innerJoin(items, eq(items.collectionId, collections.id))
        .innerJoin(loans, eq(loans.itemId, items.id))
        .groupBy(collections.id)
        .orderBy(desc(sql`count(${loans.id})`))
        .limit(limit);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error("[ReportService] Error getting popular books:", error);
      throw error;
    }
  }

  /**
   * Get guest visit statistics for the last 7 days
   */
  async getGuestStats() {
    try {
      const result = await db
        .select({
          date: sql<string>`DATE(${guestLogs.visitDate})`,
          count: sql<number>`count(*)`,
        })
        .from(guestLogs)
        .where(sql`${guestLogs.visitDate} >= CURRENT_DATE - INTERVAL '7 days'`)
        .groupBy(sql`DATE(${guestLogs.visitDate})`)
        .orderBy(sql`DATE(${guestLogs.visitDate})`);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error("[ReportService] Error getting guest stats:", error);
      throw error;
    }
  }
}
