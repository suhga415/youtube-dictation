<template>
  <div class="dictation">
    <transition name="fade">
      <div v-if="showSettingsModal">
        <settings
          :isCaptionBlurCurrent="isCaptionBlur"
          :isTranslationBlurCurrent="isTranslationBlur"
          :isSpellCheckCurrent="isSpellCheck"
          :fontSizeCurrent="fontSize"
          :playModeCurrent="playMode"
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
          <button class="dication-button dication-button__settings" @click="openSettingsModal">Settings</button>
          <button class="dication-button dication-button__download" @click="downloadCaptions">Download Captions</button>
          <button class="dication-button dication-button__save" @click="onClickSave">Save</button>
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
              :fontSize="fontSize"
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
import { PlayModes } from '@/types/PlayMode';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import CaptionBar from '@/components/CaptionBar.vue';
import Settings from '@/components/Settings.vue';
import CaptionService from '@/services/CaptionService';

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
  prevTime = 0; // compare against new updates
  currentTime = 0;
  currentIndex = 0; // current caption index
  isCaptionLoading = false;
  isVideoPlayerLoading = false;
  showSettingsModal = false;
  isCaptionBlur = true;
  isTranslationBlur = true;
  isSpellCheck = true;
  fontSize = 16;
  playMode = PlayModes.noPause;
  timer = -1; // timer id for setTimeout()
  isSectionPlay = false;
  isReplay = false;
  pauseToLoop = false;

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

  async handlePostMessage(event: any) {
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
        if (time !== this.currentTime) {
          this.prevTime = this.currentTime;
          this.currentTime = time;
          if (
            (this.currentIndex < this.captionLines.length - 1) &&
            (this.currentTime < this.captionLines[this.currentIndex].startTimeMs ||
            this.currentTime >= this.captionLines[this.currentIndex + 1].startTimeMs)
          ) {
            // time to change the currentIndex --> move focus to another caption bar
            this.currentIndex = this.searchActiveIndex(this.currentTime);
            if (this.isSectionPlay) {
              // reset Timer
              this.setTimer();
            }
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

  pauseVideo() { // *** TODO: check!!!
    if (this.pauseToLoop) {
      // try to loop... go back and replay
      this.pauseToLoop = false;
      this.player.seekTo(this.captionLines[this.currentIndex].startTimeMs / 1000, true);
      this.playVideo();
    } else {
      this.player.pauseVideo();
    }
  }

  onPlayerReady(evt: any) {
    // evt.target.playVideo();
  }

  // When the player state changed, can do `event.target.getCurrentTime()`
  onPlayerStateChange(event: any) {
    this.currentState = event.data;

    if (this.isSectionPlay) {
      if (event.data === YT.PlayerState.PLAYING) {
        console.log("play!");
        this.setTimer();
      } else if (event.data === YT.PlayerState.PAUSED) {
        console.log("pause!");
        this.clearTimer();
      }
    }

  }

  setTimer() {
    this.clearTimer();
    const duration = this.captionLines[this.currentIndex].endTimeMs - Math.ceil(this.player.getCurrentTime() * 100) * 10;
    console.log("setTImer: ", duration)
    if (duration > 0) {
      this.timer = setTimeout(()=> {
        if (this.isReplay) {
          // this.player.seekTo(this.captionLines[this.currentIndex].startTimeMs / 1000, true);
          // *** TODO: and set a loop again!!!
          this.pauseToLoop = true;
        } else {
          this.pauseToLoop = false;
        }
        this.pauseVideo();
      }, duration);
    }
  }

  clearTimer() {
    console.log("clearTImer")
    clearTimeout(this.timer);
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
    // reset timer
    this.currentIndex = this.searchActiveIndex(timeMs);
    this.player.seekTo(timeMs / 1000, true); // allowSeekAhead: boolean
    if (this.isSectionPlay) {
      this.setTimer();
    }
  }

  goPrevCaption(index: number) {
    if (index > 0) {
      // reset timer
      this.currentIndex = index - 1;
      const timeMs = (this.captionLines[index - 1]).startTimeMs;
      this.player.seekTo(timeMs / 1000, true); // allowSeekAhead: boolean
      if (this.isSectionPlay) {
        this.setTimer();
      }
    }
  }

  goNextCaption(index: number) {
    if (index < this.captionLines.length - 1) {
      // reset timer
      this.currentIndex = index + 1;
      const timeMs = (this.captionLines[index + 1]).startTimeMs;
      this.player.seekTo(timeMs / 1000, true); // allowSeekAhead: boolean
      if (this.isSectionPlay) {
        this.setTimer();
      }
    }
  }

  openSettingsModal() {
    this.showSettingsModal = true;
  }

  closeSettingsModal(
    isCaptionBlur: boolean,
    isTranslationBlur: boolean,
    isSpellCheck: boolean,
    fontSize: number,
    playMode: string,
  ) {
    // applied the changed setting
    this.showSettingsModal = false;
    this.isCaptionBlur = isCaptionBlur;
    this.isTranslationBlur = isTranslationBlur;
    this.isSpellCheck = isSpellCheck;
    this.fontSize = fontSize;
    this.playMode = playMode;
    switch (this.playMode) {
      case PlayModes.noPause:
        this.isSectionPlay = false;
        this.isReplay = false;
        this.clearTimer();
        break;
      case PlayModes.pause:
        this.isSectionPlay = true;
        this.isReplay = false;
        break;
      case PlayModes.repeat:
        this.isSectionPlay = true;
        this.isReplay = true;
        break;
      default:
        console.log("no such mode");
    }
  }

// TODO: move these to CaptionService.ts
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
    const blob = new Blob([content], {type: 'text/plain'});
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = "captions.txt";
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

  onClickSave() {
    
  }
}
</script>

<style lang="scss">
.dictation {
  text-align: center;
  height: 80%;
}

.main-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: #F3F1F5;
}

.video-container {
  margin-right: 10px;
}

.captions-container {
  height: 600px;
  padding: 20px;
  margin-left: 10px;
  background-color: #F3F1F5;
  overflow: auto;
}

.dication-button {
  border: none;
  margin: 15px;
  padding: 10px;
  width: 120px;
  overflow: visible;
  background: #276678;
  border-radius: 8px;
  font: inherit;
  color: white;
  font-size: 15px;
  line-height: normal;
}

.dication-button:hover {
  background-color: #1687A7;
}

.dication-button__download {
  width: 200px;
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
