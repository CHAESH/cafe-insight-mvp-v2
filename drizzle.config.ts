/**
 * Drizzle ORM Configuration
 * 
 * This file configures Drizzle ORM, a TypeScript ORM for SQL databases.
 * It defines how database migrations are generated and where schema definitions are located.
 */
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  // Output directory for generated SQL migrations
  out: "./sql/migrations",
  
  // Location of schema definition files - using core db schema
  schema: "./app/core/db/schema.ts",
  
  // Database dialect - using PostgreSQL
  dialect: "postgresql",
  
  // Database connection credentials - using environment variable for security
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
