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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const xml_js_1 = __importDefault(require("xml-js"));
var axios = require("axios").default;
const app = express_1.default();
const PORT = process.env.PORT || 4000;
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
};
app.use(cors_1.default(corsOptions));
const fetchCaptions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const lang = req.query.langCode;
    const videoId = req.query.videoId;
    const url = 'https://www.youtube.com/youtubei/v1/get_transcript';
    let langBase64 = Buffer.from(`\n\x00\x12\x02${lang}\x1a\x00`).toString('base64');
    let buff = Buffer.from(`\n\x0b${videoId}\x12\x0e${langBase64.replace('=', '%3D')}`);
    let base64data = buff.toString('base64');
    var options = {
        method: 'POST',
        url,
        params: { key: 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8' },
        headers: { 'Content-Type': 'application/json' },
        data: {
            context: { client: { clientName: 'WEB', clientVersion: '2.2021111' } },
            params: base64data
        }
    };
    axios.request(options).then(response => {
        const cueGroups = response.data.actions[0].updateEngagementPanelAction.content.transcriptRenderer.body.transcriptBodyRenderer.cueGroups;
        const captionLines = cueGroups.map(item => {
            const cue = item.transcriptCueGroupRenderer.cues[0].transcriptCueRenderer;
            return {
                text: cue.cue.simpleText,
                startTimeMs: Number(cue.startOffsetMs),
                endTimeMs: Number(cue.startOffsetMs) + Number(cue.durationMs),
            };
        });
        res.send(captionLines);
    }).catch(err => {
        console.error(`Error in fetching captions for: ${videoId}`, err.message);
    });
});
const fetchCaptionTracks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const videoId = req.query.videoId;
    const { data } = yield axios.get(`https://www.youtube.com/watch?v=${videoId}`);
    const regex = /({"captionTracks":.*isTranslatable":(true|false)}])/;
    const [match] = regex.exec(data);
    const { captionTracks } = JSON.parse(`${match}}`);
    let tracks = captionTracks.filter(item => {
        if (item.name.simpleText.includes("(auto-generated)")) {
            return false;
        }
        return true;
    });
    tracks = tracks.map(item => {
        return {
            langCode: item.languageCode,
            langName: item.name.simpleText,
        };
    });
    res.send(tracks);
});
const fetchCaptionTracks0 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const videoId = req.query.videoId;
    const url = `http://video.google.com/timedtext?type=list&v=${videoId}`;
    yield axios.get(url)
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
        console.log(`Error in fetching caption tracks for: ${videoId}`, err.message);
    });
});
const fetchMetadata = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const videoId = req.query.videoId;
    const url = `https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${videoId}&format=json`;
    yield axios.get(url)
        .then((response) => {
        res.send({
            title: response.data.title,
            author: response.data.author_name,
            thumbnail: response.data.thumbnail_url.replace("hqdefault", "mqdefault"),
        });
    })
        .catch(err => {
        console.log(`Error in fetching matadata for: ${videoId}`, err.message);
    });
});
app.get("/", fetchCaptions);
app.get("/caption-tracks", fetchCaptionTracks);
app.get("/metadata", fetchMetadata);
const handleListening = () => {
    console.log(`🧀 listening on: http://localhost:${PORT}!`);
};
app.listen(process.env.PORT || PORT, handleListening);
//# sourceMappingURL=index.js.map