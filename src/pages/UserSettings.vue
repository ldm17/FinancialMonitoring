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

      <p><el-checkbox v-model="isTimezoneEnabled" @change="handleEditIsTimezoneEnabled()" label="Учитывать часовой пояс устройства"/></p>

      <label>Часовой пояс устройства</label>
      <el-input v-model="combinedUserTimeZone" style="width: 250px" readonly></el-input>
    </div>
  </div>
</template>

<script>
import { OperationType, useFinancialMonitoringStore } from '@/stores/FinancialMonitoringStore';
import { ElMessage } from 'element-plus';
import { getDetectedTimeZone } from '@/utils.js';

export default {
  name: "user-settings",
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();

    return { financialMonitoringStore };
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

      const isSuccsess = await this.financialMonitoringStore.editTimeZone(updatedTimeZone);

      if (isSuccsess) {
        ElMessage.success('Тайм-зона успешно обновлена');
      } else {
        ElMessage.error('Не удалось обновить тайм-зону');
      }
    },
    async handleFetchTimeZone () {
      const result = await this.financialMonitoringStore.fetchTimeZone();
      
      if (result !== null) {
        this.selectedOption = result.timeZoneWithUtcOffset;
        this.isTimezoneEnabled = result.isTimeZoneEnabled;
      } else {
        ElMessage.error('Не удалось загрузить тайм-зону');
      }
    },
    async handleEditIsTimezoneEnabled () {
      const updateIsTimezoneEnabled = {
        isTimezoneEnabled: this.isTimezoneEnabled,
      };

      const isSuccsess = await this.financialMonitoringStore.editIsTimezoneEnabled(updateIsTimezoneEnabled);

      if (isSuccsess && this.isTimezoneEnabled) {
        ElMessage.success('Учитывание часового пояса устройства успешно включено');
      } else if (isSuccsess && !this.isTimezoneEnabled ) {
        ElMessage.success('Учитывание часового пояса устройства успешно выключено');
      } else {
        ElMessage.error('Не удалось включить учитывание часового пояса устройства');
      }
    },
    handleAddTransactionButtonClick() {
      this.$router.push({ 
        name: 'add-note',
        params: { type: 'expense', action: 'new' },
        query: { currentMenuItem: OperationType.Expenses, walletId: this.financialMonitoringStore.filtersTransactions.currentWalletId } 
      });
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

  p {
    text-align: center;
    width: 500px;
  }
}
</style>