const { Telegraf } = require('telegraf');

const bot = new Telegraf('8271303160:AAETYLfGAqBjqmnf-fRbuM6B3tcbjKs7Z00');

async function sendChannelPost() {
  const channelId = '-3813502604'; 
  
  const messageText = 
    "📚 **Victory Academy Update**\n\n" +
    "New study materials and exam prep resources have just been added!";

  await bot.telegram.sendMessage(channelId, messageText, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '✨ Open Victory Academy App',
            web_app: { url: 'https://biniyamadane201-hue.github.io/victory-academy-/' }
          }
        ]
      ]
    }
  });

  console.log('Victory Academy Mini App post sent successfully!');
}

sendChannelPost();
