<template>
  <div>
    <div v-if="financialMonitoringStore.pageParams.typeFilterExpenses == 'По категориям'">
      <p>Выберите категорию</p>
      <el-select style="width: 250px" v-model="selectedFilterCategory" placeholder="Выберите категорию">
        <el-option v-for="item in financialMonitoringStore.categories" :key="item.category" :value="item.category" />
    </el-select>
    </div>

    <div v-if="financialMonitoringStore.pageParams.typeFilterExpenses =='По диапазону дат'">
      <p>Выберите диапазон дат</p>
       <el-date-picker v-model="selectedFilterDatePicker" type="daterange" unlink-panels range-separator="|" start-placeholder="Дата начала" end-placeholder="Дата окончания" format="YYYY/MM/DD HH:mm" value-format="YYYY/MM/DD HH:mm" />
    </div>

    <div v-if="financialMonitoringStore.pageParams.typeFilterExpenses =='По диапазону сумм'">
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
      selectedFilterDatePicker: '',
      selectedFilterMinAmount: '',
      selectedFilterMaxAmount: '',
    };
  },
  methods: {
    backToHome: function () {
      this.financialMonitoringStore.setPage('expenses'); // при возврате на главную страницу переменная typeFilterExpenses должна принимать значение 'Не выбрано'
    },
    goToAddExpense: function() {
      this.financialMonitoringStore.setPage('expenses', {
        selectedFilterCategory: this.selectedFilterCategory,
        selectedFilterDatePicker: this.selectedFilterDatePicker,
        selectedFilterMinAmount: this.selectedFilterMinAmount,
        selectedFilterMaxAmount: this.selectedFilterMaxAmount,
        selectedTypeFilterExpenses: this.financialMonitoringStore.pageParams.typeFilterExpenses,
      });
    },
    checkFieldsFilter: function () {
      if (this.selectedFilterCategory || this.selectedFilterDatePicker) {
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