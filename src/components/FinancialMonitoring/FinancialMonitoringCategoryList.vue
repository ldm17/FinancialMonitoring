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
        label: 'label',
      },
      OperationType,
    };
  },
  methods: {
    handleNodeClick: function (data) {
      const categoryLabel = this.financialMonitoringStore.getCategoryLabelById(data.id, this.typeOperation);
      this.$emit('category-selected', { id: data.id, label: categoryLabel });
    },
    getCategoryList: function () {
      if (this.typeOperation === OperationType.Expenses) {
        return this.financialMonitoringStore.categories;
      } else if (this.typeOperation === OperationType.Incomes) {
        return this.financialMonitoringStore.categoriesIncomes;
      }
    },
  },
};
</script>
<style lang="scss">
</style>