import * as vscode from 'vscode';
import { OllamaService } from './ollamaService';

export class CodeAssistant {
    constructor(private ollamaService: OllamaService) {}

    async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.CompletionItem[]> {
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        if (!linePrefix.endsWith('Code Buddy: ')) {
            return [];
        }

        const completionPrompt = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
        const completion = await this.ollamaService.generateCompletion(completionPrompt);

        return [
            new vscode.CompletionItem(completion, vscode.CompletionItemKind.Text)
        ];
    }

    async debugCode(code: string): Promise<void> {
        const debugInfo = await this.ollamaService.generateCompletion(`Debug the following code and provide suggestions:\n\n${code}`);
        vscode.window.showInformationMessage(debugInfo);
    }

    async explainCode(code: string): Promise<void> {
        const explanation = await this.ollamaService.explainCode(code);
        const document = await vscode.workspace.openTextDocument({
            content: explanation,
            language: 'markdown'
        });
        vscode.window.showTextDocument(document);
    }

    async generateTestCases(code: string): Promise<void> {
        const testCases = await this.ollamaService.generateTestCases(code);
        const document = await vscode.workspace.openTextDocument({
            content: testCases,
            language: 'typescript'
        });
        vscode.window.showTextDocument(document);
    }
}