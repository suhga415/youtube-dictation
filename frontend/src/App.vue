<template>
  <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>

    <div class="video-select-bar">
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
    </div>

  </div>
  <router-view :key="$route.path"/>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
import { Track } from './types/Track';
import axios from 'axios';

export default class App extends Vue {
  captionTracks: Track[] = [];
  videoUrl = "";
  videoId!: string; // "H14bBuluwB8", "8KkKuTCFvzI", "1ALfKWG2nmw" (length: 11)
  videoLangCode: string | null = null;
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
    await axios.get('http://localhost:4000/caption-tracks', {
      params: {
        videoId: this.videoId,
      }
    })
    .then(response => {
      this.captionTracks = response.data;
    })
    .catch(err => {
      console.log(err.message);
    })
    .finally(() => {
      this.isCaptionTrackLoading = false;
    })
  }

  onSubmit() {
    this.$router.push({
      name: 'dictation',
      params: {
        id: this.videoId,
        lang: this.videoLangCode,
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
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.video-select-bar {
  background-color: #9DDAC6;
  height: 50px;
}
</style>
