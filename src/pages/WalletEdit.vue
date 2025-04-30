<template>
  <div>
    <div>
      <p>{{ $route.params.action === 'new' ? 'Добавление нового кошелька' : 'Редактирование кошелька' }}</p>

      <p>Название</p>
      <el-input v-model="name" style="width: 250px" placeholder="Введите название" clearable></el-input>

      <p>Баланс</p>
      <el-input v-model="balance" style="width: 250px" placeholder="Введите начальный баланс" clearable></el-input>

      <p>Валюта</p>
      <el-select v-model="currency" style="width: 250px"></el-select>

      <p>Примечание</p>
      <el-input v-model="description" style="width: 250px" placeholder="Введите примечание" clearable></el-input>
    </div>

    <div v-if="action === 'new'">
      <p>
        <el-button @click="backToWallets()">Назад</el-button>
        <el-button type="primary" @click="handleAddWallet()" :disabled="checkFieldsWallet()">Добавить</el-button>
      </p>
    </div>

    <div v-if="action === 'edit'">
      <p>
        <el-button @click="backToWallets()">Назад</el-button>
        <el-button type="primary" @click="handleEditWallet()" :disabled="checkFieldsWallet()">Сохранить</el-button>
      </p>
    </div>
  </div>
</template>

<script>
import { useFinancialMonitoringStoreWallet } from "@/stores/FinancialMonitoringStoreWallet";
import { ElMessage } from 'element-plus';

export default {
  name: "wallet-edit-settings",
  props: ['action', 'id'],
  components: {},
  setup() {
    const financialMonitoringStoreWallet = useFinancialMonitoringStoreWallet();
    return { financialMonitoringStoreWallet };
  },
  async created() {
    if (this.action === 'edit') {
      await this.getWallet(this.$route.params.id);
    }
  },
  data() {
    return {
      userId: 0,
      name: '',
      balance: '',
      currency: 'RUB',
      description: '',
    };
  },
  methods: {
    backToWallets: function () {
      this.$router.back();
    },
    checkFieldsWallet: function () {
      return !this.name || !this.balance || !this.currency ? true : false;
    },
    async handleAddWallet () {
      const request = {
        userId: this.userId,
        name: this.name,
        balance: parseFloat(this.balance),
        currency: this.currency,
        description: this.description,
      };

      const isSuccsess = await this.financialMonitoringStoreWallet.addWallet(request);
      
      if (isSuccsess) {
        ElMessage.success('Кошелек успешно добавлен');
        this.backToWallets();
      } else {
        ElMessage.error('Не удалось добавить кошелек');
      }
    },
    async handleEditWallet () {
      const updatedWallet = {
        id: this.$route.params.id,
        userId: this.userId,
        name: this.name,
        balance: parseFloat(this.balance),
        currency: this.currency,
        description: this.description,
      };

      const isSuccsess = await this.financialMonitoringStoreWallet.editWallet(updatedWallet);

      if (isSuccsess) {
        ElMessage.success('Кошелек успешно обновлен');
        this.$router.push({ name: 'wallet-list-settings' });
      } else {
        ElMessage.error('Не удалось обновить кошелек');
      }
    },
    async getWallet (id) {
      const wallet = await this.financialMonitoringStoreWallet.fetchWallet(id);
      
      if (wallet !== null) {
        this.name = wallet.name;
        this.balance = wallet.balance;
        this.currency = wallet.currency;
        this.description = wallet.description;
      } else {
        ElMessage.error('Не удалось загрузить кошелек');
      }
    },
  },
};
</script>