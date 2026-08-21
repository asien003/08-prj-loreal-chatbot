/* ------------------------------
   DOM elements
------------------------------ */

const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");

/*
  Replace this with the URL of your deployed
  Cloudflare Worker.

  IMPORTANT:
  There is NO OpenAI API key in this file.
*/
const WORKER_URL =
  "https://YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev/";

/* ------------------------------
   System instructions
------------------------------ */

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

/* ------------------------------
   Conversation history
------------------------------ */

const messages = [
  {
    role: "system",
    content: systemPrompt,
  },
];

/* ------------------------------
   Display a message
------------------------------ */

function addMessage(text, sender) {
  const message = document.createElement("div");

  message.classList.add("msg");
  message.classList.add(sender);

  message.textContent = text;

  chatWindow.appendChild(message);

  // Automatically scroll to the newest message.
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* ------------------------------
   Initial greeting
------------------------------ */

addMessage(
  "👋 Hello! I'm your L'Oréal Beauty Advisor. Ask me about L'Oréal products, skincare, haircare, makeup, or beauty routines.",
  "ai"
);

/* ------------------------------
   Handle form submission
------------------------------ */

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const text = userInput.value.trim();

  // Do nothing if the user submitted an empty message.
  if (!text) {
    return;
  }

  // Display the user's message.
  addMessage(text, "user");

  // Add the user's message to the conversation.
  messages.push({
    role: "user",
    content: text,
  });

  // Clear the input box.
  userInput.value = "";

  // Disable the button while waiting for the AI.
  sendBtn.disabled = true;

  addMessage("Thinking...", "ai");

  try {
    /*
      Send the conversation to the Cloudflare Worker.

      The Worker is responsible for securely communicating
      with OpenAI using its secret API key.
    */
    const response = await fetch(WORKER_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        messages: messages,
      }),
    });

    // Check whether the Worker returned an error.
    if (!response.ok) {
      throw new Error("The server returned an error.");
    }

    // Convert the response into JavaScript data.
    const data = await response.json();

    /*
      OpenAI's Chat Completions response contains
      the assistant's message here.
    */
    const reply = data.choices[0].message.content;

    // Remove the temporary "Thinking..." message.
    const thinkingMessage = chatWindow.lastElementChild;

    if (thinkingMessage) {
      thinkingMessage.remove();
    }

    // Display the AI's response.
    addMessage(reply, "ai");

    // Save the response so the chatbot remembers the conversation.
    messages.push({
      role: "assistant",
      content: reply,
    });
  } catch (error) {
    console.error(error);

    // Remove "Thinking..."
    const thinkingMessage = chatWindow.lastElementChild;

    if (thinkingMessage) {
      thinkingMessage.remove();
    }

    addMessage(
      "Sorry, I couldn't connect to the beauty advisor right now. Please try again.",
      "ai"
    );
  } finally {
    // Allow the user to send another message.
    sendBtn.disabled = false;

    // Put the cursor back in the input.
    userInput.focus();
  }
});
