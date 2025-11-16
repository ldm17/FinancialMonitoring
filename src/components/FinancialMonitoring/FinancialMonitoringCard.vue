<template>
  <div>
    <div class="expenses__card">
      <el-card style="margin-bottom: 15px;">
          <el-row :gutter="20">
            <el-col :span="12">
              {{ typeGroupTransactions == GroupType.ByDate ? formatDate(group.date, 'fullDateShortWeekday') : this.financialMonitoringStore.categories.get(group.items[0].categoryId)?.name }}
            </el-col>
            <el-col :span="12" style="text-align: right">
              <span :style="{ color: typeOperation === OperationType.Expenses ? 'red' : 'green' }">{{ typeOperation === OperationType.Expenses ? '-' : '+' }}{{ group.items.reduce((sum, item) => sum + item.amount, 0) }}</span>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <div v-if="typeGroupTransactions == GroupType.ByCategories">
                <div style="margin: 5px 0px"></div>
                <span>{{ group.items.length }} {{ getWordByType(group.items.length) }}</span>
              </div>
            </el-col>
          </el-row>
          
          <el-divider style="margin: 10px 0 5px; opacity: 0.3;" />

          <div class="visible-actions-note" @click="handleOpenInfoNote(item.id)" v-for="(item, index) in group.items" :key="item.id">
            <el-row :gutter="20" style="margin-top: 15px;">
              <el-col :span="12">
                <div>
                  {{ typeGroupTransactions == GroupType.ByDate ? this.financialMonitoringStore.categories.get(item.categoryId)?.name : formatDate(item.date, 'fullDateShortWeekday')}}
                </div>
                 <span>{{ formatDateWithUtc(item.date, 'time') }}</span>

                <div>
                  <span v-if="financialMonitoringStoreUser.isTransactionTimeZoneVisible">{{ item.timeZone }}</span>
                </div>
              </el-col>

              <el-col style="text-align: right;" :span="12">
                <span v-if="item.isFavorite">
                  <el-icon size="small"><CollectionTag /></el-icon>
                </span>
                <span v-if="item.isIgnoredInCalculation">
                  <el-icon size="small"><Hide /></el-icon>
                </span>
                <span :style="{ color: typeOperation === OperationType.Expenses ? 'red' : 'green' }">{{ typeOperation === OperationType.Expenses ? '-' : '+' }}{{ item.amount }}</span>
              </el-col>
            </el-row>

            <el-row :gutter="20" style="margin-top: 0px;">
              <el-col v-if="item.description" :span="24">
                <p class="description-card" style="margin: 5px 0px;">{{ item.description }}</p>
              </el-col>
            </el-row>
              <el-row :gutter="20">
                <el-col :span="24" style="text-align: right;">
                  <el-button @click.stop="handleFavorite(item.id)" size="small"><el-icon><CollectionTag /></el-icon></el-button>
                  <el-button @click.stop="handleEdit(item.id)" size="small"><el-icon><Edit /></el-icon></el-button>
                  <el-button @click.stop="confirmDelete(item.id)" size="small"><el-icon><Delete /></el-icon></el-button>
                </el-col>
            </el-row>

            <el-divider style="margin: 5px 0px; opacity: 0.3;" v-if="index < group.items.length - 1" />
          </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { useFinancialMonitoringStore } from "@/stores/FinancialMonitoringStore";
import { useFinancialMonitoringStoreUser } from "@/stores/FinancialMonitoringStoreUser";
import { ElMessage, ElMessageBox } from 'element-plus';
import { OperationType } from "@/stores/FinancialMonitoringStore";
import { formatDateWithUtc } from '@/utils.js';

export default {
  name: "financial-monitoring-card",
  props: {
    group: {
      type: Object,
      required: true
    },
    typeGroupTransactions: {
      type: Number,
      required: true
    },
    formatDate: {
      type: Function,
      required: true
    },
    getWordByType: {
      type: Function,
      required: true
    },
    GroupType: {
      type: Object,
      required: true
    },
    currentMenuItem: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();
    const financialMonitoringStoreUser = useFinancialMonitoringStoreUser();
    return { financialMonitoringStore, financialMonitoringStoreUser };
  },
  async created() {
    const isSuccessFetchCategories = await this.financialMonitoringStore.fetchCategories(this.typeOperation);

    if (isSuccessFetchCategories === null) {
      ElMessage.error('Не удалось загрузить категории');
    };

    await this.financialMonitoringStoreUser.fetchTimeZone();
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
      formatDateWithUtc: formatDateWithUtc,
    };
  },
  methods: {
    handleOpenInfoNote: function(id) {
      this.$emit('openInfoNote', id);
    },
    handleFavorite(id) {
      this.$emit('favorite', id);
    },
    handleEdit(id) {
      this.$emit('edit', id);
    },
    confirmDelete(id) {
      ElMessageBox.confirm(
        'Удалить запись?',
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
        this.$emit('delete', id);
        ElMessage({
          type: 'success',
          message: 'Запись успешно удалена',
        });
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: 'Удаление отменено',
        });
      });
    }
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
  width: 415px;
  max-width: 415px;
  max-height: 135px auto;
}
</style>
