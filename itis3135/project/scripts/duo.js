document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("duoForm");

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const data = new FormData(form);

            const msg = `
New Duo Application:
Name: ${data.get("name")}
Gamertag: ${data.get("gamertag")}
Experience: ${data.get("experience")}
Why Duo?: ${data.get("reason")}
`;

            window.location.href =
                "mailto:limetimeow@gmail.com?subject=Duo Application&body=" +
                encodeURIComponent(msg);
        });
    }
});
