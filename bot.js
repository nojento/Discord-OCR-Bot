require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const Tesseract = require('tesseract.js');

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`);
});

bot.on('messageCreate', async (msg) => {

    // Ignora mensagens do próprio bot
    if (msg.author.bot) return;

    // Verifica se existe algum arquivo anexado
    if (msg.attachments.size === 0) return;

    msg.attachments.forEach((attachment) => {

        // Verifica se o arquivo é uma imagem
        if (!attachment.contentType || !attachment.contentType.startsWith('image/')) {
            return;
        }

        const imageURL = attachment.url;

        console.log(`🔍 Lendo imagem: ${imageURL}`);

        Tesseract.recognize(
            imageURL,
            'por',
            {
                logger: m => console.log(m)
            }
        )
        .then(({ data: { text } }) => {

            const texto = text.trim();

            if (!texto) {
                msg.reply('não encontrei nenhum texto nessa imagem.');
                return;
            }

            // Discord permite no máximo 2000 caracteres
            const chunks = texto.match(/[\s\S]{1,1900}/g) || [];

            for (const chunk of chunks) {
                msg.reply(chunk);
            }
        })
        .catch((error) => {
            console.error('Erro no OCR:', error);
            msg.reply('ocorreu um erro ao tentar ler a imagem.');
        });
    });
});

bot.login(process.env.DISCORD_TOKEN);