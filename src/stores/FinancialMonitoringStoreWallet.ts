import { defineStore } from 'pinia';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
// eslint-disable-next-line import/extensions, import/no-unresolved
import ApiClient from '@/api/ApiClient';
// eslint-disable-next-line import/extensions, import/no-unresolved
import { useFinancialMonitoringStore } from './FinancialMonitoringStore';

interface Note {
  date?: string;
}

type Wallet = {
  id: number;
  userId: number;
  name: string;
  balance: number;
  currency: string;
  createdAt: string;
  description: string;
}

export const useFinancialMonitoringStoreWallet = defineStore('financialMonitoringStoreWallet', {
  state: () => ({
    wallets: [] as Wallet[],
  }),
  actions: {
    async fetchWallets() {
      try {
        const url = '/wallets';

        const response = await ApiClient.get<Wallet[]>(url);

        this.wallets = response.data.map((wallet: any) => ({
          id: wallet.id,
          userId: wallet.userId,
          name: wallet.name,
          balance: wallet.balance,
          currency: wallet.currency,
          createdAt: format(parseISO(wallet.createdAt), 'yyyy/MM/dd HH:mm'),
          description: wallet.description,
        }));

        return true;
      } catch (error) {
        console.error('Ошибка загрузки кошельков:', error);
        return null;
      }
    },
    async fetchWallet(id: number) {
      try {
        const url = `/wallets/${id}`;
        const response = await ApiClient.get(url);

        return response.data;
      } catch (error) {
        console.error('Ошибка при загрузке кошелька:', error);
        return null;
      }
    },
    async addWallet(note: Note = {}) {
      try {
        const url = '/wallets';

        await ApiClient.post(url, {
          ...note,
        });
        await this.fetchWallets();
      } catch (error) {
        console.error('Ошибка при добавлении кошелька:', error);
        return false;
      }

      return true;
    },
    async editWallet(updatedWallet: any) {
      try {
        const url = `/wallets/${updatedWallet.id}`;
        await ApiClient.put(url, updatedWallet);

        return true;
      } catch (error) {
        console.error('Ошибка при редактировании кошелька:', error);
        return false;
      }
    },
    async deleteWallet(id: number) {
      try {
        await ApiClient.delete(`/wallets/${id}`);
        await this.fetchWallets();
      } catch (error) {
        console.error('Ошибка при удалении записи:', error);
      }
    },
    setCurrentWalletId(walletId: number | null) {
      const financialMonitoringStore = useFinancialMonitoringStore();

      const validWalletIds = this.wallets.map((w) => w.id);

      if (walletId && validWalletIds.includes(walletId)) {
        financialMonitoringStore.filtersTransactions.currentWalletId = walletId;
      } else if (this.wallets.length > 0) {
        financialMonitoringStore.filtersTransactions.currentWalletId = this.wallets[0].id;
      } else {
        financialMonitoringStore.filtersTransactions.currentWalletId = 0;
      }
    },
  },
});

export default {};
