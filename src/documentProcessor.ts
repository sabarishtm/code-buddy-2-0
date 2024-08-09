import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class DocumentProcessor {
    private documents: Map<string, string> = new Map();

    async processDocument(filePath: string): Promise<void> {
        const fileName = path.basename(filePath);
        const fileExtension = path.extname(filePath).toLowerCase();

        try {
            let content: string;

            switch (fileExtension) {
                case '.txt':
                    content = await this.readTextFile(filePath);
                    break;
                case '.pdf':
                    content = await this.extractPdfText(filePath);
                    break;
                case '.docx':
                    content = await this.extractDocxText(filePath);
                    break;
                default:
                    throw new Error('Unsupported file type');
            }

            this.documents.set(fileName, content);
            vscode.window.showInformationMessage(`Document ${fileName} processed successfully`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Error processing document: ${errorMessage}`);
        }
    }

    private async readTextFile(filePath: string): Promise<string> {
        return fs.promises.readFile(filePath, 'utf-8');
    }

    private async extractPdfText(filePath: string): Promise<string> {
        // For PDF extraction, you might want to use a library like pdf-parse
        // This is a placeholder implementation
        throw new Error('PDF extraction not implemented');
    }

    private async extractDocxText(filePath: string): Promise<string> {
        // For DOCX extraction, you might want to use a library like mammoth
        // This is a placeholder implementation
        throw new Error('DOCX extraction not implemented');
    }

    getDocumentContent(fileName: string): string | undefined {
        return this.documents.get(fileName);
    }

    getAllDocuments(): string[] {
        return Array.from(this.documents.keys());
    }
}