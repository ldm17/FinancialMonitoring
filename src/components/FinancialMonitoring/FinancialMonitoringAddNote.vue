<template>
  <div>
    <p>{{ financialMonitoringStore.pageParams.title }}</p>
    <p>Сумма</p>
    <el-input style="width: 250px" v-model="amount" placeholder="Введите сумму" :formatter="(value) => `${value}`.replace(/[^0-9.]/g, '')">
    </el-input>

    <p>Категория</p>
    <el-select style="width: 250px" v-model="selectedCategory" placeholder="Выберите категорию">
      <el-option v-for="item in financialMonitoringStore.categories" :key="item.category" :value="item.category" />
    </el-select>

    <p>Дата</p>
    <!-- <el-date-picker v-model="datePicker" type="date" placeholder="Выберите дату" size="default" format="DD/MM/YYYY" value-format="DD/MM/YYYY" /> -->
    <el-date-picker style="width: 250px" v-model="datePicker" type="datetime" placeholder="Выберите дату" format="YYYY/MM/DD HH:mm" value-format="YYYY/MM/DD HH:mm" time-format="HH:mm" />

    <p v-if="isDescription">
      <el-input v-model="description" style="width: 250px" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea" placeholder="Примечание" />
    </p>

    <p>
      <el-button @click="addDescription()"><el-icon><EditPen /></el-icon></el-button>
      <el-button><el-icon><PictureFilled /></el-icon></el-button>
    </p>

    <p>
      Не учитывать в общей сумме
      <el-switch v-model="switchGetSumExpense" />
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

export default {
  name: "financial-monitoring-add-note",
  components: {
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
      this.switchGetSumExpense = expense.switch;
      this.mark = expense.mark;
    }
  },
  data() {
    return {
      amount: null,
      selectedCategory: '',
      datePicker: '',
      isDescription: false,
      description: '',
      switchGetSumExpense: false,
      mark: false,
    };
  },
  methods: {
    backToHome: function () {
      this.financialMonitoringStore.setPage('expenses');
    },
    addExpense: function (amount, selectedCategory, datePicker) {
    const expense = this.financialMonitoringStore.categories.find(item => item.category == selectedCategory);

    if (expense) {
      this.financialMonitoringStore.addNote({
        id: this.financialMonitoringStore.expenses.length + 1,
        idCategory: expense.id,
        amount: amount,
        category: selectedCategory,
        date: datePicker,
        description: this.description,
        switch: this.switchGetSumExpense,
        mark: this.mark,
      });
      this.financialMonitoringStore.setPage('expenses')
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
        expense.switch = this.switchGetSumExpense;
        expense.mark = this.mark
      }
      this.financialMonitoringStore.setPage('expenses')
    },
    checkFieldsAddExpense: function () {
      return this.selectedCategory == 0 || this.amount == 0 || this.datePicker == 0 ? true : false;
    },
    addDescription: function () {
      this.isDescription = !this.isDescription;
    },
  },
};
</script>
<style lang="scss">
</style>

