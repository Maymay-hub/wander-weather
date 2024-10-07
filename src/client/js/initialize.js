import { handleSubmit } from "./handlers";
import { form, upcomingTripDisplay } from "./elements";
import { removeTrip } from "./handlers";
import { restoreFromLocalStorage } from "./lib";

export const trips = [];

export function initializeApp() {
  form.addEventListener("submit", handleSubmit);
  upcomingTripDisplay.addEventListener("click", (e) => removeTrip(e, trips));
  restoreFromLocalStorage(trips);
}
