<template>
  <div class="user-settings">
    <div>
      <label>Часовой пояс по умолчанию</label>
      <el-select
        v-model="selectedOption"
        placeholder="Выберите часовой пояс"
        filterable
        clearable
        :loading="loading"
        value-key="timeZone"
        @change="handleEditTimeZone"
        style="width: 250px;"
      >
        <el-option
          v-for="opt in options"
          :key="opt.value.timeZone"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>

      <label style="margin-top: 15px;">Часовой пояс устройства</label>
      <el-input v-model="combinedUserTimeZone" style="width: 250px" readonly></el-input>

      <div class="user-settings-checkbox-container">
        <el-checkbox v-model="isTimezoneEnabled" @change="handleEditIsTimezoneEnabled()" label="Учитывать часовой пояс устройства"/>
        <el-checkbox v-model="isTransactionTimeZoneVisible" @change="handleEditIsTransactionTimeZoneVisible()" label="Отображать часовой пояс транзакций"/>
        <el-checkbox v-model="isUse12HFormat" @change="handleEditIsUse12HFormat()" label="12-ти часовой формат времени"/>
      </div>

      <label>Формат даты</label>
      <el-select v-model="financialMonitoringStoreUser.currentFormatDateType" style="width: 250px" @change="handleEditFormatDateType">
        <el-option :value="FormatDateType.DD_MM_YYYY_DOT" label="DD.MM.YYYY"></el-option>
        <el-option :value="FormatDateType.DD_MM_YYYY_DASH" label="DD-MM-YYYY"></el-option>
        <el-option :value="FormatDateType.DD_MM_YYYY_SLASH" label="DD/MM/YYYY"></el-option>
        <el-option :value="FormatDateType.MM_DD_YYYY_SLASH" label="MM/DD/YYYY"></el-option>
        <el-option :value="FormatDateType.YYYY_MM_DD_DOT" label="YYYY.MM.DD"></el-option>
        <el-option :value="FormatDateType.ISO_8601" label="YYYY-MM-DD"></el-option>
        <el-option :value="FormatDateType.YYYY_MM_DD_SLASH" label="YYYY/MM/DD"></el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
import { OperationType, useFinancialMonitoringStore } from '@/stores/FinancialMonitoringStore';
import { useFinancialMonitoringStoreUser } from '@/stores/FinancialMonitoringStoreUser';
import { ElMessage } from 'element-plus';
import { getDetectedTimeZone } from '@/utils.js';
import { FormatDateType } from '@/stores/FinancialMonitoringStoreUser';

