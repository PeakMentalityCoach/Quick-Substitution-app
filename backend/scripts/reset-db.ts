import { saveDatabase } from '../src/db/storage.js';

async function resetDB() {
  console.log('🔄 Resetting database...');

  await saveDatabase({
    squad: [],
    currentLineup: [],
    gameState: null,
    setPieceLayouts: [],
  });

  console.log('✅ Database reset complete!');
}

resetDB().catch(err => {
  console.error('❌ Failed to reset database:', err);
  process.exit(1);
});
