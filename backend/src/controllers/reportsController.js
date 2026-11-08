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

const getMonthToDateReport = async (req, res) => {
  try {
    // Get the first day of the current month
    const dateResult = await pool.query(
      `SELECT
                DATE_TRUNC('month', CURRENT_DATE)::date AS start_date,
                CURRENT_DATE AS end_date`,
    );

    const { start_date, end_date } = dateResult.rows[0];

    // Retrieve monthly statistics
    const statsResult = await pool.query(
      `SELECT
                COUNT(*) AS total_readings,
                MAX(glucose_value) AS highest,
                MIN(glucose_value) AS lowest,
                ROUND(AVG(glucose_value), 1) AS average
             FROM glucose_readings
             WHERE user_id = $1
               AND reading_date BETWEEN $2 AND $3`,
      [req.user.id, start_date, end_date],
    );

    // Retrieve individual readings
    const readingsResult = await pool.query(
      `SELECT id, reading_date, slot, glucose_value
             FROM glucose_readings
             WHERE user_id = $1
               AND reading_date BETWEEN $2 AND $3
             ORDER BY reading_date DESC,
                CASE slot
                    WHEN 'morning_fasting' THEN 1
                    WHEN 'after_breakfast' THEN 2
                    WHEN 'after_lunch' THEN 3
                    WHEN 'after_dinner' THEN 4
                END`,
      [req.user.id, start_date, end_date],
    );

    const stats = statsResult.rows[0];

    return res.status(200).json({
      success: true,
      period: {
        startDate: start_date,
        endDate: end_date,
      },
      summary: {
        totalReadings: Number(stats.total_readings),
        highest: stats.highest === null ? null : Number(stats.highest),
        lowest: stats.lowest === null ? null : Number(stats.lowest),
        average: stats.average === null ? null : Number(stats.average),
      },
      readings: readingsResult.rows,
    });
  } catch (error) {
    console.error("Month-to-date report error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const getPreviousMonthReport = async (req, res) => {
  try {
    // Calculate the first and last days of the previous month
    const dateResult = await pool.query(
      `SELECT
                (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month')::date AS start_date,
                (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day')::date AS end_date`,
    );

    const { start_date, end_date } = dateResult.rows[0];

    // Retrieve previous month's statistics
    const statsResult = await pool.query(
      `SELECT
                COUNT(*) AS total_readings,
                MAX(glucose_value) AS highest,
                MIN(glucose_value) AS lowest,
                ROUND(AVG(glucose_value), 1) AS average
             FROM glucose_readings
             WHERE user_id = $1
               AND reading_date BETWEEN $2 AND $3`,
      [req.user.id, start_date, end_date],
    );

    // Retrieve individual readings
    const readingsResult = await pool.query(
      `SELECT id, reading_date, slot, glucose_value
             FROM glucose_readings
             WHERE user_id = $1
               AND reading_date BETWEEN $2 AND $3
             ORDER BY reading_date DESC,
                CASE slot
                    WHEN 'morning_fasting' THEN 1
                    WHEN 'after_breakfast' THEN 2
                    WHEN 'after_lunch' THEN 3
                    WHEN 'after_dinner' THEN 4
                END`,
      [req.user.id, start_date, end_date],
    );

    const stats = statsResult.rows[0];

    return res.status(200).json({
      success: true,
      period: {
        startDate: start_date,
        endDate: end_date,
      },
      summary: {
        totalReadings: Number(stats.total_readings),
        highest: stats.highest === null ? null : Number(stats.highest),
        lowest: stats.lowest === null ? null : Number(stats.lowest),
        average: stats.average === null ? null : Number(stats.average),
      },
      readings: readingsResult.rows,
    });
  } catch (error) {
    console.error("Previous month report error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = {
  getDailyReport,
  getMonthToDateReport,
  getPreviousMonthReport,
};
