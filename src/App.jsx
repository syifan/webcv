import Cv from "./components/Cv";
import "./App.css";

function App() {
  const dataUrl = `${process.env.PUBLIC_URL || ""}/cv_data.yml`;
  return <Cv dataUrl={dataUrl} />;
}

export default App;
