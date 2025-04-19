<template>
  <div>
    <el-scrollbar height="400px" always>
      <el-tree
        style="width: 400px;"
        :data="getCategoryList()"
        default-expand-all
        node-key="id"
        :props="defaultProps"
        @node-click="handleNodeClick"
        :expand-on-click-node="false"
      />
    </el-scrollbar>
  </div>
</template>

<script>
import { OperationType, useFinancialMonitoringStore } from "@/stores/FinancialMonitoringStore";

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
  data() {
    return {
      defaultProps: {
        children: 'children',
        label: 'name',
      },
      OperationType,
    };
  },
  async created() {
    const isSuccessFetchCategories = await this.financialMonitoringStore.fetchCategories(this.typeOperation);

    if (isSuccessFetchCategories === null) {
      ElMessage.error('Не удалось загрузить категории');
    };
  },
  methods: {
    handleNodeClick: function (data) {
      const categoryLabel = this.financialMonitoringStore.categories.get(data.id)?.name;
      this.$emit('category-selected', { id: data.id, label: categoryLabel });
    },
    getCategoryList: function () {
      return Array.from(this.financialMonitoringStore.categories.values()).filter((category) => !category.parentId);
    },
  },
};
</script>
<style lang="scss">
</style>