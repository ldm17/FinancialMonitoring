<script>
import { OperationType } from '../stores/FinancialMonitoringStore';
import FinancialMonitoringExpenses from '../components/FinancialMonitoring/FinancialMonitoringExpenses.vue';

export default {
  name: "Expenses",
  components: {
    FinancialMonitoringExpenses,
  },
  data() {
    return {
      OperationType,
    };
  },
  methods: {},
};

</script>

<template>
  <FinancialMonitoringExpenses :typeOperation="OperationType.Expenses"/>
</template> 

<style lang="scss">
</style>