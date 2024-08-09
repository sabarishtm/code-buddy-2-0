(function() {
    const vscode = acquireVsCodeApi();
    const chatContainer = document.getElementById('chat-container');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    function addMessage(content, isUser) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', isUser ? 'user-message' : 'assistant-message');
        messageElement.textContent = content;
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    sendButton.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            addMessage(message, true);
            vscode.postMessage({ type: 'userMessage', content: message });
            messageInput.value = '';
        }
    });

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });

    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.type) {
            case 'assistantMessage':
                addMessage(message.content, false);
                break;
        }
    });
})();