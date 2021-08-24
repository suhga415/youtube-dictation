import { App, Plugin } from 'vue';

const plugin: Plugin = {
  install(): void {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/player_api';

    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag.parentNode != null) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      (window as any).onYouTubeIframeAPIReady = () => {
      };
    }
  },
};

export default plugin;
