import { OpenRouter } from "@openrouter/sdk";
import { db } from "../services/db";
import { knowledge } from "../services/db";
import { asc, cosineDistance, sql } from "drizzle-orm";

export async function run() {
  const client = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  const original = "What are the rules we should follow?";
  const response = await client.embeddings.generate({
    requestBody: {
      model: "nvidia/llama-nemotron-embed-vl-1b-v2:free",
      input: original,
    },
  });

  if (typeof response === "string") {
    console.log(response);
  } else if (response.data && response.data[0]?.embedding && typeof response.data[0].embedding !== "string") {
    console.log("Len:", response.data[0]?.embedding.length);

    const distance = cosineDistance(knowledge.ads.embedding, response.data[0].embedding);
    const results = await db
      .select({
        original: knowledge.ads.content,
        distance: sql<number>`${distance}`
      })
      .from(knowledge.ads)
      .orderBy(asc(distance))
      .limit(5);

    console.log(results);

    // await db.insert(discoveriesTable).values({
    //   embedding: response.data[0]?.embedding,
    //   original: original,
    // })
  }

}
