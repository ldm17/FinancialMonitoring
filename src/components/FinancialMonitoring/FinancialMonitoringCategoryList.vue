<template>
  <el-scrollbar height="400px" always>
    <el-tree
      style="width: 400px;"
      :data="financialMonitoringStore.categories"
      default-expand-all
      node-key="id"
      :props="defaultProps"
      @node-click="handleNodeClick"
      :expand-on-click-node="false"
    />
  </el-scrollbar>
</template>

<script>
import { useFinancialMonitoringStore } from "@/stores/FinancialMonitoringStore";

export default {
  name: "financial-monitoring-category-list",
  setup() {
    const financialMonitoringStore = useFinancialMonitoringStore();
    return { financialMonitoringStore };
  },
  data() {
    return {
      // selectedCategory: '',
      defaultProps: {
        children: 'children',
        label: 'label',
      },
    };
  },
  methods: {
    handleNodeClick(data) {
      // this.selectedCategory = data;
      // this.financialMonitoringStore.setPage('addNote', {
      //   title: 'Добавление раcхода',
      // });

      const categoryLabel = this.financialMonitoringStore.getCategoryLabelById(data.id);
      this.$emit('category-selected', { id: data.id, label: categoryLabel });
    },
  },
};
</script>
<style lang="scss">
</style>