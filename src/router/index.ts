import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import TreeListView from '@/views/TreeListView.vue'
import PersonView from '@/views/PersonView.vue'
import JobListView from '@/views/JobListView.vue'
import AnalysisView from '@/views/AnalysisView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/trees',
      name: 'tree',
      component: TreeListView,
    },
    {
      path: '/user/:id',
      name: 'person',
      component: PersonView,
      props: true // This allows passing route params as props to the component
    },
    {
      path: '/jobs',
      name: 'jobs',
      component: JobListView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/graph',
      name: 'graph',
      component: () => import('../views/GraphView.vue'),
    },
    {
      path: '/analysis',
      name: 'analysis',
      component: AnalysisView,
    }
  ],
})

export default router
