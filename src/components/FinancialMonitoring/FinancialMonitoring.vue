<template>
  <div class="layout-container">
    <el-container style="height: 100%">
      <el-aside width="250px">
        <h1 style="margin-left: 25px;">Financial</h1>
        <el-menu default-active="1">
          <el-menu-item-group>
            <el-menu-item index="1" @click="financialMonitoringStore.setPage('expenses')">
              <el-icon><ShoppingCart /></el-icon>
              <span>Расходы</span>
            </el-menu-item>
            <el-menu-item index="2" @click="financialMonitoringStore.setPage('incomes')">
              <el-icon><Coin /></el-icon>
              <span>Доходы</span>
            </el-menu-item>
          </el-menu-item-group>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header style="text-align: right; font-size: 15px; height: 70px;">
          <div class="toolbar">
            <el-button type="primary" :icon="Icons.Plus" @click="openAddExpense()">Добавить</el-button>
          </div>
        </el-header>

        <el-main>
          <el-scrollbar>
            <div v-if="financialMonitoringStore.currentPage === 'expenses'">
              <financial-monitoring-expenses>
              </financial-monitoring-expenses>
            </div>

            <div v-if="financialMonitoringStore.currentPage === 'incomes'">
              <financial-monitoring-incomes>
              </financial-monitoring-incomes>
            </div>

            <div v-if="financialMonitoringStore.currentPage === 'addNote'">
              <financial-monitoring-add-note>
              </financial-monitoring-add-note>
            </div>

            <div v-if="financialMonitoringStore.currentPage === 'filterOptions'">
              <financial-monitoring-filter-options>
              </financial-monitoring-filter-options>
            </div>

            <div v-if="financialMonitoringStore.currentPage === 'infoNote'">
              <financial-monitoring-info-note>
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
import FinancialMonitoringExpenses from './FinancialMonitoringExpenses.vue';
import FinancialMonitoringIncomes from './FinancialMonitoringIncomes.vue';
import FinancialMonitoringAddNote from './FinancialMonitoringAddNote.vue';
import FinancialMonitoringFilterOptions from './FinancialMonitoringFilterOptions.vue';
import FinancialMonitoringInfoNote from './FinancialMonitoringInfoNote.vue';

export default {
  name: "financial-monitoring",
  components: {
    FinancialMonitoringExpenses,
    FinancialMonitoringIncomes,
    FinancialMonitoringAddNote,
    FinancialMonitoringFilterOptions,
    FinancialMonitoringInfoNote,
  },
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();
    return { financialMonitoringStore };
  },
  data() {
    return {
      Icons,
    };
  },
  methods: {
    openAddExpense: function () {
      this.financialMonitoringStore.setPage('addNote', {
        title: 'Добавление раcхода'
      });
    },
  },
};
</script>
<style lang="scss">
</style>