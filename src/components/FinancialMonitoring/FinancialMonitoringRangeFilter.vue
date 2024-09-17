<template>
  <div>
    <div>
      <el-input style="width: 150px" v-model="selectedFilterMinAmount" placeholder="От" /><el-input style="width: 150px" v-model="selectedFilterMaxAmount" placeholder="До" />
    </div>
    
    <div>
      <p>
        <el-button @click="backToHome()">Назад</el-button>
        <el-button @click="filterByRangeOfAmounts()" :disabled="checkFieldsAmounts()">Продолжить</el-button> 
      </p>
    </div>
  </div>
</template> 

<script>
import { useFinancialMonitoringStore } from "@/stores/FinancialMonitoringStore";

export default {
  name: "financial-monitoring-range-filter",
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();
    return { financialMonitoringStore };
  },
  data() {
    return {
      selectedFilterMinAmount: '',
      selectedFilterMaxAmount: '',
    };
  },
  methods: {
    backToHome: function () {
      this.$emit('close-range-filter');
    },
    filterByRangeOfAmounts: function () {
      this.$emit('range-of-amounts-selected', { minAmount: parseFloat(this.selectedFilterMinAmount), maxAmount: parseFloat(this.selectedFilterMaxAmount) });
    },
    checkFieldsAmounts: function () {
      const minAmount = parseFloat(this.selectedFilterMinAmount);
      const maxAmount = parseFloat(this.selectedFilterMaxAmount);

      if (minAmount && maxAmount) {
        if (minAmount <= maxAmount)
          return false
      }
      return true
    },
  },
};
</script>
<style lang="scss">
</style>