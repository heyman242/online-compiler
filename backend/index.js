const express = require("express");
const { generateFile } = require("./generateFile");
const { executeCpp } = require("./executeCpp");

const app = express();

app.use(express.urlencoded({ extended: true}));
app.use(express.json());

app.get('/', (req, res) => {
    return res.json({ hello :"world" });
});

app.post('/run', async (req, res) => {
    const { language = "cpp", code } = req.body;
    if (code === undefined) {
        return res.status(400).json({ success: false, error: "empty code body" });
    }

    try {
        const filepath = await generateFile(language, code);
        const output = await executeCpp(filepath);
        return res.status(200).json({ filepath, output });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
});


app.listen(5000, () => {
    console.log(`listening n port 5000`);
});