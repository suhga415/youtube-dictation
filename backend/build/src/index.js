"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const cors_1 = __importDefault(require("cors"));
// import bodyParser from 'body-parser';
// import https from 'https';
// import converter from 'xml-js';
// const youtubeApiKey = process.env.YOUTUBE_API_KEY;
// const apiEndpoint = `https://www.googleapis.com/youtube/v3/captions/${videoId}?key=${youtubeApiKey}`;
const lang = "en";
const videoId = "H14bBuluwB8";
const url = `https://video.google.com/timedtext?lang=${lang}&v=${videoId}&fmt=json3`;
dotenv_1.default.config();
const app = express_1.default();
const PORT = process.env.PORT || 4000;
// app.use(bodyParser.urlencoded({extended: true}));
app.use(cors_1.default({
    origin: ['http://localhost:8080']
}));
const fetchCaptions = (req, res) => {
    axios_1.default.get(url)
        .then((response) => {
        const captionRaw = response.data.events;
        const captionLines = captionRaw.map(line => line.segs[0].utf8);
        res.send(captionLines); // converter.xml2js(response.data)
    });
};
app.get("/", fetchCaptions);
const handleListening = () => console.log(`🧀 listening on: http://localhost:${PORT}!`);
app.listen(process.env.PORT || PORT, handleListening);
//# sourceMappingURL=index.js.map