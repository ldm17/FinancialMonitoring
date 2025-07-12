<template>
  <div>
    <div class="toolbar">
    <div>
      <el-tabs v-model="financialMonitoringStore.filtersTransactions.activeTab">
        <el-tab-pane
          v-for="tab in tabs"
          :key="tab.name"
          :label="tab.label"
          :name="tab.name"
        />
      </el-tabs>
    </div>

    <div style="display: flex">
      <el-select v-model="financialMonitoringStore.filtersTransactions.typeSortTransactions" style="width: 200px; margin-right: 15px" :disabled="!filterTransactionsByTabs().length">
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

      <el-select v-model="financialMonitoringStore.filtersTransactions.typeFilterTransactions" style="width: 200px; margin-right: 15px" :disabled="!filterTransactionsByTabs().length" @change="checkTypeFilterTransactions()">
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

      <el-dialog v-model="isCategoryListDialogVisible" title="Выберите категорию" width="500" center align-center @close="handleCloseCategoryListDialog">
        <span>
          <financial-monitoring-category-list
          ref="categoryListDialog"
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

      <div>
        <RouterView />
      </div>

      <el-select v-model="financialMonitoringStore.filtersTransactions.typeGroupTransactions" style="width: 200px" :disabled="!filterTransactionsByTabs().length">
        <template #prefix>
          <el-icon><Tickets /></el-icon>
        </template>
        <el-option :value="GroupType.ByDate" label="По дате"></el-option>
        <el-option :value="GroupType.ByCategories" label="По категориям"></el-option>
      </el-select>
    </div>

    <div>
      <el-select v-model="financialMonitoringStore.filtersTransactions.currentWalletId" style="width: 200px" placeholder="Выберите кошелек">
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

    <div class="transactions-main">
    <div v-if="!transactions().length" style="text-align: center">
      <el-empty description="Нет данных для отображения" />
    </div>

    <div v-else>
      <p :style="{ color: typeOperation === OperationType.Expenses ? 'red' : 'green', textAlign: 'right' }">{{ typeOperation === OperationType.Expenses ? '-' : '+' }}{{ getSumTransactions() }}</p>
      <financial-monitoring-card
        v-for="group in transactions()"
        :key="group.id"
        :group="group"
        :typeGroupTransactions="typeGroupTransactions"
        :formatDate="formatDate"
        :getWordByType="getWordByType"
        :GroupType="GroupType"
        :currentMenuItem="typeOperation"
        @openInfoNote="openInfoNote"
        @favorite="isFavoriteTransaction"
        @edit="openEditNote"
        @delete="deleteTransaction"
      />
    </div>
  </div>
  </div>
</template>

