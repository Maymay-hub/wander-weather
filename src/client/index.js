import "./styles/reset.scss";
import "./styles/loader.scss";
import "./styles/base.scss";
import "./styles/trip-creator.scss";
import "./styles/trips.scss";
import "./styles/nav.scss"

import { initializeApp } from "./js/initialize";

window.addEventListener("load", initializeApp);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}
