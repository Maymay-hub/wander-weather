# WanderWeather

## Overview
**WanderWeather** is an intuitive web application designed to help users organize and enhance their travel experiences. With this single-page application, users can easily add travel plans and access real-time weather information for their chosen destinations.

The app integrates data from three powerful APIs—Geonames for geographical information, Weatherbit for weather forecasts, and Pixabay for stunning visuals—to create a seamless and enriching travel planning experience.

## Technologies Used

 ### Frontend Development:
  - **HTML**: For structuring the content of the application.
  - **CSS**: For styling and layout of the application.
  - **SASS**: For advanced styling and managing stylesheets with nested rules and variables.

 ### Build Tools:
  - **Webpack**: For module bundling, managing assets, and optimizing the development workflow.
    - **Webpack Loaders**: Used for transforming front-end assets.
    - **Webpack Plugins**: Used to perform a wider range of tasks like minification and environment variable management.

 ### API Integration:
  - **OpenStreetMap API**: For fetching geographical information and data.
  - **Weatherbit API**: For retrieving real-time weather data for travel destinations.
  - **Pixabay API**: For sourcing high-quality images to enhance travel plans.

 ### Backend Development:
  - **Express**: For setting up the backend server to handle API requests and serve the frontend application.

## Getting Started and Installation

Follow these steps to set up and run WanderWeather app on your local machine.

### Prerequisites

Ensure you have the following installed:

- **Node.js**: Version 14.0.0 or higher
- **npm**: Node Package Manager (comes with Node.js)

### Installation Steps

1. **Clone the Repository**
   Clone the repository to your local machine using the following command:
   `git clone https://github.com/xLalice/wander-weather.git`
   `cd wander-weather`
   `npm install`
2. **Obtain API KEYS**
    ### Obtain API Keys

Sign up for API keys from the following services:

- **[GeoNames](http://www.geonames.org/)**: Create an account and request a username for accessing geographical data.
- **[Weatherbit](https://www.weatherbit.io/)**: Sign up for an account to obtain an API key for weather data.
- **[Pixabay](https://pixabay.com/api/docs/)**: Register for an API key to access high-quality images.

### Create Environment Variables

Create a `.env` file in the root of your project and add your API keys as follows:

```plaintext
GEONAMES_USER=********
WEATHERBIT_API_KEY=*********************
PIXABAY_API_KEY=********************
```
### Running the app
```plaintext
npm build-dev
```
Open second terminal and enter:
```plaintext
npm run start
```
