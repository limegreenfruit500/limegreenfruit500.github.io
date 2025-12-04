document.addEventListener("DOMContentLoaded", () => {
    const titles = document.querySelectorAll(".card-title");

    titles.forEach(title => {
        title.addEventListener("click", () => {
            const details = title.nextElementSibling;
            if (details.style.display === "block") {
                details.style.display = "none";
            } else {
                details.style.display = "block";
            }
        });
    });
});
