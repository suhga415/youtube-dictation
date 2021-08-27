"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const cors_1 = __importDefault(require("cors"));
const xml_js_1 = __importDefault(require("xml-js"));
dotenv_1.default.config();
// let lang = "en";
// let videoId = ""; // H14bBuluwB8
// const url = `https://video.google.com/timedtext?lang=${lang}&v=${videoId}&fmt=json3`;
// const urlForCaptionList = `http://video.google.com/timedtext?type=list&v=${videoId}`;
const app = express_1.default();
const PORT = process.env.PORT || 4000;
// app.use(bodyParser.urlencoded({extended: true}));
app.use(cors_1.default({
    origin: ['http://localhost:8080']
}));
const fetchCaptions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const lang = req.query.langCode;
    const videoId = req.query.videoId;
    const url = `https://video.google.com/timedtext?lang=${lang}&v=${videoId}&fmt=json3`;
    yield axios_1.default.get(url)
        .then((response) => {
        const captionRaw = response.data.events;
        const captionLines = captionRaw.map(line => {
            return {
                text: line.segs[0].utf8,
                startTimeMs: line.tStartMs,
                endTimeMs: line.tStartMs + line.dDurationMs,
            };
        });
        res.send(captionLines);
    })
        .catch(err => {
        console.log("Error in fetching captions: ", err.message);
    });
});
const fetchCaptionTracks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const videoId = req.query.videoId;
    const url = `http://video.google.com/timedtext?type=list&v=${videoId}`;
    yield axios_1.default.get(url)
        .then((response) => {
        const json = JSON.parse(xml_js_1.default.xml2json(response.data, { compact: true }));
        const tracks = json.transcript_list.track.map(item => {
            return {
                langCode: item._attributes.lang_code,
                langName: item._attributes.lang_translated,
            };
        });
        res.send(tracks);
    })
        .catch(err => {
        console.log("Error in fetching caption tracks: ", err.message);
    });
});
app.get("/", fetchCaptions);
app.get("/caption-tracks", fetchCaptionTracks);
const handleListening = () => {
    console.log(`🧀 listening on: http://localhost:${PORT}!`);
};
app.listen(process.env.PORT || PORT, handleListening);
//# sourceMappingURL=index.js.map