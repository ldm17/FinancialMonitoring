<template>
  <div>
    <p>{{ financialMonitoringStore.pageParams.title }}</p>
    <span v-if="isIgnoredInCalculation"><el-icon size="small"><Hide /></el-icon></span>
    <span v-if="isFavorite"><el-icon size="small"><CollectionTag /></el-icon></span>
    <p>Сумма</p>
    <el-input style="width: 250px" v-model="amount" placeholder="Введите сумму" :formatter="(value) => `${value}`.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')">
    </el-input>

    <p>Категория</p>
    <!-- <el-select style="width: 250px" v-model="selectedCategory" placeholder="Выберите категорию">
      <el-option v-for="item in financialMonitoringStore.categories" :key="item.category" :value="item.category" />
    </el-select> -->

    <div class="picker-category">
      <el-autocomplete
        :class="{ 'error-border': errorMessage }"
        v-model="selectedCategory"
        :fetch-suggestions="querySearch"
        :trigger-on-focus="false"
        placeholder="Категория"
        clearable>
      </el-autocomplete>

      <el-button @click="isCategoryListDialogVisible = true"><el-icon><ArrowRight /></el-icon></el-button>
    </div>

    <div class="error-message" v-if="errorMessage">Выбранная категория не найдена. Пожалуйста, выберите другую категорию.</div>

    <el-dialog v-model="isCategoryListDialogVisible" title="Выберите категорию" width="500" center align-center>
      <span>
        <financial-monitoring-category-list
        @category-selected="onCategorySelected">
        </financial-monitoring-category-list>
      </span>
    </el-dialog>

    <p>Дата</p>
    <el-date-picker style="width: 250px" v-model="datePicker" type="date" placeholder="Выберите дату" size="default" format="YYYY/MM/DD" value-format="YYYY/MM/DD" />
    <!-- <el-date-picker style="width: 250px" v-model="datePicker" type="datetime" placeholder="Выберите дату" format="YYYY/MM/DD HH:mm" value-format="YYYY/MM/DD HH:mm" time-format="HH:mm" /> -->

    <p v-if="isDescription">
      <el-input style="width: 250px" v-model="description" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea" placeholder="Примечание" />
    </p>

    <p>
      <el-button @click="addDescription()"><el-icon><EditPen /></el-icon></el-button>
      <el-button><el-icon><PictureFilled /></el-icon></el-button>
      <el-button @click="editIsFavorite()"><el-icon><CollectionTag /></el-icon></el-button>
      <el-button @click="deleteExpense(this.financialMonitoringStore.pageParams.id)"><el-icon><Delete /></el-icon></el-button>
    </p>

    <p>
      Не учитывать в общей сумме
      <el-switch v-model="isIgnoredInCalculation" />
    </p>

    <div v-if="financialMonitoringStore.pageParams.title == 'Добавление раcхода'">
      <p>
        <el-button @click="backToHome()">Назад</el-button>
        <el-button type="primary" @click="addExpense(amount, selectedCategory, datePicker)" :disabled="checkFieldsAddExpense()">Добавить</el-button>
      </p>
    </div>

    <div v-if="financialMonitoringStore.pageParams.title == 'Редактирование раcхода'">
      <p>
        <el-button @click="backToHome()">Назад</el-button>
        <el-button type="primary" @click="editExpense(amount, selectedCategory, datePicker)" :disabled="checkFieldsAddExpense()">Сохранить</el-button>
      </p>
    </div>
  </div>
</template> 

<script>
import { useFinancialMonitoringStore } from '@/stores/FinancialMonitoringStore';
import { ElMessage, ElMessageBox } from 'element-plus';
import FinancialMonitoringCategoryList from './FinancialMonitoringCategoryList.vue';

export default {
  name: "financial-monitoring-add-note",
  components: {
    FinancialMonitoringCategoryList,
  },
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();
    return { financialMonitoringStore };
  },
  created() {
    let expense = this.getExpense(this.financialMonitoringStore.pageParams.id);

    if (expense) {
      this.amount = expense.amount;
      this.selectedCategory = expense.category;
      this.datePicker = expense.date;
      this.description = expense.description;
      this.isIgnoredInCalculation = expense.isIgnoredInCalculation;
      this.isFavorite = expense.isFavorite;
    }
  },
  mounted() {
    this.categoryListForSuggestion = this.loadAllCategoryList();
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
      getActiveName: '',
      isCategoryListDialogVisible: false,
      categoryListForSuggestion: [],
      errorMessage: false,
    };
  },
  methods: {
    backToHome: function () {
      this.financialMonitoringStore.setPage('expenses', {
        selectedActiveName: this.financialMonitoringStore.pageParams.activeName,
      });
    },
    addExpense: function (amount, selectedCategory, datePicker) {
    // const expense = this.financialMonitoringStore.categories.find(item => item.label == selectedCategory);

    const allCategories = this.loadAllCategoryList();
    const expense = allCategories.find(item => item.value === selectedCategory);

    if (expense) {
      this.financialMonitoringStore.addNote({
        id: this.financialMonitoringStore.expenses.length + 1,
        idCategory: expense.id,
        amount: parseFloat(amount),
        category: selectedCategory,
        date: datePicker,
        description: this.description,
        isIgnoredInCalculation: this.isIgnoredInCalculation,
        isFavorite: this.isFavorite,
      });

      const date = new Date(datePicker);
      const today = new Date();

      if (date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth()) {
        this.getActiveName = 'fifth';
      } else if (date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() - 1) {
        this.getActiveName = 'fourth';
      } else if (date >= new Date(today.getFullYear(), today.getMonth() - 5, 1) && date <= today) {
        this.getActiveName = 'third';
      } else if (date.getFullYear() === today.getFullYear()) {
        this.getActiveName = 'second';
      }

      this.financialMonitoringStore.setPage('expenses', {
        getActiveName: this.getActiveName,
        });

      this.errorMessage = false;
      } else {
        this.errorMessage = true;
      }
    },
    getExpense: function (id) {
      return this.financialMonitoringStore.expenses.find((item) => item.id == id);
    },
    editExpense: function () {
      let expense = this.getExpense(this.financialMonitoringStore.pageParams.id);

      if (expense) {
        expense.amount = this.amount;
        expense.category = this.selectedCategory;
        expense.date = this.datePicker;
        expense.description = this.description;
        expense.isIgnoredInCalculation = this.isIgnoredInCalculation;
        expense.isFavorite = this.isFavorite;
      }
      this.financialMonitoringStore.setPage('expenses', {
        selectedTypeSortExpenses: this.financialMonitoringStore.pageParams.typeSortExpenses,
        selectedTypeFilterExpenses: this.financialMonitoringStore.pageParams.typeFilterExpenses,
        selectedTypeGroupExpenses: this.financialMonitoringStore.pageParams.typeGroupExpenses,
        selectedActiveName: this.financialMonitoringStore.pageParams.activeName,
      })
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
    deleteExpense: function (id) {
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
        this.financialMonitoringStore.deleteExpense(id);
        this.financialMonitoringStore.setPage('expenses');
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
      const categories = store.categories;

      const extractCategories = (categories) => {
        let result = [];
        categories.forEach(category => {
          result.push({
            value: store.getCategoryLabelById(category.id),
          });

          if (category.children && category.children.length > 0) {
            result = result.concat(extractCategories(category.children));
          }
        });
        return result;
      };
      
      return extractCategories(categories);
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

.error-border {
  border: 1px solid red;
  border-radius: 5px;
}

.error-message {
  max-width: 250px;
  color: red;
  margin-top: 10px;
  font-size: 15px;
}
</style>

