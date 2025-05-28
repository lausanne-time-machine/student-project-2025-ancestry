<template>
  <main class="flex flex-col items-center">
    <div class="chart-container flex flex-col items-center">
      <h2 class="chart-title">
        Responsabilités Professionnelles
      </h2>
      <h3 class="chart-subtitle">
        de la 2ème Génération par rapport à celles de la 1ère Génération
      </h3>
      <svg class="chart" ref="respSvgRef"></svg>
    </div>
    <div class="chart-container flex flex-col items-center">
      <h2 class="chart-title">
        Durée de la Formation
      </h2>
      <h3 class="chart-subtitle">
        de la 2ème Génération par rapport à celles de la 1ère Génération
      </h3>
      <svg class="chart" ref="trainSvgRef"></svg>
    </div>
    <div class="chart-container flex flex-col items-center">
      <h2 class="chart-title">
        Physicalité du Travail
      </h2>
      <h3 class="chart-subtitle">
        de la 2ème Génération par rapport à celles de la 1ère Génération
      </h3>
      <svg class="chart" ref="physSvgRef"></svg>
    </div>
  </main>
</template>


<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, inject, type Ref, watch } from 'vue'
import * as d3 from 'd3'
import type { DataMap, Person } from '@/utils/person';
import type { Job } from '@/utils/job';

const data = inject<Ref<DataMap>>('data');
if (!data) {
  throw new Error('data not provided');
}

onMounted(() => {
  main()
})

watch(data, () => {
  main()
});


type SVGRef = Ref<SVGSVGElement | null, SVGSVGElement | null>
type PersonWithJobsMetadata = { person: Person, jobsMetadata: Job[] }
type PersonWithFeatureCategory = { person: Person, firstYear: number, featureCategoryName: ComparisonResult, jobsMetadata: Job[] }

const BANNED_JOB_LIST = ["-1", "10019"]

enum ComparisonResult {
  HIGHER = "higher",
  IDENTICAL = "identical",
  LOWER = "lower"
}

function ComparisonResultToNumber(result: ComparisonResult) {
  if (result == ComparisonResult.LOWER) return -1
  if (result == ComparisonResult.IDENTICAL) return 0
  return 1
}

const respSvgRef = ref<SVGSVGElement | null>(null)
const trainSvgRef = ref<SVGSVGElement | null>(null)
const physSvgRef = ref<SVGSVGElement | null>(null)

let personsWithJobsMetadata: { [key: string]: PersonWithJobsMetadata }
function main() {
  if (!data) {
    throw new Error('data not provided');
  }

  const persons = data.value.persons
  const jobs = data.value.jobs
  personsWithJobsMetadata = Object.fromEntries(Object.values(persons).map(person => [person.id, person.withJobsMetadata(jobs)]))

  compareGenerationalEvolution(Object.values(personsWithJobsMetadata), respSvgRef, "hiérarchie", "Hiérarchie relative à la 1ère génération", (v1, v2) => {
    if (v1 === 'chef' && v2 === 'travailleur') return ComparisonResult.HIGHER
    if (v1 === 'travailleur' && v2 === 'chef') return ComparisonResult.LOWER
    return ComparisonResult.IDENTICAL
  })

  compareGenerationalEvolution(Object.values(personsWithJobsMetadata), trainSvgRef, "durée d'apprentissage", "Durée d'apprentissage relative à la 1ère génération", (v1, v2) => {
    if ((v1 === 'haut' && v2 !== 'haut') || (v1 === 'moyen' && v2 === 'bas')) return ComparisonResult.HIGHER
    if ((v1 === 'bas' && v2 !== 'bas') || (v1 === 'moyen' && v2 === 'haut')) return ComparisonResult.LOWER
    return ComparisonResult.IDENTICAL
  })

  compareGenerationalEvolution(Object.values(personsWithJobsMetadata), physSvgRef, "physicalité", "Physicalité relative à la 1ère génération", (v1, v2) => {
    if ((v1 === 'haut' && v2 !== 'haut') || (v1 === 'moyen' && v2 === 'bas')) return ComparisonResult.HIGHER
    if ((v1 === 'bas' && v2 !== 'bas') || (v1 === 'moyen' && v2 === 'haut')) return ComparisonResult.LOWER
    return ComparisonResult.IDENTICAL
  })
}

