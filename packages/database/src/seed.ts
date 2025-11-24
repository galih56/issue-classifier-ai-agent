import "dotenv/config";
import { createDbClient } from "./client";
import * as schema from "./schema";
import { eq, and } from "drizzle-orm";

const collectionsData = [
  {
    "category": "Payroll",
    "subcategories": [
      "Salary deduction",
      "Overtime payment",
      "Bonus / incentive",
      "Payslip request",
      "Tax / BPJS"
    ]
  },
  {
    "category": "Attendance",
    "subcategories": [
      "Missing clock-in/out",
      "Leave approval",
      "Shift schedule",
      "Late attendance",
      "Correction request"
    ]
  },
  {
    "category": "Employment",
    "subcategories": [
      "Contract status",
      "Promotion / demotion",
      "Transfer request",
      "Resignation / termination",
      "Onboarding process"
    ]
  },
  {
    "category": "Benefits",
    "subcategories": [
      "Medical claim",
      "Insurance coverage",
      "Annual leave quota",
      "Training / course request",
      "Company facility"
    ]
  },
  {
    "category": "System Access",
    "description": "Covers all issues related to accessing and using internal HR systems or apps.",
    "subcategories": [
      {
        "name": "Email account issue",
        "description": "Problems with email setup, login, or company email credentials."
      },
      {
        "name": "HRIS login problem",
        "description": "User cannot log into GreatDay or HR system, forgot password, or sees login failure."
      },
      {
        "name": "Access permission request",
        "description": "Requesting access to a module, report, or feature not yet available to the user."
      },
      {
        "name": "Password reset",
        "description": "Reset or unlock password for system account."
      },
      {
        "name": "System error report",
        "description": "System shows an error message, crash, or numeric/technical error (e.g. NaN, 500, 404)."
      },
      {
        "name": "Application malfunction",
        "description": "Form or button not functioning correctly without showing explicit error."
      }
    ]
  },
  {
    "category": "General Inquiry",
    "subcategories": [
      "Policy clarification",
      "Document request",
      "Event participation",
      "Internal memo",
      "Feedback / suggestion"
    ]
  }
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const db = createDbClient(connectionString);

  console.log("🌱 Seeding database...");

  try {
    // 1. Create or get default workspace
    console.log("Checking workspace...");
    let workspaceId: string;
    const existingWorkspaces = await db.select().from(schema.workspaces).limit(1);
    
    if (existingWorkspaces.length > 0) {
      workspaceId = existingWorkspaces[0].id;
      console.log(`Using existing workspace: ${existingWorkspaces[0].name}`);
    } else {
      const [newWorkspace] = await db.insert(schema.workspaces).values({
        name: "Default Workspace",
        description: "Created by seeder",
      }).returning();
      workspaceId = newWorkspace.id;
      console.log(`Created new workspace: ${newWorkspace.name}`);
    }

    // 2. Create "HR Issues" collection
    console.log("Checking collection...");
    let collectionId: string;
    const existingCollections = await db.select().from(schema.collections)
      .where(eq(schema.collections.name, "HR Issues"))
      .limit(1);

    if (existingCollections.length > 0) {
      collectionId = existingCollections[0].id;
      console.log(`Using existing collection: ${existingCollections[0].name}`);
    } else {
      const [newCollection] = await db.insert(schema.collections).values({
        workspaceId,
        name: "HR Issues",
        description: "Standard HR issue categories",
      }).returning();
      collectionId = newCollection.id;
      console.log(`Created new collection: ${newCollection.name}`);
    }

    // 3. Insert Categories and Subcategories
    console.log("Seeding categories...");
    
    for (const catData of collectionsData) {
      // Check if category exists
      let categoryId: string;
      const existingCategory = await db.select().from(schema.collectionCategories)
        .where(and(
          eq(schema.collectionCategories.collectionId, collectionId),
          eq(schema.collectionCategories.name, catData.category)
        ))
        .limit(1);

      if (existingCategory.length > 0) {
        categoryId = existingCategory[0].id;
        // console.log(`Category exists: ${catData.category}`);
      } else {
        const [newCategory] = await db.insert(schema.collectionCategories).values({
          collectionId,
          name: catData.category,
          description: (catData as any).description,
          orderIndex: 0, 
        }).returning();
        categoryId = newCategory.id;
        console.log(`Created category: ${catData.category}`);
      }

      // Insert subcategories
      if (catData.subcategories) {
        for (const sub of catData.subcategories) {
          let subName: string;
          let subDesc: string | undefined;

          if (typeof sub === "string") {
            subName = sub;
          } else {
            subName = sub.name;
            subDesc = sub.description;
          }

          const existingSub = await db.select().from(schema.collectionCategories)
            .where(and(
              eq(schema.collectionCategories.collectionId, collectionId),
              eq(schema.collectionCategories.parentId, categoryId),
              eq(schema.collectionCategories.name, subName)
            ))
            .limit(1);

          if (existingSub.length === 0) {
             await db.insert(schema.collectionCategories).values({
              collectionId,
              name: subName,
              description: subDesc,
              parentId: categoryId,
              orderIndex: 0,
            });
            // console.log(`  - Added subcategory: ${subName}`);
          }
        }
      }
    }
    
    console.log("✅ Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

main();
