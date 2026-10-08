<template>
  <div>
    <div class="filter-category-input">
      <el-input v-model="filterCategory" style="width: 300px" placeholder="Поиск категории" clearable>
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <div>
      <el-scrollbar height="400px" always>
        <el-tree
          ref="categoryListDialog"
          style="width: 400px;"
          :data="getCategoryList()"
          draggable
          default-expand-all
          node-key="id"
          :props="defaultProps"
          @node-drag-start="handleDragStart"
          @node-drag-end="handleDragEnd"
          @node-click="handleNodeClick"
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
          :allow-drop="allowDrop"
        >
          <template #default="{ node, data }">
            <div :class="{ 'is-disabled-category': isCategoryDisabled(data.id) || (draggingNodeId && data.id !== draggingNodeId && getAncestorIds(draggingNodeId).has(data.id)) }" style="width: 100%; height: 100%; display: flex; align-items: center;">
              {{ node.label }}
            </div>
          </template>
        </el-tree>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
import { OperationType, useFinancialMonitoringStore } from "@/stores/FinancialMonitoringStore";
import { ElMessage } from "element-plus";

export default {
  name: "category-list-modal",
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();
    return { financialMonitoringStore };
  },
  props: {
    typeOperation: {
      type: Number,
      required: true
    },
    excludeId: {
      type: Number,
      required: false,
      default: null
    }
  },
  data() {
    return {
      defaultProps: {
        children: 'children',
        label: 'name',
      },
      OperationType,
      filterCategory: '',
      draggingNodeId: null,
    }
  },
  async created() {
    await this.loadCategories(this.typeOperation);
  },
  watch: {
    typeOperation(newTypeOperation) {
      this.loadCategories(newTypeOperation);
    },
    filterCategory: function (value) {
      this.$refs.categoryListDialog.filter(value);
    },
  },
  methods: {
    async loadCategories(typeOperation) {
      const isSuccessFetchCategories = await this.financialMonitoringStore.fetchCategories(typeOperation);

      if (isSuccessFetchCategories === null) {
        ElMessage.error('Не удалось загрузить категории');
      } else {
        this.getCategoryList();
      }
    },
    handleNodeClick: function (data) {
      if (this.isCategoryDisabled(data.id)) {
        return;
      }
      const categoryLabel = this.financialMonitoringStore.categories.get(data.id)?.name;
      this.$emit('category-selected', { id: data.id, label: categoryLabel });
      this.filterCategory = '';
    },
    allowDrop(draggingNode, dropNode) {
      if (this.isCategoryDisabled(dropNode.data.id)) {
        return false;
      }
      if (this.draggingNodeId && this.isChildOf(this.draggingNodeId, dropNode.data.id)) {
        return false;
      }
      if (this.draggingNodeId && this.isAncestorOf(this.draggingNodeId, dropNode.data.id)) {
        return false;
      }
      return true;
    },
    handleDragStart(node) {
      this.draggingNodeId = node.data.id;
    },
    handleDragEnd() {
      this.draggingNodeId = null;
    },
    isDraggingOrDescendant(dataId) {
      if (!this.draggingNodeId) return false;
      return dataId === this.draggingNodeId || this.isChildOf(this.draggingNodeId, dataId);
    },
    isChildOf(parentId, childId) {
      const parent = this.financialMonitoringStore.categories.get(parentId);
      if (!parent || !parent.children) return false;
      for (const child of parent.children) {
        if (child.id === childId) return true;
        if (this.isChildOf(child.id, childId)) return true;
      }
      return false;
    },
    isAncestorOf(childId, ancestorId) {
      const child = this.financialMonitoringStore.categories.get(childId);
      if (!child || !child.parentId) return false;
      if (child.parentId === ancestorId) return true;
      return this.isAncestorOf(child.parentId, ancestorId);
    },
    getAncestorIds(nodeId) {
      const ancestors = new Set();
      let current = this.financialMonitoringStore.categories.get(nodeId);
      while (current && current.parentId) {
        ancestors.add(current.parentId);
        current = this.financialMonitoringStore.categories.get(current.parentId);
      }
      return ancestors;
    },
    isCategoryDisabled(categoryId) {
      if (!this.excludeId) return false;
      return categoryId === this.excludeId || this.isChildOf(this.excludeId, categoryId);
    },
    getCategoryList() {
      return Array.from(this.financialMonitoringStore.categories.values()).filter((category) => !category.parentId);
    },
    filterNode(value, data) {
      if (!value) {
        return true;
      }
      return data.name.toLowerCase().includes(value.toLowerCase());
    },
  },
};
</script>
<style lang="scss">
.is-disabled-category {
  color: #909399;
}
</style>