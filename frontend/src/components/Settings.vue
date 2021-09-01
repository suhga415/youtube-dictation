<template>
  <div class="settings-backdrop" @click.self="closeSettingsModal">
    <div class="settings-modal">
      <h1>Settings</h1>
      <div class="settings_item settings_blur-toggle">
        <Toggle v-model="isCaptionBlur" class="toggle-theme" onLabel="On" offLabel="Off" />
        <div class="settings_item_text">Caption blur: {{ isCaptionBlur }}</div>
      </div>
      <div class="settings_item">
        <Toggle v-model="isTranslationBlur" class="toggle-theme" onLabel="On" offLabel="Off" />
        <div class="settings_item_text">Translation blur: {{ isTranslationBlur }}</div>
      </div>
      <div class="settings_item"></div>
      <div class="settings_item"></div>
      <div class="settings_item"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import Toggle from '@vueform/toggle';

@Options({
  components: {
    Toggle,
  },
})

export default class Settings extends Vue {
  isCaptionBlur = true;
  isTranslationBlur = true;

  mounted() {

  }
  // blur level
  // line spacing
  // font size
  // toggle repeat play

  closeSettingsModal() {
    this.$emit('close');
  }
}
</script>

<style lang="scss">
  @import "@vueform/toggle/themes/default.scss";

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

</style>
