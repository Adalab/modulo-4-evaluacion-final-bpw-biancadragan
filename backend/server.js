// Import libraries

const express = require('express');
const cors = require('cors');
require("dotenv").config();
const mysql = require("mysql2/promise");

async function getConnection() {
    const connectionData = {
        host: process.env["MYSQL_HOST"],
        port: process.env["MYSQL_PORT"],
        user: process.env["MYSQL_USER"],
        password: process.env["MYSQL_PASS"],
        database: process.env["MYSQL_SCHEMA"],
    };
    const connection = await mysql.createConnection(connectionData);
    await connection.connect();

    return connection;
}

//Server configuration

const app = express();
app.use(cors());
app.use(express.json());

//Launch the server

const port = 3000;
app.listen(port, () => {
    console.log(`Example app listening on port <http://localhost:${port}>`);
});

//First endpoint
app.get("/maps", async (req, res) => {

    const connection = await getConnection();

    const [results] = await connection.query(`SELECT * FROM maps;`);

    await connection.end();

    const numberOfElements = results.length;

    res.json({
        info: { count: numberOfElements },
        results: results,
    });
});


app.get("/maps/:idMap", async (req, res) => {

    const connection = await getConnection();

    const [results] = await connection.query(`
        SELECT * 
            FROM maps
            WHERE idMap = ?;`, [req.params.idMap]);

    await connection.end();

    res.json(
         results[0]
        );
});

app.post('/maps', async (req, res) => {
    const connection = await getConnection();

    const [results] = await connection.execute(
        `INSERT INTO maps (name, description, privacy, idUser) 
         VALUES (?, ?, ?, ?);`,
        [req.body.name, req.body.description, req.body.privacy, req.body.idUser]
    );

    await connection.end();

    res.json({
        success: true,
        idMap: results.insertId
    });
});

