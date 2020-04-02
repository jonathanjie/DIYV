const BodyParser = require("body-parser");
const Express = require("express");
const Fetch = require("node-fetch");

const API_SECRET = "02736cd0-74ab-11ea-8ff8-bd9ee0e87500";
const PSEMILLA_PLUGINAPI_URL = "https://8ylht4he11.execute-api.ap-southeast-1.amazonaws.com/aspen-kiwi";
const PSEMILLA_API_KEY = "1499f76d-8d7e-5b2f-83a7-4acdfb4d31e9";
const PSEMILLA_API_SECRET = "960ebdda-1fe2-5c01-aaa2-11ef69e00400";

const app = Express();
app.use(BodyParser.urlencoded({ extended: false }));
app.use(BodyParser.json());

const port = 3000;

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
    
    let { service, customer, channel } = req.body;
    
    let sendResult = await Fetch(`${PSEMILLA_PLUGINAPI_URL}/send`, {
        method : "POST",
        headers : {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body : JSON.stringify({
            channel, customer,
            service : service.permlink,
            apiKey : PSEMILLA_API_KEY, 
            apiSecret : PSEMILLA_API_SECRET,
            message : "JUST RECEIVED FROM YOU"
        })
    }).then(res => res.json());    
    
    console.log("REPLYING:::", sendResult);
    
    res.send('Ok'); 
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));