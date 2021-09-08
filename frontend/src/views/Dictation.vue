<template>
  <div class="dictation">
    <transition name="fade">
      <div v-if="showSettingsModal">
        <settings
          :isCaptionBlurCurrent="isCaptionBlur"
          :isTranslationBlurCurrent="isTranslationBlur"
          :isSpellCheckCurrent="isSpellCheck"
          @close="closeSettingsModal"
        ></settings>
      </div>
    </transition>
    <div class="main-container">
      <div class="player-container">
        <loading-spinner v-if="isVideoPlayerLoading"></loading-spinner>
        <div v-if="!isVideoPlayerLoading" id="player"></div>
      </div>
      <div class="captions-settings">
        <loading-spinner v-if="isCaptionLoading"></loading-spinner>
        <div v-if="!isCaptionLoading" class="settings-button-container">
          <button @click="openSettingsModal">Settings</button>
          <button @click="downloadCaptions">Download Captions</button>
        </div>
        <div class="captions-container" v-if="captionLines.length">
          <div v-for="(line, index) in captionLines" :key="index">
            <caption-bar
              :caption="line"
              :index="index"
              :isActive="isCaptionActive(index)"
              :isCaptionBlur="isCaptionBlur"
              :isTranslationBlur="isTranslationBlur"
              :isSpellCheck="isSpellCheck"
              @caption-click="onCaptionClick"
              @prev-caption="goPrevCaption"
              @next-caption="goNextCaption"
              @toggle-play="togglePlay"
            ></caption-bar>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Caption } from '../types/Caption';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import CaptionBar from '@/components/CaptionBar.vue';
import Settings from '@/components/Settings.vue';
import CaptionService from '@/services/CaptionService';
import axios from 'axios';

@Options({
  components: {
    CaptionBar,
    Settings,
    LoadingSpinner,
  },
})

export default class Dictation extends Vue {
  captionLines: Caption[] = [];
  arrayStartTimeMs: number[] = [];
  videoUrl = "";
  videoId!: string; // "H14bBuluwB8", "8KkKuTCFvzI", "1ALfKWG2nmw" (length: 11)
  videoLangCode: string | null = null;
  videoTranslCode: string | null = null;
  videoWidgetUrl!: string; // = `https://www.youtube.com/embed/${this.videoId}?enablejsapi=1`;
  player!: any;
  iframeWindow!: any; // the source "window" that will emit the "message" events
  currentState!: YT.PlayerState;
  currentTime: number | null = null;
  currentIndex = 0; // current caption index
  lastTimeUpdate = 0; // compare against new updates
  isCaptionLoading = false;
  isVideoPlayerLoading = false;
  showSettingsModal = false;
  isCaptionBlur = true;
  isTranslationBlur = true;
  isSpellCheck = true;
  fonrSize = 10;

  async mounted() {
    this.videoId = this.$route.params.id as string;
    this.videoLangCode = this.$route.params.lang as string;
    this.videoTranslCode = this.$route.params.transl as string;

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
    (
      {
        captionLines: this.captionLines,
        arrayStartTimeMs: this.arrayStartTimeMs
      } = await CaptionService.fetchCaptions(
        this.videoId,
        this.videoLangCode as string,
        this.videoTranslCode as string,
      )
    );
    this.isCaptionLoading = false;
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
    this.isVideoPlayerLoading = true;
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
    this.isVideoPlayerLoading = false;
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
          this.currentTime = this.lastTimeUpdate = time;
          if (
            (this.currentIndex < this.captionLines.length - 1) &&
            (this.currentTime < this.captionLines[this.currentIndex].startTimeMs ||
            this.currentTime > this.captionLines[this.currentIndex + 1].startTimeMs)
          ) { 
            // time to change the currentIndex --> move focus to another caption bar
            // maybe can configure the caption.repeat play ...
            this.currentIndex = this.searchActiveIndex(this.currentTime);
          }
        }
      }
    }
  }

  togglePlay() {
    if (this.currentState == YT.PlayerState.PLAYING) {
      this.pauseVideo();
    } else {
      this.playVideo();
    }
  }

  playVideo() {
    this.player.playVideo();
  }

  pauseVideo() {
    this.player.pauseVideo();
  }

  onPlayerReady(evt: any) {
    // evt.target.playVideo();
  }

  onPlayerStateChange(event: any) {
    // console.log("Player state changed", event.target.getCurrentTime());
    this.currentState = event.data;
  }

  isCaptionActive(index: number) {
    return (index === this.currentIndex);
  }

  searchActiveIndex(time: number): number {
    return this.binarySearch(this.arrayStartTimeMs, time);
  }

  binarySearch(array: number[], key: number): number {
    return this.binarySearchR(array, key, 0, array.length - 1);
  }

  binarySearchR(array: number[], key: number, start: number, end: number): number {
    while (end > start + 1) {
      const half: number = start + Math.floor((end - start) / 2);
      if (array[half] < key) {
        start = half;
      } else if (array[half] > key) {
        end = half;
      } else { // array[half] === key
        return half as number;
      }
    }
    return start;
  }

  onCaptionClick(timeMs: number) {
    this.player.seekTo(timeMs / 1000, true); // allowSeekAhead: boolean
  }

  goPrevCaption(index: number) {
    if (index > 0) {
      const timeMs = (this.captionLines[index-1]).startTimeMs;
      this.player.seekTo(timeMs / 1000, true); // allowSeekAhead: boolean
    }
  }

  goNextCaption(index: number) {
    if (index < this.captionLines.length - 1) {
      const timeMs = (this.captionLines[index+1]).startTimeMs;
      this.player.seekTo(timeMs / 1000, true); // allowSeekAhead: boolean
    }
  }

  openSettingsModal() {
    this.showSettingsModal = true;
  }

  closeSettingsModal(
    isCaptionBlur: boolean,
    isTranslationBlur: boolean,
    isSpellCheck: boolean,
  ) {
    // applied the changed setting
    this.showSettingsModal = false;
    this.isCaptionBlur = isCaptionBlur;
    this.isTranslationBlur = isTranslationBlur;
    this.isSpellCheck = isSpellCheck;
  }

  downloadCaptions() {
    let content = "";
    this.captionLines.map(caption => {
      const {h, m, s} = this.getHourMinSec(caption.startTimeMs);
      const hh = (h < 10) ? `0${h}` : `${h}`;
      const mm = (m < 10) ? `0${m}` : `${m}`;
      const ss = (s < 10) ? `0${s}` : `${s}`;
      content += (h > 0) 
        ? `${hh}:${mm}:${ss} ${caption.text.replace(/\n/gi, " ")}\n         ${caption.translation.replace(/\n/gi, " ")}\n\n`
        : `${mm}:${ss} ${caption.text.replace(/\n/gi, " ")}\n      ${caption.translation.replace(/\n/gi, " ")}\n\n`;
    });
    const blob = new Blob([content], {type: 'application/pdf'});
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = "captions.pdf";
    document.body.appendChild(downloadLink);
    downloadLink.click(); // click the link to download
    document.body.removeChild(downloadLink); // remove the link
  }

  getHourMinSec(milliSeconds: number) {
    const seconds = Math.floor(milliSeconds / 1000);
    return {
      h: Math.floor(seconds / 3600),
      m: Math.floor((seconds % 3600) / 60),
      s: (seconds % 3600) % 60
    }
  }
}
</script>

<style lang="scss">
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

.fade-enter-to, .fade-leave-from {
  opacity: 1;
  transition: opacity .5s;
}

.fade-enter-from, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
  transition: opacity .5s;
}
</style>
