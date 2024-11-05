<template>
  <div>
    <div class="expenses__card">
      <el-card style="margin-bottom: 15px;">
          <el-row :gutter="20">
            <el-col :span="12">
              {{ typeGroupExpenses == GroupType.ByDate ? formatDate(group.date) : group.category }}
            </el-col>
            <el-col :span="12" style="text-align: right">
              <span :style="{ color: typeOperation === OperationType.Expenses ? 'red' : 'green' }">{{ typeOperation === OperationType.Expenses ? '-' : '+' }}{{ group.items.reduce((sum, item) => sum + item.amount, 0) }}</span>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <div v-if="typeGroupExpenses == GroupType.ByCategories">
                <span>{{ group.items.length }} {{ getWordByType(group.items.length) }}</span>
                <el-divider style="margin: 5px 0px" />
              </div>
            </el-col>
          </el-row>

          <div class="visible-actions-note" @click="handleOpenInfoNote(item.id)" v-for="(item, index) in group.items" :key="item.id">
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

            <el-divider style="margin: 5px 0px" v-if="index < group.items.length - 1" />
          </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from 'element-plus';
import { OperationType } from "@/stores/FinancialMonitoringStore";

export default {
  name: "financial-monitoring-card",
  props: {
    group: {
      type: Object,
      required: true
    },
    typeGroupExpenses: {
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
          message: 'Запись удалена',
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
