import { useEffect, useState } from "react";
import { load as loadYaml } from "js-yaml";
import Cv from "./components/Cv";
import "./App.css";

function App() {
  const publicUrl = process.env.PUBLIC_URL || "";
  const dataUrl = `${publicUrl}/cv_data.yml`;
  const [cvData, setCvData] = useState(null);

  useEffect(() => {
    fetch(dataUrl)
      .then((response) => response.text())
      .then((yamlText) => setCvData(loadYaml(yamlText)))
      .catch((err) => console.error("Failed to load CV data:", err));
  }, [dataUrl]);

  if (!cvData) {
    return null;
  }

  return <Cv data={cvData} />;
}

export default App;
