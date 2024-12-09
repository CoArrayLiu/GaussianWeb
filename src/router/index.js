import { createRouter, createWebHistory } from 'vue-router';
import UploadPage from '@/views/UploadPage.vue';
import GaussianPage from '@/views/GaussianPage.vue';

const routes = [
  { path: '/', component: UploadPage },
  { path: '/gaussian', component: GaussianPage }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
