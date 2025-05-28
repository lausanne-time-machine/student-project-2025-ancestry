<script setup lang="ts">
import type { DataMap } from '@/utils/person';
import { inject, nextTick, onMounted, ref, type Ref } from 'vue';
import JobDescription from '../components/JobDescription.vue';
import { useRoute } from 'vue-router';

const data = inject<Ref<DataMap>>('data');
if (!data) {
  throw new Error('data not provided');
}

const route = useRoute()
const scrollDone = ref(false)

function handleVisibilityChange() {
  if (document.visibilityState === 'visible' && !scrollDone.value) {
    scroll()
  }
}

onMounted(() => {
  if (document.visibilityState === 'visible') {
    scroll()
  } else {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }
})


function scroll() {
  scrollDone.value = true
  if (route.hash) {
    console.log("scrolling")
    setTimeout(async () => {
      await nextTick()
      let el = document.querySelector(route.hash)
      console.log(el)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }, 300)
  }
}
</script>

<template>
  <main class="flex flex-col items-center">
    <h1 class="text-3xl font-bold mt-10">Liste des emplois</h1>
    <p>Nombre d'emplois: {{ Object.keys(data.jobs).length }}</p>

    <div class="flex flex-col w-screen p-8 gap-4">
      <template v-for="job in data.jobs">
        <div :id="`job-${job.id}`" class="relative -top-[100px] h-0"></div>
        <JobDescription :id="job.id" />
      </template>
    </div>

  </main>
</template>

<style>
html {
  scroll-behavior: smooth;
}
</style>