export default {
  name: "user-settings",
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();
    const financialMonitoringStoreUser = useFinancialMonitoringStoreUser();

    return { financialMonitoringStore, financialMonitoringStoreUser};
  },
  mounted() {
    this.financialMonitoringStore.setHeaderButtonHandler(this.handleAddTransactionButtonClick);
  },
  unmounted() {
    this.financialMonitoringStore.resetHeaderButtonHandler();
  },
  created() {
    this.loadTimeZones();
    this.detectUserTimeZone();
    this.handleFetchTimeZone();
  },
  computed: {
    combinedUserTimeZone() {
      return `${this.currentUserTimeZone.timeZone} (${this.currentUserTimeZone.utcOffset})`;
    }
  },
  data() {
    return {
      options: [],
      selectedOption: null,
      loading: false,
      currentUserTimeZone: null,
      isTimezoneEnabled: false,
      getDetectedTimeZone: getDetectedTimeZone,
      isTransactionTimeZoneVisible: false,
      isUse12HFormat: false,
      FormatDateType,
    };
  },
  methods: {
    async loadTimeZones() {
      if (typeof Intl.supportedValuesOf !== "function") {
        console.warn("Ваш браузер не поддерживает Intl.supportedValuesOf");
        return;
      }

      this.loading = true;
      try {
        const zones = Intl.supportedValuesOf("timeZone");

        const now = new Date();
        const fmt = (zone) =>
          new Intl.DateTimeFormat("en-US", {
            hour12: false,
            timeZone: zone,
            timeZoneName: "short",
          })
            .formatToParts(now)
            .find((p) => p.type === "timeZoneName")
            .value.replace("GMT", "UTC");

          this.options = zones.map((tz) => {
          let utcOffset;
          try {
            utcOffset = fmt(tz);
          } catch (e) {
            utcOffset = "UTC?";
          }
          return {
            value: {
              timeZone: tz,
              utcOffset: utcOffset
            },
            label: `${tz} (${utcOffset})`,
          };
        });

      } catch (err) {
        ElMessage.error('Ошибка загрузки списка часовых поясов');
        console.error("Не удалось загрузить зоны:", err);
      } finally {
        this.loading = false;
      }
    },
    detectUserTimeZone: function () {
      try {
        const userOption = this.options.find(
          opt => opt.value.timeZone === getDetectedTimeZone()
        );
        
        if (userOption) {
          this.currentUserTimeZone = userOption.value;
        } else {
          throw new Error("Часовой пояс не найден в списке");
        }
        
      } catch (error) {
        ElMessage.error(`Автоопределение не удалось: ${error.message}`);
        console.warn("Ошибка определения часового пояса:", error);
      }
    },
    async handleEditTimeZone () {
      if (!this.selectedOption) {
        ElMessage.warning('Необходимо выбрать часовой пояс');
        return;
      }

      const updatedTimeZone = {
        timeZone: this.selectedOption.timeZone,
      };

      const isSuccsess = await this.financialMonitoringStoreUser.editTimeZone(updatedTimeZone);

      if (isSuccsess) {
        ElMessage.success('Тайм-зона успешно обновлена');
      } else {
        ElMessage.error('Не удалось обновить тайм-зону');
      }
    },
    async handleFetchTimeZone () {
      const result = await this.financialMonitoringStoreUser.fetchTimeZone();
      
      if (result !== null) {
        this.selectedOption = result.timeZoneWithUtcOffset;
        this.isTimezoneEnabled = result.isTimeZoneEnabled;
        this.isTransactionTimeZoneVisible = result.isTransactionTimeZoneVisible;
        this.isUse12HFormat = result.isUse12HFormat;
      } else {
        ElMessage.error('Не удалось загрузить тайм-зону');
      }
    },
    async handleEditIsTimezoneEnabled () {
      const updateIsTimezoneEnabled = {
        isTimezoneEnabled: this.isTimezoneEnabled,
      };

      const isSuccsess = await this.financialMonitoringStoreUser.editIsTimezoneEnabled(updateIsTimezoneEnabled);

      if (isSuccsess && this.isTimezoneEnabled) {
        ElMessage.success('Учитывание часового пояса устройства успешно включено');
      } else if (isSuccsess && !this.isTimezoneEnabled) {
        ElMessage.success('Учитывание часового пояса устройства успешно выключено');
      } else {
        ElMessage.error('Не удалось изменить учитывание часового пояса устройства');
      }
    },
    handleAddTransactionButtonClick() {
      this.$router.push({ 
        name: 'add-note',
        params: { type: 'expense', action: 'new' },
        query: { currentMenuItem: OperationType.Expenses, walletId: this.financialMonitoringStore.filtersTransactions.currentWalletId } 
      });
    },
    async handleEditIsTransactionTimeZoneVisible() {
      const updateIsTransactionTimeZoneVisible = {
        isTransactionTimeZoneVisible: this.isTransactionTimeZoneVisible,
      };

      const isSuccsess = await this.financialMonitoringStoreUser.editIsTransactionTimeZoneVisible(updateIsTransactionTimeZoneVisible);

      if (isSuccsess && this.isTransactionTimeZoneVisible) {
        ElMessage.success('Отображение часового пояса транзакций успешно включено');
      } else if (isSuccsess && !this.isTransactionTimeZoneVisible) {
        ElMessage.success('Отображение часового пояса транзакций успешно выключено');
      } else {
        ElMessage.error('Не удалось изменить отображение часового пояса транзакций');
      }
    },
    async handleEditIsUse12HFormat() {
      const updateIsUse12HFormat = {
        isUse12HFormat: this.isUse12HFormat,
      };

      const isSuccsess = await this.financialMonitoringStoreUser.editIsUse12HFormat(updateIsUse12HFormat);

      if (isSuccsess && this.isUse12HFormat) {
        ElMessage.success('12-ти часовой формат времени успешно включен');
      } else if (isSuccsess && !this.isUse12HFormat) {
        ElMessage.success('12-ти часовой формат времени успешно выключен');
      } else {
        ElMessage.error('Не удалось изменить формат времени');
      }
    },
    async handleEditFormatDateType() {
      const updateFormatDateType = {
        FormatDateType: this.financialMonitoringStoreUser.currentFormatDateType,
      };

      const isSuccsess = await this.financialMonitoringStoreUser.editFormatDateType(updateFormatDateType);

      if (isSuccsess) {
        ElMessage.success('Формат даты успешно изменён');
      } else {
        ElMessage.error('Не удалось изменить формат даты');
      }
    },
  },
};
</script>

<style lang="scss">
.user-settings > div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 500px;
  max-width: 500px;
  margin: 20px auto;

   label {
    margin-bottom: 8px;
    width: 250px;
    text-align: left;
  }
}

.user-settings-checkbox-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 15px;
  width: 250px;
}
</style>