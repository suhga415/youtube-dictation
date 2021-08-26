import dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { Caption } from './types/Caption';
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
  const lang = "en"; // req.query.lang;
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
}

const fetchCaptionList = async (req, res) => {
  const videoId = req.query.videoId;
  const url = `http://video.google.com/timedtext?type=list&v=${videoId}`;
  await axios.get(url)
  .then((response) => {
    console.log(response); // XML
  })
  res.send("hi");
}

app.get("/", fetchCaptions);

const handleListening = () => {
  console.log(`🧀 listening on: http://localhost:${PORT}!`);
}

app.listen(process.env.PORT || PORT, handleListening);
