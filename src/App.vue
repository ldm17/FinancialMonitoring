<template>
  <el-config-provider :locale="locale">
    <div>
      <theme-switcher class="theme-switcher" />
      <financial-monitoring />
    </div>
  </el-config-provider>
</template>

<script>
import FinancialMonitoring from './components/FinancialMonitoring/FinancialMonitoring.vue';
import ThemeSwitcher from './components/FinancialMonitoring/ThemeSwitcher.vue';

import { ElConfigProvider } from 'element-plus';
import ru from 'element-plus/es/locale/lang/ru';
import en from 'element-plus/es/locale/lang/en';

import dayjs from 'dayjs';
import 'dayjs/locale/ru';

export default {
  name: "App",
  components: {
    FinancialMonitoring,
    ElConfigProvider,
    ThemeSwitcher,
  },
  created() {
    dayjs.locale('ru');
  },
  data() {
    return {
      locale: ru,
      locales: { en, ru }
    };
  },
  methods: {},
};
</script>
<style lang="scss">
.theme-switcher {
  position: fixed;
  top: 20px;
  right: 150px;
  z-index: 1000;
}
</style>