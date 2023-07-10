const express = require("express");
const { generateFile } = require('./generateFile')

const app = express();

app.use(express.urlencoded({ extended: true}));
app.use(express.json());

app.get('/', (req, res) => {
    return res.json({ hello :"world" });
});

app.post('/run', async (req,res) => {
    const {language = "cpp" , code } = req.body;
    if(code === undefined){
        return res.status(400).json({success : false, error :"empty code body "})
    }
    // need to generate a c++ file with content from the request
    const filepath = await generateFile(language, code);
    return res.status(200).json({filepath});
});

app.listen(5000, () => {
    console.log(`listening n port 5000`);
});