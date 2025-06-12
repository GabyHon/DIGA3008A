async function getISSLocation() {
    try {
        // get the ISS location
        const issResponse = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        if (!issResponse.ok) throw new Error("Failed to fetch ISS data");
        const issData = await issResponse.json();

        const latitude = parseFloat(issData.latitude).toFixed(4);
        const longitude = parseFloat(issData.longitude).toFixed(4);
        const altitude = parseFloat(issData.altitude).toFixed(2);
        const velocity = parseFloat(issData.velocity).toFixed(2);

        const coordURL = `https://api.wheretheiss.at/v1/coordinates/${latitude},${longitude}`;
        const coordResponse = await fetch(coordURL);
        if (!coordResponse.ok) throw new Error("Failed to fetch coordinate data");
        const coordData = await coordResponse.json();

        const location = coordData.location || "Over the ocean";
        const timezone = coordData.timezone_id || "unknown timezone";
        const isDaylight = coordData.daylight === true ? "Daylight" : "Night";

        console.log(`ISS is currently at:
            Latitude: ${latitude}
            Longitude: ${longitude}
            Altitude: ${altitude} km
            Velocity: ${velocity} km/m
            Over: ${location}
            Timezone: ${timezone}
            It is currently: ${isDaylight}`);

        document.getElementById("issLocation").innerText = `
        ISS Location:
        Latitude: ${latitude}
        Longitude: ${longitude}
        Altitude: ${altitude} km
        Velocity: ${velocity} km/h
        Over: ${location}
        Timezone: ${timezone}
        Currently: ${isDaylight}`;

        setTimeout(getISSLocation, 10000);
    } catch (error) {
        console.error("Error fetching ISS location:", error);
        document.getElementById("issLocation").innerText = "Unable to fetch ISS location.";
    }
}
getISSLocation();