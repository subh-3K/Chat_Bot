
const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");

const API_KEY = "AIzaSyCERVo0uGFqICBnnT_BMA75w_WSio11E-Q";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

let userMessage = "";
let chatHistory = [];


// Function to create chat message elements
const createMsgElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("msg", ...classes);
    div.innerHTML = content;
    return div;
};


//typing effect
 const typingEffect=(text,textElement,botMsgDiv)=>{
    textElement.textContent="";
    const words=text.split(" ");
    let wordIndex=0;
    const typingInterval= setInterval(()=>{
        if(wordIndex <words.length ){
            textElement.textContent+=(wordIndex===0? "":" ")+words[wordIndex++];
            botMsgDiv.classList.remove("loading")
        }else{
            clearInterval(typingInterval);
        }
    },40);
 };


// Make the API call and update bot message
const generateResponse = async (botMsgDiv) => {
    const textElement = botMsgDiv.querySelector(".msg-text");

    // Add user message to history
    chatHistory.push({
        role: "user",
        parts: [{ text: userMessage }]
    });

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: chatHistory })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error?.message || "Unknown API error");

        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text
            ?.replace(/\*\*([^*]+)\*\*/g, "$1")
            .trim() || "No response";

        // Add model message to chat history
        chatHistory.push({
            role: "model",
            parts: [{ text: responseText }]
        });

        // Update DOM
       // textElement.textContent = responseText;
       typingEffect(responseText,textElement,botMsgDiv);
        botMsgDiv.classList.remove("loading");

    } catch (error) {
        console.error("Error:", error.message);
        textElement.textContent = "Error: " + error.message;
        botMsgDiv.classList.remove("loading");
    }
};

// Handle form submit
const handleFormSubmission = (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();
    if (!userMessage) return;
    promptInput.value = "";

    // User message DOM
    const userMsgHtml = `<p class="msg-text"></p>`;
    const userMsgDiv = createMsgElement(userMsgHtml, "user-msg");
    userMsgDiv.querySelector(".msg-text").textContent = userMessage;
    chatsContainer.appendChild(userMsgDiv);

    setTimeout(() => {
        // Bot message DOM
        const botMsgHtml = `<img src="gemini-color.svg" class="avatar"><p class="msg-text">Just a sec...</p>`;
        const botMsgDiv = createMsgElement(botMsgHtml, "bot-msg", "loading");
        chatsContainer.appendChild(botMsgDiv);
        generateResponse(botMsgDiv); 
    }, 600);
};

promptForm.addEventListener("submit", handleFormSubmission);
