import type { Message, Part } from '@a2a-js/sdk';

const partText = (part: Part): string => {
    if (part.kind === 'text') {
        return part.text;
    }
    return '';
};

/** Concatena las partes de texto del mensaje A2A. */
export const extractTextFromMessage = (message: Message): string => {
    return message.parts.map(partText).filter(Boolean).join('\n').trim();
};

export { truncateForLog, logA2aIncomingTask } from './logging';
export { createA2aRequestLogger } from './express-middleware';
