<template>
  <div class="home">
    <h1>Welcome!</h1>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import LocalStorageService from '@/services/LocalStorageService';

@Options({
  components: {
    LoadingSpinner,
  },
})

export default class Home extends Vue {
}
</script>
