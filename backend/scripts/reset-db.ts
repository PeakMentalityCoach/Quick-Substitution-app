import { saveDatabase } from "../src/db/storage.js";

async function reset() {
  console.log("🔄 Resetting local JSON database (db.json)…");

  await saveDatabase({
    squad: [],
    currentLineup: [],
    gameState: null,
    setPieceLayouts: [],
  });

  console.log("✅ Database reset complete!");
}

reset();
