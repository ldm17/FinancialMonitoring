<template>
  <el-config-provider :locale="locale">
    <financialMonitoring />
  </el-config-provider>
</template>

<script>
import styles from './main.scss';
import FinancialMonitoring from './components/FinancialMonitoring/FinancialMonitoring.vue';

import { ElConfigProvider } from 'element-plus';
import ru from 'element-plus/es/locale/lang/ru';

export default {
  name: "App",
  components: {
    FinancialMonitoring,
    ElConfigProvider,
  },
  data() {
    return {
      locale: ru,
    };
  },
  methods: {},
};
</script>
<style lang="scss">
</style>