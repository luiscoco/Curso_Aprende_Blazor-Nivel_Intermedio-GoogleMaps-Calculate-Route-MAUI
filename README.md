# How to calculate a route between two sites in GoogleMaps with a MAUI Blazor application

## 1. Create a new MAUI Blazor application in Visual Studio 2022 Community Edition

Please refer to this publication for setting up yout environment:

https://github.com/luiscoco/Curso_Aprende_Blazor-Nivel_Intermedio-GoogleMaps-SimpleMap-MAUI

## 2. Create a new JavaScript file

![image](https://github.com/user-attachments/assets/44517b71-f278-4315-a88f-c66c2d2d9670)

Include this code in the **googlemaps.js** file:

```javascript
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
}
```

## 3. Include the JavaScript file reference in the index.html file

Include this code in the **index.html**

```
<script src="googlemaps.js"></script>
```

## 4. Include the Google Maps API reference in the index.html file

Include this code in the index.html 

```
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDoENaJ45__VPv8SBlkZM6F4ehh0peXMAQ"
        defer></script>
```

For creating the **Google Maps API Key** see this publication for more info: 

https://github.com/luiscoco/Curso_Aprende_Blazor-Nivel_Intermedio-GoogleMaps-SimpleMap-MAUI

See the modified **index.html** file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <title>MAUI_GoogleMaps_SimpleMap</title>
    <base href="/" />
    <link rel="stylesheet" href="css/bootstrap/bootstrap.min.css" />
    <link rel="stylesheet" href="css/app.css" />
    <link rel="stylesheet" href="MAUI_GoogleMaps_SimpleMap.styles.css" />
    <link rel="icon" href="data:,">
</head>

<body>

    <div class="status-bar-safe-area"></div>

    <div id="app">Loading...</div>

    <div id="blazor-error-ui">
        An unhandled error has occurred.
        <a href="" class="reload">Reload</a>
        <a class="dismiss">🗙</a>
    </div>

    <script src="_framework/blazor.webview.js" autostart="false"></script>
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDtY-kaCCULMKQ-017w_k2xk0-67T4IC8Q&callback=initMap"
            defer></script>
    <script src="googlemaps.js"></script>


</body>

</html>
```

## 5. Create a new razor component for the Google Map

See the new **GoogleMaps.razor** component

![image](https://github.com/user-attachments/assets/fe268eb7-d127-4e09-a08b-fb6ecef8b8e3)

Add this code in the **GoogleMaps.razor**

```razor
@page "/googleMaps"
@inject IJSRuntime JSRuntime

<h3>Google Maps with Draggable Directions and Distance Calculation</h3>

<div id="floating-panel" style="display: flex; align-items: center; gap: 10px;">
    <!-- Start and End Input Boxes, and Buttons on the Same Line -->
    <div>
        <b>Start: </b>
        <input type="text" id="start" placeholder="Enter start location" />
    </div>
    <div style="margin-left: 20px;">
        <b>End: </b>
        <input type="text" id="end" placeholder="Enter destination" />
    </div>
    <div style="margin-left: 20px; display: flex; gap: 10px;">
        <!-- Show Route and Clear Route Buttons with space between them -->
        <button class="btn btn-primary" @onclick="ShowRoute">Show Route</button>
        <button class="btn btn-danger" @onclick="ClearRoute">Clear Route</button>
    </div>
</div>

<!-- Blank Rows -->
<div style="height: 20px;"></div>

<!-- Waypoints Section -->
<div>
    <div id="waypoints"></div>

    <!-- Blank Row between Waypoint input and Add Waypoint Button -->
    <div style="height: 20px;"></div>

    <!-- Button to Add Waypoint -->
    <button class="btn btn-secondary" @onclick="AddWaypoint">Add Waypoint</button>
</div>

<!-- Blank Rows -->
<div style="height: 20px;"></div>

<!-- Map and Sidebar Container -->
<div id="container">
    <div id="map" style="height: 400px; width: 100%;"></div>
    <div id="sidebar">
        <p>Total Distance: <span id="total"></span></p>
        <div id="panel"></div>
    </div>
</div>

@code {
    private int waypointCounter = 0;

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            // Initialize the map on first render without displaying the route
            await JSRuntime.InvokeVoidAsync("initMap");
        }
    }

    private async Task AddWaypoint()
    {
        // Call JavaScript to dynamically add a new waypoint input field
        waypointCounter++;
        await JSRuntime.InvokeVoidAsync("addWaypoint", waypointCounter);
    }

    private async Task ShowRoute()
    {
        // Call JavaScript to calculate and display the route
        await JSRuntime.InvokeVoidAsync("showRoute");
    }

    private async Task ClearRoute()
    {
        // Call JavaScript to clear the route and input fields
        await JSRuntime.InvokeVoidAsync("clearRoute");
    }
}
```

## 6. Run the appplication in Windows Desktop

See this publication for more info: 

https://github.com/luiscoco/Curso_Aprende_Blazor-Nivel_Intermedio-GoogleMaps-SimpleMap-MAUI

![image](https://github.com/user-attachments/assets/ebe1ee39-b939-4314-b793-4a7b6ad18975)

![image](https://github.com/user-attachments/assets/51ab82a1-71b1-4ce2-b86d-1bd08e95f4ac)

![image](https://github.com/user-attachments/assets/a48ae2e1-25e0-4356-a4ac-a6c65587f531)

![image](https://github.com/user-attachments/assets/aa10c9e3-e3a2-4698-b0e3-0a84675f55a4)

## 7. Run the application in your Mobile Device

See this publication for more info: 

https://github.com/luiscoco/Curso_Aprende_Blazor-Nivel_Intermedio-GoogleMaps-SimpleMap-MAUI

![image](https://github.com/user-attachments/assets/de94fc40-d816-4ed5-8bde-f983da747c13)

![image](https://github.com/user-attachments/assets/e782d2da-df72-4b25-bfeb-e310ccaca141)

![image](https://github.com/user-attachments/assets/e3ecc900-004e-4f83-9f2e-60b1379f4475)

