<template>
  <div class="home">
    <!-- <youtube-iframe
      :video-id="videoId"
      :player-width="640"
      :player-height="360"
      @ready="onReady"
      @state-change="onChange"
      ref="yt"
    ></youtube-iframe> -->
    <div id="player" ref="yt"/>
    <!-- <iframe
      id="player"
      width="640"
      height="360"
      :src="videoUrl"
      title="YouTube video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
      @change="handleClick"
    ></iframe> -->
    <div v-if="captionLines.length">
      <div v-for="(line, index) in captionLines" :key="index">
        <caption-bar :text="line"></caption-bar>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
// import { Player } from '@techassi/vue-youtube-iframe';
// import YT from "@types/youtube";
import CaptionBar from '@/components/CaptionBar.vue'; // @ is an alias to /src
import axios from 'axios';
// import YouTubeIframeLoader from "youtube-iframe";
    
@Options({
  components: {
    CaptionBar,
  },
})


export default class Home extends Vue {
  captionLines: string[] = [];
  videoId = "H14bBuluwB8";
  videoUrl = `https://www.youtube.com/embed/${this.videoId}?enablejsapi=1`;
  player!: any;
// "http://www.youtube.com/embed/M7lc1UVf-VE?enablejsapi=1&origin=http://example.com"


  async mounted() {
    console.log("mounted...");

    // this.player = this.$refs.yt as typeof Player;

    // let tag = document.createElement('script')
    // tag.setAttribute('src', 'https://www.youtube.com/iframe_api');
    // const firstScriptTag = document.getElementsByTagName("script")[0];
    // document.head.appendChild(tag);

    // this.player = document.getElementById('player');

    // window.YTConfig = {
    //   host: 'https://www.youtube.com/iframe_api'
    // };
    // const host = 'https://www.youtube.com';

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
  }

  // onYouTubeIframeAPIReady() {
  //   YouTubeIframeLoader.load((YT) => {
  //     const player = new YT.Player('player', {
  //       height: '360',
  //       width: '640',
  //       videoId: this.videoId,
  //       events: {
  //         'onReady': this.onPlayerReady,
  //         'onStateChange': this.onPlayerStateChange
  //       }
  //     });
  //   });
  // }

  // initYoutube() {
  //   console.log("initYoutube");
  //   this.player = new YT.Player("player", {
  //     // startSeconds: '1999',
  //     width: 640,
  //     height: 360,
  //     videoId: this.videoId,
  //     events: {
  //       onReady: this.onPlayerReady,
  //       onStateChange: this.onPlayerStateChange
  //     }
  //   });
  // }

  onReady() {
    console.log("ready");
  }

  onChange(event: any) {
    console.log(event.target.getCurrentTime());
    if (event.data == YT.PlayerState.PLAYING) {
      console.log(event.data);      
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
    console.log("Player state changed", event.target.getCurrentTime());
  }

  // onYouTubeIframeAPIReady = () => {
  //   console.log("onYouTubeIframeAPIReady");
  //   this.initYoutube();
  // };

}
</script>
