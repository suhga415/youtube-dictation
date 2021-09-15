import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { VaInput, VaButton, VaSelect } from 'vuestic-ui'
// import './assets/reset.css';


createApp(App)
  .use(router)
  .component('va-input', VaInput)
  .component('va-button', VaButton)
  .component('va-select', VaSelect)
  .mount('#app');
