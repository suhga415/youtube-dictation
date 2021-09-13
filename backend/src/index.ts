import express from 'express';
import axios from 'axios';
import cors from 'cors';
import converter from 'xml-js';
import { Caption, Track } from './types';
// import dotenv from 'dotenv';
// dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// app.use(bodyParser.urlencoded({extended: true}));

const corsOptions = {
  origin: '*', 
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
}

app.use(cors(corsOptions));
// {
//   origin: [
//     'http://localhost:8080',
//     'https://youtube-dictation-frontend.herokuapp.com/'
//   ]
// }

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

const fetchMetadata = async (req, res) => {
  const videoId = req.query.videoId;
  const url = `https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=H14bBuluwB8&format=json`;
  await axios.get(url)
  .then((response) => {
    res.send({
      title: response.data.title,
      author_name: response.data.author_name,
      thumbnail_url: response.data.thumbnail_url,
    });
  })
  .catch(err => {
    console.log(`Error in fetching matadata for: ${videoId}`, err.message);
  });
}

app.get("/", fetchCaptions);
app.get("/caption-tracks", fetchCaptionTracks);
app.get("/metadata", fetchMetadata);

const handleListening = () => {
  console.log(`🧀 listening on: http://localhost:${PORT}!`);
}

app.listen(process.env.PORT || PORT, handleListening);
