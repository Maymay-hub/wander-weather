import { wait } from "./helpers";
import { loader } from "./elements";
import { postData } from "./postData";
import { trips } from "./initialize";

import DOMPurify from "dompurify";

// Function to calculate how many days away a trip is based on the current date
export function checkHowLongAway(dateInputValue) {
  const today = new Date();
  const startDate = new Date(dateInputValue);
  const days = Math.ceil(
    (startDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
  );
  if (days < 0) {
    alert("Your departure date cannot be in the past!"); // Alert if the selected date is in the past
  }
  return days;
}

// Function to create trip data, post it to the server, and store it locally
export const createTripData = async (destinationName, startDate) => {
  const daysUntilTrip = checkHowLongAway(startDate); // Calculate days until the trip
  const retrievedTripData = await postData("http://localhost:3000/addtrip", {
    location: encodeURIComponent(destinationName),
    startDate: startDate,
    daysUntilTrip: daysUntilTrip,
  });

  // Create trip object with data from API response
  const trip = {
    destinationName,
    startDate,
    daysUntilTrip,
    id: Date.now(), // Generate a unique ID based on the current time
    country: retrievedTripData.country,
    destinationImageUrl: retrievedTripData.destinationImageUrl,
    weatherInfo: {
      temperature: retrievedTripData.weatherInfo.temperature,
      description: retrievedTripData.weatherInfo.description,
      icon_code: retrievedTripData.weatherInfo.icon_code,
    },
  };

  trips.push(trip); // Add trip to trips array
  mirrorToLocalStorage(trips); // Save updated trips to localStorage
  return trip;
};

// Handle and display errors to the user
export function handleError(error) {
  alert(
    "There was an error processing this request. Please make sure your inputs are correct.",
    error
  );
  console.log("error", error);
}

// Reset form and hide loader after trip creation
export async function resetForm(formToReset) {
  await wait();
  hideLoader(); // Hide the loader when the form is reset
  formToReset.reset(); // Clear form inputs
}

// Show the loader when a trip is being created
export function showLoader() {
  loader.classList.remove("hidden");
}

// Hide the loader after trip creation is complete
export function hideLoader() {
  loader.classList.add("hidden");
}

// Create a trip card in the DOM with sanitized trip data
export async function createTripCard(tripData) {
  const upcomingTripDisplay = document.querySelector(".js-trips");

  // Check if there is an existing "No Trips" message and remove it
  const noTripsMessage = document.querySelector(".no-trips-message");
  if (noTripsMessage) {
    upcomingTripDisplay.removeChild(noTripsMessage);
  }

  console.log("Trip Data:", tripData);
  
  // Create the trip card HTML with trip details
  const tripHtml = `
	<div class="trip-card">
		<img class="js-destination-image" src="${tripData.destinationImageUrl}" alt="destination photo">
		<div class="trip-details">
			<h2 class="heading2">Upcoming trip to <span class="js-location-display">${tripData.destinationName}, ${tripData.country}</span></h2>
			<p class="leave-date">Departure: <span class="js-dep-date-display">${tripData.startDate}</span></p>
			<p class="departure-countdown js-departure-countdown">${tripData.daysUntilTrip} days left until your trip to ${tripData.destinationName}!</p>
			<p class="subheading">Weather forecast for the time of your stay:</p>
      <img src="https://www.weatherbit.io/static/img/icons/${tripData.weatherInfo.icon_code}.png" alt="${tripData.weatherInfo.description}" />
			<p class="js-weather-display">${tripData.weatherInfo.description} and ${tripData.weatherInfo.temperature} degrees</p>
			<button class="button button--secondary js-remove-button" value="${tripData.id}">Remove trip</button>
		</div>
	</div>
	`;

  // Sanitize the HTML to prevent XSS attacks
  const sanitizedTripHtml = DOMPurify.sanitize(tripHtml);
  const htmlFragment = document
    .createRange()
    .createContextualFragment(sanitizedTripHtml);

  upcomingTripDisplay.appendChild(htmlFragment);
}

// Save the trips array to localStorage
export function mirrorToLocalStorage(items) {
  localStorage.setItem("items", JSON.stringify(items));
}

// Restore trips from localStorage and display them in the UI
export function restoreFromLocalStorage(items) {
  console.info("Restoring from LS");
  const existingItems = JSON.parse(localStorage.getItem("items"));
  if (existingItems && existingItems.length) {
    items.push(...existingItems); // Add the stored trips to the trips array
    items.map((item) => createTripCard(item)); // Create trip cards for each restored trip
  } else {
    displayNoTripsMessage(); // Show the no trips message if no trips are present
  }
}

export function displayNoTripsMessage() {
  const upcomingTripDisplay = document.querySelector(".js-trips");
  
  // Create the no trips message element
  const noTripsMessage = document.createElement("div");
  noTripsMessage.classList.add("no-trips-message");
  noTripsMessage.innerHTML = `
    <p>No trips added yet. Start planning your next adventure!</p>
  `;

  // Append the message to the trips display section
  upcomingTripDisplay.appendChild(noTripsMessage);
}

// Function to initialize the map with OpenStreetMap and Leaflet
