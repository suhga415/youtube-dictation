<template>
  <div id="nav">
    <!-- <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link> -->
    <i class="fa-regular fa-pen-to-square" />
    <div class="app-title">Dictationary!</div>
    <div class="video-select-bar">
      <div class="video-select-bar__item">
        <va-input
          id="yt-url"
          class="url-input-bar mb-4"
          v-model="videoUrl"
          label="YouTube Video URL"
          placeholder="https://youtube.com/watch?v=1NC-cbrEB4U"
          @input="onUrlInputChange"
        />
        <!-- <n-input
          id="yt-url"
          label="YouTube Video URL"
          v-model:value="videoUrl"
          type="text"
          placeholder="https://youtube.com/watch?v=1NC-cbrEB4U"
          @input="onUrlInputChange"
        /> -->
      </div>
      <div class="video-select-bar__item">


        <!-- <label for="yt-lang">Caption </label>
        <select class="language-select-bar" v-model="videoLangCode" id="yt-lang">
          <option value="" disabled selected>Please select one</option>
          <option v-for="(item, index) in captionTracks" :key="index" :value="item.langCode">
            {{ item.langName }}
          </option>
        </select> -->

        <va-select
          class="language-select-bar mb-4"
          label="Caption Language"
          v-model="videoLangCode"
          :options="captionTracks"
          value-by="value"
          max-height="512px"
        />

        <!-- <n-select
          v-model:value="videoLangCode"
          :options="captionTracks"
        /> -->

      </div>

      <div class="video-select-bar__item">

        <!-- <label for="yt-transl">Translation </label>
        <select class="language-select-bar" v-model="videoTranslCode" id="yt-transl">
          <option value="" disabled selected>Please select one</option>
          <option v-for="(item, index) in captionTracks" :key="index" :value="item.langCode">
            {{ item.langName }}
          </option>
        </select> -->

        <va-select
          class="language-select-bar mb-4"
          label="Translation Language"
          v-model="videoTranslCode"
          :options="captionTracks"
          value-by="value"
          max-height="512px"
        />

      </div>

      <!-- <button class="video-select-bar__button" @click="onClickSubmit">SUMBIT</button> -->
      <va-button class="video-select-bar__button mr-4" @click="onClickSubmit" color="info">SUMBIT</va-button>
      <!-- <n-button @click="onClickSubmit" type="primary">SUMBIT</n-button> -->
    </div>

  </div>
  <router-view :key="$route.path"/>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Track } from './types/Track';
// import { NButton, NInput, NSelect } from 'naive-ui'
import CaptionService from './services/CaptionService';

// @Options({
//   components: {
//     NButton,
//     NInput,
//     NSelect,
//   },
// })

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
  background: #276678;
  border-radius: 8px;
  font: inherit;
  color: white;
  font-size: 15px;
  line-height: normal;
}

.video-select-bar__button:hover {
  background-color: #1687A7;
}
</style>
