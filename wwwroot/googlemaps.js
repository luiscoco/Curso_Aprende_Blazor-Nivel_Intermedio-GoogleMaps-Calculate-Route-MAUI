let map;
let directionsService;
let directionsRenderer;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 4,
        center: { lat: -24.345, lng: 134.46 }, // Australia.
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        draggable: true,
        map,
        panel: document.getElementById("panel"),
    });

    directionsRenderer.addListener("directions_changed", () => {
        const directions = directionsRenderer.getDirections();

        if (directions) {
            computeTotalDistance(directions);
        }
    });
}

// Function to dynamically add new waypoint input fields
function addWaypoint(counter) {
    const waypointsDiv = document.getElementById("waypoints");
    const newWaypoint = document.createElement("div");
    newWaypoint.setAttribute("id", `waypoint-${counter}`);
    newWaypoint.innerHTML = `
        <b>Waypoint ${counter}: </b>
        <input type="text" id="waypoint-input-${counter}" placeholder="Enter waypoint location" />
    `;
    waypointsDiv.appendChild(newWaypoint);
}

function showRoute() {
    const origin = document.getElementById("start").value;
    const destination = document.getElementById("end").value;

    if (!origin || !destination) {
        alert("Please enter both a start location and a destination.");
        return;
    }

    // Gather all the waypoints
    const waypoints = [];
    const waypointInputs = document.querySelectorAll("[id^='waypoint-input-']");

    waypointInputs.forEach((input) => {
        if (input.value) {
            waypoints.push({
                location: input.value,
            });
        }
    });

    // Display the route including waypoints
    displayRoute(origin, destination, waypoints, directionsService, directionsRenderer);
}

function displayRoute(origin, destination, waypoints, service, display) {
    service
        .route({
            origin: origin,
            destination: destination,
            waypoints: waypoints,
            travelMode: google.maps.TravelMode.DRIVING,
            avoidTolls: true,
        })
        .then((result) => {
            display.setDirections(result);
        })
        .catch((e) => {
            alert("Could not display directions due to: " + e);
        });
}

// Compute and display total distance
function computeTotalDistance(result) {
    let total = 0;
    const myroute = result.routes[0];

    if (!myroute) {
        return;
    }

    for (let i = 0; i < myroute.legs.length; i++) {
        total += myroute.legs[i].distance.value;
    }

    total = total / 1000; // Convert to kilometers
    document.getElementById("total").innerHTML = total + " km";
}

// Function to clear the route and input fields
function clearRoute() {
    // Clear all input fields
    document.getElementById("start").value = '';
    document.getElementById("end").value = '';
    document.getElementById("total").innerHTML = '';

    // Clear waypoints
    const waypointsDiv = document.getElementById("waypoints");
    waypointsDiv.innerHTML = ''; // Remove all dynamically added waypoints

    // Clear the displayed route
    if (directionsRenderer) {
        directionsRenderer.set('directions', null); // Reset the directions on the map
    }
}5
