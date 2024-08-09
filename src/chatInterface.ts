import * as vscode from 'vscode';
import * as path from 'path';
import { OllamaService } from './ollamaService';

export class ChatInterface {
    private panel: vscode.WebviewPanel | undefined;
    private context: vscode.ExtensionContext;
    private ollamaService: OllamaService;

    constructor(context: vscode.ExtensionContext, ollamaService: OllamaService) {
        this.context = context;
        this.ollamaService = ollamaService;
    }

    public openChatView() {
        if (this.panel) {
            this.panel.reveal();
        } else {
            this.panel = vscode.window.createWebviewPanel(
                'codeBuddyChat',
                'Code Buddy Chat',
                vscode.ViewColumn.Beside,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'media'))]
                }
            );

            this.panel.webview.html = this.getWebviewContent();

            this.panel.webview.onDidReceiveMessage(
                async message => {
                    switch (message.type) {
                        case 'userMessage':
                            await this.handleUserMessage(message.content);
                            break;
                    }
                },
                undefined,
                this.context.subscriptions
            );

            this.panel.onDidDispose(
                () => {
                    this.panel = undefined;
                },
                null,
                this.context.subscriptions
            );
        }
    }

    private async handleUserMessage(content: string) {
        try {
            const response = await this.ollamaService.generateCompletion(content);
            this.sendMessageToWebview(response);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.sendErrorToWebview(`Error processing message: ${errorMessage}`);
        }
    }

    public async explainCode(code: string) {
        try {
            const explanation = await this.ollamaService.explainCode(code);
            this.sendMessageToWebview("Code Explanation:\n\n" + explanation);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.sendErrorToWebview(`Error explaining code: ${errorMessage}`);
        }
    }

    public async debugCode(code: string) {
        try {
            const debugInfo = await this.ollamaService.generateCompletion(`Debug the following code and provide suggestions:\n\n${code}`);
            this.sendMessageToWebview("Debugging Information:\n\n" + debugInfo);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.sendErrorToWebview(`Error debugging code: ${errorMessage}`);
        }
    }

    public async generateTestCases(code: string) {
        try {
            const testCases = await this.ollamaService.generateTestCases(code);
            this.sendMessageToWebview("Generated Test Cases:\n\n" + testCases);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.sendErrorToWebview(`Error generating test cases: ${errorMessage}`);
        }
    }

    private sendMessageToWebview(content: string) {
        if (this.panel) {
            this.panel.webview.postMessage({ type: 'assistantMessage', content });
        } else {
            this.openChatView();
            setTimeout(() => this.sendMessageToWebview(content), 100);
        }
    }

    private sendErrorToWebview(errorMessage: string) {
        if (this.panel) {
            this.panel.webview.postMessage({ type: 'errorMessage', content: errorMessage });
        } else {
            this.openChatView();
            setTimeout(() => this.sendErrorToWebview(errorMessage), 100);
        }
    }

    private getWebviewContent(): string {
        const nonce = this.getNonce();

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${this.panel?.webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
    <title>Code Buddy Chat</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            margin: 0;
            padding: 0;
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
        }
        #chat-container {
            height: calc(100vh - 60px);
            overflow-y: auto;
            padding: 10px;
        }
        #input-container {
            display: flex;
            padding: 10px;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: var(--vscode-editor-background);
        }
        #message-input {
            flex: 1;
            margin-right: 10px;
            padding: 5px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
        }
        #send-button {
            padding: 5px 10px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            cursor: pointer;
        }
        .message {
            margin-bottom: 10px;
            padding: 5px 10px;
            border-radius: 5px;
        }
        .user-message {
            background-color: var(--vscode-textBlockQuote-background);
            align-self: flex-end;
        }
        .assistant-message {
            background-color: var(--vscode-editor-lineHighlightBackground);
            align-self: flex-start;
        }
        .error-message {
            background-color: var(--vscode-inputValidation-errorBackground);
            color: var(--vscode-inputValidation-errorForeground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
        }
    </style>
</head>
<body>
    <div id="chat-container"></div>
    <div id="input-container">
        <input type="text" id="message-input" placeholder="Type your message...">
        <button id="send-button">Send</button>
    </div>
    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        const chatContainer = document.getElementById('chat-container');
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');

        function addMessage(content, type) {
            const messageElement = document.createElement('div');
            
            messageElement.classList.add('message', '{type}-message');
            messageElement.textContent = content;
            chatContainer.appendChild(messageElement);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        sendButton.addEventListener('click', () => {
            const message = messageInput.value.trim();
            if (message) {
                addMessage(message, 'user');
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
                    addMessage(message.content, 'assistant');
                    break;
                case 'errorMessage':
                    addMessage(message.content, 'error');
                    break;
            }
        });
    </script>
</body>
</html>`;
    }

    private getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}