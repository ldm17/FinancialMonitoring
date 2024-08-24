<template>
  <div>
    <div v-if="financialMonitoringStore.pageParams.typeFilterExpenses == financialMonitoringStore.pageParams.FilterType.ByCategories">
      <p>Выберите категорию</p>
      <el-select style="width: 250px" v-model="selectedFilterCategory" placeholder="Выберите категорию">
        <el-option v-for="item in financialMonitoringStore.categories" :key="item.category" :value="item.category" />
    </el-select>
    </div>

    <div v-if="financialMonitoringStore.pageParams.typeFilterExpenses == financialMonitoringStore.pageParams.FilterType.ByRangeOfAmounts">
      <p>Выберите диапазон сумм</p>
      <el-input style="width: 150px" v-model="selectedFilterMinAmount" placeholder="От" /><el-input style="width: 150px" v-model="selectedFilterMaxAmount" placeholder="До" />
    </div>

    <div>
      <p>
        <el-button @click="backToHome()">Назад</el-button>
        <el-button @click="goToAddExpense()" :disabled="checkFieldsFilter()">Продолжить</el-button> 
      </p>
    </div>
  </div>
</template> 

<script>
import { useFinancialMonitoringStore } from "@/stores/FinancialMonitoringStore";

export default {
  name: "financial-monitoring-filter-options",
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();
    return { financialMonitoringStore };
  },
  data() {
    return {
      selectedFilterCategory: '',
      selectedFilterMinAmount: '',
      selectedFilterMaxAmount: '',
    };
  },
  methods: {
    backToHome: function () {
      this.financialMonitoringStore.setPage('expenses');
    },
    goToAddExpense: function() {
      this.financialMonitoringStore.setPage('expenses', {
        selectedFilterCategory: this.selectedFilterCategory,
        selectedFilterMinAmount: this.selectedFilterMinAmount,
        selectedFilterMaxAmount: this.selectedFilterMaxAmount,
        selectedTypeFilterExpenses: this.financialMonitoringStore.pageParams.typeFilterExpenses,
      });
    },
    checkFieldsFilter: function () {
      if (this.selectedFilterCategory) {
        return false
      } else if (this.selectedFilterMinAmount && this.selectedFilterMaxAmount) {
        if (parseInt(this.selectedFilterMinAmount) <= parseInt(this.selectedFilterMaxAmount))
        return false
      }
      return true
    }
  },
};
</script>
<style lang="scss">
</style>