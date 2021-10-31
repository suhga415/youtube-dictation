<template>
  <div class="loading-spinner-container">
    <div class="loading-spinner"></div>
    <div class="loading-spinner-text" v-if="message.length > 0">{{message}}</div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

@Options({
  components: {
  },
})

export default class LoadingSpinner extends Vue {
  message = "Loading...";

}
</script>

<style lang="scss">
.loading-spinner-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.loading-spinner {
  margin: 0, auto;
  border-radius: 100%;
  border: 3px solid #eeecec;
  border-top: 3px solid #64C9CF;
  width: 27px;
  height: 27px;
  animation: loading-spinner-spin 1s linear infinite;
}

@keyframes loading-spinner-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner-text {
  margin-top: 7px;
  color: rgb(80, 80, 80);
  font-size: 14px;
  text-align: center;
}
</style>
