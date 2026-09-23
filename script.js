const pricePerKmInput = document.getElementById("pricePerKm");
const minimumFareInput = document.getElementById("minimumFare");

const distanceDisplay = document.getElementById("distance");
const fareDisplay = document.getElementById("fare");
function calculateFare(distance) {

    const pricePerKm = Number(pricePerKmInput.value);
    const minimumFare = Number(minimumFareInput.value);

    // First 1.5 km is covered by the minimum fare
    if (distance <= 1.5) {
        fareDisplay.textContent = "₹" + minimumFare.toFixed(2);
        return;
    }

    // Distance after the first 1.5 km
    const extraDistance = distance - 1.5;

    // Round up to the next 0.5 km
    const extraHalfKm = Math.ceil(extraDistance / 0.5);

    // Convert price per km to price per 0.5 km
    const halfKmRate = pricePerKm / 2;

    const finalFare =
        minimumFare + (extraHalfKm * halfKmRate);

    fareDisplay.textContent =
        "₹" + finalFare.toFixed(2);
}
let watchId = null;
let lastPosition = null;
let totalDistance = 0;

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const statusDisplay = document.getElementById("status");

startBtn.addEventListener("click", startRide);
stopBtn.addEventListener("click", stopRide);

function startRide() {

    if (!navigator.geolocation) {
        statusDisplay.textContent = "GPS is not supported";
        return;
    }

    totalDistance = 0;
    lastPosition = null;

    statusDisplay.textContent = "📍 GPS tracking started...";

    watchId = navigator.geolocation.watchPosition(
        updateLocation,
        gpsError,
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 30000
        }
    );
}

function updateLocation(position) {

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    const currentPosition = {
        latitude: latitude,
        longitude: longitude
    };

    if (lastPosition !== null) {

        const distance = calculateDistance(
            lastPosition.latitude,
            lastPosition.longitude,
            currentPosition.latitude,
            currentPosition.longitude
        );

        totalDistance += distance;
    }

    lastPosition = currentPosition;

    distanceDisplay.textContent =
        totalDistance.toFixed(2) + " km";

    calculateFare(totalDistance);

    statusDisplay.textContent =
        "📍 GPS tracking...";
}

function stopRide() {

    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    statusDisplay.textContent = "Ride ended";

    calculateFare(totalDistance);
}
function calculateDistance(lat1, lon1, lat2, lon2) {

    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function gpsError(error) {

    if (error.code === 1) {
        statusDisplay.textContent =
            "❌ Location permission denied";
    } else if (error.code === 2) {
        statusDisplay.textContent =
            "❌ Location unavailable";
    } else if (error.code === 3) {
        statusDisplay.textContent =
            "❌ GPS request timed out";
    } else {
        statusDisplay.textContent =
            "❌ GPS error";
    }
}
