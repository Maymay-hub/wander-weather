import "./styles/reset.scss"; // Import global reset styles
import "./styles/loader.scss"; // Import styles for the loader component
import "./styles/base.scss"; // Import base styles for general layout
import "./styles/trip-creator.scss"; // Import styles for the trip creator form
import "./styles/trips.scss"; // Import styles for the trips display section
import "./styles/nav.scss"; // Import styles for the navigation bar
import "./styles/noTripsMessage.scss"; // Import style for no trip message

import { initializeApp } from "./js/initialize"; // Import the function to initialize the app

// Initialize the app when the window finishes loading
window.addEventListener("load", initializeApp);

// Register a service worker for offline capabilities
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("SW registered: ", registration); // Log successful registration
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError); // Log registration failure
      });
  });
}
