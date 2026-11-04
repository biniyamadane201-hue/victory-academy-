const { Telegraf } = require('telegraf');

const bot = new Telegraf('8271303160:AAETYLfGAqBjqmnf-fRbuM6B3tcbjKs7Z00');

async function sendChannelPost() {
  const channelId = '-1003813502604'; 
  
  const messageText = 
    "📚 **Victory Academy Freshman Exams**\n\n" +
    "Tap the button below to open your questions and study materials:";

  await bot.telegram.sendMessage(channelId, messageText, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'open question 🚀',
            web_app: { url: 'https://biniyamadane201-hue.github.io/victory-academy-/' }
          }
        ]
      ]
    }
  });

  console.log('Mini app post sent successfully!');
}

sendChannelPost();
