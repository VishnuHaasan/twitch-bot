const tmi = require('tmi.js')
const axios = require('axios')
const AWS = require('aws-sdk')
require('dotenv').config()
const translator = new AWS.Translate({
    apiVersion: '2017-07-01',
    region: 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const ChannelLinks = {
    discord : process.env.DISCORD_LINK,
    twitter : process.env.TWITTER_LINK,
}

const opts = {
    identity: {
        username: process.env.BOT_USERNAME,
        password: process.env.OAUTH_TOKEN
    },
    channels: [
        process.env.CHANNEL_NAME
    ]
};

const fetchRank = async () => {
    try{
        const name = process.env.GAME_NAME
        const tagName = process.env.TAG_NAME
        const rank = await axios.get(`https://api.henrikdev.xyz/valorant/v1/mmr/ap/${name}/${tagName}`)
        return {
            data: rank.data.data.currenttierpatched,
        }
    }
    catch(err){
        console.log(err)
        return {
            error: err
        }
    }
}

const translate = async (text, source, target) => {
    try{
        const params = {
            SourceLanguageCode: source,
            TargetLanguageCode: target,
            Text: text
        }
        const data = await translator.translateText(params).promise()
        return {
            "data": data.TranslatedText,
        }
    }
    catch(err){
        console.log(err)
        return {
            "error": err,
        }
    }
}

const onRank = async (target) => {
    const rank = await fetchRank();
    if(rank.error) {
        console.log(`Error: ${rank.error}`)
        return
    } else {
        client.say(target, `${rank.data}`)
        console.log('Executed Rank command')
        return
    }
}

const onSens = (target) => {
    client.say(target, `Men2UU's sensitivity is ${process.env.SENSITIVITY_DPI} ${process.env.SENSITIVITY_SENS}`)
    console.log('Executed Sens command')
    return
}

const onDiscord = (target) => {
    client.say(target, `Discord: ${ChannelLinks.discord}` )
    console.log('Executed Discord command')
    return
}

const onTwitter = (target) => {
    client.say(target, `Twitter: ${ChannelLinks.twitter}` )
    console.log('Executed Twitter command')
    return
}

const onAnythingElse = async (target,name, msg) => {
    const arr = msg.split(' ')
    const rest = arr[0]
    if(rest === '!tej') {
        const text = arr.slice(1).join(' ')
        const translated = await translate(text, 'en', 'ja')
        if(translated.error) {
            console.log(`Error: ${translated.error}`)
            return
        } else {
            const str = `${name}: ${translated.data}`
            client.say(target, str)
            console.log('Executed Translate command')
            return
        }
    } else if(rest === '!tje') {
        const text = arr.slice(1).join(' ')
        const translated = await translate(text, 'ja', 'en')
        if(translated.error) {
            console.log(`Error: ${translated.error}`)
            return
        } else {
            const str = `${name}: ${translated.data}`
            console.log(str)
            client.say(target, str)
            console.log('Executed Translate command')
            return
        }
    } else {
        return
    }
}

const onConnectHandler = (addr, port) => {
    console.log(`* Connected to ${addr}:${port}`);
}

const onMessageHandler = async (target, context, msg, self) => {
    const name = context['display-name'];
    const commandName = msg.trim();
    if(commandName === '!rank') {
        await onRank(target)
    } else if(commandName === '!sens') {
        onSens(target)
    } else if(commandName === '!discord') {
        onDiscord(target)
    } else if(commandName === '!twitter') {
        onTwitter(target)
    }
     else {
        await onAnythingElse(target, name, msg)
    }
}

const client = new tmi.client(opts);

client.on('connected', onConnectHandler);
client.on('message', onMessageHandler);

client.connect();