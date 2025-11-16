<template>
  <el-config-provider :locale="locale">
    <div>
       <theme-switcher v-show="this.$route.name === 'FinancialMonitoring'" />
       <router-view />
    </div>
  </el-config-provider>
</template>

<script>
import ThemeSwitcher from './components/FinancialMonitoring/ThemeSwitcher.vue';
import { useFinancialMonitoringStoreUser } from './stores/FinancialMonitoringStoreUser';

import { ElConfigProvider } from 'element-plus';
import ru from 'element-plus/es/locale/lang/ru';
import en from 'element-plus/es/locale/lang/en';

import dayjs from 'dayjs';
import 'dayjs/locale/ru';

export default {
  name: "App",
  components: {
    ElConfigProvider,
    ThemeSwitcher
  },
  setup() {
    const financialMonitoringStoreUser = useFinancialMonitoringStoreUser();

    const locales = {
      ru,
      en,
    };

    const locale = locales[financialMonitoringStoreUser.currentLocale] || ru;

    return { locale, financialMonitoringStoreUser };
  },
  created() {
    dayjs.locale('ru');
  },
  methods: {},
};
</script>
<style lang="scss">
</style>