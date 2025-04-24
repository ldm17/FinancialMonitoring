<template>
  <div>
    <div class="wallets__card" v-if="financialMonitoringStoreWallet.wallets.length">
      <el-card v-for="wallet in financialMonitoringStoreWallet.wallets" :key="wallet.id" style="margin-bottom: 15px;">
        <div class="visible-actions-note">
          <el-row :gutter="20">
            <el-col :span="16">
              <div>
                {{ wallet.name }}
              </div>
            </el-col>
            <el-col :span="8" style="text-align: right;">
              <div style="color: #409EFF">
                {{ wallet.balance }} <el-tag type="primary" size="small">{{ wallet.currency }}</el-tag>
              </div>
            </el-col>
          </el-row>

          <el-row style="margin-top: 4px;">
            <el-col :span="24">
              <div style="color: #888; font-size: 0.85em;">
                {{ formatDate(wallet.createdAt) }}
              </div>
            </el-col>
          </el-row>

          <el-row style="margin-top: 4px;">
            <el-col v-if="wallet.description" :span="24">
              <div class="description-card" style="color: #888; font-size: 0.85em;">
                {{ wallet.description }}
              </div>
            </el-col>
          </el-row>

          <el-row style="margin-top: 8px;">
            <el-col :span="24" style="text-align: right;">
              <el-button @click.stop="openEditWallet(wallet.id)" size="small">
                <el-icon>
                  <Edit />
                </el-icon>
              </el-button>
              <el-button @click.stop="confirmDeleteWallet(wallet.id)" size="small">
                <el-icon>
                  <Delete />
                </el-icon>
              </el-button>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>
    <div v-else>
      <el-empty description="Нет данных для отображения" />
    </div>
  </div>
</template>

<script>
import { useFinancialMonitoringStoreWallet } from "@/stores/FinancialMonitoringStoreWallet";
import { formatDate } from "@/utils.js";
import { ElMessage, ElMessageBox } from 'element-plus';

export default {
  name: "wallet-list-settings",
  components: {},
  setup() {
    const financialMonitoringStoreWallet = useFinancialMonitoringStoreWallet();
    return { financialMonitoringStoreWallet };
  },
  async created() {
    await this.handleFetchWallets();
  },
  data() {
    return {
      formatDate: formatDate,
    };
  },
  methods: {
    openEditWallet: function (id) {
      this.$router.push({ name: 'wallet-edit-settings', params: { action: 'edit', id: id } });
    },
    confirmDeleteWallet: function (id) {
      ElMessageBox.confirm(
      'Удалить кошелек ?',
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
        ElMessage({
          type: 'success',
          message: 'Кошелек удален',
        })
        this.financialMonitoringStoreWallet.deleteWallet(id);
        this.handleFetchWallets();
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: 'Удаление отменено',
        })
      })
    },
    async handleFetchWallets () {
      const isSuccessFetchWallets = await this.financialMonitoringStoreWallet.fetchWallets();

      if (isSuccessFetchWallets === null) {
        ElMessage.error('Не удалось загрузить кошельки');
      };
    },
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

.wallets__card .el-card {
  width: 415px;
  max-width: 415px;
  max-height: 135px auto;
}
</style>