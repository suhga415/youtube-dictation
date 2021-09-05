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

@Options({
  components: {
    Toggle,
  },
})

export default class Settings extends Vue {
  @Prop() isCaptionBlurCurrent!: boolean;
  @Prop() isTranslationBlurCurrent!: boolean;
  @Prop() fontSizeCurrent!: number;
  @Prop() spellCheckCurrent!: boolean;

  captionBlur = true;
  translationBlur = true;
  fonrSize = 10;

  mounted() {
    this.captionBlur = this.isCaptionBlurCurrent;
    this.translationBlur = this.isTranslationBlurCurrent;
  }

  closeSettingsModal() {
    // need to transfer settings variables
    this.$emit('close',
      this.captionBlur,
      this.translationBlur,
    );
  }
}
</script>

<style lang="scss">
@import "@vueform/toggle/themes/default.scss";

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
