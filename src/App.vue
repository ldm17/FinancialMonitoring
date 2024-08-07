<template>
  <el-config-provider :locale="locale">
    <financialMonitoring />
  </el-config-provider>
  <!-- <test></test> -->
</template>

<script>
import styles from './main.scss';
import FinancialMonitoring from './components/FinancialMonitoring/FinancialMonitoring.vue';
import test from './components/test.vue';

import { ElConfigProvider } from 'element-plus';
import ru from 'element-plus/es/locale/lang/ru';

export default {
  name: "App",
  components: {
    test,
    FinancialMonitoring,
    ElConfigProvider,
  },
  data() {
    return {
      locale: ru,
      // firstDayOfWeek: 1,
    };
  },
  methods: {},
};
</script>
<style lang="scss">
</style>