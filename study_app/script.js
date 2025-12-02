document.addEventListener("DOMContentLoaded", () => {
    init();
});

let mastered = JSON.parse(localStorage.getItem("mastered") || "[]");
let current = null;
let showingAnswer = false;

const videos = {
    pentatonic: "https://www.youtube.com/watch?v=3XvxOLKc69g",
    hexatonic: "https://www.youtube.com/watch?v=I9L9q24Bk3Y",
    modes: "https://www.youtube.com/watch?v=TL8Ykh7Q7KI",
    variants: "https://www.youtube.com/watch?v=FQwdGHZCw5U",
    octatonic: "https://www.youtube.com/watch?v=BBMqddr_uvU",
    chromatic: "https://www.youtube.com/watch?v=Xf6zBz73WbI",
    twelve: "https://www.youtube.com/watch?v=ntvZCG8gGV8",
    all: "https://www.youtube.com/watch?v=pICZt7l8p8o"
};

const scales = [
    { group: "pentatonic", front: "Pentatonic Major", back: "Degrees: 1 2 3 5 6\nMnemonic: Major without 4 & 7" },
    { group: "pentatonic", front: "Pentatonic Minor", back: "Degrees: 1 b3 4 5 b7\nMnemonic: Minor without 2 & 6" },
    { group: "pentatonic", front: "Hirajoshi", back: "Degrees: 1 2 b3 5 b6\nMnemonic: Dark, skip 4" },
    { group: "pentatonic", front: "Kumoi", back: "Degrees: 1 2 b3 5 6\nMnemonic: Hirajoshi but brighter" },

    { group: "hexatonic", front: "Whole Tone Scale", back: "All whole steps\nSymmetric, dreamy" },
    { group: "hexatonic", front: "Hexatonic (Augmented)", back: "Pattern: H m3 H m3 H m3" },

    { group: "modes", front: "Ionian", back: "1 2 3 4 5 6 7\nMajor scale" },
    { group: "modes", front: "Lydian", back: "1 2 3 #4 5 6 7\nRaised 4" },
    { group: "modes", front: "Aeolian", back: "1 2 b3 4 5 b6 b7\nNatural minor" },
    { group: "modes", front: "Dorian", back: "1 2 b3 4 5 6 b7\nRaised 6" },
    { group: "modes", front: "Phrygian", back: "1 b2 b3 4 5 b6 b7\nLowered 2" },
    { group: "modes", front: "Locrian", back: "1 b2 b3 4 b5 b6 b7\nLowered 2 and 5" },

    { group: "variants", front: "Lydian Dominant", back: "1 2 3 #4 5 6 b7\nLydian + b7" },
    { group: "variants", front: "Phrygian Dominant", back: "1 b2 3 4 5 b6 b7\nPhrygian + natural 3" },

    { group: "octatonic", front: "Octatonic WH", back: "WHWHWHWH\nDiminished scale" },
    { group: "octatonic", front: "Octatonic HW", back: "HWHWHWHW\nDiminished scale" },

    { group: "chromatic", front: "Chromatic Scale", back: "All half steps\n12-note scale" }
];

function randomRow() {
    let pcs = [...Array(12).keys()];
    let row = [];
    while (pcs.length) row.push(pcs.splice(Math.floor(Math.random() * pcs.length), 1)[0]);
    return row;
}

function invertRow(row) {
    let p0 = row[0];
    return row.map(n => ((p0 - (n - p0)) % 12 + 12) % 12);
}

function retro(row) {
    return [...row].reverse();
}

function retroInv(row) {
    return invertRow([...row].reverse());
}

function formatRow(row) {
    return row.join(" ");
}

function generate12ToneCard() {
    let p = randomRow();
    let inv = invertRow(p);
    let r = retro(p);
    let ri = retroInv(p);
    return {
        group: "twelve",
        front: "12-Tone Row Trainer",
        back:
            "Prime: " + formatRow(p) +
            "\nInversion: " + formatRow(inv) +
            "\nRetrograde: " + formatRow(r) +
            "\nRetrograde-Inversion: " + formatRow(ri)
    };
}

function getPool(group) {
    if (group === "all") return scales.concat({ group: "twelve", front: "12-Tone Trainer" });
    if (group === "twelve") return [{ group: "twelve", front: "12-Tone Trainer" }];
    return scales.filter(s => s.group === group);
}

function pickCard() {
    let group = document.querySelector(".cat.active")?.dataset.group || "all";
    let pool = getPool(group);
    let choice = pool[Math.floor(Math.random() * pool.length)];
    if (choice.group === "twelve") return generate12ToneCard();
    return choice;
}

function flip() {
    showingAnswer = !showingAnswer;
    document.getElementById("flashcard").innerText =
        showingAnswer ? current.back : current.front;
}

function next() {
    showingAnswer = false;
    current = pickCard();
    document.getElementById("flashcard").innerText = current.front;
}

function playVideo() {
    let g = current.group;
    let link = videos[g] || videos["all"];
    window.open(link, "_blank");
}

function toggleLight() {
    document.body.classList.toggle("light");
}

function markMastered() {
    if (!current) return;
    mastered.push(current.front);
    localStorage.setItem("mastered", JSON.stringify(mastered));
}

function init() {
    document.getElementById("flipBtn").onclick = flip;
    document.getElementById("nextBtn").onclick = next;
    document.getElementById("audioBtn").onclick = playVideo;
    document.getElementById("lightdark").onclick = toggleLight;
    document.getElementById("markBtn").onclick = markMastered;

    document.querySelectorAll(".cat").forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll(".cat").forEach(c => c.classList.remove("active"));
            btn.classList.add("active");
            next();
        };
    });

    next();
}
