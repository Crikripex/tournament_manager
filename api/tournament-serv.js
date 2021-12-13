const express = require('express')
const app = express();
const port = 3000;

//sql setup
const fs = require('fs');
const initSqlJs = require('sql.js');
const filebuffer = fs.readFileSync('../database/tournaments.db');

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.get('/api', ((req, res) => {
    if (req.url === "/api" && req.method === "GET") {
        //response headers
        res.writeHead(200, {"Content-Type": "text/plain"});
        //set the response
        initSqlJs().then(function (SQL) {
            // Load the db
            const db = new SQL.Database(filebuffer);
            let arrayResponse = db.exec("SELECT * FROM players;");
            res.write(JSON.stringify(arrayResponse));
            //end the response
            res.end();
        });
    } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Hello Worlds');
    }
}));

app.listen(port, () => {
    console.log(`Server node start on http://localhost/${port}!`)
});
