<template>
  <div class="dictation">
    <div v-if="showSettingsModal">
      <settings @close="closeSettingsModal"></settings>
    </div>
    <div class="main-container">
      <div class="player-container">
        <div id="player"></div>
      </div>
      <div class="captions-settings">
        <div class="settings-button-container">
          <button @click="openSettingsModal">Settings</button>
        </div>
        <div class="captions-container" v-if="captionLines.length">
          <div v-for="(line, index) in captionLines" :key="index">
            <caption-bar
              :caption="line"
              :isActive="isCaptionActive(index)"
              @caption-click="onCaptionClick"
            ></caption-bar>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import CaptionBar from '@/components/CaptionBar.vue';
import Settings from '@/components/Settings.vue';
import axios from 'axios';
import { Caption } from '../types/Caption';

@Options({
  components: {
    CaptionBar,
    Settings,
  },
})

export default class Dictation extends Vue {
  captionLines: Caption[] = [];
  videoUrl = "";
  videoId!: string; // "H14bBuluwB8", "8KkKuTCFvzI", "1ALfKWG2nmw" (length: 11)
  videoLangCode: string | null = null;
  videoWidgetUrl!: string; // = `https://www.youtube.com/embed/${this.videoId}?enablejsapi=1`;
  player!: any;
  iframeWindow!: any; // the source "window" that will emit the "message" events
  currentStatus!: YT.PlayerState;
  currentTime: number | null = null;
  lastTimeUpdate = 0; // compare against new updates
  isCaptionLoading = false;
  showSettingsModal = false;

  async mounted() {
    this.videoId = this.$route.params.id as string;
    this.videoLangCode = this.$route.params.lang as string;

    await this.fetchCaptions();

    if ((window as any).onYouTubeIframeAPIReady) {
      // There is already Youtube IFrame API on this component.
      if (!this.player) { // no player yet
        this.initYoutubePlayer();
      }
    } else {
      this.prepareYoutubeIFrameAPI();
    }
  }

  beforeUnmount () {
    if (this.player !== null && this.player.destroy) {
      this.player.destroy();
      delete this.player;
    }
  }

  async fetchCaptions() {
    this.isCaptionLoading = true;
    await axios.get('http://localhost:4000/', {
      params: {
        videoId: this.videoId,
        langCode: this.videoLangCode,
      }
    })
    .then(response => {
      this.captionLines = response.data;
    })
    .catch(err => console.log(err.message))
    .finally(() => {
      this.isCaptionLoading = false;
    })
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
    // Listen to events triggered by postMessage
    this.iframeWindow = this.player.getIframe().contentWindow;
    window.addEventListener("message", this.handlePostMessage);
  }

  handlePostMessage(event: any) {
    // Check that the event was sent from the YouTube IFrame
    if (event.source === this.iframeWindow) {
      var data = JSON.parse(event.data);
      // The "infoDelivery" event is used by YT to transmit any kind of information
      // change in the player (eg. current time, playback quality change)
      if (
        data.event === "infoDelivery" &&
        data.info &&
        data.info.currentTime
      ) {
        var time = Math.ceil(data.info.currentTime * 100) * 10;
        if (time !== this.lastTimeUpdate) {
          // update the dom, emit an event, whatever.
          this.currentTime = this.lastTimeUpdate = time;
        }
      }
    }
  }

  isCaptionActive(index: number) {
    const currentLine = this.captionLines[index];
    if (index < this.captionLines.length - 1) {
      return (this.currentTime)
        && (this.currentTime >= currentLine.startTimeMs)
        && (this.currentTime < this.captionLines[index + 1].startTimeMs);
    } else {
      return (this.currentTime)
        && (this.currentTime >= currentLine.startTimeMs);
    }
  }

  onCaptionClick(timeMs: number) {
    this.player.seekTo(timeMs / 1000, true); // allowSeekAhead: boolean
  }

  openSettingsModal() {
    this.showSettingsModal = true;
  }

  closeSettingsModal() {
    this.showSettingsModal = false;
  }

  stopVideo() {
    this.player.stopVideo();
  }

  onPlayerReady(evt: any) {
    // evt.target.playVideo();
  }

  onPlayerStateChange(event: any) {
    if (event.data == YT.PlayerState.PLAYING) {
      // console.log("Player state changed", event.target.getCurrentTime());
    }
  }
}
</script>
<style>
.dictation {
  text-align: center;
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
