const express = require("express");

const app = express();

app.get('/', (req, res) => {
    return res.json({ hello :"world" });
});

app.listen(5000, () => {
    console.log(`listening n port 5000`);
});