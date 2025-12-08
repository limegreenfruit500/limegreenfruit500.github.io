let slides = [
    "images/maxpowerleaderboard.png",
    "images/elo.jpg",
    "images/gamemodewinrate.png",
    "images/valorantcombineranking.png",
    "images/zonecontrol.png",
    "images/rumble.png"
];

let current = 0;

function showSlide() {
    document.getElementById("gallery-slide").src = slides[current];
}

function nextSlide() {
    current = (current + 1) % slides.length;
    showSlide();
}

function prevSlide() {
    current = (current - 1 + slides.length) % slides.length;
    showSlide();
}

document.addEventListener("DOMContentLoaded", showSlide);
