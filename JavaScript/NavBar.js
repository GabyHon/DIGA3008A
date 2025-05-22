// Toggle navigation menu
document.getElementById("MenuBtn").addEventListener("click", function () {
    document.querySelector(".NavBar").classList.toggle("visible");
});

// Blog data
const blogData = {
    Blog1: { title: "Blog 1 Title", description: "Preview of Blog 1..." },
    Blog2: { title: "Blog 2 Title", description: "Preview of Blog 2..." },
    Blog3: { title: "Blog 3 Title", description: "Preview of Blog 3..." },
    Blog4: { title: "Blog 4 Title", description: "Preview of Blog 4..." },
    Blog5: { title: "Blog 5 Title", description: "Preview of Blog 5..." },
};

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

    if (blogData[target]) {
        blogTitle.textContent = blogData[target].title;
        blogDesc.textContent = blogData[target].description;
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

        if (blogData[target]) {
            blogTitle.textContent = blogData[target].title;
            blogDesc.textContent = blogData[target].description;
        }

        const rotationPerDot = 360 / indicators.length;
        const targetAngle = i * rotationPerDot;

        // Apply smooth transition for rotation
        dragCircle.style.transition = "transform 0.6s ease-in-out";
        dragCircle.style.transform = `rotate(${targetAngle}deg)`;

        // Remove transition after movement to keep dragging instant
        setTimeout(() => {
            dragCircle.style.transition = "none";
        }, 600);
    });
});