<script>
import { useFinancialMonitoringStore } from "@/stores/FinancialMonitoringStore";
import { useFinancialMonitoringStoreWallet } from "@/stores/FinancialMonitoringStoreWallet";
import { format, parse } from "date-fns";
import FinancialMonitoringRangeFilterModal from "./FinancialMonitoringRangeFilterModal.vue";
import FinancialMonitoringCategoryList from "./FinancialMonitoringCategoryList.vue";
import { formatDate, formatDateForTab } from "@/utils.js";
import FinancialMonitoringCard from "./FinancialMonitoringCard.vue";
import { OperationType, SortType, FilterType, GroupType } from "@/stores/FinancialMonitoringStore";
import { ElMessage } from 'element-plus';

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
    const financialMonitoringStoreWallet = useFinancialMonitoringStoreWallet();

    return { financialMonitoringStore, financialMonitoringStoreWallet };
  },
  watch: {
    watchedNotesArray: {
      handler() {
        this.initializeTabs();
        this.removeEmptyTabs();
      },
      deep: true,
    },
    currentWalletId(newValue) {
      this.$router.replace({ query: { ...this.$route.query, walletId: newValue } });
      this.financialMonitoringStore.fetchNotes(this.typeOperation, newValue);
      this.initializeTabs();
      this.removeEmptyTabs();
    },
  },
  async created() {
    const walletIdFromUrl = this.$route.query.walletId ? Number(this.$route.query.walletId) : null;

    const isSuccessFetchWallets = await this.financialMonitoringStoreWallet.fetchWallets();
    this.financialMonitoringStoreWallet.setCurrentWalletId(walletIdFromUrl);

    if (isSuccessFetchWallets === null) {
      ElMessage.error('Не удалось загрузить кошельки');
    };

    this.financialMonitoringStore.fetchNotes(this.typeOperation, this.financialMonitoringStore.filtersTransactions.currentWalletId)
      .then(() => {
        this.$nextTick(() => {
          this.removeEmptyTabs();
          if (this.selectedDate) {
            this.setActiveTab(formatDateForTab(this.selectedDate));
            this.financialMonitoringStore.filtersTransactions.selectedDate = '';
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
        console.error('Ошибка при загрузке транзакций:', error);
        ElMessage.error('Не удалось загрузить транзакции');
      });
  },
  computed: {
    formattedDate: function () {
      return formatDate(this.dateString);
    },

    typeSortTransactions: function () {
      return this.financialMonitoringStore.filtersTransactions.typeSortTransactions;
    },

    typeFilterTransactions: function () {
      return this.financialMonitoringStore.filtersTransactions.typeFilterTransactions;
    },

    typeGroupTransactions: function () {
      return this.financialMonitoringStore.filtersTransactions.typeGroupTransactions;
    },

    activeTab: function () {
      return this.financialMonitoringStore.filtersTransactions.activeTab;
    },

    selectedFilterCategory: function () {
      return this.financialMonitoringStore.filtersTransactions.selectedFilterCategory;
    },

    selectedDate: function () {
      return this.financialMonitoringStore.filtersTransactions.selectedDate;
    },
    watchedNotesArray: function () {
      return this.typeOperation === OperationType.Expenses? this.financialMonitoringStore.expenses : this.financialMonitoringStore.incomes;
    },
    currentWalletId: function () {
      return this.financialMonitoringStore.filtersTransactions.currentWalletId;
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
    getSumTransactions: function () {
      let sum = 0;
      const itemsArray = this.transactions();

      for (let group of itemsArray) {
        for (let item of group.items) {
          if (!item.isIgnoredInCalculation) {
            sum += Math.round(item.amount * 10) / 10;
          }
        }
      }
      return sum
    },
    checkTypeFilterTransactions: function () {
      if (this.typeFilterTransactions == FilterType.NotSelected) {
        this.selectedFilterMinAmount = null;
        this.selectedFilterMaxAmount = null;
        this.financialMonitoringStore.filtersTransactions.selectedFilterCategory = '';
        console.log(this.financialMonitoringStore.filtersTransactions.selectedFilterCategory);

        this.$router.push({ name: this.$route.matched[0].name, query: {} });
      } else if (this.typeFilterTransactions == FilterType.ByCategories) {
        this.isCategoryListDialogVisible = true;
      } else if (this.typeFilterTransactions == FilterType.ByRangeOfAmounts) {
          this.isFilterByRangeOfAmountsVisible = true;
          this.applyRangeFilter = false;
      }
    },
    transactions: function () {
      let itemsArray = this.filterTransactionsByTabs();

      if (this.typeFilterTransactions !== FilterType.NotSelected) {
        itemsArray = this.filterTransactions();
      }

      const groupedTransactions = this.groupTransactions(itemsArray);

      const result = Object.keys(groupedTransactions).map(key => {
        return {
          [this.typeGroupTransactions === GroupType.ByDate ? 'date' : 'categoryId']: key,
          items: groupedTransactions[key]
        };
      });

      return this.sortTransactions(result);
    },
    groupTransactions: function (itemsArray) {
      const grouped = {};

      itemsArray.forEach(item => {
        const dateKey = item.date.split(' ')[0];

        const key = this.typeGroupTransactions === GroupType.ByDate ? dateKey : item.categoryId;

        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(item);
      });

      return grouped;
    },
    sortTransactions: function (itemsArray) {
      if (!itemsArray || itemsArray.length === 0) return itemsArray;

      const groupedTransactions = itemsArray.map(group => {
        const totalAmount = group.items.reduce((sum, item) => sum + item.amount, 0);
        return {
          ...group,
          totalAmount,
          minDate: Math.min(...group.items.map(item => new Date(item.date))),
          maxDate: Math.max(...group.items.map(item => new Date(item.date)))
        };
      });

      groupedTransactions.forEach(group => {
        group.items.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);

          if (this.typeSortTransactions === SortType.ByDateNew) {
            return dateB - dateA;
          } else if (this.typeSortTransactions === SortType.ByDateOld) {
            return dateA - dateB;
          } else if (this.typeSortTransactions === SortType.ByHighest) {
            return b.amount - a.amount;
          } else if (this.typeSortTransactions === SortType.ByLowest) {
            return a.amount - b.amount;
          }
        });
      });

      switch (this.typeSortTransactions) {
        case SortType.ByDateNew:
          return groupedTransactions.sort((a, b) => b.maxDate - a.maxDate);
        case SortType.ByDateOld:
          return groupedTransactions.sort((a, b) => a.minDate - b.minDate);
        case SortType.ByHighest:
          return groupedTransactions.sort((a, b) => b.totalAmount - a.totalAmount);
        case SortType.ByLowest:
          return groupedTransactions.sort((a, b) => a.totalAmount - b.totalAmount);
        default:
          return groupedTransactions;
      }
    },
    filterTransactions: function () {
      let itemsArray = this.filterTransactionsByTabs();

      if (this.selectedFilterCategory) {
        itemsArray = itemsArray.filter(item => this.financialMonitoringStore.categories.get(item.categoryId)?.name === this.selectedFilterCategory);
      } else if (this.typeFilterTransactions == FilterType.ByRangeOfAmounts && this.applyRangeFilter) {
        itemsArray = itemsArray.filter(item => {
          const amount = item.amount;
          return amount >= this.selectedFilterMinAmount && amount <= this.selectedFilterMaxAmount
        });
      } else if (this.typeFilterTransactions == FilterType.ByIgnoredInCalculation) {
        itemsArray = itemsArray.filter(item => item.isIgnoredInCalculation);
      } else if (this.typeFilterTransactions == FilterType.ByFavorite) {
        itemsArray = itemsArray.filter(item => item.isFavorite);
      }

      return itemsArray;
    },
    filterTransactionsByTabs: function () {
      let itemsArray = [];

      if (this.activeTab.match(/^\d{2}\/\d{4}$/)) {
        const [month, year] = this.activeTab.split('/').map(Number);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        itemsArray = this.financialMonitoringStore.getItemsByRangeDate(this.typeOperation, startDate, endDate);
      } else if (this.activeTab === 'custom') {
        const startDate = new Date(this.selectedFilterDatePicker?.[0]);
        const endDate = new Date(this.selectedFilterDatePicker?.[1]);

        endDate.setHours(23, 59, 59, 999);

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
    async isFavoriteTransaction (id) {
      let transaction = await this.financialMonitoringStore.fetchNote(id);
      
      transaction.isFavorite = !transaction.isFavorite
      let isSuccessUpdateIsFavorite = await this.financialMonitoringStore.editNote(transaction);

      if (isSuccessUpdateIsFavorite) {
        if (transaction.isFavorite) {
          ElMessage.success('Запись успешно добавлена в помеченные');
        } else {
          ElMessage.success('Запись успешно удалена из помеченных');
        }
        this.financialMonitoringStore.fetchNotes(this.typeOperation, this.financialMonitoringStore.filtersTransactions.currentWalletId);
      } else {
        ElMessage.error('Не удалось добавить запись в помеченные');
      }
    },
    async deleteTransaction(id) {
      try {
        await this.financialMonitoringStore.deleteTransaction(id, this.typeOperation);
        this.removeEmptyTabs();
      } catch (error) {
        console.error('Ошибка при удалении:', error);
      }
    },
    openEditNote: function (id) {
      const type = this.typeOperation === OperationType.Expenses ? 'expense' : 'income';
      this.$router.push({ name: 'add-note', params: { type: type, action: 'edit', id: id }, query: { currentMenuItem: this.typeOperation } });
    },
    openInfoNote: function (id) {
      const type = this.typeOperation === OperationType.Expenses ? 'expense' : 'income';
      this.$router.push({ name: 'info-note', params: { type: type, id: id }, query: { currentMenuItem: this.typeOperation } });
    },
    onRangeOfAmountsSelected: function ({ minAmount, maxAmount }) {
      this.selectedFilterMinAmount = minAmount;
      this.selectedFilterMaxAmount = maxAmount;
      this.isFilterByRangeOfAmountsVisible = false;
      this.applyRangeFilter = true;
    },
    onCategorySelected: function (category) {
      this.financialMonitoringStore.filtersTransactions.selectedFilterCategory = category.label;
      this.isCategoryListDialogVisible = false;
    },
    handleClose: function () {
      this.financialMonitoringStore.filtersTransactions.typeFilterTransactions = FilterType.NotSelected;
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
      this.financialMonitoringStore.filtersTransactions.activeTab = key;
    },
    handleCloseCategoryListDialog: function () {
      this.$refs.categoryListDialog.filterCategory = '';
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
  gap: 10px;

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

.transactions-main {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
</style>