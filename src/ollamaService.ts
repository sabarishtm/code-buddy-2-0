import { Ollama } from 'ollama';

export class OllamaService {
    private ollama: Ollama;

    constructor() {
        this.ollama = new Ollama();
    }

    async generateCompletion(prompt: string, model: string = 'llama3'): Promise<string> {
        try {
            const response = await this.ollama.generate({
                model: model,
                prompt: prompt
            });
            return response.response;
        } catch (error) {
            console.error('Error generating completion:', error);
            throw error;
        }
    }

    async explainCode(code: string): Promise<string> {
        const prompt = `Explain the following code:\n\n${code}`;
        return this.generateCompletion(prompt);
    }

    async generateTestCases(code: string): Promise<string> {
        const prompt = `Generate test cases for the following code:\n\n${code}`;
        return this.generateCompletion(prompt);
    }

    async queryDocument(query: string, context: string): Promise<string> {
        const prompt = `Given the following context:\n\n${context}\n\nAnswer the following question:\n${query}`;
        return this.generateCompletion(prompt);
    }
}