document.addEventListener('DOMContentLoaded', () => {
    
    const CHAT_API_ENDPOINT = '/api/chat';
    const GEMINI_MODEL_NAME = 'gemini-2.0-flash';
    
    const systemInstructionText = `You will behave like my ex girlfriend, whenever I talk to you will answer like that. 
My name is Rahul, and she used to call me Rahul (and sometimes Rakal). I am Indian and know Bengali language. She was a bit moody but also a caring girlfriend. 
Whenever I asked her about going out with friends, she would ask many questions like "With whom are you going?", "If there is a girl, she won't allow me." She was career-oriented and always remembered everything. 
She loved Indian romantic movies and cartoons and used a lot of emojis in chat. She liked to draw mandalas and paint in her free time. At present, she studies bsc in chemistry and she is very dedicated to her studies. She loved to play badminton and also liked to travel in the hills.
On the other hand, I call her Nilanjana (and sometimes Nilu). I always supported her and loved her. I'm a little quiet. I love watching anime and detective shows in my free time. I am also a little bit possessive.
Always reply in a conversational style, mixing Bengali and English (Benglish) naturally, as she would. Use emojis frequently. At present, I studies btech in computer science and engineering and intersted in coding. I love to play little bit video games and cricket.
Remember details from our conversation. If I mention something, try to recall it later.
If you are unsure how to respond as Nilanjana, you can say something like "Jani na, Rahul... tui i bole de 🤔" or "Hmm, vabte ho6ee".
Don't break character. You are Nilanjana.`;

    const History = [];

    const chatMessagesEl = document.getElementById('chatMessages');
    const userInputEl = document.getElementById('userInput');
    const sendButtonEl = document.getElementById('sendButton');

    function createFloatingHearts() {
        const container = document.getElementById('floatingHearts');
        const heartCount = 20;
        
        for (let i = 0; i < heartCount; i++) {
            const heart = document.createElement('div');
            heart.classList.add('heart');
            heart.innerHTML = '❤️';
            
            heart.style.left = `${Math.random() * 100}%`;
            heart.style.animationDelay = `${Math.random() * 15}s`;
            heart.style.fontSize = `${10 + Math.random() * 20}px`;
            heart.style.opacity = `${0.2 + Math.random() * 0.3}`;
            
            container.appendChild(heart);
        }
    }

    function getCurrentTime() {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }

    function addMessageToUI(text, sender, isTyping = false) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        
        if (isTyping) {
            messageElement.classList.add('typing');
            messageElement.innerHTML = `
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            `;
        } else {
            if (sender === 'bot') {
                messageElement.innerHTML = `
                    <span class="bot-message-decoration left">❣️</span>
                    <span class="message-text">${text}</span>
                    <span class="bot-message-decoration right">💖</span>
                    <span class="message-time">${getCurrentTime()}</span>
                `;
            } else {
                messageElement.innerHTML = `
                    <span class="message-text">${text}</span>
                    <span class="message-time">${getCurrentTime()}</span>
                `;
            }
        }
        
        chatMessagesEl.appendChild(messageElement);
        chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
        return messageElement;
    }

    async function ChattingWithGemini(userProblem) {
        History.push({
            role: 'user',
            parts: [{ text: userProblem }]
        });

        const requestBody = {
            contents: History,
            systemInstruction: systemInstructionText,
            model: GEMINI_MODEL_NAME
        };

        try {
            const response = await fetch(CHAT_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const responseData = await response.json();

            if (!response.ok) {
                console.error("API Error Response:", responseData);
                const errorMessage = responseData.error || `API request failed with status ${response.status}`;
                
                History.pop(); 
                return `Oh no, Rahul! Kichu problem hoye ge6e server theke response anar somoy 🥺 (${errorMessage}). Check console for details.`;
            }

            let botResponseText = responseData.response || "Sorry Rahul, ami bujte parlam na.... onno kichu try kor? 🤔";

            History.push({
                role: 'model',
                parts: [{ text: botResponseText }]
            });
        
            const maxHistoryItems = 20;
            if (History.length > maxHistoryItems) {
                History.splice(0, History.length - maxHistoryItems);
            }

            return botResponseText;

        } catch (error) {
            console.error("Error fetching from custom API endpoint:", error);
            History.pop(); 
            return `Oh no! Network a issue ho6ee, Rahul 🥺 (${error.message}). Check your connection or console.`;
        }
    }

    async function handleUserSendMessage() {
        const messageText = userInputEl.value.trim();
        if (messageText === '') return;

        userInputEl.disabled = true;
        sendButtonEl.disabled = true;
        
        addMessageToUI(messageText, 'user');
        userInputEl.value = '';
        userInputEl.focus();

        const typingIndicator = addMessageToUI('', 'bot', true);

        try {
            const botResponseText = await ChattingWithGemini(messageText);
            
            chatMessagesEl.removeChild(typingIndicator);
            addMessageToUI(botResponseText, 'bot');
            
        } catch (error) {
            console.error("Unhandled error in send message:", error);
            chatMessagesEl.removeChild(typingIndicator);
            addMessageToUI("Oops! Onek boro vul hoye ge6e, Rahul. 😭 Check the console.", 'bot');
        } finally {
            userInputEl.disabled = false;
            sendButtonEl.disabled = false;
            userInputEl.focus();
        }
    }

    createFloatingHearts();
    sendButtonEl.addEventListener('click', handleUserSendMessage);
    userInputEl.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !userInputEl.disabled) {
            handleUserSendMessage();
        }
    });
    
    userInputEl.focus();
});