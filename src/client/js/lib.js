import { wait } from "./helpers";
import { loader } from "./elements";
import { postData } from "./postData";
import { trips } from "./initialize";

import DOMPurify from "dompurify";

export function checkHowLongAway(dateInputValue) {
  const today = new Date();
  const startDate = new Date(dateInputValue);
  const days = Math.ceil(
    (startDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
  );
  if (days < 0) {
    alert("Your departure date cannot be in the past!");
  }
  return days;
}

export const createTripData = async (destinationName, startDate) => {
  const daysUntilTrip = checkHowLongAway(startDate);
  const retrievedTripData = await postData("http://localhost:3000/addtrip", {
    location: encodeURIComponent(destinationName),
    startDate: startDate,
    daysUntilTrip: daysUntilTrip,
  });
  const trip = {
    destinationName,
    startDate,
    daysUntilTrip,
    id: Date.now(),
    country: retrievedTripData.country,
    destinationImageUrl: retrievedTripData.destinationImageUrl,
    weatherInfo: {
      temperature: retrievedTripData.weatherInfo.temperature,
      description: retrievedTripData.weatherInfo.description,
      icon_code: retrievedTripData.weatherInfo.icon_code
    },
  };
  trips.push(trip);
  mirrorToLocalStorage(trips);
  return trip;
};

export function handleError(error) {
  alert(
    "There was an error processing this request. Please make sure your inputs are correct.",
    error
  );
  console.log("error", error);
}

export async function resetForm(formToReset) {
  await wait();
  hideLoader();
  formToReset.reset();
}

export function showLoader() {
  loader.classList.remove("hidden");
}

export function hideLoader() {
  loader.classList.add("hidden");
}

export async function createTripCard(tripData) {
  const upcomingTripDisplay = document.querySelector(".js-trips");
  console.log("Trip Data:" , tripData)
  const tripHtml = `
	<div class="trip-card">
		<img class="js-destination-image" src="${tripData.destinationImageUrl}" alt="destination photo">
		<div class="trip-details">
			<h2 class="heading2">Upcoming trip to <span class="js-location-display">${tripData.destinationName}, ${tripData.country}</span></h2>
			<p class="leave-date">Departure: <span class="js-dep-date-display">${tripData.startDate}</span></p>
			<p class="departure-countdown js-departure-countdown">${tripData.daysUntilTrip} days left until your trip to ${tripData.destinationName}!</p>
			<p class="subheading">Weather forecast for the time of your stay:</p>
      <img src="https://www.weatherbit.io/static/img/icons/${tripData.weatherInfo.icon_code}.png" alt="${tripData.weatherInfo.description}" />
			<p class="js-weather-display">${tripData.weatherInfo.description} and ${tripData.weatherInfo.temperature} degress</p>
			<button class="button button--secondary js-remove-button" value="${tripData.id}">Remove trip</button>
		</div>
	</div>
	`;
  const sanitizedTripHtml = DOMPurify.sanitize(tripHtml);
  const htmlFragment = document
    .createRange()
    .createContextualFragment(sanitizedTripHtml);

  upcomingTripDisplay.appendChild(htmlFragment);
}

export function mirrorToLocalStorage(items) {
  localStorage.setItem("items", JSON.stringify(items));
}

export function restoreFromLocalStorage(items) {
  console.info("Restoring from LS");
  const existingItems = JSON.parse(localStorage.getItem("items"));
  if (existingItems.length) {
    items.push(...existingItems);
    items.map((item) => createTripCard(item));
  }
}
