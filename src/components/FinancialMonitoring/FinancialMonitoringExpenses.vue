<template>
  <div>
    <div class="toolbar">
    <div>
      <el-select v-model="typeSortExpenses" style="width: 200px; margin-right: 15px" :disabled="!financialMonitoringStore.expenses.length">
        <template #prefix>
          <el-icon><Sort /></el-icon>
        </template>
        <el-option :value="SortType.ByDate" label="По дате добавления"></el-option>
        <el-option :value="SortType.ByHighestExpenses" label="По наибольшим расходам"></el-option>
        <el-option :value="SortType.ByLowestExpenses" label="По наименьшим расходам"></el-option>
      </el-select>

      <el-select v-model="typeFilterExpenses" style="width: 200px" :disabled="!financialMonitoringStore.expenses.length" @change="checkTypeFilterExpenses()">
        <template #prefix>
          <el-icon><Filter /></el-icon>
        </template>
        <el-option v-for="item in filterExpensesOptions" :key="item.id" :value="item.option">
        </el-option>
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
        <el-card class="visible-actions-note" style="margin-bottom: 15px;" v-for="group in expenses()" :key="group.id">
            <el-row :gutter="20">
              <el-col :span="12">
                {{ group.date }}
              </el-col>
              <el-col :span="12" style="text-align: right">
                <span v-if="group.items.some(item => item.mark)">
                  <el-icon size="small"><CollectionTag /></el-icon>
                </span>
                <span v-if="group.items.some(item => item.switch)">
                  <el-icon size="small"><Hide /></el-icon>
                </span>
                <span style="color: red">-{{ group.items.reduce((sum, item) => sum + item.amount, 0) }}</span>
              </el-col>
            </el-row>

            <div @click="openInfoNote(item.id)" v-for="(item, index) in group.items" :key="item.id">
              <el-row :gutter="20" style="margin-top: 15px;">
                <el-col :span="12">
                  {{ item.category }}
                </el-col>
                <el-col style="color: red; text-align: right;" :span="12">
                  -{{ item.amount }}
                </el-col>
              </el-row>

              <el-row :gutter="20" style="margin-top: 0px;">
                <el-col v-if="item.description" :span="24">
                  <p class="description-card" style="margin: 5px 0px;">{{ item.description }}</p>
                </el-col>
              </el-row>
                <el-row :gutter="20">
                  <el-col :span="24" style="text-align: right;">
                    <el-button @click.stop="markNote(item.id)" size="small"><el-icon><CollectionTag /></el-icon></el-button>
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
  ByDate: 0,
  ByHighestExpenses: 1,
  ByLowestExpenses: 2,
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
  },
  data() {
    return {
      SortType: SortType,
      typeSortExpenses: SortType.ByDate,
      typeFilterExpenses: 'Не выбрано',
      filterExpensesOptions: [
        {
          id: 1,
          option: 'Не выбрано',
        },
        {
          id: 2,
          option: 'По категориям',
        },
        {
          id: 3,
          option: 'По диапазону дат',
        },
        {
          id: 4,
          option: 'По диапазону сумм',
        },
        {
          id: 5,
          option: 'По неучитываемым расходам',
        },
        {
          id: 6,
          option: 'По помеченным расходам',
        },
      ],
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
          if (!item.switch) {
            sum += Math.round(item.amount * 10) / 10;
          }
        }
      }
      return sum
    },
    checkTypeFilterExpenses: function () {
      this.financialMonitoringStore.pageParams.selectedFilterCategory = '';
      this.financialMonitoringStore.pageParams.selectedFilterDatePicker = '';
      this.financialMonitoringStore.pageParams.selectedFilterMinAmount = '';
      this.financialMonitoringStore.pageParams.selectedFilterMaxAmount = '';

      if (this.typeFilterExpenses !== 'Не выбрано' && this.typeFilterExpenses !== 'По неучитываемым расходам' && this.typeFilterExpenses !== 'По помеченным расходам') {
        this.financialMonitoringStore.setPage('filterOptions', {
          typeFilterExpenses: this.typeFilterExpenses,
        });
      }
    },
    expenses: function () {
      let expensesArray = this.filterExpensesByTabs();

      if (this.typeFilterExpenses !== 'Не выбрано') {
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
      const totalAmount = group.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        return {
          ...group,
          totalAmount,
        };
      });

      switch (this.typeSortExpenses) {
        case SortType.ByDate:
          return groupedExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
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
      let selectedFilterDatePicker = this.financialMonitoringStore.pageParams.selectedFilterDatePicker;
      let selectedFilterMinAmount = this.financialMonitoringStore.pageParams.selectedFilterMinAmount;
      let selectedFilterMaxAmount = this.financialMonitoringStore.pageParams.selectedFilterMaxAmount;

      if (selectedFilterCategory) {
        expensesArray = expensesArray.filter(item => item.category === selectedFilterCategory);
      } else if (selectedFilterMinAmount && selectedFilterMinAmount) {
        expensesArray = expensesArray.filter(item => {
          const amount = item.amount;
          return amount >= selectedFilterMinAmount && amount <= selectedFilterMaxAmount
        });
      } else if (this.typeFilterExpenses == 'По неучитываемым расходам') {
        expensesArray = expensesArray.filter(item => item.switch);
      } else if (this.typeFilterExpenses == 'По помеченным расходам') {
        expensesArray = expensesArray.filter(item => item.mark);
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
        const endDate = new Date(today.getFullYear(), today.getMonth(), 1);

        expensesArray = expensesArray.filter(item => {
          const date = new Date(item.date); 
          return date >= startDate && date <= endDate
        });
      } else if (this.activeName == 'second') {
        const today = new Date();
        const startDate = new Date(today.getFullYear() - 1, 0, 1);
        const endDate = new Date(today.getFullYear(), today.getMonth(), 1);

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
    markNote: function (id) {
      const expensesNote = this.financialMonitoringStore.expenses.find(item => item.id == id);
      expensesNote.mark = !expensesNote.mark;
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
      });
    },
    openInfoNote: function (id) {
      this.financialMonitoringStore.setPage('infoNote', {
        id: id,
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

