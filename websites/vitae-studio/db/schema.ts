import { sql } from "drizzle-orm";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const resumes = sqliteTable(
  "resumes",
  {
    id: text("id").primaryKey(),
    ownerEmail: text("owner_email").notNull(),
    title: text("title").notNull().default("Untitled CV"),
    template: text("template").notNull().default("classic"),
    content: text("content").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("resumes_owner_updated_idx").on(table.ownerEmail, table.updatedAt)],
);
