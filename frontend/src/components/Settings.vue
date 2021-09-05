<template>
  <div class="settings-backdrop" @click.self="closeSettingsModal">
    <div class="settings-modal" v-bind:class="{ 'settings-modal--show': show }">
      <h1>Settings</h1>
      <div class="settings_item settings_blur-toggle">
        <Toggle
          v-model="captionBlur"
          class="toggle-theme"
          onLabel="On"
          offLabel="Off"
          @change="onCaptionToggle"
        />
        <div class="settings_item_text">Caption blur: {{ captionBlur }}</div>
      </div>
      <div class="settings_item">
        <Toggle
          v-model="translationBlur"
          class="toggle-theme"
          onLabel="On"
          offLabel="Off"
          @change="onTranslationToggle"
        />
        <div class="settings_item_text">Translation blur: {{ translationBlur }}</div>
      </div>
      <div class="settings-slider" >
        <Slider v-model="captionBlurLvl" :max="7" @change="onCaptionBlurLvlChange" />
      </div>
      <div class="settings-slider" >
        <Slider v-model="translationBlurLvl" :max="7" @change="onTranslationBlurLvlChange" />
      </div>
      <div class="settings_item"></div>
      <div class="settings_item"></div>
      <div class="settings_item"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import Toggle from '@vueform/toggle';
import Slider from '@vueform/slider';

@Options({
  components: {
    Toggle,
    Slider,
  },
})

export default class Settings extends Vue {
  @Prop() show!: boolean; // is this modal currently showed to user?
  @Prop() isCaptionBlurCurrent!: boolean;
  @Prop() isTranslationBlurCurrent!: boolean;
  @Prop() captionBlurLvlCurrent!: number;
  @Prop() translationBlurLvlCurrent!: number;
  @Prop() lineSpacingLvlCurrent!: number;
  @Prop() fontSizeCurrent!: number;
  @Prop() spellCheckCurrent!: boolean;

  captionBlur = true;
  translationBlur = true;
  captionBlurLvl = 2; // default
  translationBlurLvl = 2; // default
  lineSpacingLvl = 4;
  fonrSize = 10;

  mounted() {
    this.captionBlur = this.isCaptionBlurCurrent;
    this.translationBlur = this.isTranslationBlurCurrent;
    this.captionBlurLvl = this.captionBlurLvlCurrent;
    this.translationBlurLvl = this.translationBlurLvlCurrent;
    console.log(this.captionBlurLvl, this.translationBlurLvl);
  }

  onCaptionToggle(value: boolean) {
    if (value) {
      this.captionBlurLvl = 1;
    } else {
      this.captionBlurLvl = 0;
    }
  }

  onTranslationToggle(value: boolean) {
    if (value) {
      this.translationBlurLvl = 1;
    } else {
      this.translationBlurLvl = 0;
    }
  }

  onCaptionBlurLvlChange(value: number) {
    if (value === 0) {
      this.captionBlur = false;
    } else {
      this.captionBlur = true;
    }
  }

  onTranslationBlurLvlChange(value: number) {
    if (value === 0) {
      this.translationBlur = false;
    } else {
      this.translationBlur = true;
    }
  }

  closeSettingsModal() {
    // need to transfer settings variables
    this.$emit('close',
      this.captionBlur,
      this.translationBlur,
      this.captionBlurLvl,
      this.translationBlurLvl
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
// .settings-modal--show {
//   transition: 0.2s; // transition  doesn't work in this way.
// }
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
  --toggle-bg-on: #42b983;
  --toggle-border-on: #42b983;
  --toggle-text-on: white;
  --toggle-text-off: #374151;
  margin-right: 10px;
}

.settings-slider {
  height: 30px;
  margin: 40px 0px 20px 0px;
}

</style>
