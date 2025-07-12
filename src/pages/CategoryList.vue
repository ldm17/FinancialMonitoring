<template>
  <div>
    <div class="segmented-container">
      <el-segmented v-model="typeOperation" :options="typesOperations" :key="typeOperation" style="width: 400px" />
    </div>

    <div class="filter-category-input">
      <el-input v-model="filterCategory" style="width: 300px" placeholder="Поиск категории" clearable>
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <div>
      <el-scrollbar>
        <el-tree
          ref="categoryListDialog"
          style="width: 400px;"
          :data="getCategoryList()"
          draggable
          default-expand-all
          node-key="id"
          :props="defaultProps"
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
        >
      
        <template #default="{ node, data }">
          <div class="custom-tree-node visible-actions-category">
            <span>{{ node.label }}</span>
            <div>
              <el-button style="margin-left: 4px" type="primary" link @click.stop="openEditCategory(data.id)"><el-icon><EditPen /></el-icon></el-button>
              <el-button style="margin-left: 4px" type="danger" link @click.stop="openDialogConfirmDeleteCategory(data.id)"><el-icon><Delete /></el-icon></el-button>
            </div>
          </div>
        </template>

        </el-tree>
      </el-scrollbar>
    </div>

    <div>
      <el-dialog
        v-model="isConfirmCategoryDeleteDialogVisible"
        title="Подтвердите действие"
        width="500px"
        :before-close="handleCloseCategoryDeleteDialogVisible"
        center
        align-center
        draggable
      >
        <div class="custom-info-delete-category">
          <p>Удалить категорию?</p>
          <el-alert
            title="Вместе с родительской категорией удалятся все её дочерние категории"
            type="info"
            show-icon
            :closable="false"
            style="width: 400px;"
          />
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="handleCloseCategoryDeleteDialogVisible">Отменить</el-button>
            <el-button type="primary" @click="handleDeleteCategory()">
              <el-icon><Delete /></el-icon>
                <span>Удалить</span>
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>

    <div>
      <category-edit
      v-if="isCategoryEditModal"
      :isEditCategory="true"
      :categoryIdToEdit="categoryIdToEdit"
      :typeOperation="typeOperation"
      @close="isCategoryEditModal = false;"
      ></category-edit>
    </div>

  </div>
</template>

<script>
import { OperationType, useFinancialMonitoringStore } from "@/stores/FinancialMonitoringStore";
import { ElMessage, ElMessageBox } from "element-plus";
import CategoryEdit from "./CategoryEdit.vue";

export default {
  name: "category-list-settings",
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();
    return { financialMonitoringStore };
  },
  components: {
    CategoryEdit,
  },
  watch: {
    async typeOperation(newTypeOperation) {
      this.financialMonitoringStore.setSelectedOperationTypeCategories(newTypeOperation);
      await this.handleFetchCategories(newTypeOperation);
    },
    filterCategory: function (value) {
      this.$refs.categoryListDialog.filter(value);
    },
  },
  async created() {
    await this.handleFetchCategories(this.typeOperation);
  },
  data() {
    return {
      defaultProps: {
        children: 'children',
        label: 'name',
      },
      typeOperation: OperationType.Expenses,
      typesOperations: [
        { label: 'Расходы', value: OperationType.Expenses },
        { label: 'Доходы', value: OperationType.Incomes },
      ],
      filterCategory: '',
      isConfirmCategoryDeleteDialogVisible: false,
      categoryIdToDelete: null,
      isCategoryEditModal: false,
      categoryIdToEdit: null,
    }
  },
  methods: {
    async handleFetchCategories(typeOperation) {
      const isSuccessFetchCategories = await this.financialMonitoringStore.fetchCategories(typeOperation);

      if (isSuccessFetchCategories === null) {
        ElMessage.error('Не удалось загрузить категории');
      } else {
        this.getCategoryList();
      }
    },
    getCategoryList: function () {
      return Array.from(this.financialMonitoringStore.categories.values()).filter((category) => !category.parentId);
    },
    openEditCategory: function (id) {
      this.categoryIdToEdit = id;
      this.isCategoryEditModal = true;
    },
    filterNode(value, data) {
      if (!value) {
        return true;
      }
      return data.name.toLowerCase().includes(value);
    },
    openDialogConfirmDeleteCategory: function (id) {
      this.categoryIdToDelete = id;
      this.isConfirmCategoryDeleteDialogVisible = true;
    },
    async handleDeleteCategory() {
      const success = await this.financialMonitoringStore.deleteCategory(this.categoryIdToDelete, this.typeOperation);

      if (success) {
        ElMessage.success('Категория успешно удалена');
        this.handleFetchCategories(this.typeOperation);
      } else {
        ElMessage.error('Не удалось удалить категорию');
      }

      this.isConfirmCategoryDeleteDialogVisible = false;
      this.categoryIdToDelete = null;
    },
    handleCloseCategoryDeleteDialogVisible: function() {
      this.isConfirmCategoryDeleteDialogVisible = false;
      this.categoryIdToDelete = null;

      ElMessage.info('Удаление отменено');
    },
    handleCategoryAdded: function (operationType) {
      if (this.typeOperation !== operationType) {
        this.typeOperation = operationType;
      }
    },
  }
};
</script>

<style lang="scss">
.segmented-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.visible-actions-category .el-button {
  visibility: hidden;
}

.visible-actions-category:hover .el-button {
  visibility: visible;
}

.filter-category-input {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.save-button-container {
  margin-top: 20px;
}

.custom-info-delete-category {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>