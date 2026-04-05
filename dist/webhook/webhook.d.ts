import express from 'express';
import { ConfigService } from '@nestjs/config';
export declare class WebhookController {
    private readonly configService;
    private stripe;
    constructor(configService: ConfigService);
    handleWebhook(req: express.Request, sig: string): {
        status: string;
        message: any;
    };
}
