import type { NextFunction, Request, Response } from 'express';

/** Middleware Express que loguea cada request HTTP al servidor A2A. */
export const createA2aRequestLogger =
    (agentName: string) =>
    (req: Request, res: Response, next: NextFunction): void => {
        const start = Date.now();
        res.on('finish', () => {
            const durationMs = Date.now() - start;
            console.log(
                `[${agentName}] ${req.method} ${req.path} → ${res.statusCode} (${durationMs}ms)`,
            );
        });
        next();
    };
