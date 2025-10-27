// Denna fil ska innehålla din lösning till uppgiften (moment 5).

"use strict"; 

/*  Delar till ej obligatorisk funktionalitet, som kan ge poäng för högre betyg
*   Radera rader för funktioner du vill visa på webbsidan. */
document.getElementById("player").style.display = "none";      // Radera denna rad för att visa musikspelare
document.getElementById("shownumrows").style.display = "none"; // Radera denna rad för att visa antal träffar

/* Här under börjar du skriva din JavaScript-kod */
// === Sveriges Radio - Moment 5 ===
// Skapad av [Reem Shihab]


// Länk till APi:et
const apiUrl = "https://api.sr.se/api/v2";

// Hämtar element från HTML-filen
const kanalLista = document.getElementById("mainnavlist");
const infoRuta = document.getElementById("info");
const antalInput = document.getElementById("numrows");
const selectSpelare = document.getElementById("playchannel");
const knappSpela = document.getElementById("playbutton");
const ljudRuta = document.getElementById("radioplayer");

let allaKanaler = []; // här sparar jag alla kanaler som jag hämtar från API:t

// Funktion för att hämta data från API:t (använder fetch)
async function hamtaData(url) {
  const svar = await fetch(url); // hämtar från webben
  const data = await svar.json(); // gör om till JSON
  return data;
}

// Hämtar alla kanaler
async function hamtaKanaler() {
  const data = await hamtaData(`${apiUrl}/channels?format=json&size=100`);
  allaKanaler = data.channels; // sparar i min lista

   visaKanaler(); // visar listan i vänsterspalten
  fyllSpelare(); // fyller dropdownen för spelaren
}

// Skriver ut kanaler i listan till vänster
function visaKanaler() {
  kanalLista.innerHTML = ""; // rensar först så inget dubblas
  let antal = parseInt(antalInput.value); // läser av hur många kanaler som ska visas

if (isNaN(antal) || antal < 1) antal = 10; // standardvärde om fältet är tomt
 
 // Loopar igenom och skapar en knapp för varje kanal
  allaKanaler.slice(0, antal).forEach(k => {
    let li = document.createElement("li");
    let knapp = document.createElement("button");

knapp.textContent = k.name; // visar kanalens namn
    knapp.title = k.tagline || ""; // lite info när man håller musen över
    knapp.addEventListener("click", () => visaTabla(k.id, k.name)); // klick visar tablån

       li.appendChild(knapp);
    kanalLista.appendChild(li);
  });
}

// Visar dagens tablå (program) för vald kanal
async function visaTabla(id, namn) {
  infoRuta.innerHTML = `<p>Laddar tablå för ${namn}...</p>`; // liten text medan det laddar

    let idag = new Date().toISOString().slice(0, 10); // dagens datum i rätt format
  const data = await hamtaData(`${apiUrl}/scheduledepisodes?format=json&channelid=${id}&date=${idag}`);

  let program = data.schedule;
  let nu = new Date();

  // Tar bort program som redan har slutat
  program = program.filter(p => new Date(parseInt(p.endtimeutc.substr(6))) >= nu);

  infoRuta.innerHTML = `<h2>${namn} - Dagens tablå</h2>`;

  if (program.length === 0) {
    infoRuta.innerHTML += "<p>Inga fler program idag.</p>";
    return;
  }

  // Skriver ut varje program i tablå-listan
  program.forEach(p => {
    let start = new Date(parseInt(p.starttimeutc.substr(6)));
    let slut = new Date(parseInt(p.endtimeutc.substr(6)));

    let artikel = document.createElement("article");
    artikel.innerHTML = `
      <h3>${p.title || "(utan titel)"}</h3>
      ${p.subtitle ? `<h4>${p.subtitle}</h4>` : ""}
      <h5>${start.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} -
          ${slut.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</h5>
      <p>${p.description || ""}</p>
    `;

    infoRuta.appendChild(artikel);
  });
}

// Fyller dropdown-listan för spelaren
function fyllSpelare() {
  selectSpelare.innerHTML = ""; // rensar innan jag lägger till nytt
  allaKanaler.forEach(k => {
    let opt = document.createElement("option");
    opt.value = k.id;
    opt.textContent = k.name;
    selectSpelare.appendChild(opt);
  });
}

// Spelar vald kanal när man klickar på "Spela"-knappen
knappSpela.addEventListener("click", () => {
  let valdId = parseInt(selectSpelare.value); // hämtar den valda kanalens id
  let kanal = allaKanaler.find(k => k.id === valdId); // hittar rätt kanal i listan

  // om det inte finns någon ljudström
  if (!kanal || !kanal.liveaudio || !kanal.liveaudio.url) {
    ljudRuta.innerHTML = "<p>Ingen ljudström hittades.</p>";
    return;
  }

  // skapar en enkel ljudspelare
  ljudRuta.innerHTML = `
    <h4>Spelar: ${kanal.name}</h4>
    <audio controls autoplay>
      <source src="${kanal.liveaudio.url}" type="audio/mpeg">
    </audio>
  `;
});

// Lyssnar på ändringar i fältet för antal kanaler
antalInput.addEventListener("input", visaKanaler);

// Kör igång allt när sidan laddas
hamtaKanaler();
