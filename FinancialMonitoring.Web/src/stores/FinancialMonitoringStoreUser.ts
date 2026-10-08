import { defineStore } from 'pinia';
// eslint-disable-next-line import/extensions, import/no-unresolved
import ApiClient from '@/api/ApiClient';

export const FormatDateType = {
  DD_MM_YYYY_DOT: 1,
  DD_MM_YYYY_DASH: 2,
  DD_MM_YYYY_SLASH: 3,
  MM_DD_YYYY_SLASH: 4,
  YYYY_MM_DD_DOT: 5,
  ISO_8601: 6,
  YYYY_MM_DD_SLASH: 7,
};

export const useFinancialMonitoringStoreUser = defineStore('financialMonitoringStoreUser', {
  state: () => ({
    currentLocale: 'ru',
    defaultTimeZoneWithUtcOffset: null,
    isTimeZoneEnabled: false,
    isTransactionTimeZoneVisible: false,
    isUse12HFormat: false,
    currentFormatDateType: FormatDateType.DD_MM_YYYY_DOT,
  }),
  actions: {
    async editTimeZone(updatedTimeZone: any) {
      try {
        const url = '/usersettings/update-timezone';
        await ApiClient.put(url, updatedTimeZone);

        return true;
      } catch (error) {
        console.error('Ошибка при редактировании тайм-зоны:', error);
        return false;
      }
    },
    async fetchTimeZone() {
      try {
        const url = '/usersettings';
        const response = await ApiClient.get(url);

        this.defaultTimeZoneWithUtcOffset = response.data;
        this.isTimeZoneEnabled = response.data.isTimeZoneEnabled;
        this.isTransactionTimeZoneVisible = response.data.isTransactionTimeZoneVisible;
        this.isUse12HFormat = response.data.isUse12HFormat;
        this.currentFormatDateType = response.data.formatDateType;

        return {
          timeZoneWithUtcOffset: response.data,
          isTimeZoneEnabled: response.data.isTimeZoneEnabled,
          isTransactionTimeZoneVisible: response.data.isTransactionTimeZoneVisible,
          isUse12HFormat: response.data.isUse12HFormat,
          formatDateType: response.data.formatDateType,
        };
      } catch (error) {
        console.error('Ошибка при загрузке настроек:', error);
        return null;
      }
    },
    async editIsTimezoneEnabled(updateIsTimezoneEnabled: any) {
      try {
        const url = '/usersettings/update-timezone-enabled';
        await ApiClient.put(url, updateIsTimezoneEnabled);

        return true;
      } catch (error) {
        console.error('Ошибка при изменении настройки учитывания часового пояса устройства:', error);
        return false;
      }
    },
    async editIsTransactionTimeZoneVisible(updateIsTransactionTimeZoneVisible: any) {
      try {
        const url = '/usersettings/update-transaction-timeZone-visible';
        await ApiClient.put(url, updateIsTransactionTimeZoneVisible);

        return true;
      } catch (error) {
        console.error('Ошибка при изменении настройки отображения часового пояса транзакций:', error);
        return false;
      }
    },
    async editIsUse12HFormat(updateIsUse12HFormat: any) {
      try {
        const url = '/usersettings/update-use12HFormat';
        await ApiClient.put(url, updateIsUse12HFormat);

        return true;
      } catch (error) {
        console.error('Ошибка при изменении формата времени:', error);
        return false;
      }
    },
    async editFormatDateType(updateFormatDateType: any) {
      try {
        const url = '/usersettings/update-format-date-type';
        await ApiClient.put(url, updateFormatDateType);

        return true;
      } catch (error) {
        console.error('Ошибка при изменении формата даты:', error);
        return false;
      }
    },
  },
});

export default {};
