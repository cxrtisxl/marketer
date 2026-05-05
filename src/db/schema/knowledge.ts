import { pgSchema } from "drizzle-orm/pg-core";

const knowledge = pgSchema("knowledge");
export const platforms = knowledge.enum("platforms", ["x", "facebook", "instagram", "google"]);

export const ads = knowledge.table("ads", (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    created: t.timestamp().notNull().defaultNow(),
    source_campaign_id: t.uuid(),
    platform: platforms().notNull(),
    audience_region: t.varchar({length: 10}),
    audience_age_min: t.numeric(),
    audience_age_max: t.numeric(),
    content: t.text().notNull(),
    embedding: t.vector({dimensions: 2048}).notNull(),
}));