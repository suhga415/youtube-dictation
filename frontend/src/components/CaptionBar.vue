<template>
  <div
    class="caption-bar"
    v-bind:class="{ 'caption-bar--active': isActive }"
  >
    <div class="caption-bar__answer">{{ caption.text }}</div>
    <input
      :id="'captionInput'+caption.startTimeMs"
      ref="captionInput"
      class="caption-bar__input"
      v-bind:class="{ 'caption-bar__input--active': isActive }"
      type="text"
    />
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
.caption-bar--active {
  background-color: #64C9CF;
}
.caption-bar__answer {
  margin-bottom: 5px;
}
.caption-bar__input{
  width: 100%;
}
</style>
