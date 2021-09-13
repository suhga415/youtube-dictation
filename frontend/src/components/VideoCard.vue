<template>
  
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

export default class VideoCard extends Vue {
}
</script>
