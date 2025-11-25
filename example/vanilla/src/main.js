import { renderCv } from "easycv";
import { load as loadYaml } from "js-yaml";
import "easycv/easycv.css";
import "./customize_easycv.css";

const mount = document.getElementById("cv-root");

function setStatus(message, isError = false) {
  if (!mount) return;
  mount.textContent = "";
  const paragraph = document.createElement("p");
  paragraph.textContent = message;
  if (isError) {
    paragraph.style.color = "#b91c1c";
  }
  mount.appendChild(paragraph);
}

async function mountCv() {
  if (!mount) {
    return;
  }

  setStatus("Loading cv_data.yml...");
  const cvDataUrl = new URL(`${import.meta.env.BASE_URL}cv_data.yml`, window.location.href);
  const response = await fetch(cvDataUrl.toString(), { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Failed to load cv_data.yml (status ${response.status})`);
  }

  const yamlText = await response.text();
  const data = loadYaml(yamlText);

  mount.innerHTML = "";
  renderCv(mount, data, {
    titleTemplate: "%s - EasyCV (Vanilla)",
    actions: true,
  });
}

mountCv().catch((error) => {
  console.error("Unable to render CV", error);
  setStatus("Unable to load cv_data.yml. Open the console for details.", true);
});
