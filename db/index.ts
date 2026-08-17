import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/sinergyhome";

// Disable connection pooling for serverless or single clients if desired, but default is perfectly fine
const client = postgres(connectionString, { max: 1 });
export const db = drizzle(client, { schema });
