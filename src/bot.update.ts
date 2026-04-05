import {
  Update,
  Start,
  Ctx,
  On,
  Message,
  Command,
  Action,
} from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';

@Update()
export class BotUpdate {
  @Start()
  async start(@Ctx() ctx: Context) {
    await ctx.reply('Hello! I am a Josiv a telegram bot 🤖');
  }

  //   @On('text')
  //   async onMessage(@Message('text') text: string, @Ctx() ctx: Context) {
  //     await ctx.reply(`You said: ${text}`);
  //   }

  @Command('help')
  async help(@Ctx() ctx: Context) {
    await ctx.reply('Commands: /start /help /ping /about /echo');
  }

  @Command('menu')
  async menu(@Ctx() ctx: Context) {
    await ctx.reply(
      'Choose an option:',
      Markup.inlineKeyboard([
        [Markup.button.callback('Ping 🏓', 'PING')],
        [Markup.button.callback('About ℹ️', 'ABOUT')],
      ]),
    );
  }

  @Action('PING')
  async onPing(@Ctx() ctx: Context) {
    await ctx.answerCbQuery(); // removes loading state
    await ctx.reply('Pong 🏓');
  }

  @Action('ABOUT')
  async onAbout(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    await ctx.reply('I am a NestJS Telegram bot 🤖');
  }

  @Command('keyboard')
async keyboard(@Ctx() ctx: Context) {
  await ctx.reply(
    'Choose:',
    Markup.keyboard([
      ['Ping 🏓', 'About ℹ️'],
      ['Hide ❌'],
    ])
      .resize()
      .oneTime()
  );
}


@On('text')
async onText(
      @Message('text') text: string,
    @Ctx() ctx: Context) {
//   const text = ctx.message.text;

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

}
