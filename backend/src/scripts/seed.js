require("dotenv").config({
  path: require("path").join(__dirname, "../../.env"),
});

const bcrypt = require("bcrypt");
const pool = require("../config/db");

const DEMO_USER = {
  name: process.env.DEMO_USER_NAME || "Demo User",
  email: (process.env.DEMO_USER_EMAIL || "demo@sweety.app")
    .trim()
    .toLowerCase(),
  password: process.env.DEMO_USER_PASSWORD || "Demo1234",
};

const SEED_DAYS = Number.parseInt(process.env.SEED_DAYS || "30", 10);

const SLOTS = [
  { name: "morning_fasting", base: 92, variance: 12 },
  { name: "after_breakfast", base: 138, variance: 26 },
  { name: "after_lunch", base: 148, variance: 30 },
  { name: "after_dinner", base: 142, variance: 24 },
];

if (!Number.isInteger(SEED_DAYS) || SEED_DAYS < 1 || SEED_DAYS > 365) {
  console.error("SEED_DAYS must be a whole number between 1 and 365.");
  process.exit(1);
}

const formatDate = (date) => date.toISOString().slice(0, 10);

// Build deterministic sample readings so repeated seed runs produce the same data.
const buildReadings = (today, days) => {
  const readings = [];
  const endDate = new Date(`${today}T00:00:00.000Z`);

  for (let dayOffset = 0; dayOffset < days; dayOffset += 1) {
    const readingDate = new Date(endDate);
    readingDate.setUTCDate(endDate.getUTCDate() - dayOffset);

    SLOTS.forEach((slot, slotIndex) => {
      const wave = Math.round(
        Math.sin((dayOffset + slotIndex * 2) / 3) * slot.variance,
      );
      const dailyVariation = ((dayOffset + slotIndex * 3) % 7) - 3;
      const glucoseValue = Math.max(
        40,
        Math.min(600, slot.base + wave + dailyVariation),
      );

      readings.push({
        readingDate: formatDate(readingDate),
        slot: slot.name,
        glucoseValue,
      });
    });
  }

  return readings;
};

const seed = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const passwordHash = await bcrypt.hash(DEMO_USER.password, 10);

    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email)
       DO UPDATE SET name = EXCLUDED.name,
                     password_hash = EXCLUDED.password_hash
       RETURNING id`,
      [DEMO_USER.name, DEMO_USER.email, passwordHash],
    );

    const userId = userResult.rows[0].id;

    // Start from a clean slate so rerunning the seed does not hit duplicate keys.
    await client.query("DELETE FROM glucose_readings WHERE user_id = $1", [
      userId,
    ]);

    const dateResult = await client.query(
      "SELECT CURRENT_DATE::text AS today",
    );
    const readings = buildReadings(dateResult.rows[0].today, SEED_DAYS);

    for (const reading of readings) {
      await client.query(
        `INSERT INTO glucose_readings
           (user_id, reading_date, slot, glucose_value)
         VALUES ($1, $2, $3, $4)`,
        [userId, reading.readingDate, reading.slot, reading.glucoseValue],
      );
    }

    await client.query("COMMIT");

    console.log("Demo data seeded successfully.");
    console.log(`  Name:     ${DEMO_USER.name}`);
    console.log(`  Email:    ${DEMO_USER.email}`);
    console.log(`  Password: ${DEMO_USER.password}`);
    console.log(`  Readings: ${readings.length} across ${SEED_DAYS} days`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

seed()
  .catch((error) => {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
