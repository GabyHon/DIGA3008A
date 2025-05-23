async function getISSLocation() {
    try {
        const response = await fetch('http://api.open-notify.org/iss-now.json');
        if (!response.ok) throw new Error("Failed to fetch ISS data");
        const data = await response.json();

        const latitude = data.iss_position.latitude;
        const longitude = data.iss_position.longitude;

        console.log(` ISS is currently at: Latitude ${latitude}, Longitude ${longitude}`);
        document.getElementById("issLocation").innerHTML = 
            `ISS Location:<br> Latitude: ${latitude} <br> Longitude: ${longitude}`;

        // Refresh every 10 seconds
        setTimeout(getISSLocation, 10000);
    } catch (error) {
        console.error("Error fetching ISS location:", error);
        document.getElementById("issLocation").innerHTML = "Unable to fetch ISS location.";
    }
}
getISSLocation();