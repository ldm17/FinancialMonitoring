<template>
  <div>
    <div class="category-edit-container">
      <el-dialog v-if="$route.name === 'category-edit-settings'"
        v-model="isCategoryEditDialogVisible"
        :title="dialogTitle"
        width="500"
        center
        align-center
        @close="backToCategories"
      >
        <div class="category-edit-modal-content">
          <div class="form-group">
            <label>Название категории</label>
            <el-input style="width: 250px" v-model="name" placeholder="Введите название категории" clearable />
          </div>

          <div v-if="action !== 'edit'" class="form-group">
            <label>Тип категории</label>
            <el-select v-model="typeOperation" style="width: 250px">
              <el-option :value="OperationType.Expenses" label="Расход"></el-option>
              <el-option :value="OperationType.Incomes" label="Доход"></el-option>
            </el-select>
          </div>

          <div class="form-group">
            <el-switch v-model="isChildren" active-text="Дочерняя" inactive-text="Родительская" />
          </div>
          
          <div v-if="isChildren" class="form-group">
            <label>Выберите родительскую категорию</label>
            <el-input class="custom-el-input" style="width: 250px" v-model="parentCategoryName" @click="openCategoryModal()" placeholder="Родительская категория" readonly>
              <template #suffix>
                <el-icon><ArrowDown /></el-icon>
              </template>
            </el-input>
          </div>

          <div v-if="action === 'new'" class="category-edit-button-container">
            <el-button @click="backToCategories()">Назад</el-button>
            <el-button type="primary" @click="handleAddCategory()" :disabled="checkFieldsCategory()">Добавить</el-button>
          </div>

          <div v-if="action === 'edit'" class="category-edit-button-container">
              <el-button @click="backToCategories()">Назад</el-button>
              <el-button type="primary" @click="handleEditCategory()" :disabled="checkFieldsCategory()">Сохранить</el-button>
          </div>

        </div>

        <el-dialog v-model="isOpenModalCategoryList" title="Выберите категорию" width="500" center align-center>
          <financial-monitoring-category-list
          :typeOperation="modalTypeOperation"
          @category-selected="onCategorySelected">
          </financial-monitoring-category-list>
        </el-dialog>

      </el-dialog>
    </div>
  </div>
</template>

<script>
import { OperationType, useFinancialMonitoringStore } from '@/stores/FinancialMonitoringStore';
import { ElMessage } from 'element-plus';
import FinancialMonitoringCategoryList from '@/components/FinancialMonitoring/FinancialMonitoringCategoryList.vue';

export default {
  name: "category-edit-settings",
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();
    return { financialMonitoringStore };
  },
  components: {
    FinancialMonitoringCategoryList,
  },
  props: ['type', 'action', 'id'],
  watch: {
    isChildren(newVal) {
      if (!newVal) {
        this.parentId = null;
        this.parentCategoryName = '';
      }
    }
  },
  async created() {
    this.typeOperation = Number(this.type) || this.financialMonitoringStore.selectedOperationTypeCategories;

    if (this.action === 'edit') {
      await this.getCategory(this.$route.params.id);
    }
  },
  computed: {
    dialogTitle: function () {
      return this.action === 'new' ? 'Добавление новой категории' : 'Редактирование категории';
    }
  },
  data() {
    return {
      userId: 0,
      name: '',
      typeOperation: OperationType.Expenses,
      isChildren: false,
      OperationType,
      isCategoryEditDialogVisible: true,
      parentId: null,
      isOpenModalCategoryList: false,
      modalTypeOperation: null,
      parentCategoryName: '',
    }
  },
  methods: {
    backToCategories: function () {
      this.$router.back();
    },
    checkFieldsCategory: function () {
      if (this.isChildren && !this.parentCategoryName) {
        return true;
      }

      return !this.name ? true : false;
    },
    async handleAddCategory () {
      const newCategory = {
        userId: this.userId,
        name: this.name,
        operationType: this.typeOperation,
        parentId: this.isChildren ? this.parentId : null,
      };
 
      const isSuccsess = await this.financialMonitoringStore.addCategory(newCategory);
      
      if (isSuccsess) {
        ElMessage.success('Категория успешно добавлена');
        this.$emit('category-added', this.typeOperation);
        this.$router.back();
        await this.financialMonitoringStore.fetchCategories(this.typeOperation);
      } else {
        ElMessage.error('Не удалось добавить категорию');
      }
    },
    async handleEditCategory () {
      const updatedCategory = {
        id: this.$route.params.id,
        userId: this.userId,
        name: this.name,
        parentId: this.parentId,
      };

      const isSuccsess = await this.financialMonitoringStore.editCategory(updatedCategory);

      if (isSuccsess) {
        ElMessage.success('Категория успешно обновлена');
        this.$router.push({ name: 'category-list-settings' });
        this.financialMonitoringStore.fetchCategories(this.typeOperation);
      } else {
        ElMessage.error('Не удалось обновить категорию');
      }
    },
    async getCategory (id) {
      const category = await this.financialMonitoringStore.fetchCategory(id);

      if (category !== null) {
        this.name = category.name;
        this.isChildren = category.parentId !== null;

        if (this.isChildren && category.parentId) {
          const parentCategory = await this.financialMonitoringStore.fetchCategory(category.parentId);
          this.parentCategoryName = parentCategory?.name || '';
          this.parentId = category.parentId;
        }
      } else {
        ElMessage.error('Не удалось загрузить категорию');
      }
    },
    onCategorySelected: function (category) {
      this.parentId = category.id;
      this.parentCategoryName = category.label;
      this.isOpenModalCategoryList = false;
    },
    openCategoryModal: function() {
      this.modalTypeOperation = this.typeOperation;
      this.isOpenModalCategoryList = true;
    }
  },
};
</script>

<style land="scss">
.category-edit-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.category-edit-modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.form-group label {
  margin-bottom: 8px;
  width: 250px;
  text-align: left;
}

.category-edit-button-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 20px;
}

.custom-el-input .el-input__inner {
  cursor: pointer;
}
</style>