import { Job } from "./job";
import { capitalizeFirstLetterOfEachWord, fetchJsonData, mapDict, transformToPascalCase } from "./utils";

export type CensusEntry = {
	id: number,
	censusYear: number,
	censusPage: number,
	censusRow: number,
	firstName: string,
	lastName: string,
	birthYear: string | null,
	origin: string | null,
	job: string | null,
	houseNb: number,
	streetName: string,
	parentCensusEntry: number | null,
	person: number
}

export class Person {
	readonly id: string;
	readonly firstName: string;
	readonly lastName: string;
	readonly parentId?: number;
	private _parent?: Person;
	readonly censusEntries: readonly CensusEntry[];
	readonly jobIds: readonly string[];
	readonly children: Person[];

	constructor(id: string, firstName: string, lastName: string, parentId: number, censusEntries: readonly CensusEntry[], jobIds: readonly string[]) {
		this.id = id;
		this.firstName = capitalizeFirstLetterOfEachWord(firstName);
		this.lastName = capitalizeFirstLetterOfEachWord(lastName);
		this.parentId = parentId;
		this.censusEntries = censusEntries;
		this.jobIds = jobIds;
		this.children = [];
	}

	get name(): string {
		return `${this.firstName} ${this.lastName}`
	}

	// Getter for parent
	get parent(): Person | undefined {
		return this._parent;
	}

	// Setter for parent
	set parent(newParent: Person) {
		if (this._parent) throw new Error("Parent already set")
		this._parent = newParent;
	}

	get censusYears(): number[] {
		return this.censusEntries.map(entry => entry.censusYear)
	}

	get rawNames(): { [key: string]: string } {
		const rawData: { [key: string]: string } = {}
		this.censusEntries.forEach(entry => rawData[entry.censusYear] = `${entry.firstName} ${entry.lastName}`)
		return rawData
	}

	get rawBirthYears(): { [key: string]: string | null } {
		const rawData: { [key: string]: string | null } = {}
		this.censusEntries.forEach(entry => rawData[entry.censusYear] = entry.birthYear)
		return rawData
	}

	get birthYears(): string[] {
		const nonNullData = Object.values(this.rawBirthYears).filter(birthYear => birthYear !== null)
		return [...new Set(nonNullData)]
	}

	get rawOrigins(): { [key: string]: string | null } {
		const rawData: { [key: string]: string | null } = {}
		this.censusEntries.forEach(entry => rawData[entry.censusYear] = entry.origin)
		return rawData
	}

	get origins(): string[] {
		const nonNullOData = Object.values(this.rawOrigins).filter(origin => origin !== null)
		return [...new Set(nonNullOData)]
	}

	get rawJobs(): { [key: string]: string | null } {
		const rawData: { [key: string]: string | null } = {}
		this.censusEntries.forEach(entry => rawData[entry.censusYear] = entry.job)
		return rawData
	}

	withJobsMetadata(jobs: { [key: string]: Job }): {person: Person, jobsMetadata: Job[]} {
		return {
			person: this,
			jobsMetadata: this.jobIds.map(jobId => jobs[jobId]) 
		}
	}


	static fromJson(json: any): Person {
		const { id, firstName, lastName, censusEntries, parent, jobIds } = transformToPascalCase(json) as any;

		// Convert censusEntries to CensusEntry[] if needed
		const censusEntriesMapped: CensusEntry[] = censusEntries.map((entry: any) => transformToPascalCase<CensusEntry>(entry));
		censusEntriesMapped.forEach(entry => {
			if (entry.origin) entry.origin = capitalizeFirstLetterOfEachWord(entry.origin)
		})

		// Create a new Person instance
		const person = new Person(
			id, firstName, lastName, parent, censusEntriesMapped, jobIds
		);

		return person;
	}
}

export type DataMap = {
	persons: { [key: string]: Person }
	jobs: { [key: string]: Job }
}
export async function loadData(): Promise<DataMap> {
	return fetchJsonData()
		.then(jsonData => {
			const people: Person[] = jsonData["persons"].map((data: any) => Person.fromJson(data));
			const jobs = mapDict(jsonData["jobs"], (key, value: any) => {
				value["id"] = key;
				return [key, Job.fromJson(value)]
			})

			const dataMap: DataMap = {
				persons: {},
				jobs: jobs
			}

			people.forEach(person => {
				dataMap.persons[person.id] = person
			})


			people.forEach(person => {
				if (person.parentId) {
					person.parent = dataMap.persons[person.parentId]
					dataMap.persons[person.parentId].children.push(person)
				}
			})


			return dataMap
		})
		.catch(err => {
			console.error("Error while fetching data:", err)
			return { persons: {}, jobs: {} }
		})
}