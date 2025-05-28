<script setup lang="ts">
const props = defineProps<{
	messages: any[]
}>()
</script>

<template>
	<div class="group relative flex-col w-fit">
		<div>
			<slot></slot>
		</div>
		<span
			class="flex-col absolute hidden whitespace-nowrap group-hover:flex -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full px-2 py-1 bg-gray-700 rounded-lg text-center text-white text-sm after:content-[''] after:absolute after:left-1/2 after:top-[100%] after:-translate-x-1/2 after:border-8 after:border-x-transparent after:border-b-transparent after:border-t-gray-700">
			<span v-for="(message, index) in messages" :key="index">
				{{ message }}
			</span>
		</span>
	</div>
</template>