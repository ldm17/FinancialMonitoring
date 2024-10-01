<template>
  <div class="range-filter-modal">
    <el-dialog model-value title="Выберите диапазон сумм" width="500" center align-center @close="backToHome">
      <div class="range-filter-modal-content">
        <div class="range-filter-input-container">
          <el-input style="width: 150px" v-model="selectedFilterMinAmount" placeholder="От" />
          <el-input style="width: 150px" v-model="selectedFilterMaxAmount" placeholder="До" />
        </div>

        <div class="range-filter-button-container">
          <el-button @click="backToHome()">Назад</el-button>
          <el-button @click="filterByRangeOfAmounts()" :disabled="checkFieldsAmounts()">Продолжить</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { useFinancialMonitoringStore } from "@/stores/FinancialMonitoringStore";

export default {
  name: "financial-monitoring-range-filter",
  props: {
    selectedMinAmount: Number,
    selectedMaxAmount: Number,
  },
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();
    return { financialMonitoringStore };
  },
  data() {
    return {
      selectedFilterMinAmount: this.selectedMinAmount,
      selectedFilterMaxAmount: this.selectedMaxAmount,
    };
  },
  methods: {
    backToHome: function () {
      this.$emit('close');
    },
    filterByRangeOfAmounts: function () {
      this.$emit('update-filter', { minAmount: parseFloat(this.selectedFilterMinAmount), maxAmount: parseFloat(this.selectedFilterMaxAmount) });
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
.range-filter-modal {
  display: flex;
  justify-content: center;
  align-items: center;
}

.range-filter-modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.range-filter-input-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.range-filter-button-container {
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>