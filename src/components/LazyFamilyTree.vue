<!-- LazyFamilyTree.vue -->
<template>
  <div ref="el" class="min-h-[100px] w-fit">
    <FamilyTree v-if="isVisible" :root-person="props.rootPerson" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import FamilyTree from './FamilyTree.vue'
import type { Person } from '@/utils/person';

const props = defineProps<{ rootPerson: Person | undefined }>();

const el = ref<HTMLElement | null>(null)
const isVisible = ref(false)

// Use Intersection Observer from @vueuse/core
useIntersectionObserver(
  el,
  ([{ isIntersecting }]) => {
    if (isIntersecting) isVisible.value = true
  },
  {
    threshold: 0.1, // adjust as needed
  }
)
</script>
