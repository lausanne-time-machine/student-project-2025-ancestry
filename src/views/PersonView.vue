<script setup lang="ts">
import FamilyTree from '@/components/FamilyTree.vue';
import type { CensusEntry, Person, DataMap } from '@/utils/person';
import { computed } from '@vue/reactivity';
import { inject, ref, type Ref } from 'vue';


const props = defineProps<{
	id: string
}>()

const data = inject<Ref<DataMap>>('data');
const person = computed(() => data?.value.persons[props.id])

function keyTranslation(key: string) {
	switch (key) {
		case "censusYear":
			return "année de recensement"
		case "censusPage":
			return "page"
		case "censusRow":
			return "ligne"
		case "firstName":
			return "prénom"
		case "lastName":
			return "nom"
		case "birthYear":
			return "année de naissance"
		case "origin":
			return "origine"
		case "job":
			return "emploi"
		case "houseNb":
			return "numéro"
		case "streetName":
			return "rue"
		case "parentCensusEntry":
			return "entrée du parent"
		case "person":
			return "id de la personne"
		default:
			return key;
	}
}

</script>

<template>
	<div class="flex flex-col gap-2 m-8" v-if="person">
		<h1 class="text-xl font-bold">{{ person.name }}#{{ person.id }}</h1>
		<RouterLink :to="{ name: 'person', params: { id: person.parentId } }" v-if="person.parentId">
			<h3 class="underline">Lien vers le parent</h3>
		</RouterLink>

		<div class="flex flex-col">
			<h3 class="text-xl font-semibold text-gray-800 mb-2">
				Emploi:
			</h3>
			<ul class="flex flex-col list-disc list-inside space-y-1 text-gray-700">
				<li v-for="(jobId, index) in person.jobIds" :key="jobId">
					<RouterLink :to="{ name: 'jobs', hash: `#job-${jobId}` }" class="underline">
						{{ person.censusYears[index] }}: {{ data?.jobs[jobId]?.job || '—' }}
					</RouterLink>
				</li>
			</ul>
		</div>

		<div class="overflow-x-auto shadow-md rounded-lg">
			<table class="min-w-full bg-white">
				<thead class="bg-gray-800 text-white">
					<tr>
						<th class="py-3 px-6 text-left" v-for="key in Object.keys(person.censusEntries[0])">{{
							keyTranslation(key) }}
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					<tr class="hover:bg-gray-100" v-for="entry in person.censusEntries">
						<td class="py-4 px-6" v-for="value in Object.values(entry)">{{ value }}</td>
					</tr>
				</tbody>
			</table>
		</div>

		<div class="flex justify-center w-full">
			<FamilyTree :root-person="person" />
		</div>
	</div>
</template>