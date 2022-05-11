<template>
  <div class="home">
    <div class="history-container" v-if="history.length">
      <div v-for="(item, index) in history" :key="index">
        <video-card
          :videoMetadata="item"
          @remove="removeVideo"
        ></video-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import VideoCard from '@/components/VideoCard.vue';
import { VideoMetadata } from '@/types/VideoMetadata';
import LocalStorageService from '@/services/LocalStorageService';

@Options({
  components: {
    VideoCard,
  },
})

export default class Home extends Vue {
  history: VideoMetadata[] = [];

  async mounted() {
    this.history = LocalStorageService.getHistoryList();
  }

  removeVideo(id: string) {
    LocalStorageService.removeVideo(id);
    this.history = LocalStorageService.getHistoryList();
  }
}
</script>

<style lang="scss">
.home {
  padding: 80px;
}

.history-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
