const BodyParser = require("body-parser");
const Express = require("express");
const Fetch = require("node-fetch");
const FS = require("fs");

const API_SECRET = "02736cd0-74ab-11ea-8ff8-bd9ee0e87500";
const PSEMILLA_PLUGINAPI_URL = "https://8ylht4he11.execute-api.ap-southeast-1.amazonaws.com/aspen-kiwi";
const PSEMILLA_API_KEY = "1499f76d-8d7e-5b2f-83a7-4acdfb4d31e9";
const PSEMILLA_API_SECRET = "960ebdda-1fe2-5c01-aaa2-11ef69e00400";

const app = Express();
app.use(BodyParser.urlencoded({ extended: false }));
app.use(BodyParser.json());

const port = 3000;

let _bot;
let _rootBot;

let getBotMessages = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let rawdata = FS.readFileSync('./resources/bot_messages.json');
            let json = JSON.parse(rawdata);
            // let json = await Fetch('https://postgrest.pandemy.xyz/bot_messages').then(res => res.json());
            
            _bot = {};
    
            for(let { 
                id, prev_bot_message_id, message_text, button_text, 
                created_on, modified_on, disabled_on, prev_bot_message_text, 
                button_link, message_photo_link
            } of json) {
                _bot[id] = {
                    messageText : message_text,
                    buttons : json.filter(subMesg => subMesg.prev_bot_message_id == id).map(({ id, button_text }) => {
                        return {
                            id,
                            label : button_text
                        }
                    })
                };
                
                if(!prev_bot_message_id) {
                    _rootBot = _bot[id];
                }
            }
            
            resolve(_bot);
        } catch(error) {
            console.error("GET BOT MESSAGES ERROR", error);
            reject(error);
        }
    });
}

let getRootBot = () => {
    if(_rootBot) {
        return _rootBot;
    }
    
    return getBotMessages().then(new Promise((resolve, reject) => {
        resolve(_rootBot);
    }));
}

let authorizer = async (req, res, next) => {
    try {
        let { callbackSecret } = req.body;
        
        if(callbackSecret != API_SECRET) {
            throw new Error("Invalid Secret");
        }
        
        next();
    } catch(error) {
        console.error("AUTHORIZATION ERROR: ", error);
        res.status(403).send("Invalid Access");
    }
};

app.get('/', (req, res) => res.send('Hello from DIYV!'))

app.post('/listen', authorizer, async (req, res) => {
    console.log("BODY", req.body);
    
    let { service, customer, channel, message, messageType } = req.body;
    
    if(messageType == "CBQ" && message.startsWith("CMD:DIYV:")) {
        let id = message.replace("CMD:DIYV:", "");
        let botMessages = getBotMessages();
        
        console.log(botMessages[id]);
    } else {
        let sendResult = await sendRootResponse(service, customer, channel);
        console.log("REPLYING:::", sendResult);    
    }
    
    res.send('Ok'); 
});

let sendRootResponse = (service, customer, channel) => {
    return new Promise(async (resolve, reject) => {
        try {
            let rootBot = await getRootBot();
    
            let buttons = rootBot.buttons.map(({ id, label }) => {
                return {
                    text : label,
                    callback_data : `CMD:DIYV:${id}`
                };
            });
    
            let sendResult = await Fetch(`${PSEMILLA_PLUGINAPI_URL}/send`, {
                method : "POST",
                headers : {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body : JSON.stringify({
                    channel, 
                    customer : customer.uuid,
                    service : service.permlink,
                    apiKey : PSEMILLA_API_KEY, 
                    apiSecret : PSEMILLA_API_SECRET,
                    message : rootBot.messageText,
                    options : buttons,
                    chunk : 1
                })
            }).then(res => res.json());    
            
            resolve(sendResult);
        } catch(error) {
            console.error("ERRRRRORRRRRR:::", error);
            reject(error);
        }
    });
};

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));