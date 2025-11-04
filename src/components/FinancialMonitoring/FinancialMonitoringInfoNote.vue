<template>
  <div>
      <div v-if="transaction">
      <div style="width: 300px; overflow-wrap: break-word; white-space: normal;">
        <div>
          <p style="display: flex; justify-content: space-between; align-items: center;">
            <span>{{ this.financialMonitoringStore.categories.get(transaction.categoryId)?.name }}</span>
            <span style="display: flex; gap: 1px;">
              <el-button @click="isFavoriteTransaction(transaction.id)" size="small"><el-icon><CollectionTag /></el-icon></el-button>

              <el-button @click="this.$router.push({ name: 'add-note', params: { type: type, action: 'edit', id: id }, query: { currentMenuItem: typeOperation } })" size="small">
                <el-icon><Edit /></el-icon>
              </el-button>

              <el-button @click="deleteTransaction(transaction.id)" size="small"><el-icon><Delete /></el-icon></el-button>
            </span>
          </p>
          <h1>
            <el-icon v-if="transaction.isFavorite" size="small"><CollectionTag /></el-icon>
            <el-icon v-if="transaction.isIgnoredInCalculation" size="small"><Hide /></el-icon>
            <span :style="{ color: transaction.operationType === OperationType.Expenses ? 'red' : 'green', textAlign: 'right' }">{{ transaction.operationType === OperationType.Expenses ? '-' : '+' }}{{ transaction.amount }}</span>
          </h1>
          <p>
            <el-icon><Calendar /></el-icon>
              <span>{{ formatDate(transaction.createdAt, 'dateWithTime') }}</span>
          </p>
          <p v-if="transaction.description" style="display: flex;">
            <el-icon style="margin-right: 5px;"><EditPen /></el-icon>
            <span style="color: grey">{{ transaction.description }}</span>
          </p>
          <p>
            Не учитывается в общей сумме
            <el-switch v-model="transaction.switch" :disabled="true" />
          </p>
          <div>
            <el-button @click="this.$router.back()">Назад</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { OperationType, useFinancialMonitoringStore } from "@/stores/FinancialMonitoringStore";
import { ElMessage, ElMessageBox } from 'element-plus';
import { format, parseISO } from 'date-fns';
import { formatDate } from '@/utils.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export default {
  name: "financial-monitoring-info-note",
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  components: {},
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();
    return { financialMonitoringStore };
  },
  watch: {
    currentMenuItem(newValue) {
      this.typeOperation = newValue;
    },
  },
  mounted() {
    this.financialMonitoringStore.setHeaderButtonHandler(this.handleAddTransactionButtonClick);
  },
  unmounted() {
    this.financialMonitoringStore.resetHeaderButtonHandler();
  },
  async created () {
    await this.financialMonitoringStore.fetchTimeZone();
    this.typeOperation = Number(this.$route.query.currentMenuItem);
    await this.financialMonitoringStore.fetchCategories(this.typeOperation);
    await this.handleFetchTransaction();
  },
  data() {
    return {
      typeOperation: null,
      transaction: null,
      OperationType,
      format,
      parseISO,
      formatDate: formatDate,
    };
  },
  methods: {
    async handleFetchTransaction() {
      try {
        this.transaction = await this.financialMonitoringStore.fetchNote(this.id);
        if (!this.transaction) {
          this.$router.back();
        }
      } catch (error) {
        console.error('Error loading transaction:', error);
        this.$router.back();
      }
    },
    deleteTransaction: function (id) {
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
          message: 'Запись успешно удалена',
        })
        this.financialMonitoringStore.deleteTransaction(id, this.typeOperation);
        this.$router.back();
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: 'Удаление отменено',
        })
      })
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
    handleAddTransactionButtonClick: function () {
      const type = this.typeOperation === OperationType.Expenses ? 'expense' : 'income';
      this.$router.push({ 
        name: 'add-note',
        params: { type: type, action: 'new' },
        query: { currentMenuItem: this.typeOperation, walletId: this.financialMonitoringStore.filtersTransactions.currentWalletId } 
      });
    },
  },
};
</script>
<style lang="scss"></style>
