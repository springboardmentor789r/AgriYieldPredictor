import React from "react";

const ForecastTable = ({ forecast }) => {
  return (
    <table style={{ borderCollapse: "collapse", width: "100%", marginTop: "20px" }}>
      <thead>
        <tr>
          <th style={{ border: "1px solid #ccc", padding: "8px" }}>Date</th>
          <th style={{ border: "1px solid #ccc", padding: "8px" }}>Predicted Yield</th>
          <th style={{ border: "1px solid #ccc", padding: "8px" }}>Lower CI</th>
          <th style={{ border: "1px solid #ccc", padding: "8px" }}>Upper CI</th>
        </tr>
      </thead>
      <tbody>
        {forecast.map((day) => (
          <tr key={day.Date}>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{day.Date}</td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
              {day.Predicted_Yield.toFixed(2)}
            </td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
              {day.Lower_CI.toFixed(2)}
            </td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>
              {day.Upper_CI.toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ForecastTable;