function compareGenerationalEvolution(
  persons: PersonWithJobsMetadata[],
  svgRef: SVGRef,
  featureName: string,
  yAxisName: string,
  compare: (v1: string, v2: string) => ComparisonResult,
) {
  const years: Set<number> = new Set();
  const personsWithMaxJobValues = Object.fromEntries(persons.map(p => {
    p.person.censusYears.forEach(year => years.add(year))
    const jobList = p.jobsMetadata
    let max = jobList[0].metadata[featureName] as string;
    let maxId = jobList[0].id;
    for (let i = 1; i < jobList.length; i++) {
      if (compare(jobList[i].metadata[featureName], max) == ComparisonResult.HIGHER) {
        max = jobList[i].metadata[featureName]
        maxId = jobList[i].id
      }
    }
    return [p.person.id, { ...p, maxFeatureValue: max, maxFeatureJobId: maxId }]
  }))

  function isValid(p: {
    maxFeatureValue: string;
    maxFeatureJobId: string;
    person: Person;
    jobsMetadata: Job[];
  }) {
    if (!p.person.parentId) return false
    const parentData = personsWithMaxJobValues[p.person.parentId]
    return p.person.parentId !== null && p.maxFeatureValue && !BANNED_JOB_LIST.includes(p.maxFeatureJobId) && parentData.maxFeatureValue && !BANNED_JOB_LIST.includes(parentData.maxFeatureJobId)
  }

  const personsWithFeatureCategory: PersonWithFeatureCategory[] = Object.entries(personsWithMaxJobValues).filter(([, p]) => isValid(p)).map(([, p]) => {
    return {
      person: p.person,
      firstYear: Math.min(...p.person.censusYears),
      featureCategoryName: compare(p.maxFeatureValue, personsWithMaxJobValues[p.person.parentId!].maxFeatureValue),
      jobsMetadata: p.jobsMetadata
    }
  });

  drawChart(personsWithFeatureCategory, featureName, Array.from(years).sort(), yAxisName, svgRef)
}

