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
          @node-click="handleNodeClick"
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
        >
        </el-tree>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
import { OperationType, useFinancialMonitoringStore } from "@/stores/FinancialMonitoringStore";
import { ElMessage } from "element-plus";

export default {
  name: "financial-monitoring-category-list",
  props: {
    typeOperation: {
      type: Number,
      required: true
    }
  },
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();
    return { financialMonitoringStore };
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
  data() {
    return {
      defaultProps: {
        children: 'children',
        label: 'name',
      },
      OperationType,
      filterCategory: '',
    }
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
      const categoryLabel = this.financialMonitoringStore.categories.get(data.id)?.name;
      this.$emit('category-selected', { id: data.id, label: categoryLabel });
      this.filterCategory = '';
    },
    getCategoryList: function () {
      return Array.from(this.financialMonitoringStore.categories.values()).filter((category) => !category.parentId);
    },
    filterNode(value, data) {
      if (!value) {
        return true;
      }
      return data.name.toLowerCase().includes(value);
    },
  },
};
</script>
<style lang="scss">
</style>