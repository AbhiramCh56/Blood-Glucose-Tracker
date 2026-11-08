const pool = require("../config/db");

const getDailyReport = async (req, res) => {
  try {
    // Get date from the URL query parameter
    const { date } = req.query;

    // Validate required date
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Report date is required.",
      });
    }

    // Validate date format
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Date must be in YYYY-MM-DD format.",
      });
    }

    // Validate that the date actually exists
    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid date.",
      });
    }

    // Retrieve daily statistics
    const statsResult = await pool.query(
      `SELECT
                COUNT(*) AS total_readings,
                MAX(glucose_value) AS highest,
                MIN(glucose_value) AS lowest,
                ROUND(AVG(glucose_value), 1) AS average
             FROM glucose_readings
             WHERE user_id = $1 AND reading_date = $2`,
      [req.user.id, date],
    );

    // Retrieve individual readings
    const readingsResult = await pool.query(
      `SELECT id, reading_date, slot, glucose_value
             FROM glucose_readings
             WHERE user_id = $1 AND reading_date = $2
             ORDER BY
                CASE slot
                    WHEN 'morning_fasting' THEN 1
                    WHEN 'after_breakfast' THEN 2
                    WHEN 'after_lunch' THEN 3
                    WHEN 'after_dinner' THEN 4
                END`,
      [req.user.id, date],
    );

    return res.status(200).json({
      success: true,
      date,
      summary: statsResult.rows[0],
      readings: readingsResult.rows,
    });
  } catch (error) {
    console.error("Daily report error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = {
  getDailyReport,
};
