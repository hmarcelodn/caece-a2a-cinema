import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { buildProfileSystemPrompt } from './prompts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const skillPath = join(__dirname, 'skills', 'user-preferences', 'SKILL.md');
const skillContent = readFileSync(skillPath, 'utf-8');
const systemPrompt = buildProfileSystemPrompt(skillContent);

const model = new ChatAnthropic({
    model: 'claude-haiku-4-5-20250514',
    temperature: 0,
});

export const invokeProfileAgent = async (query: string): Promise<string> => {
    const response = (await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(query),
    ])) as unknown as { content: string | unknown };
    return typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
};
