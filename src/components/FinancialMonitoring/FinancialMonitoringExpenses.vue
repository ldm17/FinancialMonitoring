<template>
  <div>
    <div class="toolbar">
    <div>
      <el-select v-model="financialMonitoringStore.filtersExpenses.typeSortExpenses" style="width: 200px; margin-right: 15px" :disabled="!filterExpensesByTabs().length">
        <template #prefix>
          <el-icon><Sort /></el-icon>
        </template>
        <el-option :value="SortType.ByDateNew" label="По дате добавления (новые)"></el-option>
        <el-option :value="SortType.ByDateOld" label="По дате добавления (старые)"></el-option>
        <div v-if="this.typeOperation === OperationType.Expenses">
          <el-option :value="SortType.ByHighest" label="По наибольшим расходам"></el-option>
          <el-option :value="SortType.ByLowest" label="По наименьшим расходам"></el-option>
        </div>
        <div v-if="this.typeOperation === OperationType.Incomes">
          <el-option :value="SortType.ByHighest" label="По наибольшим доходам"></el-option>
          <el-option :value="SortType.ByLowest" label="По наименьшим доходам"></el-option>
        </div>
      </el-select>

      <el-select v-model="financialMonitoringStore.filtersExpenses.typeFilterExpenses" style="width: 200px; margin-right: 15px" :disabled="!filterExpensesByTabs().length" @change="checkTypeFilterExpenses()">
        <template #prefix>
          <el-icon><Filter /></el-icon>
        </template>
        <el-option :value="FilterType.NotSelected" label="Не выбрано"></el-option>
        <el-option :value="FilterType.ByCategories" label="По категориям"></el-option>
        <el-option :value="FilterType.ByRangeOfAmounts" label="По диапазону сумм"></el-option>
        <div v-if="this.typeOperation === OperationType.Expenses">
          <el-option :value="FilterType.ByIgnoredInCalculation" label="По неучитываемым расходам"></el-option>
          <el-option :value="FilterType.ByFavorite" label="По помеченным расходам"></el-option>
        </div>
        <div v-if="this.typeOperation === OperationType.Incomes">
          <el-option :value="FilterType.ByIgnoredInCalculation" label="По неучитываемым доходам"></el-option>
          <el-option :value="FilterType.ByFavorite" label="По помеченным доходам"></el-option>
        </div>
      </el-select>

      <el-dialog v-model="isCategoryListDialogVisible" title="Выберите категорию" width="500" center align-center>
        <span>
          <financial-monitoring-category-list
          :typeOperation="typeOperation"
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

      <el-select v-model="financialMonitoringStore.filtersExpenses.typeGroupExpenses" style="width: 200px" :disabled="!filterExpensesByTabs().length">
        <template #prefix>
          <el-icon><Tickets /></el-icon>
        </template>
        <el-option :value="GroupType.ByDate" label="По дате"></el-option>
        <el-option :value="GroupType.ByCategories" label="По категориям"></el-option>
      </el-select>
    </div>

    <div>
      <el-tabs v-model="financialMonitoringStore.filtersExpenses.activeTab">
        <el-tab-pane
          v-for="tab in tabs"
          :key="tab.name"
          :label="tab.label"
          :name="tab.name"
        />
      </el-tabs>
    </div>
  </div>

    <div class="custom-tab">
      <p v-if="activeTab === 'custom'">Выберите диапазон дат</p>
      <el-date-picker
        v-if="activeTab === 'custom'"
        v-model="selectedFilterDatePicker"
        type="daterange"
        unlink-panels
        range-separator="|"
        start-placeholder="Дата начала"
        end-placeholder="Дата окончания"
        format="YYYY/MM/DD"
        value-format="YYYY/MM/DD"
      />
    </div>

    <div class="expenses-main">
    <div v-if="!expenses().length" style="text-align: center">
      <el-empty description="Нет данных для отображения" />
    </div>

    <div v-else>
      <p :style="{ color: typeOperation === OperationType.Expenses ? 'red' : 'green', textAlign: 'right' }">{{ typeOperation === OperationType.Expenses ? '-' : '+' }}{{ getSumExpenses() }}</p>
      <financial-monitoring-card
        v-for="group in expenses()"
        :key="group.id"
        :group="group"
        :typeGroupExpenses="typeGroupExpenses"
        :formatDate="formatDate"
        :getWordByType="getWordByType"
        :GroupType="GroupType"
        :currentMenuItem="typeOperation"
        @openInfoNote="openInfoNote"
        @favorite="isFavoriteExpense"
        @edit="openEditNote"
        @delete="deleteExpense"
      />
    </div>
  </div>
  </div>
