<template>
  <div>
    <div class="toolbar">
    <div>
      <el-select v-model="typeSortExpenses" style="width: 200px; margin-right: 15px" :disabled="!financialMonitoringStore.expenses.length">
        <template #prefix>
          <el-icon><Sort /></el-icon>
        </template>
        <el-option :value="SortType.ByDateNew" label="По дате добавления (новые)"></el-option>
        <el-option :value="SortType.ByDateOld" label="По дате добавления (старые)"></el-option>
        <el-option :value="SortType.ByHighestExpenses" label="По наибольшим расходам"></el-option>
        <el-option :value="SortType.ByLowestExpenses" label="По наименьшим расходам"></el-option>
      </el-select>

      <el-select v-model="typeFilterExpenses" style="width: 200px" :disabled="!financialMonitoringStore.expenses.length" @change="checkTypeFilterExpenses()">
        <template #prefix>
          <el-icon><Filter /></el-icon>
        </template>
        <el-option :value="FilterType.NotSelected" label="Не выбрано"></el-option>
        <el-option :value="FilterType.ByCategories" label="По категориям"></el-option>
        <el-option :value="FilterType.ByRangeOfAmounts" label="По диапазону сумм"></el-option>
        <el-option :value="FilterType.ByIgnoredInCalculation" label="По неучитываемым расходам"></el-option>
        <el-option :value="FilterType.ByFavorite" label="По помеченным расходам"></el-option>
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
                {{ group.date }}
              </el-col>
              <el-col :span="12" style="text-align: right">
                <span style="color: red">-{{ group.items.reduce((sum, item) => sum + item.amount, 0) }}</span>
              </el-col>
            </el-row>

            <div class="visible-actions-note" @click="openInfoNote(item.id)" v-for="(item, index) in group.items" :key="item.id">
              <el-row :gutter="20" style="margin-top: 15px;">
                <el-col :span="12">
                  {{ item.category }}
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

export default {
  name: "financial-monitoring-expenses",
  components: {},
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();
    return { financialMonitoringStore };
  },
  created() {
    if (this.financialMonitoringStore.pageParams.selectedTypeFilterExpenses) {
      this.typeFilterExpenses = this.financialMonitoringStore.pageParams.selectedTypeFilterExpenses;
    }

    if (this.financialMonitoringStore.pageParams.selectedSortTypeExpenses) {
      this.typeSortExpenses = this.financialMonitoringStore.pageParams.selectedSortTypeExpenses;
    }

    if (this.financialMonitoringStore.pageParams.selectedActiveName) {
      this.activeName = this.financialMonitoringStore.pageParams.selectedActiveName;
    }
  },
  data() {
    return {
      SortType: SortType,
      typeSortExpenses: SortType.ByDateNew,
      FilterType: FilterType,
      typeFilterExpenses: FilterType.NotSelected,
      activeName: 'fifth',
      selectedFilterDatePicker: '',
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
      this.financialMonitoringStore.pageParams.selectedFilterCategory = '';
      this.financialMonitoringStore.pageParams.selectedFilterMinAmount = '';
      this.financialMonitoringStore.pageParams.selectedFilterMaxAmount = '';

      if (this.typeFilterExpenses !== FilterType.NotSelected && this.typeFilterExpenses !== FilterType.ByIgnoredInCalculation && this.typeFilterExpenses !== FilterType.ByFavorite) {
        this.financialMonitoringStore.setPage('filterOptions', {
          typeFilterExpenses: this.typeFilterExpenses,
          FilterType: this.FilterType,
        });
      }
    },
    expenses: function () {
      let expensesArray = this.filterExpensesByTabs();

      if (this.typeFilterExpenses !== FilterType.NotSelected) {
        expensesArray = this.filterExpenses();
      }
    
      let groupedExpenses = {};

      expensesArray.forEach(item => {
        const dateKey = item.date.split(' ')[0];

        if (!groupedExpenses[dateKey]) {
          groupedExpenses[dateKey] = [];
        }
        groupedExpenses[dateKey].push(item);
      });

      let result = Object.keys(groupedExpenses).map(date => {
        return {
          date: date,
          items: groupedExpenses[date]
        };
      });

      return this.sortExpenses(result);
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
      let selectedFilterCategory = this.financialMonitoringStore.pageParams.selectedFilterCategory;
      let selectedFilterMinAmount = this.financialMonitoringStore.pageParams.selectedFilterMinAmount;
      let selectedFilterMaxAmount = this.financialMonitoringStore.pageParams.selectedFilterMaxAmount;

      if (selectedFilterCategory) {
        expensesArray = expensesArray.filter(item => item.category === selectedFilterCategory);
      } else if (selectedFilterMinAmount && selectedFilterMinAmount) {
        expensesArray = expensesArray.filter(item => {
          const amount = item.amount;
          return amount >= selectedFilterMinAmount && amount <= selectedFilterMaxAmount
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
        activeName: this.activeName,
      });
    },
    openInfoNote: function (id) {
      this.financialMonitoringStore.setPage('infoNote', {
        id: id,
        typeSortExpenses: this.typeSortExpenses,
        activeName: this.activeName,
      });
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

