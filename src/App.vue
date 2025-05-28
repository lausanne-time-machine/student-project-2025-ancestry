<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref, provide } from 'vue'
import { loadData, Person, type DataMap } from './utils/person'

const data = ref<DataMap>({persons: {}, jobs: {}})
const rootPersons = ref<Person[]>([])
const isLoading = ref(true)

provide('data', data)
provide('rootPersons', rootPersons)

loadData().then(loadedData => {
  data.value = loadedData
  rootPersons.value = Object.values(loadedData.persons).filter(person => !person.parentId)
  isLoading.value = false
  console.log("ready")
})
</script>

<template>
  <header class="sticky top-0 z-50 bg-white shadow-md">
    <nav class="container mx-auto flex items-center justify-between p-4">
      <a href="#" class="flex items-center space-x-2">
        <img src="/logo.jpg" alt="Logo" class="h-8 w-auto">
        <span class="text-xl font-bold">Lausanne Ancestry</span>
      </a>
      <ul class="flex space-x-4">
        <RouterLink to="/">Accueil</RouterLink>
        <RouterLink to="/trees">Arbres</RouterLink>
        <RouterLink to="/jobs">Liste des emplois</RouterLink>
        <RouterLink to="/graph">Visualisation interactive</RouterLink>
        <RouterLink to="/analysis">Analyse des données</RouterLink>
      </ul>
    </nav>
  </header>



  <!-- <div v-if="isLoading" class="flex items-center justify-center h-screen">
    <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
  </div>
  <div v-else> -->

    <RouterView />
  <!-- </div> -->
</template>