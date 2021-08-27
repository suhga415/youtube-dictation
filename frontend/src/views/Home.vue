<template>
  <div class="home">
    <div class="video-select-bar">
      <!-- <form @submit.prevent> -->
        <label for="yt-url">Video URL: </label>
        <input
          v-model="videoUrl"
          type="text"
          id="yt-url"
          name="yt-url"
          placeholder="youtube.com/watch?v=1NC-cbrEB4U"
          @input="onUrlInputChange"
        >
        <label for="yt-lang">Language: </label>
        <select v-model="videoLangCode" id="yt-lang">
          <option disabled value="">Please select one</option>
          <option v-for="(item, index) in captionTracks" :key="index" :value="item.langCode">
            {{ item.langName }}
          </option>
        </select>
        <button @click="onSubmit">Submit</button>
      <!-- </form> -->
    </div>
    <div class="main-container">
      <div class="player-container">
        <div id="player"></div>
      </div>
      <div class="captions-container" v-if="captionLines.length">
        <div v-for="(line, index) in captionLines" :key="index">
          <caption-bar
            :caption="line"
            :isActive="isCaptionActive(index)"
          ></caption-bar>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import CaptionBar from '@/components/CaptionBar.vue'; // @ is an alias to /src
import axios from 'axios';
import { Caption } from '../types/Caption';
import { Track } from '../types/Track';

@Options({
  components: {
    CaptionBar,
  },
})

export default class Home extends Vue {
  captionLines: Caption[] = [];
  captionTracks: Track[] = [];
  videoUrl = "";
  videoId!: string; // "H14bBuluwB8", "8KkKuTCFvzI", "1ALfKWG2nmw" (length: 11)
  videoLangCode: string | null = null;
  videoWidgetUrl!: string; // = `https://www.youtube.com/embed/${this.videoId}?enablejsapi=1`;
  player!: any;
  iframeWindow!: any; // the source "window" that will emit the "message" events
  currentStatus!: YT.PlayerState;
  currentTime: number | null = null;
  lastTimeUpdate = 0; // compare against new updates

  async mounted() {
  }

  isCaptionActive(index: number) {
    const currentLine = this.captionLines[index];
    if (index < this.captionLines.length) {
      const nextLine = this.captionLines[index + 1];
      return (this.currentTime)
        && (this.currentTime >= currentLine.startTimeMs)
        && (this.currentTime < nextLine.startTimeMs);
    } else {
      return true;
    }
  }

  async onUrlInputChange(event: any) {
    const prefix = "youtube.com/watch?v=";
    if ((this.videoUrl).includes(prefix) && this.videoUrl.length >= prefix.length + 11) {
      // 1. refine the input value, extract video ID
      this.videoId = (this.videoUrl.replace("https://www.", "")).replace(prefix, "");
      // 2. check if it's a valid video ID / the video exists
      if (this.validVideoId(this.videoId)) {
        console.log("this input is valid.");
        // 3. update language options
        await this.fetchCaptionTracks();
      } else {
        this.captionTracks = [];
      }
    }
  }

  async validVideoId(id: string) {
    // is there a better way to check?
    const url = "http://img.youtube.com/vi/" + id + "/mqdefault.jpg";
    const { status } = await fetch(url);
    if (status === 404) return false;
    return true;
  }

  async onSubmit() {
    // TODO: go to route with parameter or query... like /8KkKuTCFvzI
    // so that it can be refreshed.

    await this.fetchCaptions();
    this.prepareYoutubeIFrameAPI();
  }

  async fetchCaptions() {
    console.log(this.videoId);
    await axios.get('http://localhost:4000/', {
      params: {
        videoId: this.videoId,
        langCode: this.videoLangCode,
      }
    })
    .then(response => {
      this.captionLines = response.data;
    })
    .catch(err => console.log(err.message));
  }

  async fetchCaptionTracks() {
    console.log("videoId for caption tracks: ", this.videoId);
    await axios.get('http://localhost:4000/caption-tracks', {
      params: {
        videoId: this.videoId,
      }
    })
    .then(response => {
      this.captionTracks = response.data;
    })
    .catch(err => console.log(err.message));
  }

  prepareYoutubeIFrameAPI() {
    // append youtube iFrame API from https://www.youtube.com/iframe_api
    // docs: https://developers.google.com/youtube/iframe_api_reference#Getting_Started
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    if (firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    (window as any).onYouTubeIframeAPIReady = () => {
      this.initYoutubePlayer();
    };
  }

  initYoutubePlayer() {
    console.log("initYoutubePlayer called!");
    this.player = new YT.Player('player', {
      height: 360,
      width: 640,
      videoId: this.videoId,
      events: {
        'onReady': this.onPlayerReady,
        'onStateChange': this.onPlayerStateChange,
      },
    })

    // TODO: Turn off any captions of the player as default! 

    // Listen to events triggered by postMessage.
    this.iframeWindow = this.player.getIframe().contentWindow;
    window.addEventListener("message", this.handlePostMessage);
  }

  handlePostMessage(event: any) {
    // Check that the event was sent from the YouTube IFrame.
    if (event.source === this.iframeWindow) {
      var data = JSON.parse(event.data);
      // The "infoDelivery" event is used by YT to transmit any kind of information
      // change in the player (eg. current time, playback quality change)
      if (
        data.event === "infoDelivery" &&
        data.info &&
        data.info.currentTime
      ) {
        var time = Math.floor(data.info.currentTime * 100) * 10;
        if (time !== this.lastTimeUpdate) {
          // update the dom, emit an event, whatever.
          this.currentTime = this.lastTimeUpdate = time;
        }
      }
    }
  }

  stopVideo() {
    this.player.stopVideo();
  }

  onPlayerReady(evt: any) {
    console.log("Player ready");
    // evt.target.playVideo();
  }

  onPlayerStateChange(event: any) {
    if (event.data == YT.PlayerState.PLAYING) {
      console.log("Player state changed", event.target.getCurrentTime());
    }
  }
}
</script>
<style>
.home {
  text-align: center;
}
.video-select-bar {
  background-color: #9DDAC6;
  height: 50px;
}
.main-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 700px;
  background-color: #F3F1F5;
}
.captions-container {
  height: 600px;
  padding: 10px;
  background-color: #FDE49C;
  overflow: auto;
}
</style>
