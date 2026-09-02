const form = document.getElementById("ideaForm");
const promptInput = document.getElementById("customPrompt");
const charCount = document.getElementById("charCount");
const generateBtn = document.getElementById("generateBtn");
const btnContent = generateBtn.querySelector(".btn-content");
const btnLoading = generateBtn.querySelector(".btn-loading");
const errorBox = document.getElementById("errorBox");
const resultsSection = document.getElementById("resultsSection");
const resultsGrid = document.getElementById("resultsGrid");
const copyBtn = document.getElementById("copyBtn");
const newIdeaBtn = document.getElementById("newIdeaBtn");

let lastIdeaText = "";

const SECTION_CONFIG = [
  { keys: ["app name", "name"], label: "App Name", icon: "🚀", hero: true, accent: "#ff6bcb" },
  { keys: ["one-line description", "description", "one line"], label: "One-line Description", icon: "💡", accent: "#a855f7" },
  { keys: ["target audience", "audience"], label: "Target Audience", icon: "👥", accent: "#22d3ee" },
  { keys: ["core features", "features", "key features"], label: "Core Features", icon: "⚡", accent: "#a3e635", list: true },
  { keys: ["unique value proposition", "value proposition", "uvp"], label: "Unique Value Proposition", icon: "💎", accent: "#fb923c", fullWidth: true },
  { keys: ["monetization strategy", "monetization", "revenue"], label: "Monetization Strategy", icon: "💰", accent: "#f472b6" },
  { keys: ["technology stack", "tech stack", "technology"], label: "Technology Stack", icon: "🛠️", accent: "#818cf8" },
];

promptInput.addEventListener("input", () => {
  charCount.textContent = promptInput.value.length;
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    promptInput.value = chip.dataset.prompt;
    charCount.textContent = promptInput.value.length;
    promptInput.focus();
  });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();
  setLoading(true);

  try {
    const res = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customPrompt: promptInput.value.trim() }),
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error || "Something went wrong");
    }

    lastIdeaText = data.idea;
    renderResults(parseIdea(data.idea));
    resultsSection.classList.remove("hidden");
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
});

copyBtn.addEventListener("click", async () => {
  if (!lastIdeaText) return;

  try {
    await navigator.clipboard.writeText(lastIdeaText);
    copyBtn.classList.add("copied");
    copyBtn.querySelector("span").textContent = "Copied!";
    setTimeout(() => {
      copyBtn.classList.remove("copied");
      copyBtn.querySelector("span").textContent = "Copy";
    }, 2000);
  } catch {
    showError("Could not copy to clipboard");
  }
});

newIdeaBtn.addEventListener("click", () => {
  promptInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

function setLoading(loading) {
  generateBtn.disabled = loading;
  btnContent.classList.toggle("hidden", loading);
  btnLoading.classList.toggle("hidden", !loading);
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function hideError() {
  errorBox.classList.add("hidden");
}

function parseIdea(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const sections = [];
  let current = null;

  for (const line of lines) {
    const match = line.match(/^(?:\d+\.\s*)?(.+?):\s*(.*)$/i);

    if (match) {
      const heading = match[1].trim().toLowerCase();
      const content = match[2].trim();
      const config = SECTION_CONFIG.find((s) =>
        s.keys.some((k) => heading.includes(k))
      );

      if (config) {
        if (current) sections.push(current);
        current = { ...config, value: content };
        continue;
      }
    }

    if (current) {
      current.value += (current.value ? "\n" : "") + line;
    }
  }

  if (current) sections.push(current);

  if (sections.length === 0) {
    return [{ label: "Your App Idea", icon: "✨", value: text, hero: true, accent: "#a855f7" }];
  }

  return sections;
}

function renderResults(sections) {
  resultsGrid.innerHTML = "";

  sections.forEach((section, i) => {
    const card = document.createElement("article");
    card.className = "result-card";
    card.style.setProperty("--card-accent", section.accent);
    card.style.animationDelay = `${i * 0.08}s`;

    if (section.hero) card.classList.add("hero-card");
    if (section.fullWidth) card.classList.add("full-width");

    const icon = document.createElement("span");
    icon.className = "card-icon";
    icon.textContent = section.icon;

    const label = document.createElement("div");
    label.className = "card-label";
    label.textContent = section.label;

    const value = document.createElement("div");
    value.className = "card-value";

    if (section.list) {
      value.innerHTML = formatAsList(section.value);
    } else {
      value.textContent = section.value;
    }

    if (!section.hero) card.appendChild(icon);
    card.appendChild(label);
    card.appendChild(value);
    resultsGrid.appendChild(card);
  });
}

function formatAsList(text) {
  const items = text
    .split(/\n|(?:^|\s)(?:[-•*]|\d+\.)\s/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (items.length <= 1) {
    return `<p>${escapeHtml(text)}</p>`;
  }

  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
