<template>
  <div id="nav">
    <i class="fa-regular fa-pen-to-square" />
    <div class="app-title">Dictationary!</div>
    <div class="video-select-bar">
      <div class="video-select-bar__item">
        <va-input
          id="yt-url"
          class="url-input-bar mb-4"
          v-model="videoUrl"
          label="YouTube Video URL"
          placeholder="https://youtube.com/watch?v=H14bBuluwB8"
          @input="onUrlInputChange"
        />
      </div>
      <div class="video-select-bar__item">
        <va-select
          class="language-select-bar mb-4"
          label="Caption Language"
          v-model="videoLangCode"
          :options="captionTracks"
          value-by="value"
          max-height="512px"
        />
      </div>
      <div class="video-select-bar__item">
        <va-select
          class="language-select-bar mb-4"
          label="Translation Language"
          v-model="videoTranslCode"
          :options="captionTracks"
          value-by="value"
          max-height="512px"
        />
      </div>
      <div class="video-select-bar__item">
        <va-button
          class="video-select-bar__button"
          @click="onClickSubmit"
          color="#618fdf"
        >SUMBIT</va-button>
      </div>
    </div>

  </div>
  <router-view :key="$route.path"/>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Track } from './types/Track';
import CaptionService from './services/CaptionService';

export default class App extends Vue {
  captionTracks: any[] = [];
  videoUrl = "";
  videoId!: string; // "H14bBuluwB8", "8KkKuTCFvzI", "1ALfKWG2nmw" (length: 11)
  videoLangCode: string = "";
  videoTranslCode: string = "";
  isCaptionTrackLoading = false;

  async onUrlInputChange(event: any) {
    const prefix = "youtube.com/watch?v=";
    if ((this.videoUrl).includes(prefix) && this.videoUrl.length >= prefix.length + 11) {
      // 1. refine the input value, extract video ID
      this.videoId = (this.videoUrl.replace("https://", "")).replace("www.", "").replace(prefix, "");
      // 2. check if it's a valid video ID / the video exists
      if (this.validVideoId(this.videoId)) {
        // 3. update language options
        await this.fetchCaptionTracks();
      } else {
        this.captionTracks = [];
      }
    }
  }

  async validVideoId(id: string) {
    // TODO: is there a better way to check?
    const url = "http://img.youtube.com/vi/" + id + "/mqdefault.jpg";
    const { status } = await fetch(url);
    if (status === 404) return false;
    return true;
  }

  async fetchCaptionTracks() {
    this.isCaptionTrackLoading = true;
    const captionTracksRes = await CaptionService.fetchCaptionTracks(this.videoId);
    this.captionTracks = captionTracksRes.map((item) => {
      return {
        text: item.langName,
        value: item.langCode,
      }
    })
    this.isCaptionTrackLoading = false;
  }

  onClickSubmit() {
    this.$router.push({
      name: 'dictation',
      params: {
        id: this.videoId,
        lang: this.videoLangCode,
        transl: this.videoTranslCode,
      }
    })
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,400;1,700&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@200;600;700&display=swap');

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  /* background-color: darkblue; */
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

#nav {
  padding: 20px;
  display: flex;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #32a9ca;
}

.app-title {
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 30px;
  color: black;
}

.video-select-bar {
  /* background-color: #9DDAC6; */
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-select-bar__item {
  margin: 0 20px;
}

.url-input-bar {
  width: 300px;
  height: 20px;
  outline: none;
}

.language-select-bar {
  height: 20px;
  outline: none;
  /* padding: .8em .5em; */
}

select:required:invalid {
  color: red;
}

.video-select-bar__button {
  border: none;
  padding: 10px;
  width: 120px;
  overflow: visible;
  background: #82a3dd;
  border-radius: 8px;
  font: inherit;
  color: white;
  font-size: 15px;
  line-height: normal;
}

.video-select-bar__button:hover {
  background-color: #bdceec;
}
</style>
