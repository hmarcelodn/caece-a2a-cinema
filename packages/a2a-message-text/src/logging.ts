/** Trunca texto para logs de consola. */
export const truncateForLog = (text: string, maxLen = 200): string => {
    const normalized = text.replace(/\s+/g, ' ').trim();
    if (normalized.length <= maxLen) {
        return normalized;
    }
    return `${normalized.slice(0, maxLen)}…`;
};

/** Loguea el payload de una tarea A2A entrante. */
export const logA2aIncomingTask = (agentName: string, raw: string): void => {
    const preview = raw ? truncateForLog(raw, 200) : '(empty)';
    console.log(`[${agentName}] incoming task: ${preview}`);
};
