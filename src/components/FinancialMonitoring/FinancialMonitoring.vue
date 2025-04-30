<template>
  <div class="layout-container">
    <el-container style="height: 100%">
      <el-backtop :right="100" :bottom="100" />
      <el-aside width="250px">
        <h1 style="margin-left: 25px;">Financial</h1>
        <el-menu default-active="1" @select="handleMenuSelect">
          <el-menu-item-group>
            <el-menu-item index="1">
              <router-link :to="{ name: 'expenses' }" class="router-link-aside">
                <el-icon><ShoppingCart /></el-icon>
                <span>Расходы</span>
              </router-link>
            </el-menu-item>
            <el-menu-item index="2">
              <router-link :to="{ name: 'incomes' }" class="router-link-aside">
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
      </el-aside>

      <el-container>
        <el-header style="text-align: right; font-size: 15px; height: 70px;">
          <div class="header">
            <el-button
              v-if="financialMonitoringStore.currentPage !== 'addNote' && $route.name !== 'wallet-list-settings' && $route.name !== 'category-list-settings'"
              type="primary" :icon="Icons.Plus" @click="openAddExpense()">Добавить</el-button>
            <el-button v-if="$route.name === 'wallet-list-settings'" type="primary" :icon="Icons.Plus" @click="openAddWallet()">Добавить</el-button>
            <el-button v-if="$route.name === 'category-list-settings'" type="primary" :icon="Icons.Plus" @click="openAddCategory()">Добавить</el-button>
          </div>
        </el-header>

        <el-main>
          <el-scrollbar>
            <div v-if="financialMonitoringStore.currentPage == 'expenses'">
              <RouterView />
            </div>

            <div v-if="financialMonitoringStore.currentPage === 'addNote'">
              <financial-monitoring-add-note 
              :currentMenuItem="currentMenuItem">
              </financial-monitoring-add-note>
            </div>

            <div v-if="financialMonitoringStore.currentPage === 'rangeFilter'">
              <financial-monitoring-range-filter-modal>
              </financial-monitoring-range-filter-modal>
            </div>

            <div v-if="financialMonitoringStore.currentPage === 'infoNote'">
              <financial-monitoring-info-note 
              :currentMenuItem="currentMenuItem">
              </financial-monitoring-info-note>
            </div>
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
import { OperationType } from '@/stores/FinancialMonitoringStore';

export default {
  name: "financial-monitoring",
  components: {
    FinancialMonitoringTransactions,
    FinancialMonitoringAddNote,
    FinancialMonitoringRangeFilterModal,
    FinancialMonitoringInfoNote,
  },
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();
    return { financialMonitoringStore };
  },
  data() {
    return {
      Icons,
      currentMenuItem: OperationType.Expenses,
    };
  },
  methods: {
    openAddExpense: function () {
      this.financialMonitoringStore.setPage('addNote', {
        title: 'Добавление операции',
      });
    },
    openAddWallet: function () {
      this.$router.push({ name: 'wallet-edit-settings', params: { action: 'new' } });
    },
    openAddCategory: function () {
      const selectedType = this.financialMonitoringStore.selectedOperationTypeCategories;
      this.$router.push({ name: 'category-edit-settings', params: { type: selectedType, action: 'new' } });
    },
    handleMenuSelect: function (index) {
      this.currentMenuItem = index === '1' ? OperationType.Expenses : OperationType.Incomes;
    },
  },
};
</script>
<style lang="scss">
</style>