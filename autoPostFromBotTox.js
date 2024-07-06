
const axios = require('axios');
const { TwitterApi } = require('twitter-api-v2');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
// Telegram Bot Token

const TELEGRAM_BOT_TOKEN =  process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

// Twitter API credentials
const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
const TWITTER_API_SECRET_KEY = process.env.TWITTER_API_SECRET_KEY;
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
const TWITTER_ACCESS_TOKEN_SECRET = process.env.TWITTER_ACCESS_TOKEN_SECRET;
console.log(`Telegram Bot Token: ${TELEGRAM_BOT_TOKEN}`);

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
    if(message.media=="msg"){
console.log("messageObj",message)
      const twee= await twitterClient.v2.readWrite.tweet({ text: message.message });
    console.log('Successfully posted message to Twitter:', twee);
    }else if(message.media=="image"){
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


    } else if(message.media=="video"){
       console.log("messageObj", message);
      const videoResponse = await axios.get(message.fileUrl, { responseType: 'arraybuffer' });
      const videoData = Buffer.from(videoResponse.data, 'binary');

      // Upload video to Twitter
      console.log("Upload video to Twitter");
      const mediaId = await twitterClient.v1.uploadMedia(videoData, { mimeType:  'video/mp4'});
      console.log("uploading video to Twitter", mediaId);

      const twee = await twitterClient.v2.tweet({
        text: message.message, 
        media: {
          media_ids: [mediaId]
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
    postToTwitter({media:"msg",message:message});
      }
      else if (msg.photo && msg.photo.length > 0) {
        message=msg.caption;
        // Handle multiple sizes of photos, choose the largest one
        const photo = msg.photo[msg.photo.length - 1];
        const file_id = photo.file_id;

        // Get photo URL from Telegram API
        const fileUrl = await bot.getFileLink(file_id);

        // Post message with image to Twitter
        await postToTwitter({media:"image",message:message,fileUrl:fileUrl});

        console.log('New image with caption posted to Twitter:', message);
      } else if(msg.video){
        console.log(msg)
         message = msg.caption;
      const file_id = msg.video.file_id;

      const fileUrl = await bot.getFileLink(file_id);
      await postToTwitter({ media:"video", message:message,fileUrl: fileUrl });

      console.log('New video with caption posted to Twitter:', message);
      }


   
  
} catch (error) {

  console.log(toString(error));
}
 
  }
);

// Log to confirm the bot is running
console.log('Bot is running...');
