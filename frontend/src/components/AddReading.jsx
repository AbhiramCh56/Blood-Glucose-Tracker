import { useState } from "react";
import { addReadings } from "../services/api";

function AddReading({ onReadingAdded }) {
  const [readingDate, setReadingDate] = useState("");
  const [slot, setSlot] = useState("");
  const [glucoseValue, setGlucoseValue] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    const numericValue = Number(glucoseValue);

    if (
      !Number.isInteger(numericValue) ||
      numericValue < 40 ||
      numericValue > 600
    ) {
      setError("Glucose value must be a whole number between 40 and 600.");
      return;
    }

    if (
      new Date(`${readingDate}T00:00:00`) > new Date(new Date().toDateString())
    ) {
      setError("Reading date cannot be in the future.");
      return;
    }
    setLoading(true);
    try {
      const response = await addReadings({
        readingDate,
        slot,
        glucoseValue: Number(glucoseValue),
      });
      setSuccess(response.message);
      onReadingAdded();

      setReadingDate("");
      setSlot("");
      setGlucoseValue("");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <h2>Add Glucose Reading</h2>
      {error && <p className="form-error">{error}</p>}

      {success && <p className="form-success">{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="readingDate">Reading Date</label>
          <input
            id="readingDate"
            type="text"
            value={readingDate}
            onChange={(event) => setReadingDate(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="slot">Reading Slot</label>
          <select
            id="slot"
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
          <label htmlFor="glucoseValue">Glucose Value (mg/dL)</label>
          <input
            id="glucoseValue"
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
          {loading ? "Adding Reading.." : "Add Reading"}
        </button>
      </form>
    </div>
  );
}

export default AddReading;
