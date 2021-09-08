<template>
  <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>

    <div class="video-select-bar">
      <div class="video-select-bar_item">
        <label for="yt-url">Video URL: </label>
        <input
          class="url-input-bar"
          v-model="videoUrl"
          type="text"
          id="yt-url"
          name="yt-url"
          placeholder="youtube.com/watch?v=1NC-cbrEB4U"
          @input="onUrlInputChange"
        >
      </div>
      <div class="video-select-bar_item">
        <label for="yt-lang">Language: </label>
        <select class="language-select-bar" v-model="videoLangCode" id="yt-lang">
          <option disabled value="">Please select one</option>
          <option v-for="(item, index) in captionTracks" :key="index" :value="item.langCode">
            {{ item.langName }}
          </option>
        </select>
      </div>
      <div class="video-select-bar_item">
      <label for="yt-transl">Translation: </label>
        <select class="language-select-bar" v-model="videoTranslCode" id="yt-transl">
          <option disabled value="">Please select one</option>
          <option v-for="(item, index) in captionTracks" :key="index" :value="item.langCode">
            {{ item.langName }}
          </option>
        </select>
      </div>
      <button class="video-select-bar_button" @click="onClickSubmit">SUMBIT</button>
    </div>

  </div>
  <router-view :key="$route.path"/>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
import { Track } from './types/Track';
import CaptionService from './services/CaptionService';

export default class App extends Vue {
  captionTracks: Track[] = [];
  videoUrl = "";
  videoId!: string; // "H14bBuluwB8", "8KkKuTCFvzI", "1ALfKWG2nmw" (length: 11)
  videoLangCode: string | null = null;
  videoTranslCode: string | null = null;
  isCaptionTrackLoading = false;

  async onUrlInputChange(event: any) {
    const prefix = "youtube.com/watch?v=";
    if ((this.videoUrl).includes(prefix) && this.videoUrl.length >= prefix.length + 11) {
      // 1. refine the input value, extract video ID
      this.videoId = (this.videoUrl.replace("https://www.", "")).replace(prefix, "");
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
    // Hmmm is there a better way to check?
    const url = "http://img.youtube.com/vi/" + id + "/mqdefault.jpg";
    const { status } = await fetch(url);
    if (status === 404) return false;
    return true;
  }

  async fetchCaptionTracks() {
    this.isCaptionTrackLoading = true;
    this.captionTracks = await CaptionService.fetchCaptionTracks(this.videoId);
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
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #32a9ca;
}

.video-select-bar {
  /* background-color: #9DDAC6; */
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-select-bar_item {
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
}

.video-select-bar_button {
  border: none;
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

.video-select-bar_button:hover {
  background-color: #1687A7;
}
</style>
