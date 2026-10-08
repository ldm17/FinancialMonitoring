<script>
import { OperationType } from '../stores/FinancialMonitoringStore';
import FinancialMonitoringTransactions from '../components/FinancialMonitoring/FinancialMonitoringTransactions.vue';

export default {
  name: "Incomes",
  components: {
    FinancialMonitoringTransactions,
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
  <FinancialMonitoringTransactions :typeOperation="OperationType.Incomes"/>
</template> 

<style lang="scss">
</style>