function drawChart(data: PersonWithFeatureCategory[], featureName: string, years: number[], yAxisName: string, svgRef: SVGRef) {
  const container = svgRef.value?.parentElement
  if (!container) return

  const containerWidth = container.clientWidth
  const containerHeight = 450 // or container.clientHeight if you want dynamic height

  const margin = { top: 40, right: 40, bottom: 60, left: 220 }
  const width = containerWidth - margin.left - margin.right
  const height = containerHeight - margin.top - margin.bottom

  // --- Scales ---
  const x = d3.scaleLinear()
    .domain([1800, 1900])
    .range([0, width])

  const y = d3.scalePoint<ComparisonResult>()
    .domain(Object.values(ComparisonResult))
    .range([0, height])
    .padding(0.5)

  // --- SVG Setup ---
  const svg = d3.select(svgRef.value)
    .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');


  svg.selectAll('*').remove() // Clear previous

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // --- Axes ---
  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).tickValues(years).tickFormat(d3.format('d')))
  g.append('g')
    .call(d3.axisLeft(y))

  // --- Axis Labels ---
  svg.append('text')
    .attr('x', margin.left + width / 2)
    .attr('y', height + margin.top + 45)
    .attr('text-anchor', 'middle')
    .attr('font-size', 14)
    .attr('font-weight', 'bold')
    .text('Year')

  svg.append('text')
    .attr('x', margin.left - 160)
    .attr('y', margin.top + height / 2)
    .attr('text-anchor', 'middle')
    .attr('transform', `rotate(-90,${margin.left - 160},${margin.top + height / 2})`)
    .attr('font-size', 14)
    .attr('font-weight', 'bold')
    .text(yAxisName)

  // --- Jitter helpers ---
  function jitterY() { return (Math.random() - 0.5) * 30 }
  function jitterX() { return (Math.random() - 0.5) * 30 }

  // --- Color ---
  const color = d3.scaleOrdinal<ComparisonResult, string>()
    .domain(Object.values(ComparisonResult))
    .range(['#2ca02c', '#1f77b4', '#d62728'])

  // --- Tooltip ---
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)
    .style('position', 'absolute')
    .style('background', '#fff')
    .style('border', '1px solid #bbb')
    .style('padding', '6px 12px')
    .style('border-radius', '6px')
    .style('pointer-events', 'none')
    .style('font-size', '13px')
    .style('color', '#222')
    .style('box-shadow', '2px 2px 8px #ccc')

  // --- Draw Points ---
  g.selectAll('.person')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'person')
    .attr('cx', d => x(d.firstYear) + jitterX())
    .attr('cy', d => y(d.featureCategoryName)! + jitterY())
    .attr('r', 4)
    .attr('fill', d => color(d.featureCategoryName))
    .attr('stroke', '#333')
    .attr('stroke-width', 1.5)
    .style('cursor', 'pointer')
    .on('mouseover', function (event, d) {
      const parentJobsMetadata = personsWithJobsMetadata[d.person.parentId!].jobsMetadata
      tooltip.transition().duration(150).style('opacity', 1)
      tooltip.html(
        `<strong>Emplois:</strong> ${d.jobsMetadata.map(j => j.job).filter(j => j !== "").join(", ")} (${d.jobsMetadata.map(j => j.metadata[featureName]).filter(j => j !== "").join(", ")})<br>
        <strong>Emplois du parent:</strong> ${parentJobsMetadata.map(j => j.job).filter(j => j !== "").join(", ")} (${parentJobsMetadata.map(j => j.metadata[featureName]).filter(j => j !== "").join(", ")})`
      )
        .style('left', (event.pageX + 18) + 'px')
        .style('top', (event.pageY - 28) + 'px')
      d3.select(this).attr('stroke-width', 3)
    })
    .on('mousemove', function (event) {
      tooltip.style('left', (event.pageX + 18) + 'px')
        .style('top', (event.pageY - 28) + 'px')
    })
    .on('mouseout', function () {
      tooltip.transition().duration(200).style('opacity', 0)
      d3.select(this).attr('stroke-width', 1.5)
    })

  // --- Error Bars ---
  function yFromMean(mean: number) {
    return d3.scaleLinear().domain([1, 0, -1]).range(Object.values(ComparisonResult).map(d => y(d)!))(mean)
  }

  const yearStats = years.map((year: number) => {
    const vals = data.filter(p => p.firstYear === year).map(p => ComparisonResultToNumber(p.featureCategoryName))
    const mean = vals.length ? d3.mean(vals) ?? 0 : 0
    const std = vals.length ? d3.deviation(vals) ?? 0 : 0
    return { year, mean, std }
  })

  g.selectAll('.error-bar')
    .data(yearStats)
    .enter()
    .append('line')
    .attr('class', 'error-bar')
    .attr('x1', d => x(d.year))
    .attr('x2', d => x(d.year))
    .attr('y1', d => yFromMean(d.mean - d.std))
    .attr('y2', d => yFromMean(d.mean + d.std))
    .attr('stroke', '#222')
    .attr('stroke-width', 2)

  g.selectAll('.mean-dot')
    .data(yearStats)
    .enter()
    .append('circle')
    .attr('class', 'mean-dot')
    .attr('cx', d => x(d.year))
    .attr('cy', d => yFromMean(d.mean))
    .attr('r', 6)
    .attr('fill', '#222')
}

</script>

<style>
.tooltip {
  z-index: 1000;
}

.chart-container {
  width: 100%;
  max-width: 1200px;
  margin: 0px 32px;
  padding: 24px 0;
}

.chart-title {
  text-align: left;
  font-size: 2.2rem;
  font-weight: bold;

  margin-top: 0;
}

.chart-subtitle {
  text-align: left;
  font-size: 1rem;
  margin-bottom: 32px;
}

.chart {
  width: 100%;
  height: 450px;
  display: block;
}
</style>