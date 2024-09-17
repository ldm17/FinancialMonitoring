<template>
  <div>
    <div class="toolbar">
    <div>
      <el-select v-model="typeSortExpenses" style="width: 200px; margin-right: 15px" :disabled="!filterExpensesByTabs().length">
        <template #prefix>
          <el-icon><Sort /></el-icon>
        </template>
        <el-option :value="SortType.ByDateNew" label="По дате добавления (новые)"></el-option>
        <el-option :value="SortType.ByDateOld" label="По дате добавления (старые)"></el-option>
        <el-option :value="SortType.ByHighestExpenses" label="По наибольшим расходам"></el-option>
        <el-option :value="SortType.ByLowestExpenses" label="По наименьшим расходам"></el-option>
      </el-select>

      <el-select v-model="typeFilterExpenses" style="width: 200px; margin-right: 15px" :disabled="!filterExpensesByTabs().length" @change="checkTypeFilterExpenses()">
        <template #prefix>
          <el-icon><Filter /></el-icon>
        </template>
        <el-option :value="FilterType.NotSelected" label="Не выбрано"></el-option>
        <el-option :value="FilterType.ByCategories" label="По категориям"></el-option>
        <el-option :value="FilterType.ByRangeOfAmounts" label="По диапазону сумм"></el-option>
        <el-option :value="FilterType.ByIgnoredInCalculation" label="По неучитываемым расходам"></el-option>
        <el-option :value="FilterType.ByFavorite" label="По помеченным расходам"></el-option>
      </el-select>

      <el-dialog v-model="isCategoryListDialogVisible" title="Выберите категорию" width="500" center align-center>
        <span>
          <financial-monitoring-category-list
          @category-selected="onCategorySelected">
          </financial-monitoring-category-list>
        </span>
      </el-dialog>

      <el-dialog v-model="isFilterByRangeOfAmountsVisible" title="Выберите диапазон сумм" width="500" center align-center>
        <span>
          <financial-monitoring-range-filter
          @range-of-amounts-selected="onRangeOfAmountsSelected"
          @close-range-filter="isFilterByRangeOfAmountsVisible = false">
          </financial-monitoring-range-filter>
        </span>
      </el-dialog>

      <el-select v-model="typeGroupExpenses" style="width: 200px" :disabled="!filterExpensesByTabs().length">
        <template #prefix>
          <el-icon><Tickets /></el-icon>
        </template>
        <el-option :value="GroupType.ByDate" label="По дате"></el-option>
        <el-option :value="GroupType.ByCategories" label="По категориям"></el-option>
      </el-select>
    </div>

    <div>
      <el-tabs v-model="activeName" @tab-click="filterExpensesByTabs">
        <el-tab-pane label="Пользовательский" name="first">
          <p>Выберите диапазон дат</p>
            <el-date-picker v-model="selectedFilterDatePicker" type="daterange" unlink-panels range-separator="|" start-placeholder="Дата начала" end-placeholder="Дата окончания" format="YYYY/MM/DD HH:mm" value-format="YYYY/MM/DD HH:mm" />
        </el-tab-pane>
        <el-tab-pane label="Год" name="second"></el-tab-pane>
        <el-tab-pane label="Полгода" name="third"></el-tab-pane>
        <el-tab-pane label="Прошлый месяц" name="fourth"></el-tab-pane>
        <el-tab-pane label="Текущий месяц" name="fifth"></el-tab-pane>
      </el-tabs>
    </div>
  </div>

    <div class="expenses-main">
    <div v-if="!expenses().length" style="text-align: center">
      <el-empty description="Нет данных для отображения" />
    </div>

    <div v-else>
      <p style="color: red; text-align: right">{{ getSumExpenses() }}</p>
      <div class="expenses__card">
        <el-card style="margin-bottom: 15px;" v-for="group in expenses()" :key="group.id">
            <el-row :gutter="20">
              <el-col :span="12">
                {{ typeGroupExpenses == GroupType.ByDate ? formatDate(group.date) : group.category }}
              </el-col>
              <el-col :span="12" style="text-align: right">
                <span style="color: red">-{{ group.items.reduce((sum, item) => sum + item.amount, 0) }}</span>
              </el-col>
            </el-row>

            <div class="visible-actions-note" @click="openInfoNote(item.id)" v-for="(item, index) in group.items" :key="item.id">
              <el-row :gutter="20" style="margin-top: 15px;">
                <el-col :span="12">
                  {{ typeGroupExpenses == GroupType.ByDate ? item.category : formatDate(item.date)}}
                </el-col>
                <el-col style="text-align: right;" :span="12">
                  <span v-if="item.isFavorite">
                    <el-icon size="small"><CollectionTag /></el-icon>
                  </span>
                  <span v-if="item.isIgnoredInCalculation">
                    <el-icon size="small"><Hide /></el-icon>
                  </span>
                  <span style="color: red;">-{{ item.amount }}</span>
                </el-col>
              </el-row>

              <el-row :gutter="20" style="margin-top: 0px;">
                <el-col v-if="item.description" :span="24">
                  <p class="description-card" style="margin: 5px 0px;">{{ item.description }}</p>
                </el-col>
              </el-row>
                <el-row :gutter="20">
                  <el-col :span="24" style="text-align: right;">
                    <el-button @click.stop="isFavoriteNote(item.id)" size="small"><el-icon><CollectionTag /></el-icon></el-button>
                    <el-button @click.stop="openEditNote(item.id)" size="small"><el-icon><Edit /></el-icon></el-button>
                    <el-button @click.stop="deleteExpense(item.id)" size="small"><el-icon><Delete /></el-icon></el-button>
                  </el-col>
              </el-row>
              <el-divider style="margin: 5px 0px" v-if="index < group.items.length - 1" />
            </div>
        </el-card>
      </div>
    </div>
  </div >
  </div>
