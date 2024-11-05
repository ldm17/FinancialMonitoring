/* eslint-disable */
import { createRouter, createWebHistory } from 'vue-router';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import Expenses from './pages/Expenses.vue';
import Incomes from './pages/Incomes.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      name: 'home',
      path: '/',
      redirect: '/expenses'
    },
    {
    name: 'expenses',
    path: '/expenses',
    component: Expenses,
    // props: (route) => ({ typeOperation: route.name })
  },
  {
    name: 'incomes',
    path: '/incomes',
    component: Incomes,
    // props: (route) => ({ typeOperation: route.name })
  }]
});

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

app.use(createPinia());
app.use(ElementPlus);
app.use(router);

app.mount('#app');
