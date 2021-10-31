import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { VaInput, VaButton, VaSelect } from 'vuestic-ui'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCog, faArrowCircleDown, faDownload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faCog);
library.add(faDownload);
library.add(faArrowCircleDown);

createApp(App)
  .use(router)
  .component('va-input', VaInput)
  .component('va-button', VaButton)
  .component('va-select', VaSelect)
  .component('font-awesome-icon', FontAwesomeIcon)
  .mount('#app');
