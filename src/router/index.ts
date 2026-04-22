import { createRouter, createWebHistory } from 'vue-router';
import InventoryView from '../modules/inventory/views/InventoryView.vue';
import AnalyticsView from '../modules/analytics/views/AnalyticsView.vue';

const routes = [
  {
    path: '/',
    redirect: '/inventory'
  },
  {
    path: '/inventory',
    name: 'inventory',
    component: InventoryView,
    meta: { title: 'Inventory Management' }
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: AnalyticsView,
    meta: { title: 'Intelligence & Analytics' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard for dynamic titles
router.beforeEach((to, from, next) => {
  document.title = (to.meta.title as string) || 'VueIntelligence';
  next();
});

export default router;
