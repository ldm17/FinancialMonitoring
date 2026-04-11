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
          :allow-drop="allowDrop"
          @node-drop="handleDrop"
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
        close-on-press-escape
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
      <category-form-modal
        v-if="isCategoryAddModalVisible"
        :isAddCategory="true"
        @close="isCategoryAddModalVisible = false"
        @category-added="handleCategoryAdded"
      >
      </category-form-modal>
    </div>

    <div>
      <category-form-modal
      v-if="isCategoryFormModal"
      :isEditCategory="true"
      :categoryIdToEdit="categoryIdToEdit"
      :typeOperation="typeOperation"
      @close="isCategoryFormModal = false;"
      >
      </category-form-modal>
    </div>

  </div>
</template>

<script>
import { OperationType, useFinancialMonitoringStore } from "@/stores/FinancialMonitoringStore";
import { ElMessage } from "element-plus";
import CategoryFormModal from "./CategoryFormModal.vue";

export default {
  name: "category-list-settings",
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();
    return { financialMonitoringStore };
  },
  components: {
    CategoryFormModal,
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
  mounted() {
    this.financialMonitoringStore.setHeaderButtonHandler(this.handleAddCategoryButtonClick);
  },
  unmounted() {
    this.financialMonitoringStore.resetHeaderButtonHandler();
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
      isCategoryFormModal: false,
      categoryIdToEdit: null,
      isCategoryAddModalVisible: false,
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
      return Array.from(this.financialMonitoringStore.categories.values())
        .filter((category) => !category.parentId)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    },
    openEditCategory: function (id) {
      this.categoryIdToEdit = id;
      this.isCategoryFormModal = true;
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
    handleAddCategoryButtonClick() {
      this.isCategoryAddModalVisible = true;
    },
    allowDrop(draggingNode, dropNode) {
      if (draggingNode.data.id === dropNode.data.id) return false;
      if (this.isDescendant(dropNode.data.id, draggingNode.data.id)) return false;
      return true;
    },
    isDescendant(nodeId, targetId) {
      const node = this.financialMonitoringStore.categories.get(nodeId);
      if (!node || !node.children) return false;
      for (const child of node.children) {
        if (child.id === targetId) return true;
        if (this.isDescendant(child.id, targetId)) return true;
      }
      return false;
    },
    async handleDrop(draggingNode, dropNode, position) {
      const dropNodeId = dropNode.data.id;
      const newParentId = position === 'inner' ? dropNode.data.id : dropNode.parent?.data?.id ?? null;

      const success = await this.financialMonitoringStore.updateCategory(
        draggingNode.data.id,
        newParentId,
        position,
        dropNodeId
      );

      if (success) {
        await this.handleFetchCategories(this.typeOperation);
        ElMessage.success('Категория успешно перемещена');
      } else {
        ElMessage.error('Не удалось переместить категорию');
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