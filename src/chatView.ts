import * as vscode from 'vscode';

export class ChatView {
    private panel: vscode.WebviewPanel;
    private disposables: vscode.Disposable[] = [];

    constructor(extensionUri: vscode.Uri) {
        this.panel = vscode.window.createWebviewPanel(
            'codeBuddyChat',
            'Code Buddy Chat',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
            }
        );

        this.panel.webview.html = this.getWebviewContent(this.panel.webview, extensionUri);

        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

        this.panel.webview.onDidReceiveMessage(
            message => {
                switch (message.type) {
                    case 'userMessage':
                        this.handleUserMessage(message.content);
                        break;
                }
            },
            null,
            this.disposables
        );
    }

    private handleUserMessage(content: string) {
        // TODO: Implement logic to process user message and generate response
        // For now, we'll just echo the message back
        this.sendMessage(`Echo: ${content}`);
    }

    public sendMessage(content: string) {
        this.panel.webview.postMessage({ type: 'assistantMessage', content });
    }

    public dispose() {
        this.panel.dispose();
        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    private getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'chatView.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'chatView.css'));

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Buddy Chat</title>
    <link rel="stylesheet" href="${styleUri}">
</head>
<body>
    <div id="chat-container"></div>
    <div id="input-container">
        <input type="text" id="message-input" placeholder="Type your message...">
        <button id="send-button">Send</button>
    </div>
    <script src="${scriptUri}"></script>
</body>
</html>`;
    }
}