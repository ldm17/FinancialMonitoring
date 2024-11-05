<template>
  <div>
    <div v-for="item in items" :key="item.id">
      <div style="width: 300px; overflow-wrap: break-word; white-space: normal;" v-if="item.id == this.financialMonitoringStore.pageParams.id">
        <div>
          <p style="display: flex; justify-content: space-between; align-items: center;">
            <span>{{ item.category }}</span>
            <span style="display: flex; gap: 1px;">
              <el-button @click="isFavoriteExpense(item.id)" size="small"><el-icon><CollectionTag /></el-icon></el-button>
              <el-button @click="this.financialMonitoringStore.setPage('addNote', {
                title: 'Редактирование операции', 
                id: this.financialMonitoringStore.pageParams.id,
                returnToInfoNote: true,
                typeSortExpenses: this.financialMonitoringStore.pageParams.typeSortExpenses,
                typeFilterExpenses: this.financialMonitoringStore.pageParams.typeFilterExpenses,
                typeGroupExpenses: this.financialMonitoringStore.pageParams.typeGroupExpenses,
                activeTab: this.financialMonitoringStore.pageParams.activeTab,
                selectedFilterCategory: this.financialMonitoringStore.pageParams.selectedFilterCategory,
                showDeleteButton: true,
                previousActiveTabIndex: this.financialMonitoringStore.pageParams.previousActiveTabIndex,
              })"
                size="small">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button @click="deleteExpense(item.id)" size="small"><el-icon><Delete /></el-icon></el-button>
            </span>
          </p>
          <h1>
            <el-icon v-if="item.isFavorite" size="small"><CollectionTag /></el-icon>
            <el-icon v-if="item.isIgnoredInCalculation" size="small"><Hide /></el-icon>
            <span :style="{ color: typeOperation === OperationType.Expenses ? 'red' : 'green', textAlign: 'right' }">{{ typeOperation === OperationType.Expenses ? '-' : '+' }}{{ item.amount }}</span>
          </h1>
          <p>
            <el-icon><Calendar /></el-icon>
            {{ item.date }}
          </p>
          <p v-if="item.description" style="display: flex;">
            <el-icon style="margin-right: 5px;"><EditPen /></el-icon>
            <span style="color: grey">{{ item.description }}</span>
          </p>
          <p>
            Не учитывается в общей сумме
            <el-switch v-model="item.switch" :disabled="true" />
          </p>
          <div>
            <el-button @click="backToHome()">Назад</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { OperationType, useFinancialMonitoringStore } from "@/stores/FinancialMonitoringStore";
import { ElMessage, ElMessageBox } from 'element-plus';

export default {
  name: "financial-monitoring-info-note",
  props: {
    currentMenuItem: {
      type: Number,
      required: true
    },
  },
  components: {},
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();
    return { financialMonitoringStore };
  },
  computed: {
    items: function() {
      return this.typeOperation === OperationType.Expenses ? this.financialMonitoringStore.expenses : this.financialMonitoringStore.incomes;
    },
  },
  watch: {
    currentMenuItem(newValue) {
      this.typeOperation = newValue;
    }
  },
  data() {
    return {
      typeOperation: this.currentMenuItem,
      OperationType,
    };
  },
  methods: {
    backToHome: function () {
      this.financialMonitoringStore.setPage('expenses', {
        selectedTypeSortExpenses: this.financialMonitoringStore.pageParams.typeSortExpenses,
        selectedTypeFilterExpenses: this.financialMonitoringStore.pageParams.typeFilterExpenses,
        selectedTypeGroupExpenses: this.financialMonitoringStore.pageParams.typeGroupExpenses,
        selectedActiveTab: this.financialMonitoringStore.pageParams.activeTab,
        selectedFilterCategory: this.financialMonitoringStore.pageParams.selectedFilterCategory,
        } 
      );
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
        this.financialMonitoringStore.setPage('expenses', {
          selectedTypeSortExpenses: this.financialMonitoringStore.pageParams.typeSortExpenses,
          selectedTypeFilterExpenses: this.financialMonitoringStore.pageParams.typeFilterExpenses,
          selectedTypeGroupExpenses: this.financialMonitoringStore.pageParams.typeGroupExpenses,
          selectedActiveTab: this.financialMonitoringStore.pageParams.activeTab,
          selectedFilterCategory: this.financialMonitoringStore.pageParams.selectedFilterCategory,
          selectedPreviousActiveTabIndex: this.financialMonitoringStore.pageParams.previousActiveTabIndex,
        });
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: 'Удаление отменено',
        })
      })
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
  },
};
</script>
<style lang="scss"></style>
