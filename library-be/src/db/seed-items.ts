import { db } from "./index";
import { items, collections, locations } from "./schema";
import { eq } from "drizzle-orm";

async function seedItems() {
  console.log("🌱 Seeding Items...");

  try {
    // 1. Get Existing Collections (Books)
    const books = await db.query.collections.findMany({ limit: 5 });
    if (books.length === 0) {
      console.log(
        "❌ No collections found. Please seed collections first using 'bun run seed:collections' (or create manually).",
      );
      return;
    }

    // 2. Get Existing Locations (Racks)
    const racs = await db.query.locations.findMany({ limit: 5 });
    if (racs.length === 0) {
      console.log(
        "❌ No locations found. Please seed locations first. Creating a default location now...",
      );
      const [newLoc] = await db
        .insert(locations)
        .values({
          room: "Main Library",
          rack: "A1",
          shelf: "1",
        })
        .returning();
      racs.push(newLoc);
    }

    const itemsData = [
      {
        collectionId: books[0].id, // Book 1, Copy 1
        locationId: racs[0].id,
        barcode: "ITEM-001-001",
        uniqueCode: "BK1-CP1",
        status: "available" as const,
      },
      {
        collectionId: books[0].id, // Book 1, Copy 2
        locationId: racs[0].id,
        barcode: "ITEM-001-002",
        uniqueCode: "BK1-CP2",
        status: "loaned" as const, // Simulation: currently borrowed
      },
      {
        collectionId: books.length > 1 ? books[1].id : books[0].id, // Book 2, Copy 1
        locationId: racs.length > 1 ? racs[1].id : racs[0].id,
        barcode: "ITEM-002-001",
        uniqueCode: "BK2-CP1",
        status: "available" as const,
      },
      {
        collectionId: books.length > 1 ? books[1].id : books[0].id, // Book 2, Copy 2 (Damaged)
        locationId: racs[0].id,
        barcode: "ITEM-002-002",
        uniqueCode: "BK2-CP2",
        status: "damaged" as const,
      },
    ];

    for (const item of itemsData) {
      // Check duplicate barcode to avoid sizing errors on re-run
      const exists = await db.query.items.findFirst({
        where: eq(items.barcode, item.barcode),
      });

      if (!exists) {
        await db.insert(items).values(item);
        console.log(`✅ Created item: ${item.barcode}`);
      } else {
        console.log(`⚠️ Item ${item.barcode} already exists, skipping.`);
      }
    }

    console.log("✨ Items seeding completed!");
  } catch (err) {
    console.error("❌ Error seeding items:", err);
  }
}

seedItems()
  .then(() => process.exit(0))
  // eslint-disable-next-line n/handle-callback-err
  .catch((err) => process.exit(1));
