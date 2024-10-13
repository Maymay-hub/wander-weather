import { showLoader } from "./lib.js";

// Function to send POST request with data to the given URL
export async function postData(url = "", data = {}) {
  showLoader(); // Display the loader when the request is being processed

  try {
    // Send a POST request with the specified data
    const response = await fetch(url, {
      method: "POST", // Use the POST method for sending data
      credentials: "same-origin", // Include credentials for same-origin requests
      headers: {
        "Content-Type": "application/json", // Specify JSON format for the request body
      },
      body: JSON.stringify(data), // Convert data object to a JSON string
    });

    // Parse and log the response as JSON
    const newData = await response.json();
    console.log(newData);
    return newData; // Return the parsed response data
  } catch (error) {
    // Handle and log any errors that occur during the fetch request
    console.log("error", error);
    return error;
  }
}
