import dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';
import cors from 'cors';
// import bodyParser from 'body-parser';
// import https from 'https';
// import converter from 'xml-js';

// const youtubeApiKey = process.env.YOUTUBE_API_KEY;
// const apiEndpoint = `https://www.googleapis.com/youtube/v3/captions/${videoId}?key=${youtubeApiKey}`;

const lang = "en";
const videoId = "H14bBuluwB8";
const url = `https://video.google.com/timedtext?lang=${lang}&v=${videoId}&fmt=json3`;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({
  origin: ['http://localhost:8080']
}));

const fetchCaptions = (req, res) => {
  console.log("fetching captions...");
  axios.get(url)
    .then((response) => {
      const captionRaw = response.data.events;
      const captionLines = captionRaw.map(line => line.segs[0].utf8);
      res.send(captionLines); // converter.xml2js(response.data)
    })
}

app.get("/", fetchCaptions);

const handleListening = () =>
    console.log(`🧀 listening on: http://localhost:${PORT}!`);

app.listen(process.env.PORT || PORT, handleListening);
