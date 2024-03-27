<template>
  <div class="home">
    <HeaderComponent />
    <ChatComponent />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import HeaderComponent from '@/components/HeaderComponent.vue'
import ChatComponent from "@/components/ChatComponent.vue"
import { OllamaRequester } from '@/scripts/OllamaRequester';
import router from "@/router"


export default defineComponent({
  components: {
    HeaderComponent,
    ChatComponent,
  },
  data() {
    return {
      ollamaRequester: new OllamaRequester(),
    };
  },
  async beforeMount() {
    const missingModels = await this.ollamaRequester.updateMissingModel();
    if (missingModels.length !== 0) router.push({ path: '/missing-models-view' })
  }
});

</script>


<style>
@import "@/assets/css/home-view.css";
</style>
