import { saveDatabase } from "../src/db/storage.js";

async function run() {
  await saveDatabase({
    squad: [],
    currentLineup: [],
    gameState: null,
    setPieceLayouts: []
  });
  console.log("Database reset successfully.");
}

run();
