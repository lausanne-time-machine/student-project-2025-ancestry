<template>
	<div ref="treeContainer" class="relative" :style="{ width: `${width}px`, height: `${height}px` }">
		<!-- SVG links -->
		<svg :width="width" :height="height" class="absolute top-0 left-0 pointer-events-none">
			<g>
				<path v-for="link in links" :key="link.target.data.id" :d="generatePath(link)"
					class="stroke-gray-300 fill-none" stroke-width="2" />
			</g>
		</svg>

		<!-- HTML Nodes -->
		<div v-for="node in nodes" :key="node.data.id">
			<RouterLink :to="{ name: 'person', params: { id: node.data.id } }">
				<div :style="{ position: 'absolute', top: `${node.y}px`, left: `${node.x}px` }"
					class="border shadow-md rounded-xl p-4 inline-block hover:z-50"
					:class="{ 'bg-gray-100 hover:bg-gray-200': node.data.id === props.rootPerson?.id, 'bg-white hover:bg-gray-100':  node.data.id !== props.rootPerson?.id }"
					:ref="(el: any) => nodeRefs.set(node.data.id, el)">
					<TooltipDiv
						:messages="Object.entries(node.data.rawNames).map(([key, value]) => `${key}: ${value}`)">
						<h3 class="text-base font-bold w-full">{{ node.data.firstName }} {{ node.data.lastName }}</h3>
					</TooltipDiv>
					<TooltipDiv
						:messages="Object.entries(node.data.rawBirthYears).map(([key, value]) => `${key}: ${value}`)">
						<p class="text-sm text-gray-600 w-full whitespace-nowrap">Année de naissance: {{
							node.data.birthYears.length !== 0 ? node.data.birthYears.join(", ") : "Non renseignée" }}
						</p>
					</TooltipDiv>
					<TooltipDiv
						:messages="Object.entries(node.data.rawOrigins).map(([key, value]) => `${key}: ${value}`)">
						<p class="text-sm text-gray-600 w-full whitespace-nowrap">Origine: {{ node.data.origins.length
							!== 0 ?
							node.data.origins.join(", ") : "Non renseignée" }}</p>
					</TooltipDiv>
					<TooltipDiv :messages="Object.entries(node.data.rawJobs).map(([key, value]) => `${key}: ${value}`)">
						<p class="text-sm text-gray-600 w-full whitespace-nowrap">Emplois: {{ node.data.jobIds.length !==
							0 ?
							node.data.jobIds.map(jobId => data?.jobs[jobId].job).join(", ") : "Aucun" }}</p>
					</TooltipDiv>
					<p class="text-sm text-gray-600 w-full whitespace-nowrap">Recensé en: {{
						node.data.censusYears.join(", ") }}
					</p>
				</div>
			</RouterLink>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, watch, inject, type Ref} from 'vue'
import * as d3 from 'd3'
import type { DataMap, Person } from '@/utils/person';
import TooltipDiv from './TooltipDiv.vue';

const data = inject<Ref<DataMap>>('data');

const props = defineProps<{ rootPerson: Person | undefined }>();

const width = ref(999999)
const height = ref(999999)
const treeContainer = ref<HTMLDivElement | null>(null)
const nodeRefs = new Map<string, HTMLElement>()

const nodes = ref<d3.HierarchyPointNode<Person>[]>([])
const links = ref<d3.HierarchyPointLink<Person>[]>([])

async function drawTree(rootPerson: Person | undefined) {
	if (!rootPerson) return

	// Step 1: Build hierarchy + d3 tree
	const root = d3.hierarchy(rootPerson)
	const treeLayout = d3.tree<Person>()
		.nodeSize([250, 180]) // base spacing
	treeLayout(root)

	// Step 2: Set initial node/links
	// @ts-ignore
	nodes.value = root.descendants()
	// @ts-ignore
	links.value = root.links()

	await nextTick()

	// Step 3: Measure HTML nodes & adjust layout
	nodes.value.forEach(node => {
		const el = nodeRefs.get(node.data.id)
		if (el) {
			const { offsetWidth, offsetHeight } = el
			node.x = node.x - offsetWidth / 2
			node.y = node.y // vertical stays, or you can offset here
		}
	})

	const minX = Math.min(...nodes.value.map(n => n.x))
	nodes.value.forEach(node => {
		node.x = node.x - minX
	})

	// Step 4: recompute bounding box
	const maxX = Math.max(...nodes.value.map(n => n.x + (nodeRefs.get(n.data.id)?.offsetWidth || 0)))
	const maxY = Math.max(...nodes.value.map(n => n.y + (nodeRefs.get(n.data.id)?.offsetHeight || 0)))
	width.value = maxX
	height.value = maxY + 10
}

function generatePath(link: d3.HierarchyPointLink<Person>) {
	const sx = link.source.x + getNodeWidth(link.source.data.id) / 2
	const sy = link.source.y + getNodeHeight(link.source.data.id)
	const tx = link.target.x + getNodeWidth(link.target.data.id) / 2
	const ty = link.target.y
	return `M${sx},${sy} C${sx},${(sy + ty) / 2} ${tx},${(sy + ty) / 2} ${tx},${ty}`
}

function getNodeWidth(id: string) {
	return nodeRefs.get(id)?.offsetWidth || 100
}

function getNodeHeight(id: string) {
	return nodeRefs.get(id)?.offsetHeight || 60
}

onMounted(() => {
	if (props.rootPerson) drawTree(props.rootPerson)
})

watch(() => props.rootPerson, drawTree)
</script>
