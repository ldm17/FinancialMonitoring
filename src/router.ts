import { createRouter, createWebHistory } from 'vue-router';
// eslint-disable-next-line import/extensions, import/no-unresolved
import { useAuthenticationStore } from './stores/AuthenticationStore';

import Expenses from './pages/Expenses.vue';
import Incomes from './pages/Incomes.vue';
import WalletList from './pages/WalletList.vue';
import WalletEdit from './pages/WalletEdit.vue';
import CategoryList from './pages/CategoryList.vue';
import Register from './pages/Register.vue';
import Login from './pages/Login.vue';
import FinancialMonitoring from './components/FinancialMonitoring/FinancialMonitoring.vue';
import FinancialMonitoringAddNote from './components/FinancialMonitoring/FinancialMonitoringAddNote.vue';
import FinancialMonitoringInfoNote from './components/FinancialMonitoring/FinancialMonitoringInfoNote.vue';
import UserSettings from './pages/UserSettings.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      name: 'register',
      path: '/register',
      component: Register,
      meta: { requiresAuth: false },
    },
    {
      name: 'login',
      path: '/login',
      component: Login,
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      component: FinancialMonitoring,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'expenses',
          name: 'expenses',
          component: Expenses,
        },
        {
          path: 'incomes',
          name: 'incomes',
          component: Incomes,
        },
        {
          path: 'settings/wallets/',
          name: 'wallet-list-settings',
          component: WalletList,
        },
        {
          path: 'settings/wallets/:action/:id?',
          name: 'wallet-edit-settings',
          component: WalletEdit,
          props: true,
        },
        {
          path: 'settings/categories/',
          name: 'category-list-settings',
          component: CategoryList,
        },
        {
          path: 'add-note/:type/:action/:id?',
          name: 'add-note',
          component: FinancialMonitoringAddNote,
          props: true,
        },
        {
          path: 'note/:type/:id',
          name: 'info-note',
          component: FinancialMonitoringInfoNote,
          props: true,
        },
        {
          path: '/',
          redirect: '/expenses',
        },
        {
          path: 'settings/user/',
          name: 'user-settings',
          component: UserSettings,
        },
      ],
    },
  ],
});

// eslint-disable-next-line consistent-return
router.beforeEach(async (to, from, next) => {
  const authenticationStore = useAuthenticationStore();
  await authenticationStore.initializeTokens();

  if (authenticationStore.isAuthenticated && (to.name === 'login' || to.name === 'register')) {
    return next({ path: '/' });
  }

  if (to.meta.requiresAuth) {
    try {
      if (!authenticationStore.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      if (!authenticationStore.isAccessTokenValid()) {
        if (!authenticationStore.isRefreshTokenValid()) {
          throw new Error('Refresh token expired');
        }

        await authenticationStore.refreshTokenUpdate();

        if (!authenticationStore.isAccessTokenValid()) {
          throw new Error('Token refresh failed');
        }
      }

      next();
    } catch (error) {
      console.error('Ошибка аутентификации:', error);
      authenticationStore.clearAuth();
      next({ name: 'login' });
    }
  } else {
    next();
  }
});

export default router;
