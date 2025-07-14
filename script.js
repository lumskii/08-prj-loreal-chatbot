/* ----------  Helper Functions ---------- */
// Simple query selector helper
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [
  ...parent.querySelectorAll(selector),
];

/* ----------  State Management ---------- */
let state = {
  isChatOpen: false,
  isPageLoaded: false,
  currentSlide: 0,
  messages: [
    {
      id: 1,
      text: "Hi there! I'm Beauty Genius, your AI beauty assistant. What's your name, and how can I help you today?",
      sender: "ai",
    },
  ],
  // Conversation context tracking
  conversationContext: {
    userName: null,
    skinType: null,
    skinConcerns: [],
    preferredBrands: [],
    previousRecommendations: [],
    conversationHistory: [],
  },
};

/* ----------  Product Data ---------- */
// Product data for the carousel
const products = [
  {
    id: 1,
    name: "Revitalift Filler Hyaluronic Acid Serum",
    image:
      "https://images.unsplash.com/photo-1617897903246-719242758050?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80",
    price: "$29.99",
    description:
      "Pure hyaluronic acid serum that plumps skin and reduces wrinkles.",
  },
  {
    id: 2,
    name: "Color Riche Matte Lipstick",
    image:
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2015&q=80",
    price: "$12.99",
    description: "Intensely rich color with a comfortable matte finish.",
  },
  {
    id: 3,
    name: "Elvive Total Repair 5 Shampoo",
    // Use local shampoo.jpg image
    image: "img/shampoo.jpg",
    price: "$8.99",
    description: "Repairs damaged hair with pro-keratin and ceramide.",
  },
];

/* ----------  Initialization ---------- */
document.addEventListener("DOMContentLoaded", () => {
  // Initialize page components
  initializePage();
  initializeCarousel();
  initializeChat();

  // Set page as loaded
  setTimeout(() => {
    state.isPageLoaded = true;
    showHeroText();
  }, 100);

  // Set current year in footer
  const yearElement = $("#currentYear");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});

/* ----------  Page Initialization ---------- */
function initializePage() {
  // Add fade-in animation to hero text
  const heroText = $("#heroText");
  if (heroText) {
    heroText.classList.add("animate");
  }
}

function showHeroText() {
  const heroText = $("#heroText");
  if (heroText) {
    heroText.classList.add("visible");
  }
}

