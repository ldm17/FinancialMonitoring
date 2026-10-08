<script>
import { OperationType } from '../stores/FinancialMonitoringStore';
import FinancialMonitoringTransactions from '../components/FinancialMonitoring/FinancialMonitoringTransactions.vue';

export default {
  name: "Expenses",
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
  <FinancialMonitoringTransactions :typeOperation="OperationType.Expenses"/>
</template> 

<style lang="scss">
</style>