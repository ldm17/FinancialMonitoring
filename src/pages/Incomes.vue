<script>
import { OperationType } from '../stores/FinancialMonitoringStore';
import FinancialMonitoringExpenses from '../components/FinancialMonitoring/FinancialMonitoringExpenses.vue';

export default {
  name: "Incomes",
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
  <FinancialMonitoringExpenses :typeOperation="OperationType.Incomes"/>
</template> 

<style lang="scss">
</style>