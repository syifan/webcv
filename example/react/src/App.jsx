import { useEffect, useRef, useState } from "react";
import { load as loadYaml } from "js-yaml";
import { renderCv } from "easycv";
import "easycv/easycv.css";
import "./App.css";

const STATUS = {
  idle: "idle",
  loading: "loading",
  error: "error",
  ready: "ready",
};

export default function App() {
  const [status, setStatus] = useState(STATUS.idle);
  const [error, setError] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    const run = async () => {
      setStatus(STATUS.loading);
      setError(null);
      const cvDataUrl = new URL(`${import.meta.env.BASE_URL}cv_data.yml`, window.location.origin);
      const response = await fetch(cvDataUrl.toString(), { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`Failed to load cv_data.yml (status ${response.status})`);
      }
      const yamlText = await response.text();
      const data = loadYaml(yamlText);

      if (rootRef.current) {
        rootRef.current.innerHTML = "";
        renderCv(rootRef.current, data, {
          titleTemplate: "%s — EasyCV (React)",
          actions: true,
        });
      }
      setStatus(STATUS.ready);
    };

    run().catch((err) => {
      console.error("Failed to render CV", err);
      setError(err);
      setStatus(STATUS.error);
    });
  }, []);

  return (
    <div className="page">
      <div className="shell">
        <header className="hero">
          <h1>EasyCV with React</h1>
          <p className="lede">
            This Vite app fetches the shared <code>cv_data.yml</code>, parses it with{" "}
            <code>js-yaml</code>, and mounts EasyCV inside a component.
          </p>
        </header>

        <main className="layout">
          <section className="cv-shell" aria-label="CV preview">
            {status === STATUS.loading && <p className="status">Loading cv_data.yml…</p>}
            {status === STATUS.error && (
              <p className="status error">Unable to load CV data. Check the console for details.</p>
            )}
            <div ref={rootRef} aria-live="polite" aria-busy={status === STATUS.loading}></div>
          </section>
        </main>
      </div>
    </div>
  );
}
