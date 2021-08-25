<template>
  <div class="home">
    <div id="player" ref="yt"/>
    <div v-if="captionLines.length">
      <div v-for="(line, index) in captionLines" :key="index">
        <caption-bar
          :caption="line"
          :isActive="(currentTime && currentTime >= line.startTimeMs && currentTime <= line.endTimeMs) ? true : false"
        ></caption-bar>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import CaptionBar from '@/components/CaptionBar.vue'; // @ is an alias to /src
import axios from 'axios';
import { Caption } from '../types/Caption';

@Options({
  components: {
    CaptionBar,
  },
})

export default class Home extends Vue {
  captionLines: Caption[] = [];
  videoId = "H14bBuluwB8";
  videoUrl = `https://www.youtube.com/embed/${this.videoId}?enablejsapi=1`;
  player!: any;
  iframeWindow!: any; // the source "window" that will emit the "message" events
  currentStatus!: YT.PlayerState;
  currentTime: number | null = null;
  lastTimeUpdate = 0; // compare against new updates

  async mounted() {
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

    await this.fetchCaptions();
  }

  async fetchCaptions() {
    await axios.get('http://localhost:4000/')
      .then(response => {
        this.captionLines = response.data;
      })
      .catch(err => console.log(err.message));
  }

  initYoutubePlayer() {
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
        var time = Math.floor(data.info.currentTime * 10) * 100;
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
