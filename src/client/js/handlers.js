import {
  createTripCard,
  resetForm,
  createTripData,
  handleError,
  mirrorToLocalStorage,
  displayNoTripsMessage
} from "./lib";
import { form } from "./elements";
import { areCoordinatesSet } from "./lib";

// Handle form submission for creating a new trip
export async function handleSubmit(event) {
  event.preventDefault();
  const destinationName = form.querySelector("#destination").value.trim();
  const startDate = form.querySelector("#departure-date").value;
  const latitude = parseFloat(form.querySelector("#latitude").value);
  const longitude = parseFloat(form.querySelector("#longitude").value);
  
  console.log("Form submission data:", { destinationName, startDate, latitude, longitude });
  
  if (!destinationName || !startDate) {
    handleError(new Error("Please fill in all fields."));
    return;
  }
  
  if (!areCoordinatesSet()) {
    handleError(new Error("Please select a location on the map."));
    return;
  }
  
  try {
    const trip = await createTripData(destinationName, startDate, latitude, longitude);
    console.log("Created trip:", trip);
    createTripCard(trip);
    resetForm(form);
  } catch (error) {
    console.error("Error creating trip:", error);
    handleError(error);
  }
}

// Remove a trip from the UI and update localStorage
// Function to remove a trip from the list
export function removeTrip(e, items) {
  console.log("DELETING ITEM with ID: ", parseInt(e.target.value)); // Log the ID of the trip being removed
  if (!e.target.matches(".js-remove-button")) return; // Ensure the clicked target is a remove button
  
  const tripCard = e.target.closest(".trip-card"); // Get the closest trip card element
  tripCard.remove(); // Remove the trip card from the DOM
  console.log(items.length); // Log the current number of trips for debugging

  // Find the index of the trip to be removed based on its ID
  const index = items.findIndex((trip) => {
    return trip.id === parseInt(e.target.value);
  });

  if (index !== -1) {
    items.splice(index, 1); // Remove the trip from the items array
    console.log(items.length); // Log the updated number of trips for debugging
    mirrorToLocalStorage(items); // Update localStorage with the new list of trips

    // Check if the items array is empty and show the no trips message if it is
    if (items.length === 0) {
      displayNoTripsMessage(); // Show the "No Trips" message
    }
  }
}

