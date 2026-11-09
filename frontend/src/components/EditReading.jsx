import { useState } from "react";
import { updateReading } from "../services/api";

function EditReading({ reading, onReadingUpdated }) {
  const [readingDate, setReadingDate] = useState(reading.reading_date);
  const [slot, setSlot] = useState(reading.slot);
  const [glucoseValue, setGlucoseValue] = useState(
    String(reading.glucose_value),
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    const numericValue = Number(glucoseValue);

    if (
      !Number.isInteger(numericValue) ||
      numericValue < 40 ||
      numericValue > 600
    ) {
      setError("Glucose value must be a whole number between 40 and 600.");
      setLoading(false);
      return;
    }

    if (
      new Date(`${readingDate}T00:00:00`) > new Date(new Date().toDateString())
    ) {
      setError("Reading date cannot be in the future.");
      setLoading(false);
      return;
    }

    try {
      await updateReading(reading.id, {
        readingDate,
        slot,
        glucoseValue: numericValue,
      });

      onReadingUpdated();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <h2>Edit Glucose Reading</h2>
      {error && <p className="form-error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="editReadingDate">Reading Date</label>
          <input
            id="editReadingDate"
            type="date"
            value={readingDate}
            onChange={(event) => setReadingDate(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="editSlot">Reading Slot</label>
          <select
            id="editSlot"
            value={slot}
            onChange={(event) => setSlot(event.target.value)}
            required
          >
            <option value="">Select a slot</option>
            <option value="morning_fasting">Morning fasting</option>
            <option value="after_breakfast">After breakfast</option>
            <option value="after_lunch">After lunch</option>
            <option value="after_dinner">After dinner</option>
          </select>
        </div>

        <div>
          <label htmlFor="editGlucoseValue">Glucose Value (mg/dL)</label>
          <input
            id="editGlucoseValue"
            type="number"
            value={glucoseValue}
            onChange={(event) => setGlucoseValue(event.target.value)}
            min="40"
            max="600"
            step="1"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Saving Changes..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

export default EditReading;
