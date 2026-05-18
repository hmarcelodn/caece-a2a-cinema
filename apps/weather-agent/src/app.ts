import type { Server } from 'node:http';
import { AGENT_CARD_PATH } from '@a2a-js/sdk';
import type { DefaultRequestHandler } from '@a2a-js/sdk/server';
import { agentCardHandler, jsonRpcHandler, restHandler, UserBuilder } from '@a2a-js/sdk/server/express';
import { createA2aRequestLogger } from '@caece-so2/a2a-message-text';
import express, { type Application } from 'express';
import { BASE_URL } from './constants';

const AGENT_LOG_NAME = 'weather-agent';

export class WeatherA2aApp {
    public app: Application;
    public port: number;
    public server?: Server;

    constructor(
        port: number,
        private readonly requestHandler: DefaultRequestHandler,
    ) {
        this.app = express();
        this.port = port;
        this.app.use(createA2aRequestLogger(AGENT_LOG_NAME));
        this.initializeA2aRoutes();
    }

    protected initializeA2aRoutes = (): void => {
        this.app.use(`/${AGENT_CARD_PATH}`, agentCardHandler({ agentCardProvider: this.requestHandler }));
        this.app.use(
            `/a2a/json-rpc`,
            jsonRpcHandler({ requestHandler: this.requestHandler, userBuilder: UserBuilder.noAuthentication }),
        );
        this.app.use(
            `/a2a/rest`,
            restHandler({ requestHandler: this.requestHandler, userBuilder: UserBuilder.noAuthentication }),
        );
    };

    listen = (): void => {
        this.server = this.app.listen(this.port, () => {
            console.log(`Weather agent A2A server on port ${this.port} (${BASE_URL})`);
        });
    };
}
