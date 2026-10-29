const API_URL = ""; // Backend deploy pannina piragu URL add pannuvom.

const chatBox = document.querySelector("#chatMessages");
const input = document.querySelector("#messageInput");
const sendButton = document.querySelector("#sendButton");
const modelSelect = document.querySelector("#modelSelect");
const welcomeScreen = document.querySelector("#welcomeScreen");
const newChatButton = document.querySelector("#newChatButton");

let conversation = [];
let isLoading = false;

function addMessage(role, content) {
  const message = document.createElement("div");
  message.className = `message ${role}`;

  const label = document.createElement("div");
  label.className = "message-role";
  label.textContent = role === "user" ? "You" : "VISHU AI";

  const text = document.createElement("div");
  text.className = "message-content";
  text.textContent = content;

  message.append(label, text);
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;

  return message;
}

function showWelcome(show) {
  if (welcomeScreen) {
    welcomeScreen.style.display = show ? "" : "none";
  }
}

function setLoading(loading) {
  isLoading = loading;
  sendButton.disabled = loading;
  sendButton.textContent = loading ? "..." : "Send";
}

async function sendMessage() {
  const message = input.value.trim();

  if (!message || isLoading) return;

  if (!API_URL) {
    addMessage(
      "assistant",
      "VISHU AI frontend ready! Backend connect pannina piragu real AI response varum."
    );
    return;
  }

  showWelcome(false);
  addMessage("user", message);

  conversation.push({ role: "user", content: message });
  input.value = "";
  input.style.height = "auto";

  const model = modelSelect?.value || "auto";

  setLoading(true);

  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: conversation,
        model
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "AI request failed");
    }

    const reply = data.reply || "AI response empty-ah irukku.";
    addMessage("assistant", reply);
    conversation.push({ role: "assistant", content: reply });
  } catch (error) {
    addMessage(
      "assistant",
      `Error: ${error.message}. Backend URL and server status check pannu.`
    );
  } finally {
    setLoading(false);
  }
}

sendButton?.addEventListener("click", sendMessage);

input?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

input?.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 160)}px`;
});

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    input.value = button.dataset.prompt || button.textContent.trim();
    input.focus();
  });
});

newChatButton?.addEventListener("click", () => {
  conversation = [];
  chatBox.replaceChildren();
  input.value = "";
  showWelcome(true);
  input.focus();
});
