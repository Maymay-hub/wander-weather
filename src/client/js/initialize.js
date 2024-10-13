import { handleSubmit } from "./handlers";
import { form, upcomingTripDisplay } from "./elements";
import { removeTrip } from "./handlers";
import { restoreFromLocalStorage } from "./lib";

export const trips = [];

// Initialize the app by setting up event listeners and restoring data
export function initializeApp() {
  form.addEventListener("submit", handleSubmit); // Listen for form submission to handle trip creation
  upcomingTripDisplay.addEventListener("click", (e) => removeTrip(e, trips)); // Listen for trip removal
  restoreFromLocalStorage(trips); // Restore trips from localStorage on app load
}
