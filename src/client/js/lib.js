import { wait } from "./helpers";
import { loader } from "./elements";
import { postData } from "./postData";
import { trips } from "./initialize";
import DOMPurify from "dompurify";

let map;
let marker;

export function initializeMap() {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) {
    console.error('Map container not found');
    return;
  }

  if (map) {
    map.remove();  // Remove existing map if it exists
  }
  
  map = L.map(mapContainer).setView([0, 0], 2); // Initialize with a world view

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  map.on("click", onMapClick);
  console.log('Map initialized and click event listener added');
}

function onMapClick(e) {
  let lat = e.latlng.lat;
  let lng = e.latlng.lng;

  // Normalize longitude to be within -180 to 180 degrees
  lng = ((lng + 180) % 360) - 180;

  if (marker) {
    map.removeLayer(marker);
  }
  marker = L.marker([lat, lng]).addTo(map);
  
  // Update the form with the selected coordinates
  const latitudeInput = document.getElementById("latitude");
  const longitudeInput = document.getElementById("longitude");
  
  if (latitudeInput && longitudeInput) {
    latitudeInput.value = lat.toFixed(6);
    longitudeInput.value = lng.toFixed(6);
    console.log("Updated coordinates:", latitudeInput.value, longitudeInput.value);
  } else {
    console.error("Latitude or longitude input not found");
  }
  
  // Perform reverse geocoding to get the place name
  reverseGeocode(lat, lng);
}

export function areCoordinatesSet() {
  const latitudeInput = document.getElementById("latitude");
  const longitudeInput = document.getElementById("longitude");
  return latitudeInput && longitudeInput && 
         !isNaN(parseFloat(latitudeInput.value)) && 
         !isNaN(parseFloat(longitudeInput.value));
}

async function reverseGeocode(lat, lon) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`);
    const data = await response.json();
    
    let locationName = extractLocationName(data);
    
    const destinationInput = document.getElementById("destination");
    if (destinationInput) {
      destinationInput.value = locationName;
      console.log("Updated location name:", locationName);
    } else {
      console.error("Destination input not found");
    }
  } catch (error) {
    console.error("Error in reverse geocoding:", error);
  }
}

function extractLocationName(data) {
  if (!data || !data.address) {
    console.error("Unexpected data structure from geocoding API:", data);
    return "Unknown Location";
  }

  const address = data.address;
  console.log("Address: ", address);
  
  // Priority order: city, town, village, municipality, county
  const priorities = ['city','municipality','county', 'state', 'country', 'town', 'village' ];
  
  for (let key of priorities) {
    if (address[key]) {
      return address[key];
    }
  }
  
  // If none of the above are found, fall back to the display name
  if (data.display_name) {
    return data.display_name.split(',')[0];
  }
  
  // If all else fails, return a generic message
  return "Unnamed Location";
}

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
export const createTripData = async (destinationName, startDate, latitude, longitude) => {
  const daysUntilTrip = checkHowLongAway(startDate);
  console.log("Sending data to server:", { destinationName, startDate, daysUntilTrip, latitude, longitude });
  
  try {
    const response = await fetch("http://localhost:3000/addtrip", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location: encodeURIComponent(destinationName),
        startDate: startDate,
        daysUntilTrip: daysUntilTrip,
        latitude: latitude,
        longitude: longitude,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const retrievedTripData = await response.json();
    console.log("Retrieved trip data:", retrievedTripData);

    const trip = {
      destinationName,
      startDate,
      daysUntilTrip,
      id: Date.now(),
      country: retrievedTripData.country,
      destinationImageUrl: retrievedTripData.destinationImageUrl,
      latitude,
      longitude,
      weatherInfo: retrievedTripData.weatherInfo,
    };

    trips.push(trip);
    mirrorToLocalStorage(trips);
    return trip;
  } catch (error) {
    console.error("Error in createTripData:", error);
    throw error;
  }
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
        <div class="weather-container">
            <img src="https://www.weatherbit.io/static/img/icons/${tripData.weatherInfo.icon_code}.png" alt="${tripData.weatherInfo.description}" />
            <p class="js-weather-display">${tripData.weatherInfo.description} and ${tripData.weatherInfo.temperature} degrees</p>
        </div>
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

document.addEventListener("DOMContentLoaded", () => {
  initializeMap(); // Initialize the map
});
