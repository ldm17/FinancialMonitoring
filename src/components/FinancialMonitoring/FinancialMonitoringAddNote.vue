<template>
  <div>
     <p>{{ action === 'new' ? 'Добавление транзакции' : 'Редактирование транзакции' }}</p>
    <span v-if="isIgnoredInCalculation"><el-icon size="small"><Hide /></el-icon></span>
    <span v-if="isFavorite"><el-icon size="small"><CollectionTag /></el-icon></span>
    
    <p>Кошелёк</p>
      <el-select v-model="financialMonitoringStore.filtersTransactions.currentWalletId" style="width: 250px" placeholder="Выберите кошелек">
        <template #prefix>
          <el-icon><WalletFilled /></el-icon>
        </template>
        <el-option
          v-for="wallet in financialMonitoringStoreWallet.wallets"
          :key="wallet.id"
          :value="wallet.id"
          :label="wallet.name"
        ></el-option>
      </el-select>

    <p>Тип операции</p>
      <el-select v-model="typeOperation" style="width: 250px" placeholder="Введите тип операции">
        <el-option :value="OperationType.Expenses" label="Расход"></el-option>
        <el-option :value="OperationType.Incomes" label="Доход"></el-option>
      </el-select>

    <p>Сумма</p>
    <el-input style="width: 250px" v-model="amount" placeholder="Введите сумму" :formatter="(value) => `${value}`.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')" clearable></el-input>

    <p>Категория</p>
    <div class="picker-category">
      <el-autocomplete
        v-model="selectedCategory"
        :fetch-suggestions="querySearch"
        :trigger-on-focus="false"
        placeholder="Выберите категорию"
        clearable>
      </el-autocomplete>

      <el-button @click="isCategoryListDialogVisible = true"><el-icon><ArrowRight /></el-icon></el-button>
    </div>
    <div class="error-message" v-if="isSubmitAttempted && errorMessage">Выбранная категория не найдена. Пожалуйста, выберите другую категорию</div>

    <el-dialog v-model="isCategoryListDialogVisible" title="Выберите категорию" width="500" center align-center>
      <span>
        <financial-monitoring-category-list
        :typeOperation="typeOperation"
        @category-selected="onCategorySelected">
        </financial-monitoring-category-list>
      </span>
    </el-dialog>
    
    <p>Дата <span v-if="action === 'new' && checkTimezoneWarning()" style="font-size: 12px; color: #409EFF;">({{ checkTimezoneWarning() }})</span></p>
    <el-date-picker style="width: 250px" v-model="datePicker" type="datetime" placeholder="Выберите дату и время" :format="dateFormat" value-format="YYYY-MM-DD HH:mm" :time-format="timeFormat" :picker-options="pickerOptions" />

    <div v-if="action === 'edit'">
      <p>Часовой пояс транзакции</p>
      <el-input style="width: 250px" v-model="timeZone" readonly></el-input>
    </div>

    <div v-if="isDescription">
      <p>Примечание</p>
      <el-input style="width: 250px" v-model="description" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea" placeholder="Введите примечание" />
    </div>

    <p>
      <el-button @click="addDescription()"><el-icon><EditPen /></el-icon></el-button>
      <el-button><el-icon><PictureFilled /></el-icon></el-button>
      <el-button @click="editIsFavorite()"><el-icon><CollectionTag /></el-icon></el-button>
      <el-button v-if="this.$route.params.action === 'edit'" @click="deleteTransaction(id)"><el-icon><Delete /></el-icon></el-button>
    </p>

    <p>
      Не учитывать в общей сумме
      <el-switch v-model="isIgnoredInCalculation" />
    </p>

    <div v-if="action === 'new'">
      <p>
        <el-button @click="this.$router.back()">Назад</el-button>
        <el-button type="primary" @click="addExpense(amount, selectedCategory, datePicker)" :disabled="checkFieldsAddExpense()">Добавить</el-button>
      </p>
    </div>

      <div v-if="action === 'edit'">
      <p>
        <el-button @click="this.$router.back()">Назад</el-button>
        <el-button type="primary" @click="handleEditTransaction()" :disabled="checkFieldsAddExpense()">Сохранить</el-button>
      </p>
    </div>

    <div>
      <el-dialog class="select-timeZone-modal" v-model="isDialogWarningEditDatePicker" title="Подтвердите действие" width="600" center align-center draggable>
        <p style="text-align: center;">Дата транзакции была изменена. Как учесть часовой пояс?</p>
        <div class="select-timeZone-button-container">
          <el-button type="primary" @click="saveOriginalTimeZone()">Сохранить исходный (UTC{{ getTzOffsets.transactionOffset }})</el-button>
          <el-button type="primary" @click="saveCurrentTimeZone()">Сохранить текущий (UTC{{ getTzOffsets.detectedTimeZone }})</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template> 