</template>

<script>
import { useFinancialMonitoringStore } from "@/stores/FinancialMonitoringStore";
import { format, parse } from "date-fns";
import FinancialMonitoringRangeFilterModal from "./FinancialMonitoringRangeFilterModal.vue";
import FinancialMonitoringCategoryList from "./FinancialMonitoringCategoryList.vue";
import { formatDate, formatDateForTab } from "@/utils.js";
import FinancialMonitoringCard from "./FinancialMonitoringCard.vue";
import { OperationType, SortType, FilterType, GroupType } from "@/stores/FinancialMonitoringStore";

export default {
  name: "financial-monitoring-expenses",
  props: {
    typeOperation: {
      type: Number,
      required: true,
    },
  },
  components: {
    FinancialMonitoringRangeFilterModal,
    FinancialMonitoringCategoryList,
    FinancialMonitoringCard,
  },
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();
    return { financialMonitoringStore };
  },
  watch: {
    watchedNotesArray: {
      handler() {
        this.initializeTabs();
        this.removeEmptyTabs();
      },
      deep: true,
    },
  },
  created() {
    this.financialMonitoringStore.fetchNotes(this.typeOperation)
      .then(() => {
        this.$nextTick(() => {
          this.removeEmptyTabs();
          if (this.selectedDate) {
            this.setActiveTab(formatDateForTab(this.selectedDate));
            this.financialMonitoringStore.filtersExpenses.selectedDate = '';
          } else if (this.activeTab) {
            const currentTab = this.tabs.find(tab => tab.name === this.activeTab);

            if (currentTab) {
              this.setActiveTab(this.activeTab);
            } else {
              this.setActiveTab(this.tabs[this.tabs.length - 1].name)
            }
          } else {
            const lastTab = this.tabs[this.tabs.length - 1];
            this.setActiveTab(lastTab.name);
          }
        });
      })
      .catch(error => {
        console.error('Ошибка загрузки:', error);
      });
  },
  computed: {
    formattedDate: function () {
      return formatDate(this.dateString);
    },

    typeSortExpenses: function () {
      return this.financialMonitoringStore.filtersExpenses.typeSortExpenses;
    },

    typeFilterExpenses: function () {
      return this.financialMonitoringStore.filtersExpenses.typeFilterExpenses;
    },

    typeGroupExpenses: function () {
      return this.financialMonitoringStore.filtersExpenses.typeGroupExpenses;
    },

    activeTab: function () {
      return this.financialMonitoringStore.filtersExpenses.activeTab;
    },

    selectedFilterCategory: function () {
      return this.financialMonitoringStore.filtersExpenses.selectedFilterCategory;
    },

    selectedDate: function () {
      return this.financialMonitoringStore.filtersExpenses.selectedDate;
    },
    watchedNotesArray: function () {
      return this.typeOperation === OperationType.Expenses? this.financialMonitoringStore.expenses : this.financialMonitoringStore.incomes;
    },
  },
  data() {
    return {
      SortType: SortType,
      GroupType: GroupType,
      OperationType,
      FilterType: FilterType,
      selectedFilterDatePicker: '',
      tabs: [
        { label: 'Пользовательский', name: 'custom' },
      ],
      isFilterByRangeOfAmountsVisible: false,
      selectedFilterMinAmount: null,
      selectedFilterMaxAmount: null,
      applyRangeFilter: false,
      isCategoryListDialogVisible: false,
      formatDate: formatDate,
    };
  },
  methods: {
    getSumExpenses: function () {
      let sum = 0;
      const itemsArray = this.expenses();

      for (let group of itemsArray) {
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
        this.financialMonitoringStore.filtersExpenses.selectedFilterCategory = '';
      } else if (this.typeFilterExpenses == FilterType.ByCategories) {
        this.isCategoryListDialogVisible = true;
      } else if (this.typeFilterExpenses == FilterType.ByRangeOfAmounts) {
        this.isFilterByRangeOfAmountsVisible = true;
        this.applyRangeFilter = false;
      }
    },
    expenses: function () {
      let itemsArray = this.filterExpensesByTabs();

      if (this.typeFilterExpenses !== FilterType.NotSelected) {
        itemsArray = this.filterExpenses();
      }

      const groupedExpenses = this.groupExpenses(itemsArray);

      const result = Object.keys(groupedExpenses).map(key => {
        return {
          [this.typeGroupExpenses === GroupType.ByDate ? 'date' : 'category']: key,
          items: groupedExpenses[key]
        };
      });

      return this.sortExpenses(result);
    },
    groupExpenses: function (itemsArray) {
      const grouped = {};

      itemsArray.forEach(item => {
        const dateKey = item.date.split(' ')[0];

        const key = this.typeGroupExpenses === GroupType.ByDate ? dateKey : item.category;

        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(item);
      });

      return grouped;
    },
    sortExpenses: function (itemsArray) {
      if (!itemsArray || itemsArray.length === 0) return itemsArray;

      const groupedExpenses = itemsArray.map(group => {
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

          if (this.typeSortExpenses === SortType.ByDateNew) {
            return dateB - dateA;
          } else if (this.typeSortExpenses === SortType.ByDateOld) {
            return dateA - dateB;
          } else if (this.typeSortExpenses === SortType.ByHighest) {
            return b.amount - a.amount;
          } else if (this.typeSortExpenses === SortType.ByLowest) {
            return a.amount - b.amount;
          }
        });
      });

      switch (this.typeSortExpenses) {
        case SortType.ByDateNew:
          return groupedExpenses.sort((a, b) => b.maxDate - a.maxDate);
        case SortType.ByDateOld:
          return groupedExpenses.sort((a, b) => a.minDate - b.minDate);
        case SortType.ByHighest:
          return groupedExpenses.sort((a, b) => b.totalAmount - a.totalAmount);
        case SortType.ByLowest:
          return groupedExpenses.sort((a, b) => a.totalAmount - b.totalAmount);
        default:
          return groupedExpenses;
      }
    },
    filterExpenses: function () {
      let itemsArray = this.filterExpensesByTabs();

      if (this.selectedFilterCategory) {
        itemsArray = itemsArray.filter(item => item.category === this.selectedFilterCategory);
      } else if (this.typeFilterExpenses == FilterType.ByRangeOfAmounts && this.applyRangeFilter) {
        itemsArray = itemsArray.filter(item => {
          const amount = item.amount;
          return amount >= this.selectedFilterMinAmount && amount <= this.selectedFilterMaxAmount
        });
      } else if (this.typeFilterExpenses == FilterType.ByIgnoredInCalculation) {
        itemsArray = itemsArray.filter(item => item.isIgnoredInCalculation);
      } else if (this.typeFilterExpenses == FilterType.ByFavorite) {
        itemsArray = itemsArray.filter(item => item.isFavorite);
      }

      return itemsArray;
    },
    filterExpensesByTabs: function () {
      let itemsArray = [];

      if (this.activeTab.match(/^\d{2}\/\d{4}$/)) {
        const [month, year] = this.activeTab.split('/').map(Number);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        itemsArray = this.financialMonitoringStore.getItemsByRangeDate(this.typeOperation, startDate, endDate);
      } else if (this.activeTab === 'custom') {
        const startDate = new Date(this.selectedFilterDatePicker?.[0]);
        const endDate = new Date(this.selectedFilterDatePicker?.[1]);

        itemsArray = this.financialMonitoringStore.getItemsByRangeDate(this.typeOperation, startDate, endDate);
      }

      return itemsArray;
    },
    initializeTabs: function () {
      const uniqueDates = new Set();

      const notesArray = this.typeOperation === OperationType.Expenses ? 'expenses' : 'incomes';

      this.financialMonitoringStore[notesArray].forEach(item => {
        const formattedDate = formatDateForTab(item.date);
        uniqueDates.add(formattedDate);
      });

      const currentFormattedDate = formatDateForTab(new Date());
      if (!uniqueDates.has(currentFormattedDate)) {
        uniqueDates.add(currentFormattedDate);
      }

      const sortedDates = Array.from(uniqueDates).sort((a, b) => {
        const [monthA, yearA] = a.split('/').map(Number);
        const [monthB, yearB] = b.split('/').map(Number);
        return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
      });

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const dynamicTabs = sortedDates.map(date => {
        const [month, year] = date.split('/').map(Number);

        if (year === currentYear && month === currentMonth) {
          return { label: 'Текущий месяц', name: date };
        } else if (
          (year === currentYear && month === currentMonth - 1) ||
          (currentMonth === 1 && month === 12 && year === currentYear - 1)
        ) {
          return { label: 'Предыдущий месяц', name: date };
        } else {
          return { label: date, name: date };
        }
      });

      this.tabs = [
        { label: 'Пользовательский', name: 'custom' },
        ...dynamicTabs
      ];
    },
    isFavoriteExpense: function (id) {
      let notesArray = this.typeOperation === OperationType.Expenses ? this.financialMonitoringStore.expenses : this.financialMonitoringStore.incomes;

      for (let item of notesArray) {
        if (item.id == id) {
          item.isFavorite = !item.isFavorite;
          break;
        }
      }
    },
    async deleteExpense(id) {
      try {
        await this.financialMonitoringStore.deleteExpense(id, this.typeOperation);
        this.removeEmptyTabs();
      } catch (error) {
        console.error('Ошибка при удалении:', error);
      }
    },

    openEditNote: function (id) {
      this.financialMonitoringStore.setPage('addNote', {
        title: 'Редактирование операции',
        id: id,
        showDeleteButton: true,
      });
    },
    openInfoNote: function (id) {
      this.financialMonitoringStore.setPage('infoNote', {
        id: id,
      });
    },
    onRangeOfAmountsSelected: function ({ minAmount, maxAmount }) {
      this.selectedFilterMinAmount = minAmount;
      this.selectedFilterMaxAmount = maxAmount;
      this.isFilterByRangeOfAmountsVisible = false;
      this.applyRangeFilter = true;
    },
    onCategorySelected: function (category) {
      this.financialMonitoringStore.filtersExpenses.selectedFilterCategory = category.label;
      this.isCategoryListDialogVisible = false;
    },
    handleClose: function () {
      this.isFilterByRangeOfAmountsVisible = false;
      this.financialMonitoringStore.filtersExpenses.typeFilterExpenses = FilterType.NotSelected;
    },
    getWordByType: function (count) {
      const words = {
        [OperationType.Expenses]: ['расход', 'расхода', 'расходов'],
        [OperationType.Incomes]: ['доход', 'дохода', 'доходов']
      };

      const [singular, few, many] = words[this.typeOperation] || [];

      if (count === 1 || (count % 10 === 1 && count % 100 !== 11)) {
        return singular;
      } else if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
        return few;
      } else {
        return many;
      }
    },
    removeEmptyTabs: function () {
      const currentActiveTab = this.activeTab;

      for (let i = this.tabs.length - 1; i >= 0; i--) {
        const tab = this.tabs[i];

        if (tab.name === 'custom' || tab.label === 'Текущий месяц') continue;
        const hasEntries = this.financialMonitoringStore[this.typeOperation === OperationType.Expenses ? 'expenses' : 'incomes']
          .some(item => formatDateForTab(item.date) === tab.name);

        if (!hasEntries) this.tabs.splice(i, 1);
      }

      if (!this.tabs.some(tab => tab.name === currentActiveTab)) {
        const lastTab = this.tabs[this.tabs.length - 1].name;
        this.setActiveTab(lastTab);
      }
    },
    setActiveTab(key) {
      this.financialMonitoringStore.filtersExpenses.activeTab = key;
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

.custom-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.expenses-main {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
</style>