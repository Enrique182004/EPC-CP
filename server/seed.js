require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function seed() {
  console.log('[Seed] Creating default admin user...');
  const hash = await bcrypt.hash('Admin1234!', 12);

  try {
    db.prepare(`
      INSERT OR IGNORE INTO users (email, password_hash, role, name)
      VALUES ('admin@epc.local', ?, 'admin', 'System Administrator')
    `).run(hash);
    console.log('[Seed] Admin user created: admin@epc.local / Admin1234!');
    console.log('[Seed] IMPORTANT: Change this password after first login!');
  } catch (err) {
    console.error('[Seed] Error:', err.message);
  }
}

seed();