<script>
import { OperationType, useFinancialMonitoringStore } from '@/stores/FinancialMonitoringStore';
import { useFinancialMonitoringStoreWallet } from "@/stores/FinancialMonitoringStoreWallet";
import { useFinancialMonitoringStoreUser } from "@/stores/FinancialMonitoringStoreUser";
import { ElMessage, ElMessageBox } from 'element-plus';
import FinancialMonitoringCategoryList from './FinancialMonitoringCategoryList.vue';
import { formatDate, getDetectedTimeZone, DATE_FORMATS } from '@/utils.js'
import { FormatDateType } from '@/stores/FinancialMonitoringStoreUser';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc)
dayjs.extend(timezone)

export default {
  name: "financial-monitoring-add-note",
  props: {
    type: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: false,
    }
  },
  components: {
    FinancialMonitoringCategoryList,
  },
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();
    const financialMonitoringStoreWallet = useFinancialMonitoringStoreWallet();
    const financialMonitoringStoreUser = useFinancialMonitoringStoreUser();
    return { financialMonitoringStore, financialMonitoringStoreWallet, financialMonitoringStoreUser };
  },
  async created() {
    this.typeOperation = Number(this.$route.query.currentMenuItem);

    const walletIdFromUrl = this.$route.query.walletId ? Number(this.$route.query.walletId) : null;
    const isSuccessFetchWallets = await this.financialMonitoringStoreWallet.fetchWallets();
    this.financialMonitoringStoreWallet.setCurrentWalletId(walletIdFromUrl);

    if (isSuccessFetchWallets === null) {
      ElMessage.error('Не удалось загрузить кошельки');
    };

    const isSuccessFetchCategories = await this.financialMonitoringStore.fetchCategories(this.typeOperation);

    if (isSuccessFetchCategories === null) {
      ElMessage.error('Не удалось загрузить категории');
    };

    await this.financialMonitoringStoreUser.fetchTimeZone();

    const expenseId = Number(this.id);
    if (expenseId) {
      this.fetchExpense(expenseId);
    } else {
      this.setCurrentDate();
    }

    this.categoryListForSuggestion = this.loadAllCategoryList();
  },
  watch: {
    selectedCategory(newValue) {
      if (newValue.length === 0) {
        this.errorMessage = false;
        this.isSubmitAttempted = false;
      }
    },
    async typeOperation(newType) {
      const currentMenuItem = newType === OperationType.Expenses ? 0 : 1;

      const isSuccess = await this.financialMonitoringStore.fetchCategories(newType);
      if (isSuccess === null) {
        ElMessage.error('Не удалось загрузить категории');
      }

      this.categoryListForSuggestion = this.loadAllCategoryList();

      this.$router.replace({ params: { type: newType === this.OperationType.Expenses ? 'expense' : 'income' }, query: { ...this.$route.query, currentMenuItem } });
    },
    datePicker(newValue, oldValue) {
      this.isEditDatePicker = oldValue && oldValue !== newValue ? true : false;
    }
  },
  computed: {
    currentWalletId: function () {
      return this.financialMonitoringStore.filtersTransactions.currentWalletId;
    },
    getTzOffsets: function () {
      const transactionOffset = dayjs().tz(this.timeZone).format('Z');
      const detectedTimeZone = dayjs().tz(getDetectedTimeZone()).format('Z');

      return {
        transactionOffset,
        detectedTimeZone,
      };
    },
    dateFormat: function () {
      const timeFormat = this.financialMonitoringStoreUser.isUse12HFormat ? 'h:mm A' : 'HH:mm';
      const datePattern = this.getDatePattern();
      return `${datePattern} ${timeFormat}`;
    },
    timeFormat: function () {
      return this.financialMonitoringStoreUser.isUse12HFormat ? 'h:mm A' : 'HH:mm';
    },
    pickerOptions: function () {
      return {
        selectableRange: !this.financialMonitoringStoreUser.isUse12HFormat ? ['00:00:00 - 23:59:59'] : ['00:00:00 - 12:59:59'],
      }
    },
  },
  data() {
    return {
      amount: null,
      selectedCategory: '',
      datePicker: '',
      isDescription: false,
      description: '',
      isIgnoredInCalculation: false,
      isFavorite: false,
      isCategoryListDialogVisible: false,
      categoryListForSuggestion: [],
      errorMessage: false,
      isSubmitAttempted: false,
      typeOperation: OperationType.Expenses,
      OperationType,
      getDetectedTimeZone: getDetectedTimeZone,
      timeZone: '',
      isEditDatePicker: false,
      isDialogWarningEditDatePicker: false,
      typeSaveEditDatePicker: '',
      formatDate,
      DATE_FORMATS,
      FormatDateType,
    };
  },
  methods: {
    async addExpense(amount, selectedCategory, datePicker) {
      this.isSubmitAttempted = true;

      const allCategories = this.loadAllCategoryList();
      const isValidCategory = allCategories.find(item => item.value.toLowerCase() === selectedCategory.toLowerCase());

      if (!isValidCategory) {
        this.errorMessage = true;
        return;
      }

      const targetZone = this.financialMonitoringStoreUser.isTimeZoneEnabled ? getDetectedTimeZone() : this.financialMonitoringStoreUser.defaultTimeZoneWithUtcOffset.timeZone;

      const datePickerWithOffset = dayjs(datePicker).tz(targetZone, true).format('YYYY-MM-DDTHH:mm:ss.SSSZ');

      const request = {
        categoryId: isValidCategory.id,
        amount: parseFloat(amount),
        createdAtUtc: datePickerWithOffset,
        description: this.description,
        isIgnoredInCalculation: this.isIgnoredInCalculation,
        isFavorite: this.isFavorite,
        operationType: this.typeOperation,
        walletId: this.financialMonitoringStore.filtersTransactions.currentWalletId,
        timeZone: targetZone,
      };
      const isSuccsess = await this.financialMonitoringStore.addNote(request, this.typeOperation);

      if (isSuccsess) {
        this.financialMonitoringStore.filtersTransactions.selectedDate = datePicker;

        ElMessage.success('Запись успешно добавлена');

        this.redirectToTransactionTab();
      } else {
        ElMessage.error('Ошибка добавлении транзакции');
      }
    },
    async fetchExpense(id) {
      const expense = await this.financialMonitoringStore.fetchNote(id);

      if (expense !== null) {
        this.amount = expense.amount;
        this.selectedCategory = this.financialMonitoringStore.categories.get(expense.categoryId)?.name;
        this.datePicker = dayjs(expense.createdAt).tz(expense.timeZone).format('YYYY-MM-DD HH:mm');
        this.description = expense.description;
        this.isIgnoredInCalculation = expense.isIgnoredInCalculation;
        this.isFavorite = expense.isFavorite;
        this.timeZone = expense.timeZone;
      } else {
        ElMessage.error('Не удалось загрузить запись');
      }
    },
    async editTransaction() {
      this.isSubmitAttempted = true;

      const allCategories = this.loadAllCategoryList();
      const isValidCategory = allCategories.find(item => item.value.toLowerCase() === this.selectedCategory.toLowerCase());

      if (!isValidCategory) {
        this.errorMessage = true;
        return;
      }

      let targetZone = '';

      if (this.isDialogWarningEditDatePicker) {
        targetZone = this.typeSaveEditDatePicker === 'saveOriginalTimeZone' ? this.timeZone : getDetectedTimeZone();
      } else if (this.timeZone == getDetectedTimeZone()) {
        targetZone = this.timeZone;
      }

      let datePickerWithOffset = dayjs(this.datePicker).tz(targetZone, true).format('YYYY-MM-DDTHH:mm:ss.SSSZ');

      const updatedExpense = {
        id: this.id,
        categoryId: isValidCategory.id,
        amount: parseFloat(this.amount),
        createdAtUtc: datePickerWithOffset,
        description: this.description,
        isIgnoredInCalculation: this.isIgnoredInCalculation,
        isFavorite: this.isFavorite,
        operationType: this.typeOperation,
        walletId: this.financialMonitoringStore.filtersTransactions.currentWalletId,
        timeZone: targetZone,
      };

      const isSuccsess = await this.financialMonitoringStore.editNote(updatedExpense);

      if (isSuccsess) {
        ElMessage.success('Запись успешно обновлена');
        this.isDialogWarningEditDatePicker = false;
        
        this.redirectToTransactionTab();
      } else {
        ElMessage.error('Не удалось обновить запись');
      }
    },
    checkFieldsAddExpense: function () {
      return this.selectedCategory == 0 || this.amount == 0 || this.datePicker == 0 ? true : false;
    },
    addDescription: function () {
      this.isDescription = !this.isDescription;
    },
    editIsFavorite: function () {
      this.isFavorite = !this.isFavorite;
    },
    deleteTransaction: function (id) {
      ElMessageBox.confirm(
      'Удалить запись ?',
      'Подтвердите действие',
      {
        confirmButtonText: 'Удалить',
        cancelButtonText: 'Отменить',
        type: 'warning',
        center: true,
        draggable: true,
      }
    )
      .then(() => {
        ElMessage({
          type: 'success',
          message: 'Запись успешно удалена',
        })
        this.financialMonitoringStore.deleteTransaction(id, this.typeOperation);

        this.$router.replace({ query: {} });
        this.$router.back();
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: 'Удаление отменено',
        })
      })
    },
    onCategorySelected: function (category) {
      this.selectedCategory = category.label;
      this.isCategoryListDialogVisible = false;
    },
    querySearch: function (queryString, callback) {
      const results = queryString ? this.categoryListForSuggestion.filter(this.createFilter(queryString)) : this.categoryListForSuggestion;
      callback(results);
    },
    createFilter: function (queryString) {
      return (labelCategory) => {
        return (labelCategory.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
      };
    },
    loadAllCategoryList: function () {
      const store = this.financialMonitoringStore;

      const extractCategories = (categories) => {
        let result = [];
        categories.forEach((category) => {
          result.push({
            value: category.name,
            id: category.id,
          });

          if (category.children && category.children.length > 0) {
            result = result.concat(extractCategories(category.children));
          }
        });
        return result;
      };

      const rootCategories = Array.from(store.categories.values()).filter(
        (category) => !category.parentId
      );
      
      return extractCategories(rootCategories);
    },
    setCurrentDate: function () {
      this.datePicker = this.financialMonitoringStoreUser.isTimeZoneEnabled ? dayjs().tz(getDetectedTimeZone()).format('YYYY-MM-DD HH:mm') : dayjs().tz(this.financialMonitoringStoreUser.defaultTimeZoneWithUtcOffset.timeZone).format('YYYY-MM-DD HH:mm');
    },
    redirectToTransactionTab: function () {
      const walletId = this.financialMonitoringStore.filtersTransactions.currentWalletId;
      if (this.typeOperation === this.OperationType.Expenses) {
        this.$router.push({ 
          name: 'expenses', 
          query: { walletId } 
        });
      } else {
        this.$router.push({ 
          name: 'incomes', 
          query: { walletId } 
        });
      }
    },
    checkTimezoneWarning: function () {
      if (this.financialMonitoringStoreUser.isTimeZoneEnabled && this.financialMonitoringStoreUser.defaultTimeZoneWithUtcOffset.timeZone !== Intl.DateTimeFormat().resolvedOptions().timeZone) {
        let offset = dayjs().tz(getDetectedTimeZone()).utcOffset();
        const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
        const minutes = String(Math.abs(offset) % 60).padStart(2, '0');
        const sign = offset >= 0 ? '+' : '-';
        offset = `${sign}${hours}:${minutes}`;

        return `${getDetectedTimeZone()} (UTC${offset})`;
      }
    },
    handleEditTransaction: function () {
      if (this.isEditDatePicker && this.financialMonitoringStoreUser.isTimeZoneEnabled && getDetectedTimeZone() !== this.financialMonitoringStoreUser.defaultTimeZoneWithUtcOffset.timeZone && this.timeZone !== getDetectedTimeZone()) {
        this.isDialogWarningEditDatePicker = true;
      } else {
        this.editTransaction();
      }
    },
    saveOriginalTimeZone: function () {
      this.typeSaveEditDatePicker = 'saveOriginalTimeZone';
      this.editTransaction();
    },
    saveCurrentTimeZone: function () {
      this.typeSaveEditDatePicker = 'saveCurrentTimeZone';
      this.editTransaction();
    },
    getDatePattern() {
      const formatType = this.financialMonitoringStoreUser.currentFormatDateType;
      return DATE_FORMATS[formatType] || DATE_FORMATS[FormatDateType.DD_MM_YYYY_DOT];
    }
  },
};
</script>
<style lang="scss">

.picker-category {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  width: 250px;

  .el-autocomplete {
    width: 100%;
  }

  .el-button {
    width: 32px;
  }
}

.error-message {
  max-width: 250px;
  color: red;
  margin-top: 10px;
  font-size: 15px;
}

.select-timeZone-modal {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.select-timeZone-button-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>

