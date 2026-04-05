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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotUpdate = void 0;
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegraf_1 = require("telegraf");
let BotUpdate = class BotUpdate {
    async start(ctx) {
        await ctx.reply('Hello! I am a Josiv a telegram bot 🤖');
    }
    async help(ctx) {
        await ctx.reply('Commands: /start /help /ping /about /echo');
    }
    async menu(ctx) {
        await ctx.reply('Choose an option:', telegraf_1.Markup.inlineKeyboard([
            [telegraf_1.Markup.button.callback('Ping 🏓', 'PING')],
            [telegraf_1.Markup.button.callback('About ℹ️', 'ABOUT')],
        ]));
    }
    async onPing(ctx) {
        await ctx.answerCbQuery();
        await ctx.reply('Pong 🏓');
    }
    async onAbout(ctx) {
        await ctx.answerCbQuery();
        await ctx.reply('I am a NestJS Telegram bot 🤖');
    }
    async keyboard(ctx) {
        await ctx.reply('Choose:', telegraf_1.Markup.keyboard([
            ['Ping 🏓', 'About ℹ️'],
            ['Hide ❌'],
        ])
            .resize()
            .oneTime());
    }
    async onText(text, ctx) {
        if (text === 'Ping 🏓') {
            return ctx.reply('Pong 🏓');
        }
        if (text === 'About ℹ️') {
            return ctx.reply('NestJS Telegram bot 🤖');
        }
        if (text === 'Hide ❌') {
            return ctx.reply('Keyboard hidden', {
                reply_markup: { remove_keyboard: true },
            });
        }
    }
};
exports.BotUpdate = BotUpdate;
__decorate([
    (0, nestjs_telegraf_1.Start)(),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "start", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('help'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "help", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('menu'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "menu", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('PING'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onPing", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('ABOUT'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onAbout", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('keyboard'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "keyboard", null);
__decorate([
    (0, nestjs_telegraf_1.On)('text'),
    __param(0, (0, nestjs_telegraf_1.Message)('text')),
    __param(1, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, telegraf_1.Context]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onText", null);
exports.BotUpdate = BotUpdate = __decorate([
    (0, nestjs_telegraf_1.Update)()
], BotUpdate);
//# sourceMappingURL=bot.update.js.map