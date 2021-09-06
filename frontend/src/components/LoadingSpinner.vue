<template>
  <!-- <div class="box-dots">
    <div class="dot"></div>
    <div class="dot"></div>
    <div class="dot"></div>
  </div> -->
  <div class="loading-spinner-container">
    <div class="loading-spinner"></div>
    <div class="loading-spinner-text" v-if="message.length > 0">{{message}}</div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';

@Options({
  components: {
  },
})

export default class LoadingSpinner extends Vue {
  // @Prop() loading!: boolean;
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

// .box-dots {
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   width: 80px;
//   animation: 1s box-dots-animation infinite ease-in-out;
// }
// .dot {
//   background-color: black;
//   height: 10px;
//   width: 10px;
//   border-radius: 5px;
// }

// @keyframes box-dots-animation {
//   0% {
//     transform: none;
//   }
//   50% {
//     transform: rotate(180deg);
//   }
//   100% {
//     transform: rotate(180deg);
//   }
// }
</style>
