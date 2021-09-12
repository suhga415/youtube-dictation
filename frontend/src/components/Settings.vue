<template>
  <div class="settings-backdrop" @click.self="closeSettingsModal">
    <div class="settings-modal">
      <h1>Settings</h1>
      <div class="settings_item settings_blur-toggle">
        <Toggle
          v-model="captionBlur"
          class="toggle-theme"
          onLabel="On"
          offLabel="Off"
        />
        <div class="settings_item_text">Caption blur: {{ captionBlur }}</div>
      </div>
      <div class="settings_item">
        <Toggle
          v-model="translationBlur"
          class="toggle-theme"
          onLabel="On"
          offLabel="Off"
        />
        <div class="settings_item_text">Translation blur: {{ translationBlur }}</div>
      </div>
      <div class="settings_item">
        <Toggle
          v-model="isSpellCheck"
          class="toggle-theme"
          onLabel="On"
          offLabel="Off"
        />
        <div class="settings_item_text">Do spell check: {{ isSpellCheck }}</div>
      </div>
      <div class="settings_item_select">
        <label for="play-mode">Play Mode: </label>
        <select class="settings_item__select-bar" v-model="playMode" id="play-mode">
          <option v-for="item in playModes" :key="item" :value="item">
            {{ item }}
          </option>
        </select>
      </div>
      <div class="settings_item_slider">
        <Slider
          v-model="fontSize"
          class="slider-theme"
          :min="12"
          :max="26"
        />
      </div>
      <div class="settings_item"></div>
      <div class="settings_item"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { PlayModes } from '../types/PlayMode'
import Toggle from '@vueform/toggle';
import Slider from '@vueform/slider';

@Options({
  components: {
    Toggle,
    Slider,
  },
})

export default class Settings extends Vue {
  @Prop() isCaptionBlurCurrent!: boolean;
  @Prop() isTranslationBlurCurrent!: boolean;
  @Prop() isSpellCheckCurrent!: boolean;
  @Prop() playModeCurrent!: string;
  @Prop() fontSizeCurrent!: number;

  captionBlur = true;
  translationBlur = true;
  isSpellCheck = true;
  fontSize: number = 18;
  playModes = Object.values(PlayModes);
  playMode = PlayModes.noPause;

  mounted() {
    this.captionBlur = this.isCaptionBlurCurrent;
    this.translationBlur = this.isTranslationBlurCurrent;
    this.isSpellCheck = this.isSpellCheckCurrent;
    this.fontSize = this.fontSizeCurrent;
    this.playMode = this.playModeCurrent;
  }

  closeSettingsModal() {
    // need to transfer settings variables
    this.$emit('close',
      this.captionBlur,
      this.translationBlur,
      this.isSpellCheck,
      this.fontSize,
      this.playMode,
    );
  }
}
</script>

<style lang="scss">
@import "@vueform/toggle/themes/default.scss";
@import "@vueform/slider/themes/default.scss";

.box{
  height: 10px;
  width: 50px;
  background-color: greenyellow;
}

.settings-modal {
  width: 400px;
  padding: 20px;
  margin: 200px auto;
  background: white;
  border-radius: 10px;
}

.settings-backdrop {
  top: 0;
  position: fixed;
  background: rgba(0,0,0,0.5);
  width: 100%;
  height: 100%;
}

.settings-modal h1 {
  color: #374151;
  border: none;
  padding: 0;
}

.settings-modal p {
  font-style: normal;
}

.settings_item {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
}

.toggle-theme {
  --toggle-bg-on: #91C788;
  --toggle-border-on: #91C788;
  --toggle-text-on: white;
  --toggle-text-off: #374151;
  margin-right: 10px;
}

.settings_item_slider {
  height: 30px;
  margin-top: 60px;
}

.slider-theme {
  --slider-connect-bg: #91C788;
  --slider-tooltip-bg: #91C788;
  --slider-handle-ring-color: #648b5d;
}

</style>