/* ----------  Product Carousel ---------- */
function initializeCarousel() {
  const carouselTrack = $("#carouselTrack");
  const carouselDots = $("#carouselDots");
  const prevBtn = $("#prevBtn");
  const nextBtn = $("#nextBtn");

  if (!carouselTrack || !carouselDots) return;

  // Build product slides
  carouselTrack.innerHTML = products
    .map(
      (product) => `
    <div class="product-slide">
      <div class="product-card">
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}" />
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <p class="product-price">${product.price}</p>
          <button class="btn-primary">Shop Now</button>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  // Build dots
  carouselDots.innerHTML = products
    .map(
      (_, index) => `
    <button class="carousel-dot" data-slide="${index}" aria-label="Go to slide ${
        index + 1
      }"></button>
  `
    )
    .join("");

  // Add event listeners
  if (prevBtn) {
    prevBtn.addEventListener("click", () => previousSlide());
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => nextSlide());
  }

  // Add dot click handlers
  $$(".carousel-dot").forEach((dot, index) => {
    dot.addEventListener("click", () => goToSlide(index));
  });

  // Initialize first slide
  updateCarousel();
}

function nextSlide() {
  state.currentSlide = (state.currentSlide + 1) % products.length;
  updateCarousel();
}

function previousSlide() {
  state.currentSlide =
    state.currentSlide === 0 ? products.length - 1 : state.currentSlide - 1;
  updateCarousel();
}

function goToSlide(index) {
  state.currentSlide = index;
  updateCarousel();
}

function updateCarousel() {
  const carouselTrack = $("#carouselTrack");
  const dots = $$(".carousel-dot");

  if (carouselTrack) {
    carouselTrack.style.transform = `translateX(-${state.currentSlide * 100}%)`;
  }

  // Update active dot
  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === state.currentSlide);
  });
}

/* ----------  Chat Functionality ---------- */
function initializeChat() {
  const openChatBtn = $("#openChatBtn");
  const closeChatBtn = $("#closeChatBtn");
  const chatInput = $("#chatInput");
  const sendBtn = $("#sendBtn");

  // Add event listeners
  if (openChatBtn) {
    openChatBtn.addEventListener("click", openChat);
  }

  if (closeChatBtn) {
    closeChatBtn.addEventListener("click", closeChat);
  }

  if (sendBtn) {
    sendBtn.addEventListener("click", sendMessage);
  }

  if (chatInput) {
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendMessage();
      }
    });
  }

  // Render initial messages
  renderMessages();
}

function openChat() {
  const chatModal = $("#chatModal");
  if (chatModal) {
    state.isChatOpen = true;
    chatModal.classList.add("visible");

    // Focus on input after animation
    setTimeout(() => {
      const chatInput = $("#chatInput");
      if (chatInput) {
        chatInput.focus();
      }
    }, 300);
  }
}

function closeChat() {
  const chatModal = $("#chatModal");
  if (chatModal) {
    state.isChatOpen = false;
    chatModal.classList.remove("visible");
  }
}

async function sendMessage() {
  const chatInput = $("#chatInput");
  if (!chatInput) return;

  const messageText = chatInput.value.trim();
  if (!messageText) return;

  // Add user message to state
  const userMessage = {
    id: state.messages.length + 1,
    text: messageText,
    sender: "user",
  };

  state.messages.push(userMessage);

  // Update conversation context with user's message
  updateConversationContext(messageText);

  chatInput.value = "";

  // Re-render messages
  renderMessages();

  // Add typing indicator
  showTypingIndicator();

  try {
    // Call OpenAI API with conversation context
    const aiResponse = await callOpenAI(messageText, state.conversationContext);

    // Remove typing indicator
    hideTypingIndicator();

    const aiMessage = {
      id: state.messages.length + 1,
      text: aiResponse,
      sender: "ai",
    };

    state.messages.push(aiMessage);

    // Update context with AI response for future reference
    updateContextFromAIResponse(aiResponse);

    renderMessages();
  } catch (error) {
    console.error("Error calling Cloudflare Worker:", error);

    // Remove typing indicator
    hideTypingIndicator();

    // Provide context-aware fallback responses
    let fallbackResponse;

    if (state.conversationContext.userName) {
      fallbackResponse = `Sorry ${state.conversationContext.userName}, I'm having trouble connecting right now. But I'm still here to help with your beauty needs! What would you like to know about L'Oréal products?`;
    } else if (messageText.toLowerCase().includes("name")) {
      fallbackResponse =
        "I'm having connection issues, but I'd love to help you with beauty recommendations! What's your main skincare or makeup concern?";
    } else if (messageText.toLowerCase().includes("skin")) {
      fallbackResponse =
        "I'm experiencing some technical difficulties, but for general skincare, I'd recommend checking out our Revitalift line for anti-aging or Hydra Genius for hydration. What specific skin concerns do you have?";
    } else if (
      messageText.toLowerCase().includes("makeup") ||
      messageText.toLowerCase().includes("lipstick")
    ) {
      fallbackResponse =
        "Connection issues on my end! For makeup, our Color Riche lipsticks are amazing - they come in over 40 shades. Are you looking for a specific color or finish?";
    } else if (messageText.toLowerCase().includes("hair")) {
      fallbackResponse =
        "Technical troubles here, but I can still help! For hair care, our Elvive line is fantastic. Are you dealing with damaged, dry, or oily hair?";
    } else {
      fallbackResponse =
        "I'm having trouble connecting right now, but I'm here to help with your beauty needs! Feel free to ask about skincare, makeup, or haircare products.";
    }

    const aiMessage = {
      id: state.messages.length + 1,
      text: fallbackResponse,
      sender: "ai",
    };

    state.messages.push(aiMessage);
    renderMessages();
  }
}

