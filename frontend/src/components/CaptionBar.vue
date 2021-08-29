<template>
  <div
    class="caption-bar"
    v-bind:class="{ 'caption-bar--active': isActive }"
  >
    <div class="caption-bar__answer">{{ caption.text }}</div>
    <textarea
      :id="'captionInput'+caption.startTimeMs"
      ref="captionInput"
      class="caption-bar__input"
      v-bind:class="{ 'caption-bar__input--active': isActive }"
      type="text"
      @click="onInputClick"
    ></textarea>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Prop, Watch, Ref } from 'vue-property-decorator';
import { Caption } from '../types/Caption';

@Options({
})

export default class CaptionBar extends Vue {
  @Prop() caption!: Caption;
  @Prop() isActive!: boolean;

  mounted() {
  }

  @Watch('isActive')
  onChangeActive(value: boolean) {
    if (this.isActive) {
      const input = document.getElementById(`captionInput${this.caption.startTimeMs}`);
      if (input) {
        input.focus();
      }
    }
  }

  onInputClick(event: any) {
    const startTimeMS = parseInt(event.srcElement.id.replace("captionInput", ""));
    this.$emit("caption-click", startTimeMS);
  }
}
</script>

<style>
.caption-bar {
  /* height: 50px; */
  width: 500px;
  text-align: left;
  padding: 5px 10px;
  margin-bottom: 20px;
  border-radius: 7px;
  background-color: #F3F1F5;
}
.caption-bar--active {
  background-color: #64C9CF;
}
.caption-bar__answer {
  margin-bottom: 5px;
  color: transparent;
  text-shadow: 0 0 8px #111;
  transition: 0.2s;
}
.caption-bar__answer:hover {
  color: #111;
  text-shadow: none;
}

/* h1 {
  font-size: 4em;
  text-align: center;
  color: transparent;
  text-shadow: #111 0 0 15px;
  transition: 0.4s;
  font-family: HelveticaNeue;
  
  &:hover {
    color: #111;
    text-shadow: none;
  }
} */

.caption-bar__input{
  width: 100%;
}
</style>
