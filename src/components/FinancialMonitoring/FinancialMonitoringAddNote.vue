<template>
  <div>
    <p>{{ financialMonitoringStore.pageParams.title }}</p>
    <span v-if="isIgnoredInCalculation"><el-icon size="small"><Hide /></el-icon></span>
    <span v-if="isFavorite"><el-icon size="small"><CollectionTag /></el-icon></span>
    
    <p>Тип операции</p>
      <el-select v-model="typeOperation" style="width: 250px" placeholder="Введите тип операции">
        <el-option :value="OperationType.Expenses" label="Расход"></el-option>
        <el-option :value="OperationType.Incomes" label="Доход"></el-option>
      </el-select>

    <p>Сумма</p>
    <el-input style="width: 250px" v-model="amount" placeholder="Введите сумму" :formatter="(value) => `${value}`.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')" clearable>
    </el-input>

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

    <p>Дата</p>
    <el-date-picker style="width: 250px" v-model="datePicker" type="datetime" placeholder="Выберите дату и время" format="YYYY/MM/DD HH:mm" value-format="YYYY/MM/DD HH:mm" time-format="HH:mm"/>

    <div v-if="isDescription">
      <p>Примечание</p>
      <el-input style="width: 250px" v-model="description" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea" placeholder="Введите примечание" />
    </div>

    <p>
      <el-button @click="addDescription()"><el-icon><EditPen /></el-icon></el-button>
      <el-button><el-icon><PictureFilled /></el-icon></el-button>
      <el-button @click="editIsFavorite()"><el-icon><CollectionTag /></el-icon></el-button>
      <el-button v-if="financialMonitoringStore.pageParams.showDeleteButton" @click="deleteTransaction(this.financialMonitoringStore.pageParams.id)"><el-icon><Delete /></el-icon></el-button>
    </p>

    <p>
      Не учитывать в общей сумме
      <el-switch v-model="isIgnoredInCalculation" />
    </p>

    <div v-if="financialMonitoringStore.pageParams.title == 'Добавление операции'">
      <p>
        <el-button @click="backToHome()">Назад</el-button>
        <el-button type="primary" @click="addExpense(amount, selectedCategory, datePicker)" :disabled="checkFieldsAddExpense()">Добавить</el-button>
      </p>
    </div>

    <div v-if="financialMonitoringStore.pageParams.title == 'Редактирование операции'">
      <p>
        <el-button @click="backToHome()">Назад</el-button>
        <el-button type="primary" @click="editExpense()" :disabled="checkFieldsAddExpense()">Сохранить</el-button>
      </p>
    </div>
  </div>
</template> 

<script>
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { OperationType, useFinancialMonitoringStore } from '@/stores/FinancialMonitoringStore';
import { ElMessage, ElMessageBox } from 'element-plus';
import FinancialMonitoringCategoryList from './FinancialMonitoringCategoryList.vue';

export default {
  name: "financial-monitoring-add-note",
  props: {
    currentMenuItem: {
      type: Number,
      required: true
    },
  },
  components: {
    FinancialMonitoringCategoryList,
  },
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();
    return { financialMonitoringStore };
  },
  async created() {
    this.typeOperation = this.currentMenuItem;

    const isSuccessFetchCategories = await this.financialMonitoringStore.fetchCategories(this.typeOperation);

    if (isSuccessFetchCategories === null) {
      ElMessage.error('Не удалось загрузить категории');
    };

    const expenseId = this.financialMonitoringStore.pageParams.id;
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
  }
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
    };
  },
  methods: {
    backToHome: function () {
      if (this.financialMonitoringStore.pageParams.returnToInfoNote) {
        this.financialMonitoringStore.setPage('infoNote', {
          id: this.financialMonitoringStore.pageParams.id,
        });
      } else {
        this.financialMonitoringStore.setPage('expenses', {});
      }
    },
    async addExpense(amount, selectedCategory, datePicker) {
      this.isSubmitAttempted = true;

      const allCategories = this.loadAllCategoryList();
      const isValidCategory = allCategories.find(item => item.value.toLowerCase() === selectedCategory.toLowerCase());

      if (!isValidCategory) {
        this.errorMessage = true;
        return;
      }

      const request = {
        categoryId: isValidCategory.id,
        amount: parseFloat(amount),
        date: new Date(this.datePicker).toISOString(),
        description: this.description,
        isIgnoredInCalculation: this.isIgnoredInCalculation,
        isFavorite: this.isFavorite,
        operationType: this.typeOperation,
        walletId: this.financialMonitoringStore.filtersTransactions.currentWalletId,
      };

      const isSuccsess = await this.financialMonitoringStore.addNote(request, this.typeOperation);

      if (isSuccsess) {
        this.financialMonitoringStore.filtersTransactions.selectedDate = datePicker;

        ElMessage.success('Запись успешно добавлена');
        this.financialMonitoringStore.setPage('expenses', {});
      } else {
        ElMessage.error('Ошибка добавлении транзакции');
      }
    },
    async fetchExpense(id) {
      const expense = await this.financialMonitoringStore.fetchNote(id);

      if (expense !== null) {
        this.amount = expense.amount;
        this.selectedCategory = this.financialMonitoringStore.categories.get(expense.categoryId)?.name;
        this.datePicker = format(parseISO(expense.date), 'yyyy/MM/dd HH:mm'); // expense.date
        this.description = expense.description;
        this.isIgnoredInCalculation = expense.isIgnoredInCalculation;
        this.isFavorite = expense.isFavorite;
      } else {
        ElMessage.error('Не удалось загрузить запись');
      }
    },
    async editExpense() {
      this.isSubmitAttempted = true;

      const allCategories = this.loadAllCategoryList();
      const isValidCategory = allCategories.find(item => item.value.toLowerCase() === this.selectedCategory.toLowerCase());

      if (!isValidCategory) {
        this.errorMessage = true;
        return;
      }

      const utcDate = new Date(this.datePicker).toISOString();

      const updatedExpense = {
        id: this.financialMonitoringStore.pageParams.id,
        categoryId: isValidCategory.id,
        amount: parseFloat(this.amount),
        date: utcDate, // this.datePicker
        description: this.description,
        isIgnoredInCalculation: this.isIgnoredInCalculation,
        isFavorite: this.isFavorite,
        operationType: this.typeOperation,
        walletId: this.financialMonitoringStore.filtersTransactions.currentWalletId,
      };

      const isSuccsess = await this.financialMonitoringStore.editNote(updatedExpense);

      if (isSuccsess) {
        ElMessage.success('Запись успешно обновлена');
        this.financialMonitoringStore.setPage('expenses', {});
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
          message: 'Запись удалена',
        })
        this.financialMonitoringStore.deleteTransaction(id, this.typeOperation);
        this.financialMonitoringStore.setPage('expenses', {});
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
    loadAllCategoryList() {
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
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const hours = String(today.getHours()).padStart(2, '0');
      const minutes = String(today.getMinutes()).padStart(2, '0');

      this.datePicker = `${year}/${month}/${day} ${hours}:${minutes}`;
    },
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
</style>

