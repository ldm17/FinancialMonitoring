import { defineStore } from 'pinia';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

interface Expense {
  id: number;
  idCategory: number;
  amount: number;
  date: string;
  description?: string;
  isIgnoredInCalculation?: boolean;
  isFavorite?: boolean;
  operationType: number;
  walletId: number,
}

export const SortType = {
  ByDateNew: 0,
  ByDateOld: 1,
  ByHighest: 2,
  ByLowest: 3,
  ByHighestIncomes: 4,
  ByLowestIncomes: 5,
};

export const FilterType = {
  NotSelected: 0,
  ByCategories: 1,
  ByRangeOfAmounts: 2,
  ByIgnoredInCalculation: 3,
  ByFavorite: 4,
};

export const GroupType = {
  ByDate: 0,
  ByCategories: 1,
};

interface Note {
  date?: string;
}

export const OperationType = {
  Expenses: 0,
  Incomes: 1,
};

export const WalletType = {
  Cash: 0,
  BankCard: 1,
};

type Category = {
  id: number;
  userId: string;
  name: string;
  operationType: number;
  parentId?: number;
  parent?: Category;
  children?: Category[];
  transactions?: Expense[];
};

const baseUrl = 'http://localhost:5124/api';

export const useFinancialMonitoringStore = defineStore('financialMonitoringStore', {
  state: () => ({
    filtersExpenses: {
      typeSortExpenses: SortType.ByDateNew,
      typeFilterExpenses: FilterType.NotSelected,
      typeGroupExpenses: GroupType.ByDate,
      selectedFilterCategory: '',
      selectedDate: '',
      activeTab: '',
      currentWallet: WalletType.Cash,
    },
    currentPage: 'expenses',
    currentPageTitle: '',
    pageParams: {},
    expenses: [] as Expense[],
    incomes: [] as Expense[],
    categoriesExpenses: [] as Category[],
    categoriesIncomes: [] as Category[],
  }),
  actions: {
    setPage(page: string, params: object) {
      this.currentPage = page;
      this.currentPageTitle = page;
      this.pageParams = params;
    },
    setPageTitle(title: string) {
      this.currentPageTitle = title;
    },
    setPageParams(params: number) {
      this.pageParams = params;
    },
    async fetchNotes(typeOperation: number, currentWallet: number) {
      try {
        const url = `${baseUrl}/transactions?operationType=${typeOperation}&walletId=${currentWallet}`;
        const notesArray = typeOperation === OperationType.Expenses ? 'expenses' : 'incomes';

        const response = await axios.get<Expense[]>(url);

        this[notesArray] = response.data.map((note) => ({
          id: note.id,
          idCategory: note.idCategory,
          amount: note.amount,
          date: format(parseISO(note.date), 'yyyy/MM/dd HH:mm'),
          description: note.description,
          isIgnoredInCalculation: note.isIgnoredInCalculation,
          isFavorite: note.isFavorite,
          operationType: note.operationType,
          walletId: note.walletId,
        }));
      } catch (error) {
        console.error('Ошибка при получении заметок:', error);
      }
    },
    async fetchNote(id: number) {
      try {
        const url = `${baseUrl}/transactions/${id}`;
        const response = await axios.get(url);

        return response.data;
      } catch (error) {
        console.error('Ошибка при загрузке записи:', error);
        return null;
      }
    },
    async fetchCategories(typeOperation: number) {
      try {
        const url = `${baseUrl}/categories/${typeOperation}`;
        const categoriesArray = typeOperation === OperationType.Expenses ? this.categoriesExpenses : this.categoriesIncomes;

        const response = await axios.get<Category[]>(url);
        categoriesArray.splice(0);
        categoriesArray.push(...response.data);

        return true;
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
        return null;
      }
    },
    // eslint-disable-next-line default-param-last
    async addNote(note: Note = {}, typeOperation: number) {
      try {
        const url = `${baseUrl}/transactions`;
        const walletId = this.filtersExpenses.currentWallet;
        const utcDate = note.date ? new Date(note.date).toISOString() : null;

        await axios.post(url, {
          ...note,
          date: utcDate,
        });
        await this.fetchNotes(typeOperation, walletId);
      } catch (error) {
        console.error('Ошибка при добавлении записи:', error);
        return false;
      }

      return true;
    },
    async editNote(updatedExpense: any) {
      try {
        const url = `${baseUrl}/transactions/${updatedExpense.id}`;
        await axios.put(url, updatedExpense);

        return true;
      } catch (error) {
        console.error('Ошибка при редактировании записи:', error);
        return false;
      }
    },
    async deleteExpense(id: number, typeOperation: number) {
      try {
        const walletId = this.filtersExpenses.currentWallet;

        await axios.delete(`${baseUrl}/transactions/${id}`);
        await this.fetchNotes(typeOperation, walletId);
      } catch (error) {
        console.error('Ошибка при удалении записи:', error);
      }
    },
    getCategoryLabelById(id: number, typeOperation: number) {
      const categoriesToUse = typeOperation === OperationType.Expenses ? this.categoriesExpenses : this.categoriesIncomes;

      const findCategory = (categories: Category[]): string | null => {
        let result = null;

        categories.some((category) => {
          if (category.id === id) {
            result = category.name;
            return true;
          }

          if (category.children && category.children.length > 0) {
            result = findCategory(category.children);
            return result !== null;
          }

          return false;
        });

        return result;
      };

      return findCategory(categoriesToUse);
    },
    getItemsByRangeDate(typeOperation: number, startDate: Date, endDate: Date) {
      const notesArray = typeOperation === OperationType.Expenses ? this.expenses : this.incomes;
      const itemsArray = notesArray.filter((item: { date: string }) => {
        const date = new Date(item.date);
        return date >= startDate && date <= endDate;
      });
      return itemsArray;
    },
  },
});

export default {};
