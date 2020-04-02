const BodyParser = require("body-parser");
const Express = require("express");

const app = Express();
app.use(BodyParser.urlencoded({ extended: false }));
app.use(BodyParser.json());

const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/listen', (req, res) => {
    console.log("BODY", req.body);
    res.send('Hello World!'); 
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));