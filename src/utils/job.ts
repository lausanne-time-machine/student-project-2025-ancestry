import { transformToPascalCase } from "./utils";

export class Job {
	readonly id: string;
	readonly job: string;
	readonly description: string | null;
	readonly source: string | null;
	readonly metadata: { [key: string]: string };

	constructor(
		id: string,
		job: string,
		description: string | null = null,
		source: string | null = null,
		metadata: { [key: string]: string } = {}
	) {
		this.id = id;
		this.job = job;
		this.description = description;
		this.source = source;
		this.metadata = metadata;
	}

	static fromJson(json: any): Job {
		const { id, job, description, source, ...metadata } = json;

		// Create a new Job instance
		const person = new Job(
			id, job, description, source, metadata
		);

		return person;
	}
}
