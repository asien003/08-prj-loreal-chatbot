

const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");


const WORKER_URL =
  "https://08-prj-loreal-chatbot.asien003.workers.dev/";



const systemPrompt = `
You are L'Oréal Beauty Advisor, a friendly and helpful beauty assistant.

Only answer questions related to:
- L'Oréal products
- L'Oréal beauty routines
- skincare
- haircare
- makeup
- beauty product recommendations
- beauty-related questions that help the user choose or use L'Oréal products

If the user asks about something unrelated to L'Oréal or beauty, politely refuse and redirect them.

For example:
"I'm here to help with L'Oréal products, beauty routines, and recommendations. What would you like help with?"

Do not pretend to know information that you do not know.
Do not invent product ingredients, prices, availability, or medical claims.

Keep answers clear, friendly, and reasonably concise.
`;

const messages = [
  {
    role: "system",
    content: systemPrompt,
  },
];

function addMessage(text, sender) {
  const message = document.createElement("div");

  message.classList.add("msg");
  message.classList.add(sender);

  message.textContent = text;

  chatWindow.appendChild(message);

  chatWindow.scrollTop = chatWindow.scrollHeight;
}

addMessage(
  "Hi, I'm your L'Oréal Beauty Advisor. Ask me anything about L'Oréal products, skincare, haircare, makeup, or beauty routines.",
  "ai"
);


chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const text = userInput.value.trim();

  if (!text) {
    return;
  }

  addMessage(text, "user");

  messages.push({
    role: "user",
    content: text,
  });

  userInput.value = "";

  sendBtn.disabled = true;

  addMessage("Thinking...", "ai");

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        messages: messages,
      }),
    });

    if (!response.ok) {
      throw new Error("The server returned an error.");
    }

    const data = await response.json();

    const reply = data.choices[0].message.content;

    const thinkingMessage = chatWindow.lastElementChild;

    if (thinkingMessage) {
      thinkingMessage.remove();
    }

    addMessage(reply, "ai");

    messages.push({
      role: "assistant",
      content: reply,
    });
  } catch (error) {
    console.error(error);

    const thinkingMessage = chatWindow.lastElementChild;

    if (thinkingMessage) {
      thinkingMessage.remove();
    }
    addMessage(
      "Sorry, I couldn't connect to the beauty advisor right now. Please try again.",
      "ai"
    );
  } finally {
    sendBtn.disabled = false;

    userInput.focus();
  }
});
