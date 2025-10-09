import CropForm from "./CropForm";
import Forecast7Days from "./Forecast";

function App() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ textAlign: "center" }}>Crop Yield Prediction</h1>
      <CropForm />
      <Forecast7Days />
    </div>
  );
}

export default App;
