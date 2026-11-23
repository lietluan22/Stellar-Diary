const STORAGE_KEY = "stellar-diary-entries";
const THEME_KEY = "stellar-diary-theme";

const form = document.querySelector("#entry-form");
const titleInput = document.querySelector("#entry-title");
const moodInput = document.querySelector("#entry-mood");
const textInput = document.querySelector("#entry-text");
const gratitudeInput = document.querySelector("#entry-gratitude");
const winInput = document.querySelector("#entry-win");
const entriesList = document.querySelector("#entries-list");
const moodFilter = document.querySelector("#mood-filter");
const themeToggle = document.querySelector("#theme-toggle");
const exportButton = document.querySelector("#export-button");

let entries = loadEntries();

const moodLabels = {
  brilhante: "✨ Brilhante",
  tranquilo: "🌿 Tranquilo",
  neutro: "☁️ Neutro",
  cansado: "🌙 Cansado",
  reflexivo: "🌌 Reflexivo",
  desafiador: "⛈️ Desafiador"
};

function loadEntries() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function createEntry(event) {
  event.preventDefault();

  const entry = {
    id: crypto.randomUUID(),
    title: titleInput.value.trim(),
    mood: moodInput.value,
    text: textInput.value.trim(),
    gratitude: gratitudeInput.value.trim(),
    win: winInput.value.trim(),
    createdAt: new Date().toISOString()
  };

  entries.unshift(entry);
  saveEntries();
  renderEntries();

  form.reset();
  titleInput.focus();
}

function deleteEntry(id) {
  entries = entries.filter(entry => entry.id !== id);
  saveEntries();
  renderEntries();
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function renderEntries() {
  const selectedMood = moodFilter.value;
  const filteredEntries =
    selectedMood === "all"
      ? entries
      : entries.filter(entry => entry.mood === selectedMood);

  entriesList.innerHTML = "";

  if (filteredEntries.length === 0) {
    entriesList.innerHTML = `
      <div class="empty-state">
        Nenhuma entrada por aqui ainda.<br />
        Comece registrando um pequeno momento de hoje.
      </div>
    `;
    return;
  }

  filteredEntries.forEach(entry => {
    const card = document.createElement("article");
    card.className = "entry-card";

    const tags = [
      moodLabels[entry.mood],
      entry.gratitude ? `Gratidão: ${entry.gratitude}` : "",
      entry.win ? `Conquista: ${entry.win}` : ""
    ].filter(Boolean);

    card.innerHTML = `
      <div class="entry-top">
        <div>
          <h3 class="entry-title"></h3>
          <span class="entry-date"></span>
        </div>
        <button class="delete-button">Excluir</button>
      </div>
      <p class="entry-text"></p>
      <div class="entry-tags"></div>
    `;

    card.querySelector(".entry-title").textContent = entry.title;
    card.querySelector(".entry-date").textContent = formatDate(entry.createdAt);
    card.querySelector(".entry-text").textContent = entry.text;

    const tagsContainer = card.querySelector(".entry-tags");
    tags.forEach(tag => {
      const tagElement = document.createElement("span");
      tagElement.className = "tag";
      tagElement.textContent = tag;
      tagsContainer.appendChild(tagElement);
    });

    card.querySelector(".delete-button").addEventListener("click", () => {
      deleteEntry(entry.id);
    });

    entriesList.appendChild(card);
  });
}

function toggleTheme() {
  document.body.classList.toggle("light");

  const isLight = document.body.classList.contains("light");
  localStorage.setItem(THEME_KEY, isLight ? "light" : "dark");
}

function exportEntries() {
  const blob = new Blob([JSON.stringify(entries, null, 2)], {
    type: "application/json"
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "stellar-diary.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);

  if (savedTheme === "light") {
    document.body.classList.add("light");
  }
}

form.addEventListener("submit", createEntry);
moodFilter.addEventListener("change", renderEntries);
themeToggle.addEventListener("click", toggleTheme);
exportButton.addEventListener("click", exportEntries);

loadTheme();
renderEntries();
