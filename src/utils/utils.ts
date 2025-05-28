export function capitalizeFirstLetterOfEachWord(str: string): string {
	return str.split(' ').map(word => {
		return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
	}).join(' ').split('-').map(word => {
		return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
	}).join('-');
}

export function snakeToCamelCase(str: string): string {
	return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
		.replace(/^([A-Z])/, (match, letter) => letter.toLowerCase());
}

export function transformToPascalCase<T>(obj: Record<string, any>): T {
	const result: Record<string, any> = {};
	Object.keys(obj).forEach(key => {
		const pascalKey = snakeToCamelCase(key);
		result[pascalKey] = obj[key];
	});
	return result as T;
}

export function mapDict<K extends string, V, U>(
	input: Record<K, V>,
	transform: (key: K, value: V) => [string, U]
): Record<string, U> {
	return Object.fromEntries(
		Object.entries(input).map(([key, value]) =>
			transform(key as K, value as V)
		)
	);
}

export async function fetchJsonData(url: string = import.meta.env.BASE_URL + "/tracked.json"): Promise<any> {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error('Network response was not ok ' + response.statusText);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		throw error;
	}
}