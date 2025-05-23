document.addEventListener("DOMContentLoaded", function () {
    const activePageItems = document.querySelectorAll(".ActivePage");

    activePageItems.forEach((item) => {
        const submenu = item.querySelector(".SubPages");
        if (!submenu) return; // Skip if there's no submenu

        let submenuTimeout;

        function showSubMenu() {
            clearTimeout(submenuTimeout);
            submenu.style.display = "flex";
        }

        function hideSubMenu() {
            submenuTimeout = setTimeout(() => {
                submenu.style.display = "none";
            }, 200); // Short delay allows user to move from parent to submenu
        }

        item.addEventListener("mouseenter", showSubMenu);
        item.addEventListener("mouseleave", hideSubMenu);
        submenu.addEventListener("mouseenter", showSubMenu);
        submenu.addEventListener("mouseleave", hideSubMenu);
    });

    // Dynamically position .Circle elements in a semicircle
    const container = document.querySelector(".CircleIndicators");
    const circles = container.querySelectorAll(".Circle");

    const radiusX = container.offsetWidth * 0.6; // Horizontal spread (width)
    const radiusY = container.offsetHeight * 0.4; // Vertical spread (height)
    const centerX = container.offsetWidth / 3;
    const centerY = container.offsetHeight / 2 + 35;

    const total = circles.length;
    const angleStep = Math.PI / (total - 1); // Evenly spaced in 180°

    circles.forEach((circle, i) => {
        const angle = Math.PI * (i / (total - 1)); // 0 to PI (semicircle)

        const x = centerX + radiusX * Math.sin(angle); // Horizontal position
        const y = centerY - radiusY * Math.cos(angle); // Vertical position

        circle.style.left = `${x}px`;
        circle.style.top = `${y}px`;
    });

});

// Toggle navigation menu with the planet icon
document.getElementById("MenuBtn").addEventListener("click", function () {
    document.querySelector(".NavBar").classList.toggle("visible");
});

// Fetching the data from the .json files
let fetchedData = {}; // Global variable to store JSON data

function fetchData(file) {
    fetch(file)
        .then(response => response.json())
        .then(data => {
            fetchedData = data; // Store data globally
            updatePreview(data);
        })
        .catch(error => console.error("Error loading data:", error));
}

// Load different JSON files depending on the page type
const pageType = document.body.getAttribute("data-page"); // Detect which page we're on
if (pageType === "portfolio") {
    fetchData("portfolio.json");
} else if (pageType === "essays") {
    fetchData("essays.json");
} else {
    fetchData("../BlogPages/BlogsPreview.json"); // Default to blogs if no page type is specified
}

// DOM elements
const dragCircle = document.getElementById("RotatingCircle");
const indicators = document.querySelectorAll(".Circle");
const blogTitle = document.getElementById("BlogTitle");
const blogDesc = document.getElementById("BlogDescription");

let isDragging = false;
let startAngle = 0;
let currentRotation = 0;

function getAngle(cx, cy, ex, ey) {
    const dy = ey - cy;
    const dx = ex - cx;
    return Math.atan2(dy, dx) * (180 / Math.PI);
}

dragCircle.addEventListener("mousedown", (e) => {
    isDragging = true;
    const rect = dragCircle.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    startAngle = getAngle(cx, cy, e.clientX, e.clientY) - currentRotation;
});

document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const rect = dragCircle.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = getAngle(cx, cy, e.clientX, e.clientY);
    currentRotation = angle - startAngle;

    dragCircle.style.transform = `rotate(${currentRotation}deg)`;

    // Determine active circle
    const index = Math.round((currentRotation % 360) / (360 / indicators.length));
    const normalizedIndex = ((index % indicators.length) + indicators.length) % indicators.length;
    const selected = indicators[normalizedIndex];
    const target = selected.getAttribute("data-target");

    if (fetchedData[target]) { // Use fetched JSON data
        blogTitle.textContent = fetchedData[target].title;
        blogDesc.textContent = fetchedData[target].description;
    }

    indicators.forEach((circle) => {
        circle.classList.remove("active"); // Remove fill from all circles
    });

    if (selected) {
        selected.classList.add("active"); // Apply fill to the active one
    }
});

document.addEventListener("mouseup", () => {
    isDragging = false;
});

// Allow clicking circles to update preview and rotation
indicators.forEach((circle, i) => {
    circle.addEventListener("click", () => {
        indicators.forEach((c) => c.classList.remove("active")); // Reset all circles
        circle.classList.add("active"); // Fill the clicked one

        const target = circle.getAttribute("data-target");

        if (fetchedData[target]) { // Use fetched JSON data
            blogTitle.textContent = fetchedData[target].title;
            blogDesc.textContent = fetchedData[target].description;
        }

        const rotationPerDot = 360 / indicators.length;
        const targetAngle = i * rotationPerDot;

        // Apply transition for smooth rotation
        dragCircle.style.transition = "transform 0.6s ease-in-out";
        dragCircle.style.transform = `rotate(${targetAngle}deg)`;

        // **Reset dragging angle so it starts smoothly**
        currentRotation = targetAngle;
        startAngle = targetAngle;

        // Remove transition after movement to keep dragging instant
        setTimeout(() => {
            dragCircle.style.transition = "none";
        }, 600);
    });
});
