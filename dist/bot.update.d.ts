import { Context } from 'telegraf';
export declare class BotUpdate {
    start(ctx: Context): Promise<void>;
    help(ctx: Context): Promise<void>;
    menu(ctx: Context): Promise<void>;
    onPing(ctx: Context): Promise<void>;
    onAbout(ctx: Context): Promise<void>;
    keyboard(ctx: Context): Promise<void>;
    onText(text: string, ctx: Context): Promise<import("@telegraf/types").Message.TextMessage | undefined>;
}
