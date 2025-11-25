import { useEffect } from "react";
import { load as loadYaml } from "js-yaml";
import { renderCv } from "easycv";
import "easycv/easycv.css";
import "./customize_easycv.css";

export default function App({ mountNode }) {
  useEffect(() => {
    let cancelled = false;
    const target = mountNode || document.getElementById("cv-root");

    const setStatus = (message, isError = false) => {
      if (!target) return;
      target.innerHTML = "";
      const paragraph = document.createElement("p");
      paragraph.textContent = message;
      if (isError) {
        paragraph.style.color = "#b91c1c";
      }
      target.appendChild(paragraph);
      target.setAttribute("aria-live", "polite");
      target.setAttribute("aria-busy", isError ? "false" : "true");
    };

    const mountCv = async () => {
      if (!target) return;
      setStatus("Loading cv_data.yml...");

      const cvDataUrl = new URL(`${import.meta.env.BASE_URL}cv_data.yml`, window.location.href);
      const response = await fetch(cvDataUrl.toString(), { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`Failed to load cv_data.yml (status ${response.status})`);
      }

      const yamlText = await response.text();
      const data = loadYaml(yamlText);

      if (cancelled || !target) {
        return;
      }

      target.innerHTML = "";
      renderCv(target, data, {
        titleTemplate: "%s - EasyCV (React)",
        actions: true,
      });
      target.setAttribute("aria-busy", "false");
    };

    mountCv().catch((error) => {
      console.error("Failed to render CV", error);
      setStatus("Unable to load CV data. Check the console for details.", true);
    });

    return () => {
      cancelled = true;
    };
  }, [mountNode]);

  return null;
}
