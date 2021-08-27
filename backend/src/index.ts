import dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import converter from 'xml-js';
import { Caption, Track } from './types';
dotenv.config();

// let lang = "en";
// let videoId = ""; // H14bBuluwB8
// const url = `https://video.google.com/timedtext?lang=${lang}&v=${videoId}&fmt=json3`;
// const urlForCaptionList = `http://video.google.com/timedtext?type=list&v=${videoId}`;

const app = express();
const PORT = process.env.PORT || 4000;

// app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({
  origin: ['http://localhost:8080']
}));

const fetchCaptions = async (req, res) => {
  const lang = req.query.langCode;
  const videoId = req.query.videoId;
  const url = `https://video.google.com/timedtext?lang=${lang}&v=${videoId}&fmt=json3`;
  await axios.get(url)
  .then((response) => {
    const captionRaw = response.data.events;
    const captionLines = captionRaw.map(line => {
      return {
        text: line.segs[0].utf8,
        startTimeMs: line.tStartMs,
        endTimeMs: line.tStartMs + line.dDurationMs,
      } as Caption;
    });
    res.send(captionLines);
  })
  .catch(err => {
    console.log(`Error in fetching captions for: ${videoId}`, err.message);
  });
}

const fetchCaptionTracks = async (req, res) => {
  const videoId = req.query.videoId;
  const url = `http://video.google.com/timedtext?type=list&v=${videoId}`;
  await axios.get(url)
  .then((response) => {
    const json = JSON.parse(converter.xml2json(response.data, {compact: true}));
    const tracks = json.transcript_list.track.map(item => {
      return {
        langCode: item._attributes.lang_code,
        langName: item._attributes.lang_translated,
      } as Track;
    });
    res.send(tracks);
  })
  .catch(err => {
    console.log(`Error in fetching caption tracks for: ${videoId}`, err.message);
  });
}

app.get("/", fetchCaptions);
app.get("/caption-tracks", fetchCaptionTracks);

const handleListening = () => {
  console.log(`🧀 listening on: http://localhost:${PORT}!`);
}

app.listen(process.env.PORT || PORT, handleListening);
