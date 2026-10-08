import { createRouter, createWebHistory } from 'vue-router';
// eslint-disable-next-line import/extensions, import/no-unresolved
import { useAuthenticationStore } from './stores/AuthenticationStore';

import Expenses from './pages/Expenses.vue';
import Incomes from './pages/Incomes.vue';
import WalletList from './pages/WalletList.vue';
import WalletForm from './pages/WalletForm.vue';
import CategoryList from './pages/CategoryList.vue';
import Register from './pages/Register.vue';
import Login from './pages/Login.vue';
import FinancialMonitoring from './components/FinancialMonitoring/FinancialMonitoring.vue';
import TransactionForm from './components/FinancialMonitoring/TransactionForm.vue';
import TransactionInfo from './components/FinancialMonitoring/TransactionInfo.vue';
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
          name: 'wallet-form-settings',
          component: WalletForm,
          props: true,
        },
        {
          path: 'settings/categories/',
          name: 'category-list-settings',
          component: CategoryList,
        },
        {
          path: 'transaction-form/:type/:action/:id?',
          name: 'transaction-form',
          component: TransactionForm,
          props: true,
        },
        {
          path: 'transaction/:type/:id',
          name: 'transaction-info',
          component: TransactionInfo,
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
