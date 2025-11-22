import { useEffect, useRef, useState } from "react";
import { load as loadYaml } from "js-yaml";
import { renderCv } from "easycv";
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
  const hostRef = useRef(null);
  const shadowRef = useRef(null);
  const mountRef = useRef(null);

  useEffect(() => {
    if (!hostRef.current) {
      return;
    }

    if (!shadowRef.current) {
      shadowRef.current = hostRef.current.attachShadow({ mode: "open" });
      const shared = document.createElement("link");
      shared.rel = "stylesheet";
      shared.href = "/shared.css";
      const easycvCss = document.createElement("link");
      easycvCss.rel = "stylesheet";
      easycvCss.href = new URL("easycv/dist/easycv.css", import.meta.url).href;
      mountRef.current = document.createElement("div");
      mountRef.current.id = "cv-mount";
      shadowRef.current.append(shared, easycvCss, mountRef.current);
    }

    const run = async () => {
      setStatus(STATUS.loading);
      setError(null);
      const response = await fetch("/cv_data.yml", { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`Failed to load cv_data.yml (status ${response.status})`);
      }
      const yamlText = await response.text();
      const data = loadYaml(yamlText);

      if (mountRef.current) {
        mountRef.current.innerHTML = "";
        renderCv(mountRef.current, data, {
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
          <p className="eyebrow">React</p>
          <h1>EasyCV with React</h1>
          <p className="lede">
            This Vite app fetches the shared <code>cv_data.yml</code>, parses it with{" "}
            <code>js-yaml</code>, and mounts EasyCV inside a component.
          </p>
        </header>

        <main className="layout">
          <section className="callout">
            <div className="callout-header">
              <strong>How it works</strong>
              <p>
                Fetch the shared YAML, parse with <code>js-yaml</code>, and pass the data to
                <code>renderCv</code>. Everything else (styles, actions) comes from EasyCV.
              </p>
            </div>
            <div className="steps">
              <div className="step">
                <span className="step-number">1</span>
                <p>Use the shared <code>public/cv_data.yml</code> as the single source of truth.</p>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <p>Start the dev server (<code>npm run dev</code>) and load the YAML via <code>fetch</code>.</p>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <p>Call <code>renderCv</code> inside your component; EasyCV handles layout + actions.</p>
              </div>
            </div>
          </section>

          <section className="cv-shell" aria-label="CV preview">
        {status === STATUS.loading && <p className="status">Loading cv_data.yml…</p>}
        {status === STATUS.error && (
          <p className="status error">Unable to load CV data. Check the console for details.</p>
        )}
        <div
          ref={hostRef}
          aria-live="polite"
          aria-busy={status === STATUS.loading}
          className="cv-host"
        ></div>
          </section>
        </main>
      </div>
    </div>
  );
}
