document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("duoForm");
    const msg = document.getElementById("responseMessage");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        msg.textContent = "Application submitted! Cylows will review.";
        msg.style.color = "#00ffaa";
        msg.style.display = "block";

        form.reset();
    });
});
