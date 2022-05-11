import express from 'express';
import cors from 'cors';
import converter from 'xml-js';
import { Caption, Track } from './types';
var axios = require("axios").default;

const app = express();
const PORT = process.env.PORT || 4000;

const corsOptions = {
  origin: '*', 
  credentials: true, // access-control-allow-credentials: true
  optionSuccessStatus: 200,
}

app.use(cors(corsOptions));

const fetchCaptions = async (req, res) => {
  const lang = req.query.langCode;
  const videoId = req.query.videoId;
  const url = 'https://www.youtube.com/youtubei/v1/get_transcript'

  let langBase64 = Buffer.from(`\n\x00\x12\x02${lang}\x1a\x00`).toString('base64');
  let buff = Buffer.from(`\n\x0b${videoId}\x12\x0e${langBase64.replace('=', '%3D')}`);
  let base64data = buff.toString('base64');
  var options = {
    method: 'POST',
    url,
    params: {key: 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8'},
    headers: {'Content-Type': 'application/json'},
    data: {
      context: {client: {clientName: 'WEB', clientVersion: '2.2021111'}},
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
      } as Caption;
    });
    res.send(captionLines);
  }).catch(err => {
    console.error(`Error in fetching captions for: ${videoId}`, err.message);
  });
}

const fetchCaptionTracks = async (req, res) => {
  const videoId = req.query.videoId;
  const {data} = await axios.get(
    `https://www.youtube.com/watch?v=${videoId}`
  );
  const regex = /({"captionTracks":.*isTranslatable":(true|false)}])/;
  const [match] = regex.exec(data);
  const {captionTracks} = JSON.parse(`${match}}`);
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
    } as Track;
  });
  res.send(tracks);
}

const fetchCaptionTracks0 = async (req, res) => {
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
  const url = `https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${videoId}&format=json`;
  await axios.get(url)
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
}

app.get("/", fetchCaptions);
app.get("/caption-tracks", fetchCaptionTracks);
app.get("/metadata", fetchMetadata);

const handleListening = () => {
  console.log(`🧀 listening on: http://localhost:${PORT}!`);
}

app.listen(process.env.PORT || PORT, handleListening);
