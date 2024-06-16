// index.js
const axios = require('axios');
const { TwitterApi } = require('twitter-api-v2');
const TelegramBot = require('node-telegram-bot-api');

// Telegram Bot Token
const TELEGRAM_BOT_TOKEN = '7415841049:AAEUcWNHPhRxZFzUuIsTU2qeH6iAdWwD2lg';
const TELEGRAM_CHANNEL_ID = -1001867758537;

// Twitter API credentials
const TWITTER_API_KEY = 'k0eTcdEXzuCVlaf7DY29XuKqq';
const TWITTER_API_SECRET_KEY = 'BtaUaKLAGk0gr3YINfPeiInnp6Lnu9mQmjLYOQPQKIkBKkmuXj';
const TWITTER_ACCESS_TOKEN = '1802378842901798912-MvYUmsEi2jCPWudYATOtUIYVH2J1ej';
const TWITTER_ACCESS_TOKEN_SECRET = 'UCjHjbipOztvAYXk17vSbs0lsfnU9GohR2Yzk5o8na2VW';

const axiosInstance = axios.create();
// Initialize Twitter client
const twitterClient = new TwitterApi({
  appKey: TWITTER_API_KEY,
  appSecret: TWITTER_API_SECRET_KEY,
  accessToken: TWITTER_ACCESS_TOKEN,
  accessSecret: TWITTER_ACCESS_TOKEN_SECRET,
   version: '2'
});

// Initialize Telegram bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Function to post to Twitter
async function postToTwitter(message) {

  try {
    // console.log(message)
    if(message.ismessage){
console.log("messageObj",message)
      const twee= await twitterClient.v2.readWrite.tweet({ text: message.message });
    console.log('Successfully posted message to Twitter:', twee);
    }else{
     console.log("messageObj",message)
      const imageResponse = await axios.get(message.fileUrl, { responseType: 'arraybuffer' });
      const imageData = Buffer.from(imageResponse.data, 'binary');
      // Upload image to Twitter
      const mediaId = await twitterClient.v1.uploadMedia(imageData,{ mimeType: 'image/jpg' });
      console.log("uploading image to Twitter",mediaId);
      

      const twee= await twitterClient.v2.tweet({
    text: message.message,
    media:{
     media_ids:[mediaId]
    }
      
    });
    console.log('Successfully posted message to Twitter:', twee);


    }
   
  } catch (error) {
    console.error('Error posting to Twitter:', error);
  }
}

// Listen for new messages in the Telegram channel
bot.on('channel_post', async (msg) => {
//  console.log(`[Message] ${msg.from.username}: ${msg.text}`);
try {

  if (msg.text) {
        message = msg.text;
         console.log('New message received from Telegram channel:', msg);
    postToTwitter({ismessage:true,message:message});
      }
      if (msg.photo && msg.photo.length > 0) {
        message=msg.caption;
        // Handle multiple sizes of photos, choose the largest one
        const photo = msg.photo[msg.photo.length - 1];
        const file_id = photo.file_id;

        // Get photo URL from Telegram API
        const fileUrl = await bot.getFileLink(file_id);

        // Post message with image to Twitter
        await postToTwitter({ismessage:false,message:message,fileUrl:fileUrl});

        console.log('New image with caption posted to Twitter:', message);
      } 


   
  
} catch (error) {

  
}
 
  }
);

// Log to confirm the bot is running
console.log('Bot is running...');
