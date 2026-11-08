const pool = require("../config/db");

const addReading = async (req, res) => {
  try {
    const { readingDate, slot, glucoseValue } = req.body || {};

    if (
      !readingDate ||
      !slot ||
      glucoseValue === undefined ||
      glucoseValue === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Date, slot and glucose values are required.",
      });
    }

    if (
      typeof readingDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(readingDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Date must be in YYYY-MM-DD format.",
      });
    }

    //validate date actually exists
    const parsedDate = new Date(`${readingDate}T00:00:00.000Z`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== readingDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid date",
      });
    }

    //validate reading slot
    const allowedSlots = [
      "morning_fasting",
      "after_breakfast",
      "after_lunch",
      "after_dinner",
    ];

    if (!allowedSlots.includes(slot)) {
      return res.status(400).json({
        success: false,
        message: " Invalid reading slot",
      });
    }

    //validate glucose calue
    if (
      !Number.isInteger(glucoseValue) ||
      glucoseValue < 40 ||
      glucoseValue > 600
    ) {
      return res.status(400).json({
        success: false,
        message: "Glucose value must be an integer between 40 and 600.",
      });
    }

    //check reading date is not in the future
    const dateCheck = await pool.query(
      "SELECT $1::date > CURRENT_DATE AS is_future",
      [readingDate],
    );

    if (dateCheck.rows[0].is_future) {
      return res.status(400).json({
        success: false,
        message: "Future dates are not allowed.",
      });
    }

    const result = await pool.query(
      `INSERT INTO glucose_readings
                (user_id, reading_date, slot, glucose_value)
             VALUES ($1, $2, $3, $4)
             RETURNING id, reading_date, slot, glucose_value`,
      [req.user.id, readingDate, slot, glucoseValue],
    );

    return res.status(201).json({
      success: true,
      message: "Glucose reading added successfully.",
      reading: result.rows[0],
    });
  } catch (error) {
    console.error("Add reading error:", error.message);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A reading already exists for this slot and date.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Interval server error.",
    });
  }
};

module.exports = {
  addReading,
};