function renderMessages() {
  const chatMessages = $("#chatMessages");
  if (!chatMessages) return;

  chatMessages.innerHTML = state.messages
    .map(
      (message) => `
    <div class="message-wrapper ${message.sender}">
      <div class="message-bubble ${message.sender}">
        <div class="message-text">
          ${message.sender === 'ai' ? formatChatResponse(message.text) : message.text}
        </div>
        <div class="message-time">${new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}</div>
      </div>
    </div>
  `
    )
    .join("");

  // Add context indicator if we have user information
  if (
    state.conversationContext.userName ||
    state.conversationContext.skinType ||
    state.conversationContext.skinConcerns.length > 0
  ) {
    const contextIndicator = document.createElement("div");
    contextIndicator.className = "context-indicator";
    contextIndicator.innerHTML = `
      <div class="context-info">
        <small>💡 I'm remembering our conversation to give you better recommendations!</small>
      </div>
    `;
    chatMessages.appendChild(contextIndicator);
  }

  // Auto-scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/* ----------  OpenAI API Integration via Cloudflare Worker ---------- */
async function callOpenAI(userMessage, conversationContext) {
  // Create a context-aware system prompt
  let systemPrompt = `You are Beauty Genius, L'Oréal's AI beauty assistant. You ONLY help customers with beauty-related topics including:
  - Product recommendations for skincare, makeup, haircare, and fragrance
  - Beauty routine advice and tips
  - Ingredient information and benefits
  - Color matching and shade selection
  - Application techniques
  - Skin concerns and solutions
  - Hair care and styling advice
  - Makeup application tips
  
  IMPORTANT: If a user asks about topics unrelated to beauty, skincare, makeup, haircare, or L'Oréal products, politely decline and redirect them back to beauty topics.
  
  Always be helpful, friendly, and knowledgeable about L'Oréal products. Keep responses concise but informative. Focus on L'Oréal brands like Revitalift, Color Riche, Elvive, Hydra Genius, and others.`;

  // Add context information to the system prompt if available
  if (conversationContext.userName) {
    systemPrompt += `\n\nUser's name: ${conversationContext.userName}`;
  }
  if (conversationContext.skinType) {
    systemPrompt += `\nUser's skin type: ${conversationContext.skinType}`;
  }
  if (conversationContext.skinConcerns.length > 0) {
    systemPrompt += `\nUser's skin concerns: ${conversationContext.skinConcerns.join(
      ", "
    )}`;
  }
  if (conversationContext.previousRecommendations.length > 0) {
    systemPrompt += `\nPreviously recommended products: ${conversationContext.previousRecommendations.join(
      ", "
    )}`;
  }

  // Build the messages array in OpenAI format
  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },
  ];

  // Add recent conversation history (last 6 messages for context)
  const recentMessages = state.messages.slice(-6);
  recentMessages.forEach((msg) => {
    if (msg.sender === "user") {
      messages.push({
        role: "user",
        content: msg.text,
      });
    } else if (msg.sender === "ai") {
      messages.push({
        role: "assistant",
        content: msg.text,
      });
    }
  });

  // Add the current user message
  messages.push({
    role: "user",
    content: userMessage,
  });

  try {
    const response = await fetch(
      "https://chatbot-worker.lumi8866.workers.dev/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages, // This matches what your Cloudflare Worker expects
        }),
      }
    );

    if (!response.ok) {
      console.error(`HTTP Error: ${response.status} ${response.statusText}`);
      throw new Error(`Worker responded with status ${response.status}`);
    }

    const data = await response.json();
    console.log("Worker response:", data); // Debug log

    // Extract the AI response from OpenAI's response format
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }

    // Fallback if response format is unexpected
    return (
      data.response ||
      data.message ||
      data.text ||
      "I'm here to help with your beauty needs!"
    );
  } catch (error) {
    console.error("Detailed error:", error);
    throw error; // Re-throw to trigger fallback
  }
}

