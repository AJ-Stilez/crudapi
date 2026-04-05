"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const common_1 = require("@nestjs/common");
const express_1 = __importDefault(require("express"));
const stripe_1 = __importDefault(require("stripe"));
const config_1 = require("@nestjs/config");
let WebhookController = class WebhookController {
    configService;
    stripe;
    constructor(configService) {
        this.configService = configService;
        this.stripe = new stripe_1.default(this.configService.get('STRIPE_SECRET_KEY'), {
            apiVersion: '2025-12-15.clover',
        });
    }
    handleWebhook(req, sig) {
        const isTesting = process.env.NODE_ENV !== 'production';
        let event;
        if (isTesting) {
            try {
                event = JSON.parse(req.body);
            }
            catch {
                return { status: 'error', message: 'Invalid JSON' };
            }
        }
        else {
            const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
            try {
                event = this.stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
            }
            catch (err) {
                console.error('Webhook signature failed:', err.message);
                return { status: 'error', message: 'Webhook signature failed' };
            }
        }
        let message;
        switch (event.type) {
            case 'payment_intent.succeeded':
                message = `✅ Payment succeeded: ${JSON.stringify(event.data.object)}`;
                console.log(message);
                break;
            case 'payment_intent.payment_failed':
                message = `❌ Payment failed: ${JSON.stringify(event.data.object)}`;
                console.log(message);
                break;
            case 'checkout.session.completed':
                message = `🛒 Checkout session completed: ${JSON.stringify(event.data.object)}`;
                console.log(message);
                break;
            default:
                message = `Unhandled event type: ${event.type}`;
                console.log(message);
        }
        return { status: 'success', message: event.data.object };
    }
};
exports.WebhookController = WebhookController;
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WebhookController.prototype, "handleWebhook", null);
exports.WebhookController = WebhookController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WebhookController);
//# sourceMappingURL=webhook.js.map