import * as vscode from 'vscode';
import { OllamaService } from './ollamaService';
import { ChatInterface } from './chatInterface';
import { DocumentProcessor } from './documentProcessor';

export function activate(context: vscode.ExtensionContext) {
    const ollamaService = new OllamaService();
    const chatInterface = new ChatInterface(context, ollamaService);
    const documentProcessor = new DocumentProcessor();

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('codeBuddy.debug', () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const document = editor.document;
                const selection = editor.selection;
                const text = document.getText(selection);
                chatInterface.debugCode(text);
            }
        }),

        vscode.commands.registerCommand('codeBuddy.explain', () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const document = editor.document;
                const selection = editor.selection;
                const text = document.getText(selection);
                chatInterface.explainCode(text);
            }
        }),

        vscode.commands.registerCommand('codeBuddy.generateTests', () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const document = editor.document;
                const selection = editor.selection;
                const text = document.getText(selection);
                chatInterface.generateTestCases(text);
            }
        }),

        vscode.commands.registerCommand('codeBuddy.uploadDocument', async () => {
            const result = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                filters: {
                    'Documents': ['pdf', 'docx', 'txt']
                }
            });

            if (result && result[0]) {
                await documentProcessor.processDocument(result[0].fsPath);
            }
        }),

        vscode.commands.registerCommand('codeBuddy.openChat', () => {
            chatInterface.openChatView();
        })
    );

    // Set up code completion provider
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            { scheme: 'file', language: '*' },
            {
                provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                    const linePrefix = document.lineAt(position).text.substr(0, position.character);
                    if (!linePrefix.endsWith('Code Buddy: ')) {
                        return [];
                    }

                    const completionItem = new vscode.CompletionItem('Code Buddy: Ask a question');
                    completionItem.insertText = '';
                    completionItem.command = { 
                        command: 'codeBuddy.openChat', 
                        title: 'Open Code Buddy Chat' 
                    };

                    return [completionItem];
                }
            }
        )
    );
}

export function deactivate() {}