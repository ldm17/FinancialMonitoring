/* eslint-disable */
import { createRouter, createWebHistory } from 'vue-router';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import 'element-plus/theme-chalk/dark/css-vars.css';
import 'material-icons/iconfont/material-icons.css';

import Expenses from './pages/Expenses.vue';
import Incomes from './pages/Incomes.vue';
import WalletList from './pages/WalletList.vue';
import WalletEdit from './pages/WalletEdit.vue';
import CategoryList from './pages/CategoryList.vue';
import CategoryEdit from './pages/CategoryEdit.vue';

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
  },
  {
    name: 'incomes',
    path: '/incomes',
    component: Incomes,
  },
  {
    name: 'wallet-list-settings',
    path: '/settings/wallets/',
    component: WalletList,
  },
  {
    name: 'wallet-edit-settings',
    path: '/settings/wallets/:action/:id?',
    component: WalletEdit,
    props: true,
  },
  {
    name: 'category-list-settings',
    path: '/settings/categories/',
    component: CategoryList,
    children: [
      {
        name: 'category-edit-settings',
        path: '/settings/categories/:type/:action/:id?',
        component: CategoryEdit,
        props: true,
      },
    ],
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
