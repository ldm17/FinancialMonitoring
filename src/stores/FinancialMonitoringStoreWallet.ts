import { defineStore } from 'pinia';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

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

const baseUrl = 'http://localhost:5124/api';

export const useFinancialMonitoringStoreWallet = defineStore('financialMonitoringStoreWallet', {
  state: () => ({
    wallets: [] as Wallet[],
  }),
  actions: {
    async fetchWallets() {
      try {
        const url = `${baseUrl}/wallets`;

        const response = await axios.get<Wallet[]>(url);

        this.wallets = response.data.map((wallet) => ({
          id: wallet.id,
          userId: wallet.id,
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
        const url = `${baseUrl}/wallets/${id}`;
        const response = await axios.get(url);

        return response.data;
      } catch (error) {
        console.error('Ошибка при загрузке кошелька:', error);
        return null;
      }
    },
    async addWallet(note: Note = {}) {
      try {
        const url = `${baseUrl}/wallets`;

        await axios.post(url, {
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
        const url = `${baseUrl}/wallets/${updatedWallet.id}`;
        await axios.put(url, updatedWallet);

        return true;
      } catch (error) {
        console.error('Ошибка при редактировании кошелька:', error);
        return false;
      }
    },
    async deleteWallet(id: number) {
      try {
        await axios.delete(`${baseUrl}/wallets/${id}`);
        await this.fetchWallets();
      } catch (error) {
        console.error('Ошибка при удалении записи:', error);
      }
    },
  },
});

export default {};
