<template>
  <div>
    <div v-for="item in financialMonitoringStore.expenses" :key="item.id">
      <div style="width: 260px; overflow-wrap: break-word; white-space: normal;" v-if="item.id == this.financialMonitoringStore.pageParams.id">
        <div>
          <p>{{ item.category }}</p>
          <h1>
            <el-icon v-if="item.isFavorite" size="small"><CollectionTag /></el-icon>
            <el-icon v-if="item.isIgnoredInCalculation" size="small"><Hide /></el-icon>
            <span style="color: red;">-{{ item.amount }}</span>
          </h1>
          <p>
            <el-icon><Calendar /></el-icon>
            {{ item.date }}
          </p>
          <p v-if="item.description" style="display: flex;">
            <el-icon style="margin-right: 5px;"><EditPen /></el-icon>
            <span style="color: grey">{{ item.description }}</span>
          </p>
          <p>
            Не учитывается в общей сумме
            <el-switch v-model="item.switch" :disabled="true" />
          </p>
          <div>
            <el-button @click="backToHome()">Назад</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useFinancialMonitoringStore } from "@/stores/FinancialMonitoringStore";

export default {
  name: "financial-monitoring-info-note",
  components: {},
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();
    return { financialMonitoringStore };
  },
  data() {
    return {};
  },
  methods: {
    backToHome: function () {
      this.financialMonitoringStore.setPage('expenses', {
        selectedTypeSortExpenses: this.financialMonitoringStore.pageParams.typeSortExpenses,
        selectedTypeFilterExpenses: this.financialMonitoringStore.pageParams.typeFilterExpenses,
        selectedTypeGroupExpenses: this.financialMonitoringStore.pageParams.typeGroupExpenses,
        selectedActiveName: this.financialMonitoringStore.pageParams.activeName,
        } 
      );
    },
  },
};
</script>
<style lang="scss"></style>
