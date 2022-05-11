<template>
  <div class="video-card">
    <img
      class="video-card__thumbnail"
      v-bind:src="videoMetadata.thumbnail"
      height="140"
      alt=""
      @click="onClick"
    >
    <div class="video-card__title">
      <h3>{{videoMetadata.title}}</h3>
    </div>
    <div class="video-card__author">
      <p>{{videoMetadata.author}}</p>
    </div>
    <div class="video-card__remove">
      <button class="remove-button" @click="removeVideo">
        <font-awesome-icon icon="trash" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { VideoMetadata } from "@/types/VideoMetadata";
import { Vue } from "vue-class-component";
import { Prop, Watch } from 'vue-property-decorator';

export default class VideoCard extends Vue {
  @Prop() videoMetadata!: VideoMetadata;

  onClick() {
    this.$router.push({
      name: 'dictation',
      params: {
        id: this.videoMetadata.id,
        lang: this.videoMetadata.langCode,
        transl: this.videoMetadata.translCode,
      }
    })
  }
  
  removeVideo() {
    this.$emit('remove', this.videoMetadata.id);
  }
}
</script>

<style lang="scss">
h3, p {
  margin: 0;
}

.video-card {
  width: 1000px;
  margin-bottom: 40px;
  outline: solid #aebed6 1px;
  border-radius: 10px;
  display: grid;
  grid-template-columns: 25% 70% 5%;
  grid-template-rows: 60% 40%;
}

.video-card__thumbnail {
  cursor: pointer;
  border-radius: 10px 0px 0px 10px;
  grid-column: 1 / 2;
	grid-row: 1 / 3;
}

.video-card__title {
  grid-column: 2 / 3;
	grid-row: 1 / 2;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px 10px;
}

.video-card__author {
  grid-column: 2 / 3;
	grid-row: 2 / 3;
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-card__remove {
  grid-column: 3 / 4;
	grid-row: 1 / 2;
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.remove-button {
  cursor: pointer;
  width: 27px;
  height: 27px;
  font-size: 15px;
  border-radius: 30%;
  background-color: rgb(243, 72, 109);
  color: white;
  border: none;
}
</style>
