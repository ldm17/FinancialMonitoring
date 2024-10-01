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

      <div v-if="isFilterByRangeOfAmountsVisible">
        <financial-monitoring-range-filter-modal
          :selected-min-amount="selectedFilterMinAmount"
          :selected-max-amount="selectedFilterMaxAmount"
          @update-filter="onRangeOfAmountsSelected"
          @close="handleClose">
        </financial-monitoring-range-filter-modal>
      </div>

      <el-select v-model="typeGroupExpenses" style="width: 200px" :disabled="!filterExpensesByTabs().length">
        <template #prefix>
          <el-icon><Tickets /></el-icon>
        </template>
        <el-option :value="GroupType.ByDate" label="По дате"></el-option>
        <el-option :value="GroupType.ByCategories" label="По категориям"></el-option>
      </el-select>
    </div>

    <div>
      <el-tabs v-model="activeTab">
        <el-tab-pane
          v-for="tab in tabs"
          :key="tab.name"
          :label="tab.label"
          :name="tab.name"
        >
        <p v-if="tab.name === 'custom'">Выберите диапазон дат</p>
        <el-date-picker
          v-if="tab.name === 'custom'"
          v-model="selectedFilterDatePicker"
          type="daterange"
          unlink-panels
          range-separator="|"
          start-placeholder="Дата начала"
          end-placeholder="Дата окончания"
          format="YYYY/MM/DD"
          value-format="YYYY/MM/DD"
        />
        </el-tab-pane>
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

            <el-row>
              <el-col :span="24">
                <div v-if="typeGroupExpenses == GroupType.ByCategories">
                  <span>{{ group.items.length }} {{ getExpenseWord(group.items.length) }}</span>
                  <el-divider style="margin: 5px 0px" />
                </div>
              </el-col>
            </el-row>

            <div class="visible-actions-note" @click="openInfoNote(item.id)" v-for="(item, index) in group.items" :key="item.id">
              <el-row :gutter="20" style="margin-top: 15px;">
                <el-col :span="12">
                  <div>
                    {{ typeGroupExpenses == GroupType.ByDate ? item.category : formatDate(item.date)}}
                  </div>
                  <span>{{ item.date.split(' ')[1] }}</span>
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
                    <el-button @click.stop="isFavoriteExpense(item.id)" size="small"><el-icon><CollectionTag /></el-icon></el-button>
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
import FinancialMonitoringRangeFilterModal from "./FinancialMonitoringRangeFilterModal.vue";
import FinancialMonitoringCategoryList from "./FinancialMonitoringCategoryList.vue";
import formatDate from "../../stores/utils.js";

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

