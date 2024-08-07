<template>
  <div>
    <div>
      <el-select v-model="typeSortExpenses" style="width: 200px; margin-right: 15px" :disabled="!financialMonitoringStore.expenses.length">
        <template #prefix>
          <el-icon><Sort /></el-icon>
        </template>
        <el-option v-for="item in sortExpensesOptions" :key="item.id" :value="item.option">
        </el-option>
      </el-select>

      <el-select v-model="typeFilterExpenses" style="width: 200px" :disabled="!financialMonitoringStore.expenses.length" @change="checkTypeFilterExpenses()">
        <template #prefix>
          <el-icon><Filter /></el-icon>
        </template>
        <el-option v-for="item in filterExpensesOptions" :key="item.id" :value="item.option">
        </el-option>
      </el-select>
    </div>
    <p v-if="!financialMonitoringStore.expenses.length" style="text-align: center">
      <el-empty description="Нет данных для отображения" />
      </p>
    <div v-else>
      <p style="color: red; text-align: right">{{ getSumExpenses() }}</p>
      <div class="expenses__card">
        <el-card class="visible-actions-note" style="margin-bottom: 15px;" @click="openInfoNote(item.id)" v-for="item in expenses()" :key="item.id">
          <el-row :gutter="20">
            <el-col :span="12">
              {{ item.date }}
            </el-col>
            <el-col :span="12" style="text-align: right">
              <span v-if="item.mark">
                <el-icon size="small"><CollectionTag /></el-icon>
              </span>
              <span v-if="item.switch">
                <el-icon size="small"><Hide /></el-icon>
              </span>
              <span style="color: red">-{{ item.amount }}</span>
            </el-col>
          </el-row>

          <p class="description-card">{{ item.description }}</p>

          <el-row :gutter="20">
            <el-col :span="12">
              {{ item.category }}
            </el-col>
              <el-col :span="12" style="text-align: right">
                <el-button @click.stop="markNote(item.id)" size="small"><el-icon><CollectionTag /></el-icon></el-button>
                <el-button @click.stop="openEditNote(item.id)" size="small"><el-icon><Edit /></el-icon></el-button>
                <el-button @click.stop="deleteExpense(item.id)" size="small"><el-icon><Delete /></el-icon></el-button>
              </el-col>
          </el-row>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import { useFinancialMonitoringStore } from "@/stores/FinancialMonitoringStore";

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
      typeSortExpenses: 'По дате добавления',
      sortExpensesOptions: [
        {
          id: 1,
          option: 'По дате добавления',
        },
        {
          id: 2,
          option: 'По наибольшим расходам',
        },
        {
          id: 3,
          option: 'По наименьшим расходам',
        },
      ],
      typeFilterExpenses: '',
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
      ],
    };
  },
  methods: {
    getSumExpenses: function () {
      let sum = 0;

      for (let item of this.expenses()) {
        if (!item.switch) {
          sum += Math.round(item.amount * 10) / 10
        }
      }
      return sum
    },
    checkTypeFilterExpenses: function () {
      if (this.typeFilterExpenses !== 'Не выбрано' && this.typeFilterExpenses !== 'По неучитываемым расходам') {
        this.financialMonitoringStore.setPage('filterOptions', {
          typeFilterExpenses: this.typeFilterExpenses,
        });
      } else if (this.typeFilterExpenses == 'Не выбрано') {
        this.financialMonitoringStore.pageParams.selectedFilterCategory = '';
        this.financialMonitoringStore.pageParams.selectedFilterDatePicker = '';
        this.financialMonitoringStore.pageParams.selectedFilterMinAmount = '';
        this.financialMonitoringStore.pageParams.selectedFilterMaxAmount = '';
      }
    },
    expenses: function () {
      let expensesArray = this.sortExpenses()

        if (this.financialMonitoringStore.pageParams.selectedFilterCategory) {
          expensesArray = this.filterExpenses();
        } else if (this.financialMonitoringStore.pageParams.selectedFilterDatePicker) {
          expensesArray = this.filterExpenses();
        } else if (this.financialMonitoringStore.pageParams.selectedFilterMinAmount && this.financialMonitoringStore.pageParams.selectedFilterMaxAmount) {
          expensesArray = this.filterExpenses();
        } else if (this.typeFilterExpenses == 'По неучитываемым расходам') {
          expensesArray = this.filterExpenses();
        }

        return expensesArray;
    },
    sortExpenses: function () {
      let expensesArray = this.financialMonitoringStore.expenses

      for (let item of this.sortExpensesOptions) {
        if ((item.option == this.typeSortExpenses && item.id == 1)) {
           expensesArray = expensesArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else if (item.option == this.typeSortExpenses && item.id == 2) {
          expensesArray = expensesArray.sort((a, b) => b.amount - a.amount);
        } else if (item.option == this.typeSortExpenses && item.id == 3) {
          expensesArray = expensesArray.sort((a, b) => a.amount - b.amount);
        }
      }
      return expensesArray;
    },
    filterExpenses: function () {
      let expensesArray = this.financialMonitoringStore.expenses;
      let selectedFilterCategory = this.financialMonitoringStore.pageParams.selectedFilterCategory;
      let selectedFilterDatePicker = this.financialMonitoringStore.pageParams.selectedFilterDatePicker;
      let selectedFilterMinAmount = this.financialMonitoringStore.pageParams.selectedFilterMinAmount;
      let selectedFilterMaxAmount = this.financialMonitoringStore.pageParams.selectedFilterMaxAmount;

      if (selectedFilterCategory) {
        expensesArray = expensesArray.filter(item => item.category === selectedFilterCategory);
      } else if (selectedFilterDatePicker) {
        const startDate = new Date(selectedFilterDatePicker[0]);
        const endDate = new Date(selectedFilterDatePicker[1]);

        expensesArray = expensesArray.filter(item => {
          const date = new Date(item.date); 
          return date >= startDate && date <= endDate
        });
      } else if (selectedFilterMinAmount && selectedFilterMinAmount) {
        expensesArray = expensesArray.filter(item => {
          const amount = item.amount;
          return amount >= selectedFilterMinAmount && amount <= selectedFilterMaxAmount
        });
      } else if (this.typeFilterExpenses == 'По неучитываемым расходам') {
        expensesArray = expensesArray.filter(item => item.switch);
      }

      return expensesArray;
    },
    markNote: function (id) {
      const expensesNote = this.financialMonitoringStore.expenses.find(item => item.id == id);
      expensesNote.mark = !expensesNote.mark;
    },
    deleteExpense: function (id) {
      let index = this.financialMonitoringStore.expenses.findIndex((item) => item.id == id);
      this.financialMonitoringStore.expenses.splice(index, 1);
      // this.financialMonitoringStore.deleteExpense({id})
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
.visible-actions-note .el-button {
  visibility: hidden;
}

.visible-actions-note:hover .el-button {
  visibility: visible;
}

.expenses__card .el-card {
  max-width: 415px;
  max-height: 135px;
}

.description-card {
  color: grey;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
}
</style>

