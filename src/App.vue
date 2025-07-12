<template>
  <el-config-provider :locale="locale">
    <div>
       <theme-switcher v-show="this.$route.name === 'FinancialMonitoring'" />
       <router-view />
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
    ThemeSwitcher
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
</style>