export default {
  name: "financial-monitoring-expenses",
  components: {
    FinancialMonitoringRangeFilterModal,
    FinancialMonitoringCategoryList,
  },
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();
    return { financialMonitoringStore };
  },
  created() {
    this.initializeTabs()

    if (this.financialMonitoringStore.pageParams.selectedDate) {
      this.initializeTabs(this.financialMonitoringStore.pageParams.selectedDate);
    } else if (this.financialMonitoringStore.pageParams.selectedActiveTab) {
      this.activeTab = this.financialMonitoringStore.pageParams.selectedActiveTab;
    } else {
      const lastTab = this.tabs[this.tabs.length - 1];
      this.activeTab = lastTab.name;
    }

    if (this.financialMonitoringStore.pageParams.selectedTypeSortExpenses) {
      this.typeSortExpenses = this.financialMonitoringStore.pageParams.selectedTypeSortExpenses;
    }

    if (this.financialMonitoringStore.pageParams.selectedTypeFilterExpenses) {
      this.typeFilterExpenses = this.financialMonitoringStore.pageParams.selectedTypeFilterExpenses;
    }

    if (this.financialMonitoringStore.pageParams.selectedTypeGroupExpenses) {
      this.typeGroupExpenses = this.financialMonitoringStore.pageParams.selectedTypeGroupExpenses;
    }

    if (this.financialMonitoringStore.pageParams.currentTabs) {
      this.tabs = this.financialMonitoringStore.pageParams.currentTabs;
    }

    if (this.financialMonitoringStore.pageParams.selectedFilterCategory) {
      this.selectedFilterCategory = this.financialMonitoringStore.pageParams.selectedFilterCategory;
    }

    if (this.financialMonitoringStore.pageParams.removeEmptyTabs) {
      this.removeEmptyTabs();
    }
  },
  computed: {
    formattedDate() {
      return formatDate(this.dateString);
    },
  },
  data() {
    return {
      SortType: SortType,
      typeSortExpenses: SortType.ByDateNew,
      FilterType: FilterType,
      typeFilterExpenses: FilterType.NotSelected,
      GroupType: GroupType,
      typeGroupExpenses: GroupType.ByDate,
      selectedFilterDatePicker: '',
      activeTab: '',
      tabs: [
        { label: 'Пользовательский', name: 'custom' },
      ],
      isFilterByRangeOfAmountsVisible: false,
      selectedFilterMinAmount: null,
      selectedFilterMaxAmount: null,
      applyRangeFilter: false,
      isCategoryListDialogVisible: false,
      selectedFilterCategory: '',
      formatDate: formatDate,
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
      if (this.typeFilterExpenses == FilterType.NotSelected) {
        this.selectedFilterMinAmount = null;
        this.selectedFilterMaxAmount = null;
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
        const dateKey = item.date.split(' ')[0];

        const key = this.typeGroupExpenses === GroupType.ByDate ? dateKey : item.category;

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
          minDate: Math.min(...group.items.map(item => new Date(item.date))),
          maxDate: Math.max(...group.items.map(item => new Date(item.date)))
        };
      });

      groupedExpenses.forEach(group => {
        group.items.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return this.typeSortExpenses == SortType.ByDateNew ? dateB - dateA : dateA - dateB;
        });
      });

      switch (this.typeSortExpenses) {
        case SortType.ByDateNew:
          return groupedExpenses.sort((a, b) => b.maxDate - a.maxDate);
        case SortType.ByDateOld:
          return groupedExpenses.sort((a, b) => a.minDate - b.minDate);
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

      if (this.activeTab.match(/^\d{2}\/\d{4}$/)) {
        const [month, year] = this.activeTab.split('/').map(Number);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        expensesArray = this.financialMonitoringStore.getExpensesByRangeDate(startDate, endDate);
      } else if (this.activeTab === 'custom') {
        const startDate = new Date(this.selectedFilterDatePicker?.[0]);
        const endDate = new Date(this.selectedFilterDatePicker?.[1]);

        expensesArray = this.financialMonitoringStore.getExpensesByRangeDate(startDate, endDate);
      }

      return expensesArray;
    },
    initializeTabs: function (selectedDate) {
      const uniqueDates = new Set();

      this.financialMonitoringStore.expenses.forEach(expense => {
        const formattedDate = this.formatDateForTab(expense.date);
        uniqueDates.add(formattedDate);
      });

      const sortedDates = Array.from(uniqueDates).sort((a, b) => {
        const [monthA, yearA] = a.split('/').map(Number);
        const [monthB, yearB] = b.split('/').map(Number);
        return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
      });

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      sortedDates.forEach(date => {
        const [month, year] = date.split('/').map(Number);
        let label = date;

        if (year === currentYear && month === currentMonth) {
          label = 'Текущий месяц';
        } else 
        if (year === currentYear && month === currentMonth - 1) {
          label = 'Предыдущий месяц';
        } else if (currentMonth === 1 && month === 12 && year === currentYear - 1) {
          label = 'Предыдущий месяц';
        }

        const existingTab = this.tabs.find(tab => tab.name === date);
        if (!existingTab) {
          this.tabs.push({ label: label, name: date });
        }
      });

      const currentMonthTabName = `${currentMonth}/${currentYear}`;
      if (!this.tabs.find(tab => tab.name === currentMonthTabName)) {
        this.tabs.push({ label: 'Текущий месяц', name: currentMonthTabName });
      }

      if (selectedDate) {
        this.activeTab = this.formatDateForTab(selectedDate);
      }
    },
    formatDateForTab: function (date) {
      const selectedDate = new Date(date);
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      return `${month}/${year}`;
    },

    isFavoriteExpense: function (id) {
      for (let item of this.financialMonitoringStore.expenses) {

      if (item.id == id) {
        item.isFavorite = !item.isFavorite;
        break;
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
        this.removeEmptyTabs();
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
        activeTab: this.activeTab,
        tabs: this.tabs,
        selectedFilterCategory: this.selectedFilterCategory,
        showDeleteButton: true,
      });
    },
    openInfoNote: function (id) {
      this.financialMonitoringStore.setPage('infoNote', {
        id: id,
        typeSortExpenses: this.typeSortExpenses,
        typeFilterExpenses: this.typeFilterExpenses,
        typeGroupExpenses: this.typeGroupExpenses,
        activeTab: this.activeTab,
        tabs: this.tabs,
        selectedFilterCategory: this.selectedFilterCategory,
      });
    },
    onRangeOfAmountsSelected: function ({ minAmount, maxAmount }) {
      this.selectedFilterMinAmount = minAmount;
      this.selectedFilterMaxAmount = maxAmount;
      this.isFilterByRangeOfAmountsVisible = false;
      this.applyRangeFilter = true;
    },
    onCategorySelected: function (category) {
      this.selectedFilterCategory = category.label;
      this.isCategoryListDialogVisible = false;
    },
    handleClose: function () {
      this.isFilterByRangeOfAmountsVisible = false;
      this.typeFilterExpenses = FilterType.NotSelected;
    },
    getExpenseWord: function (count) {
      if (count === 1 || (count % 10 === 1 && count % 100 !== 11)) {
        return 'расход';
      } else if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
        return 'расхода';
      } else {
        return 'расходов';
      }
    },
    removeEmptyTabs: function () {
      const currentActiveTab = this.activeTab;
      const currentIndex = this.tabs.findIndex(tab => tab.name === currentActiveTab);
      for (let i = this.tabs.length - 1; i >= 0; i--) {
        const tab = this.tabs[i];

        if (tab.name === 'custom' || tab.label === 'Текущий месяц') {
          continue;
        }

        this.activeTab = tab.name;

        const expensesForTab = this.filterExpensesByTabs();

        if (expensesForTab.length === 0) {
          this.tabs.splice(i, 1);
        }
      }

      if (!this.tabs.some(tab => tab.name === currentActiveTab)) {
        this.activeTab = this.tabs[currentIndex].name;
      } else {
        this.activeTab = currentActiveTab;
      }
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

