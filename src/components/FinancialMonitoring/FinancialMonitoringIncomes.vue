<template>
  <el-empty description="Нет данных для отображения" />
</template>

<script>
import { useFinancialMonitoringStore } from "@/stores/FinancialMonitoringStore";

export default {
  name: "financial-monitoring-incomes",
  components: {},
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();
    return { financialMonitoringStore };
  },
  data() {
    return {};
  },
  methods: {},
};
</script>
<style lang="scss">
</style>

