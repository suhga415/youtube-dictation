<template>
  <div class="caption-bar">
    <div class="caption-bar__answer">{{ text }}</div>
    <input class="caption-bar__input" type="text">
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

@Options({
  props: {
    text: String,
  },
})
export default class CaptionBar extends Vue {
  mounted() {

  }
}
</script>

<style>
.caption-bar {
  height: 50px;
  width: 500px;
  text-align: left;
  padding: 5px 10px;
  margin-bottom: 20px;
  border-radius: 7px;
  background-color: #F3F1F5;
}
.caption-bar__answer {
  margin-bottom: 5px;
}
.caption-bar__input{
  width: 100%;
}
</style>