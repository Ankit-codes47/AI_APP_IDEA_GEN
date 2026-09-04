const form = document.getElementById("ideaForm");
const promptInput = document.getElementById("customPrompt");
const charCount = document.getElementById("charCount");
const generateBtn = document.getElementById("generateBtn");
const btnContent = generateBtn.querySelector(".btn-content");
const btnLoading = generateBtn.querySelector(".btn-loading");
const errorBox = document.getElementById("errorBox");
const resultsSection = document.getElementById("resultsSection");
const resultContent = document.getElementById("resultContent");
const copyBtn = document.getElementById("copyBtn");
const newIdeaBtn = document.getElementById("newIdeaBtn");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
const toast = document.getElementById("toast");

let lastIdeaText = "";
let isGenerating = false;

init();

function init() {
  promptInput.addEventListener("input", updateCharCount);

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      promptInput.value = chip.dataset.prompt;
      updateCharCount();
      promptInput.focus();
    });
  });

  form.addEventListener("submit", handleSubmit);
  copyBtn.addEventListener("click", handleCopy);
  newIdeaBtn.addEventListener("click", scrollToGenerator);
  navToggle.addEventListener("click", toggleNav);

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        closeNav();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  document.addEventListener("click", (e) => {
    if (
      navLinks.classList.contains("open") &&
      !navLinks.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      closeNav();
    }
  });
}

function updateCharCount() {
  charCount.textContent = promptInput.value.length;
}

async function handleSubmit(e) {
  e.preventDefault();

  if (isGenerating) return;

  const prompt = promptInput.value.trim();
  if (!prompt) {
    showError("Please describe what you want to build.");
    promptInput.focus();
    return;
  }

  hideError();
  setLoading(true);

  try {
    const res = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customPrompt: prompt }),
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error || "Something went wrong. Please try again.");
    }

    lastIdeaText = data.idea;
    renderResult(data.idea);
    resultsSection.classList.remove("hidden");
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

async function handleCopy() {
  if (!lastIdeaText) return;

  try {
    await navigator.clipboard.writeText(lastIdeaText);
    copyBtn.classList.add("copied");
    copyBtn.querySelector("span").textContent = "Copied!";
    showToast("Idea copied to clipboard", "success");
    setTimeout(() => {
      copyBtn.classList.remove("copied");
      copyBtn.querySelector("span").textContent = "Copy Idea";
    }, 2500);
  } catch {
    showToast("Could not copy to clipboard", "error");
  }
}

function scrollToGenerator() {
  document.getElementById("generator").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => promptInput.focus(), 400);
}

function toggleNav() {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", isOpen);
}

function closeNav() {
  navLinks.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
}

function setLoading(loading) {
  isGenerating = loading;
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

function showToast(message, type = "") {
  toast.textContent = message;
  toast.className = "toast";
  if (type) toast.classList.add(type);
  toast.classList.remove("hidden");

  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

function renderResult(text) {
  resultContent.innerHTML = formatIdeaText(text);
}

function formatIdeaText(text) {
  const lines = text.split("\n");
  let html = "";
  let inList = false;

  const closeList = () => {
    if (inList) {
      html += "</ul>";
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      closeList();
      continue;
    }

    const isHeading = /^(?:\d+\.\s*)?.+:$/.test(line) && line.length < 80;
    const isListItem = /^[-•*]\s/.test(line) || /^\d+\.\s/.test(line);

    if (isHeading) {
      closeList();
      html += `<p class="result-heading">${escapeHtml(line.replace(/:$/, ""))}</p>`;
    } else if (isListItem) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      const item = line.replace(/^[-•*]\s*/, "").replace(/^\d+\.\s*/, "");
      html += `<li>${escapeHtml(item)}</li>`;
    } else {
      closeList();
      html += `<p>${escapeHtml(line)}</p>`;
    }
  }

  closeList();
  return html || `<p>${escapeHtml(text)}</p>`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
