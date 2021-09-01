<template>
  <div class="settings-backdrop" @click.self="closeSettingsModal">
    <div class="settings-modal">
      <h1>Settings</h1>
      <Toggle v-model="isCaptionBlur" class="toggle-blue" />
      <div class="output">Data: {{ isCaptionBlur }}</div>
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

<style>
/* scoped src="@vueform/toggle/themes/default.css" */
/* @import "@vueform/toggle/themes/default.css"; */

.toggle-blue {
  --toggle-bg-on: blue;
  --toggle-border-on: blue;
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
    color: #03cfb4;
    border: none;
    padding: 0;
  }
  .settings-modal p {
    font-style: normal;
  }
</style>