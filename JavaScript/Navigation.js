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
            fetchedData = data;

            if (pageType === "Portfolio") {
                populateGallery(data);
            } else {
                updatePreview(data); // used on Essays/Blogs
            }
        })
        .catch(error => console.error("Error loading data:", error));
}

function populateGallery(data) {
    const gallery = document.getElementById("Gallery");
    gallery.innerHTML = "";

    for (let key in data) {
        const entry = data[key];

        const item = document.createElement("div");
        item.className = "gallery-item";

        item.innerHTML = `
            <img src="${entry.image}" alt="${entry.title}">
            <h3>${entry.title}</h3>
            <p>${entry.description}</p>
            
        `;

        gallery.appendChild(item);
    }
}

// Load different JSON files depending on the page type
const pageType = document.body.getAttribute("data-page"); // Detect which page we're on
if (pageType === "Portfolio") {
    fetchData("../PortfolioPages/PortfolioPreview.json");
} else if (pageType === "Essays") {
    fetchData("../EssayPages/EssayPreview.json");
} else if (pageType === "Designs") {
    fetchData("../DesignPages/DesignPreview.json");
} else {
    fetchData("../BlogPages/BlogsPreview.json"); // Default to blogs if no page type is specified
}

// DOM elements
const dragCircle = document.getElementById("RotatingCircle");
const indicators = document.querySelectorAll(".Circle");
const Title = document.getElementById("Title");
const Desc = document.getElementById("Description");
const DynamicButton = document.getElementById("DynamicButton");

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

    // Snap rotation transform
    dragCircle.style.transform = `rotate(${currentRotation}deg)`;

    // Compute which indicator is currently selected
    const segments = indicators.length;
    const rotationPerDot = 360 / segments;
    let index = Math.round(currentRotation / rotationPerDot);

    // Normalize index in case of negative rotation
    index = ((index % segments) + segments) % segments;

    const selected = indicators[index];
    const target = selected.getAttribute("data-target");

    // Scroll gallery to matching item
    const gallery = document.getElementById("Gallery");
    const scrollPerItem = gallery.querySelector(".gallery-item").offsetWidth + 32;
    const targetScroll = index * scrollPerItem;
    gallery.scrollTo({
        left: targetScroll,
        behavior: "smooth"
    });

    // Update preview (if not on Portfolio)
    if (fetchedData[target] && pageType !== "Portfolio") {
        Title.textContent = fetchedData[target].title;
        Desc.textContent = fetchedData[target].description;
        DynamicButton.href = fetchedData[target].link;
        DynamicButton.style.display = "inline-block";
    }

    // Highlight correct indicator
    indicators.forEach((circle) => circle.classList.remove("active"));
    selected.classList.add("active");
});


document.addEventListener("mouseup", () => {
    isDragging = false;
});

// Allow clicking circles to update preview and rotation
indicators.forEach((circle, i) => {
    circle.addEventListener("click", () => {
        indicators.forEach((c) => c.classList.remove("active")); // Reset all circles
        circle.classList.add("active"); // Fill the clicked one
        DynamicButton.style.display = "inline-block";

        const scrollPerItem = gallery.querySelector(".gallery-item").offsetWidth + 32;
        const targetScroll = i * scrollPerItem;
        gallery.scrollTo({
            left: targetScroll,
            behavior: "smooth"
        });


        const target = circle.getAttribute("data-target");

        if (fetchedData[target]) { // Use fetched JSON data
            Title.textContent = fetchedData[target].title;
            Desc.textContent = fetchedData[target].description;
            DynamicButton.href = fetchedData[target].link;
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