</template>

<script>
import { useFinancialMonitoringStore } from "@/stores/FinancialMonitoringStore";
import { ElMessage, ElMessageBox } from 'element-plus';
import FinancialMonitoringRangeFilter from "./FinancialMonitoringRangeFilter.vue";
import FinancialMonitoringCategoryList from "./FinancialMonitoringCategoryList.vue";

const SortType = {
  ByDateNew: 0,
  ByDateOld: 1,
  ByHighestExpenses: 2,
  ByLowestExpenses: 3,
};

const FilterType = {
  NotSelected: 0,
  ByCategories: 1,
  ByRangeOfAmounts: 2,
  ByIgnoredInCalculation: 3,
  ByFavorite: 4,
};

const GroupType = {
  ByDate: 0,
  ByCategories: 1,
};

const Months = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11
};

const DaysOfWeek = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6
};

const monthsInRussian = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

const daysOfWeekInRussian = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

export default {
  name: "financial-monitoring-expenses",
  components: {
    FinancialMonitoringRangeFilter,
    FinancialMonitoringCategoryList,
  },
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();
    return { financialMonitoringStore };
  },
  created() {
    if (this.financialMonitoringStore.pageParams.selectedTypeSortExpenses) {
      this.typeSortExpenses = this.financialMonitoringStore.pageParams.selectedTypeSortExpenses;
    }

    if (this.financialMonitoringStore.pageParams.selectedTypeFilterExpenses) {
      this.typeFilterExpenses = this.financialMonitoringStore.pageParams.selectedTypeFilterExpenses;
    }

    if (this.financialMonitoringStore.pageParams.selectedTypeGroupExpenses) {
      this.typeGroupExpenses = this.financialMonitoringStore.pageParams.selectedTypeGroupExpenses;
    }

    if (this.financialMonitoringStore.pageParams.selectedActiveName) {
      this.activeName = this.financialMonitoringStore.pageParams.selectedActiveName;
    }

    if (this.financialMonitoringStore.pageParams.getActiveName) {
      this.activeName = this.financialMonitoringStore.pageParams.getActiveName;
    }
  },
  data() {
    return {
      SortType: SortType,
      typeSortExpenses: SortType.ByDateNew,
      FilterType: FilterType,
      typeFilterExpenses: FilterType.NotSelected,
      GroupType: GroupType,
      typeGroupExpenses: GroupType.ByDate,
      activeName: 'fifth',
      selectedFilterDatePicker: '',
      isFilterByRangeOfAmountsVisible: false,
      selectedFilterMinAmount: '',
      selectedFilterMaxAmount: '',
      applyRangeFilter: false,
      isCategoryListDialogVisible: false,
      selectedFilterCategory: '',
    };
  },
  methods: {
    getSumExpenses: function () {
      let sum = 0;
      const expensesArray = this.expenses();
      
      for (let group of expensesArray) {
        for (let item of group.items) {
          if (!item.isIgnoredInCalculation) {
            sum += Math.round(item.amount * 10) / 10;
          }
        }
      }
      return sum
    },
    checkTypeFilterExpenses: function () {
      // this.financialMonitoringStore.pageParams.selectedFilterCategory = '';
      // this.financialMonitoringStore.pageParams.selectedFilterMinAmount = '';
      // this.financialMonitoringStore.pageParams.selectedFilterMaxAmount = '';

      // if (this.typeFilterExpenses !== FilterType.NotSelected && this.typeFilterExpenses !== FilterType.ByIgnoredInCalculation && this.typeFilterExpenses !== FilterType.ByFavorite) {
      //   this.financialMonitoringStore.setPage('filterOptions', {
      //     typeSortExpenses: this.typeSortExpenses,
      //     typeFilterExpenses: this.typeFilterExpenses,
      //     typeGroupExpenses: this.typeGroupExpenses,
      //     activeName: this.activeName,
      //     FilterType: this.FilterType,
      //   });
      // }

      if (this.typeFilterExpenses == FilterType.NotSelected) {
        this.selectedFilterMinAmount = ''; // не очищается
        this.selectedFilterMaxAmount = ''; // не очищается
        this.selectedFilterCategory = '';
      } else if (this.typeFilterExpenses == FilterType.ByCategories) {
          this.isCategoryListDialogVisible = true;
      } else if (this.typeFilterExpenses == FilterType.ByRangeOfAmounts) {
          this.isFilterByRangeOfAmountsVisible = true;
          this.applyRangeFilter = false;
      }
    },
    expenses: function () {
      let expensesArray = this.filterExpensesByTabs();

      if (this.typeFilterExpenses !== FilterType.NotSelected) {
        expensesArray = this.filterExpenses();
      }
    
      const groupedExpenses = this.groupExpenses(expensesArray);

      const result = Object.keys(groupedExpenses).map(key => {
        return {
          [this.typeGroupExpenses === GroupType.ByDate ? 'date' : 'category']: key,
          items: groupedExpenses[key]
        };
      });

      return this.sortExpenses(result);
    },
    groupExpenses: function (expensesArray) {
      const grouped = {};

      expensesArray.forEach(item => {
        const key = this.typeGroupExpenses === GroupType.ByDate ? item.date : item.category;

        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(item);
      });

      return grouped;
    },
    sortExpenses: function (expensesArray) {
      if (!expensesArray || expensesArray.length === 0) return expensesArray;

      const groupedExpenses = expensesArray.map(group => {
      const totalAmount = group.items.reduce((sum, item) => sum + item.amount, 0);
        return {
          ...group,
          totalAmount,
        };
      });

      groupedExpenses.forEach(group => {
        group.items.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return this.typeSortExpenses == SortType.ByDateNew ? dateB - dateA : dateA - dateB
        });
      });

      switch (this.typeSortExpenses) {
        case SortType.ByDateNew:
          return groupedExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        case SortType.ByDateOld:
          return groupedExpenses.sort((a, b) => new Date(a.date) - new Date(b.date));  
        case SortType.ByHighestExpenses:
          return groupedExpenses.sort((a, b) => b.totalAmount - a.totalAmount);
        case SortType.ByLowestExpenses:
          return groupedExpenses.sort((a, b) => a.totalAmount - b.totalAmount);
        default:
          return groupedExpenses;
      }
    },
    filterExpenses: function () {
      let expensesArray = this.filterExpensesByTabs();
      // let selectedFilterCategory = this.financialMonitoringStore.pageParams.selectedFilterCategory;
      // let selectedFilterMinAmount = this.financialMonitoringStore.pageParams.selectedFilterMinAmount;
      // let selectedFilterMaxAmount = this.financialMonitoringStore.pageParams.selectedFilterMaxAmount;

      if (this.selectedFilterCategory) {
        expensesArray = expensesArray.filter(item => item.category === this.selectedFilterCategory);
      } else if (this.typeFilterExpenses == FilterType.ByRangeOfAmounts && this.applyRangeFilter) {
        expensesArray = expensesArray.filter(item => {
          const amount = item.amount;
          return amount >= this.selectedFilterMinAmount && amount <= this.selectedFilterMaxAmount
        });
      } else if (this.typeFilterExpenses == FilterType.ByIgnoredInCalculation) {
        expensesArray = expensesArray.filter(item => item.isIgnoredInCalculation);
      } else if (this.typeFilterExpenses == FilterType.ByFavorite) {
        expensesArray = expensesArray.filter(item => item.isFavorite);
      }
      
      return expensesArray;
    },
    filterExpensesByTabs: function () {
      let expensesArray = this.financialMonitoringStore.expenses;

      if (this.activeName == 'fifth') {
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        expensesArray = expensesArray.filter(item => {
          const date = new Date(item.date); 
          return date >= startDate && date <= endDate
        });
      } else if (this.activeName == 'fourth') {
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endDate = new Date(today.getFullYear(), today.getMonth(), 0);

        expensesArray = expensesArray.filter(item => {
          const date = new Date(item.date); 
          return date >= startDate && date <= endDate
        });
      } else if (this.activeName == 'third') {
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        expensesArray = expensesArray.filter(item => {
          const date = new Date(item.date); 
          return date >= startDate && date <= endDate
        });
      } else if (this.activeName == 'second') {
        const today = new Date();
        const startDate = new Date(today.getFullYear() - 1, 0, 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        expensesArray = expensesArray.filter(item => {
          const date = new Date(item.date); 
          return date >= startDate && date <= endDate
        });
      } else if (this.activeName == 'first') {
        const startDate = new Date(this.selectedFilterDatePicker?.[0]);
        const endDate = new Date(this.selectedFilterDatePicker?.[1]);

        expensesArray = expensesArray.filter(item => {
          const date = new Date(item.date); 
          return date >= startDate && date <= endDate
        });
      }
      
      return expensesArray;
    },
    isFavoriteNote: function (id) {
      const groupedExpenses = this.expenses();
      for (const group of groupedExpenses) {
        const expensesNote = group.items.find(item => item.id == id);
        if (expensesNote) {
          expensesNote.isFavorite = !expensesNote.isFavorite;
        }
      }
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
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: 'Удаление отменено',
        })
      })
    },
    openEditNote: function (id) {
      this.financialMonitoringStore.setPage('addNote', {
        title: 'Редактирование раcхода',
        id: id,
        typeSortExpenses: this.typeSortExpenses,
        typeFilterExpenses: this.typeFilterExpenses,
        typeGroupExpenses: this.typeGroupExpenses,
        activeName: this.activeName,
      });
    },
    openInfoNote: function (id) {
      this.financialMonitoringStore.setPage('infoNote', {
        id: id,
        typeSortExpenses: this.typeSortExpenses,
        typeFilterExpenses: this.typeFilterExpenses,
        typeGroupExpenses: this.typeGroupExpenses,
        activeName: this.activeName,
      });
    },
    formatDate: function (dateString) {
      const [year, month, day] = dateString.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      const dayOfWeek = daysOfWeekInRussian[date.getDay() === 0 ? 6 : date.getDay() - 1];

      return `${day} ${monthsInRussian[month - 1]} ${year}, ${dayOfWeek}`;
    },
    onRangeOfAmountsSelected: function (amount) {
      this.selectedFilterMinAmount = amount.minAmount;
      this.selectedFilterMaxAmount = amount.maxAmount;
      this.isFilterByRangeOfAmountsVisible = false;
      this.applyRangeFilter = true;
    },
    onCategorySelected: function (category) {
      this.selectedFilterCategory = category.label;
      this.isCategoryListDialogVisible = false;
    },
  },
};
</script>

<style lang="scss">
.toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  & .el-tabs {
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
}

.expenses-main {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.visible-actions-note .el-button {
  visibility: hidden;
}

.visible-actions-note:hover .el-button {
  visibility: visible;
}

.expenses__card .el-card {
  width: 415px;
  max-width: 415px;
  max-height: 135px auto;
}

.description-card {
  color: grey;
  width: 350px;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
}
</style>

