import { useState } from "react";
import { getDailyReport } from "../services/api";

function DailyReport() {
  const [selectedDate, setSelectedDate] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateReport = async () => {
    if (!selectedDate) {
      setError("Please select a date.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setReport(null);

      const response = await getDailyReport(selectedDate);

      setReport(response);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="report-title">Daily Report</h3>

      <div className="report-summary">
        <label htmlFor="reportDate">Select Date</label>

        <input
          id="reportDate"
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          required
        />
      </div>

      <button type="button" onClick={handleGenerateReport} disabled={loading}>
        {loading ? "Generating..." : "Generate Report"}
      </button>
      {loading && <p>Generating report...</p>}

      {error && <p className="form-error">{error}</p>}

      {report && (
        <div className="report-summary">
          <h3>Report Summary</h3>

          <p>Total Readings: {report.summary.totalReadings}</p>
          <p>Highest: {report.summary.highest ?? "N/A"} mg/dL</p>
          <p>Lowest: {report.summary.lowest ?? "N/A"} mg/dL</p>
          <p>Average: {report.summary.average ?? "N/A"} mg/dL</p>
        </div>
      )}

      {report && report.readings.length === 0 && (
        <p>No readings found for this date.</p>
      )}

      {report && report.readings.length > 0 && (
        <div className="report-summary">
          <h3>Individual Readings</h3>

          {report.readings.map((reading) => (
            <div key={reading.id}>
              <p>Slot: {reading.slot}</p>
              <p>Glucose: {reading.glucose_value} mg/dL</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DailyReport;
