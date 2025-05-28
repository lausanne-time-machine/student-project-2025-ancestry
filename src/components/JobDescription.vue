<script setup lang="ts">
import type { DataMap } from '@/utils/person';
import { computed } from '@vue/reactivity';
import { inject, ref, type Ref } from 'vue';


const props = defineProps<{
	id: string
}>()

const data = inject<Ref<DataMap>>('data');
const job = computed(() => data?.value.jobs[props.id])

</script>

<template>
	<div class="w-full flex flex-col gap-4 p-6 rounded-lg bg-white shadow-md border border-gray-200" v-if="job">
		<h1 class="text-2xl font-bold text-gray-800">
			{{ job.job }} <span class="text-sm text-gray-500">#{{ job.id }}</span>
		</h1>

		<p class="text-gray-700" v-if="job.description">
			{{ job.description }}
		</p>

		<p class="text-sm text-gray-500 italic" v-if="job.source">
			Source:
			<a :href="job.source" rel="noopener noreferrer" class="text-gray-500-600 underline hover:text-gray-800">
				{{ job.source }}
			</a>
		</p>


		<div class="overflow-x-auto shadow-md rounded-lg">
			<table class="min-w-full bg-white">
				<thead class="bg-gray-800 text-white">
					<tr>
						<th class="py-3 px-6 text-left" v-for="key in Object.keys(job.metadata)">{{ key }}
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					<tr>
						<td class="py-4 px-6" v-for="value in Object.values(job.metadata)">{{ value }}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>
