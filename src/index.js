import { load as loadYaml } from "js-yaml";
import "./index.css";
import { renderCv } from "./library";

const rootElement = typeof document !== "undefined" ? document.getElementById("root") : null;

const getDataUrl = () => {
  const rawBase = (import.meta.env && import.meta.env.BASE_URL) || "/";
  const trimmed = rawBase.trim();
  if (!trimmed || trimmed === "/") {
    return "/cv_data.yml";
  }
  return trimmed.endsWith("/") ? `${trimmed}cv_data.yml` : `${trimmed}/cv_data.yml`;
};

const setStatus = (message) => {
  if (!rootElement) {
    return null;
  }
  rootElement.innerHTML = "";
  const status = document.createElement("div");
  status.className = "cv-loading";
  status.setAttribute("role", "status");
  status.textContent = message;
  rootElement.appendChild(status);
  return status;
};

const showError = (error) => {
  if (!rootElement) {
    return;
  }
  rootElement.innerHTML = "";
  const wrapper = document.createElement("div");
  wrapper.className = "cv-error";
  wrapper.setAttribute("role", "alert");

  const heading = document.createElement("h2");
  heading.textContent = "Unable to load CV data";
  wrapper.appendChild(heading);

  const details = document.createElement("p");
  details.className = "cv-error-message";
  details.textContent = error?.message || "Unknown error";
  wrapper.appendChild(details);

  rootElement.appendChild(wrapper);
};

const bootstrap = async () => {
  if (!rootElement) {
    return;
  }

  setStatus("Loading CV...");

  try {
    const response = await fetch(getDataUrl());
    if (!response.ok) {
      throw new Error(`Failed to load CV data (status ${response.status})`);
    }
    const yamlText = await response.text();
    const data = loadYaml(yamlText);

    rootElement.innerHTML = "";
    renderCv(rootElement, data);
  } catch (error) {
    console.error("Failed to load CV data:", error);
    showError(error);
  }
};

if (typeof window !== "undefined") {
  bootstrap();
}
