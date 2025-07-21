<template>
  <div class="layout-container">
    <el-container style="height: 100%">
      <el-backtop :right="100" :bottom="100" />
      <el-aside width="250px" style="display: flex; flex-direction: column; height: 100%;">
        <h1 class="app-name">Financial</h1>
        <el-menu :default-active="activeMenuItem" style="flex: 1;" @select="handleMenuSelect">
          <el-menu-item-group>
            <el-menu-item index="1">
              <router-link :to="{ name: 'expenses', query: { walletId: financialMonitoringStore.filtersTransactions.currentWalletId } }" class="router-link-aside">
                <el-icon><ShoppingCart /></el-icon>
                <span>Расходы</span>
              </router-link>
            </el-menu-item>

            <el-menu-item index="2">
              <router-link :to="{ name: 'incomes', query: { walletId: financialMonitoringStore.filtersTransactions.currentWalletId } }" class="router-link-aside">
                <el-icon><Coin /></el-icon>
                <span>Доходы</span>
              </router-link>
            </el-menu-item>

            <el-sub-menu index="3">
              <template #title>
                <el-icon><Setting /></el-icon>
                <span>Настройки</span>
              </template>
              <el-menu-item-group>
                <el-menu-item index="3-1">
                  <router-link :to="{ name: 'wallet-list-settings' }" class="router-link-aside">
                    <span>Кошельки</span>
                  </router-link>
                </el-menu-item>

                <el-menu-item index="3-2">
                  <router-link :to="{ name: 'category-list-settings' }" class="router-link-aside">
                    <span>Категории</span>
                  </router-link>
                </el-menu-item>
              </el-menu-item-group>
            </el-sub-menu>
          </el-menu-item-group>
        </el-menu>

        <el-menu>
          <el-menu-item @click="confirmLogout()">
              <el-icon><SwitchButton /></el-icon>
              <span>Выйти</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header class="blurred-header">
          <div class="header">
            <theme-switcher style="right: 15px;" />
            <el-button type="primary" :icon="Icons.Plus" @click="handleHeaderButtonClick()">Добавить</el-button>
          </div>
        </el-header>

        <el-main>
          <el-scrollbar>
            <RouterView />
          </el-scrollbar>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template> 

<script>
import * as Icons from '@element-plus/icons-vue';
import { useFinancialMonitoringStore } from '@/stores/FinancialMonitoringStore';
import FinancialMonitoringTransactions from './FinancialMonitoringTransactions.vue';
import FinancialMonitoringAddNote from './FinancialMonitoringAddNote.vue';
import FinancialMonitoringRangeFilterModal from './FinancialMonitoringRangeFilterModal.vue';
import FinancialMonitoringInfoNote from './FinancialMonitoringInfoNote.vue';
import CategoryEdit from '@/pages/CategoryEdit.vue';
import { OperationType } from '@/stores/FinancialMonitoringStore';
import { useAuthenticationStore } from '@/stores/AuthenticationStore';
import { ElMessage, ElMessageBox } from 'element-plus';
import ThemeSwitcher from './ThemeSwitcher.vue';

export default {
  name: "financial-monitoring",
  components: {
    FinancialMonitoringTransactions,
    FinancialMonitoringAddNote,
    FinancialMonitoringRangeFilterModal,
    FinancialMonitoringInfoNote,
    CategoryEdit,
    ThemeSwitcher,
  },
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();
    const authenticationStore = useAuthenticationStore();

    return { financialMonitoringStore, authenticationStore };
  },
  watch: {
    '$route.name'(newRouteName) {
      if (newRouteName === 'expenses' || newRouteName === 'incomes') {
        this.currentMenuItem = newRouteName === 'expenses' ? OperationType.Expenses : OperationType.Incomes;
      }
    },
  },
  computed: {
    activeMenuItem() {
      return this.currentMenuItem === OperationType.Expenses ? '1' : '2';
    },
  },
  data() {
    return {
      Icons,
      currentMenuItem: OperationType.Expenses,
    };
  },
  methods: {
    handleMenuSelect: function (index) {
      this.currentMenuItem = index === '1' ? OperationType.Expenses : OperationType.Incomes;
    },
    confirmLogout: function () {
      ElMessageBox.confirm(
      'Выйти из аккаунта ?',
      'Подтвердите действие',
      {
        confirmButtonText: 'Выйти',
        cancelButtonText: 'Отменить',
        type: 'warning',
        center: true,
        draggable: true,
      }
    )
      .then(async () => {
        await this.authenticationStore.logout();
        ElMessage({
          type: 'success',
          message: 'Вы вышли из аккаунта',
        });
        this.$router.push({ 
          name: 'login' 
        });
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: 'Выход отменён',
        })
      })
    },
    handleHeaderButtonClick: function() {
      if (typeof this.financialMonitoringStore.headerButtonHandler === 'function') {
        this.financialMonitoringStore.headerButtonHandler();
      }
    },
  },
};
</script>
<style lang="scss">
</style>