function showTypingIndicator() {
  const chatMessages = $("#chatMessages");
  if (!chatMessages) return;

  // Create typing indicator element
  const typingIndicator = document.createElement("div");
  typingIndicator.id = "typingIndicator";
  typingIndicator.className = "message-wrapper ai";
  typingIndicator.innerHTML = `
    <div class="message-bubble ai typing">
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;

  chatMessages.appendChild(typingIndicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
  const typingIndicator = $("#typingIndicator");
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

/* ----------  Conversation Context Management ---------- */
function updateConversationContext(userMessage) {
  const message = userMessage.toLowerCase();

  // Extract name if user introduces themselves
  const namePatterns = [
    /my name is (\w+)/i,
    /i'm (\w+)/i,
    /i am (\w+)/i,
    /call me (\w+)/i,
    /this is (\w+)/i,
  ];

  for (const pattern of namePatterns) {
    const match = userMessage.match(pattern);
    if (match && match[1] && !state.conversationContext.userName) {
      state.conversationContext.userName = match[1];
      break;
    }
  }

  // Extract skin type mentions
  const skinTypes = [
    "oily",
    "dry",
    "combination",
    "sensitive",
    "normal",
    "acne-prone",
  ];
  for (const skinType of skinTypes) {
    if (message.includes(skinType) && !state.conversationContext.skinType) {
      state.conversationContext.skinType = skinType;
      break;
    }
  }

  // Extract skin concerns
  const concerns = [
    "acne",
    "wrinkles",
    "dark spots",
    "pores",
    "aging",
    "dullness",
    "redness",
    "blackheads",
    "fine lines",
  ];
  for (const concern of concerns) {
    if (
      message.includes(concern) &&
      !state.conversationContext.skinConcerns.includes(concern)
    ) {
      state.conversationContext.skinConcerns.push(concern);
    }
  }

  // Add to conversation history
  state.conversationContext.conversationHistory.push({
    type: "user",
    message: userMessage,
    timestamp: new Date().toISOString(),
  });

  // Keep only last 10 conversation turns
  if (state.conversationContext.conversationHistory.length > 10) {
    state.conversationContext.conversationHistory =
      state.conversationContext.conversationHistory.slice(-10);
  }
}

function updateContextFromAIResponse(aiResponse) {
  const response = aiResponse.toLowerCase();

  // Extract product recommendations mentioned by AI
  const products = [
    "revitalift",
    "color riche",
    "elvive",
    "hydra genius",
    "true match",
    "infallible",
  ];
  for (const product of products) {
    if (
      response.includes(product) &&
      !state.conversationContext.previousRecommendations.includes(product)
    ) {
      state.conversationContext.previousRecommendations.push(product);
    }
  }

  // Add AI response to conversation history
  state.conversationContext.conversationHistory.push({
    type: "ai",
    message: aiResponse,
    timestamp: new Date().toISOString(),
  });

  // Keep only last 10 conversation turns
  if (state.conversationContext.conversationHistory.length > 10) {
    state.conversationContext.conversationHistory =
      state.conversationContext.conversationHistory.slice(-10);
  }
}

function getContextSummary() {
  const context = state.conversationContext;
  let summary = "User context: ";

  if (context.userName) {
    summary += `Name: ${context.userName}. `;
  }

  if (context.skinType) {
    summary += `Skin type: ${context.skinType}. `;
  }

  if (context.skinConcerns.length > 0) {
    summary += `Concerns: ${context.skinConcerns.join(", ")}. `;
  }

  if (context.previousRecommendations.length > 0) {
    summary += `Previously recommended: ${context.previousRecommendations.join(
      ", "
    )}. `;
  }

  return summary;
}

/* ----------  Text Formatting Functions ---------- */
function formatChatResponse(text) {
  // Clean up the text first
  let formatted = text.trim();
  
  // Handle numbered lists with bold titles (1. **Title**: Description)
  formatted = formatted.replace(/(\d+)\.\s*\*\*(.*?)\*\*:\s*(.*?)(?=(?:\d+\.|\n\n|$))/gs, 
    '<div class="response-item"><span class="item-number">$1.</span><span class="item-title">$2:</span><span class="item-description">$3</span></div>');
  
  // Handle simple numbered lists (1. Description)
  formatted = formatted.replace(/(\d+)\.\s+([^<\n].*?)(?=(?:\d+\.|\n\n|$))/gs, 
    '<div class="response-item"><span class="item-number">$1.</span><span class="item-content">$2</span></div>');
  
  // Handle remaining bold text (**text**)
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Handle bullet points (- or •)
  formatted = formatted.replace(/^[-•]\s+(.+?)(?=\n[-•]|\n\n|$)/gm, 
    '<div class="response-bullet"><span class="bullet-point">•</span><span class="bullet-content">$1</span></div>');
  
  // Handle line breaks - preserve double breaks, convert single breaks to spaces within items
  formatted = formatted.replace(/\n\n+/g, '<div class="response-break"></div>');
  formatted = formatted.replace(/\n(?!<)/g, ' ');
  
  // Clean up any multiple spaces
  formatted = formatted.replace(/\s+/g, ' ');
  
  // Wrap the formatted content
  return `<div class="formatted-response">${formatted}</div>`;
}

/* ----------  Utility Functions ---------- */
// Close chat modal when clicking outside
document.addEventListener("click", (e) => {
  const chatModal = $("#chatModal");
  const chatContainer = $("#chatContainer");

  if (chatModal && chatContainer && state.isChatOpen) {
    if (e.target === chatModal && !chatContainer.contains(e.target)) {
      closeChat();
    }
  }
});

// Handle escape key to close chat
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && state.isChatOpen) {
    closeChat();
  }
});
