import { defineStore } from 'pinia';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
// eslint-disable-next-line import/extensions, import/no-unresolved
import ApiClient from '@/api/ApiClient';

interface Expense {
  id: number;
  categoryId: number;
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

type Category = {
  id: number;
  userId: number;
  name: string;
  operationType: number;
  parentId?: number;
  children?: Category[];
};

export const useFinancialMonitoringStore = defineStore('financialMonitoringStore', {
  state: () => ({
    filtersTransactions: {
      typeSortTransactions: SortType.ByDateNew,
      typeFilterTransactions: FilterType.NotSelected,
      typeGroupTransactions: GroupType.ByDate,
      selectedFilterCategory: '',
      selectedDate: '',
      activeTab: '',
      currentWalletId: 0,
    },
    currentPageTitle: '',
    pageParams: {},
    expenses: [] as Expense[],
    incomes: [] as Expense[],
    categories: new Map<number, Category>(),
    selectedOperationTypeCategories: OperationType.Expenses,
  }),
  actions: {
    setPage(page: string, params: object) {
      this.currentPageTitle = page;
      this.pageParams = params;
    },
    setPageTitle(title: string) {
      this.currentPageTitle = title;
    },
    setPageParams(params: number) {
      this.pageParams = params;
    },
    async fetchNotes(typeOperation: number, currentWalletId: number) {
      try {
        const url = `/transactions?operationType=${typeOperation}&walletId=${currentWalletId}`;
        const notesArray = typeOperation === OperationType.Expenses ? 'expenses' : 'incomes';

        const response = await ApiClient.get<Expense[]>(url);

        this[notesArray] = response.data.map((note) => ({
          id: note.id,
          categoryId: note.categoryId,
          amount: note.amount,
          date: format(parseISO(note.date), 'yyyy/MM/dd HH:mm'),
          description: note.description,
          isIgnoredInCalculation: note.isIgnoredInCalculation,
          isFavorite: note.isFavorite,
          operationType: note.operationType,
          walletId: note.walletId,
        }));
      } catch (error) {
        console.error('Ошибка при загрузке транзакций:', error);
        throw error;
      }
    },
    async fetchNote(id: number) {
      try {
        const url = `/transactions/${id}`;
        const response = await ApiClient.get(url);

        return response.data;
      } catch (error) {
        console.error('Ошибка при загрузке записи:', error);
        return null;
      }
    },
    // eslint-disable-next-line default-param-last
    async addNote(note: Note = {}, typeOperation: number) {
      try {
        const url = '/transactions';
        const walletId = this.filtersTransactions.currentWalletId;
        const utcDate = note.date ? new Date(note.date).toISOString() : null;

        await ApiClient.post(url, {
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
        const url = `/transactions/${updatedExpense.id}`;
        await ApiClient.put(url, updatedExpense);

        return true;
      } catch (error) {
        console.error('Ошибка при редактировании записи:', error);
        return false;
      }
    },
    async deleteTransaction(id: number, typeOperation: number) {
      try {
        const walletId = this.filtersTransactions.currentWalletId;

        await ApiClient.delete(`/transactions/${id}`);
        await this.fetchNotes(typeOperation, walletId);
      } catch (error) {
        console.error('Ошибка при удалении записи:', error);
      }
    },
    getItemsByRangeDate(typeOperation: number, startDate: Date, endDate: Date) {
      const notesArray = typeOperation === OperationType.Expenses ? this.expenses : this.incomes;
      const itemsArray = notesArray.filter((item: { date: string }) => {
        const date = new Date(item.date);
        return date >= startDate && date <= endDate;
      });
      return itemsArray;
    },
    buildCategoryTree(categories: Category[]): Map<number, Category> {
      const categoryById: Map<number, Category> = new Map();

      categories.forEach((category) => {
        const mutableCategory = { ...category, children: [] };
        categoryById.set(mutableCategory.id, mutableCategory);
      });

      categories.forEach((category) => {
        if (category.parentId == null) {
          return;
        }

        const parentCategory = categoryById.get(category.parentId);
        const childCategory = categoryById.get(category.id);

        if (parentCategory && childCategory) {
          parentCategory.children?.push(childCategory);
        } else {
          console.warn(`Категория с id=${category.id} или её родительская категория с id=${category.parentId} не найдена`);
        }
      });

      return categoryById;
    },
    async fetchCategories(typeOperation: number) {
      try {
        const url = '/categories';

        const response = await ApiClient.get<Category[]>(url);

        const filteredCategories = response.data.filter((category) => category.operationType === typeOperation);

        this.categories = this.buildCategoryTree(filteredCategories);

        return true;
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
        return null;
      }
    },
    async fetchCategory(id: number) {
      try {
        const url = `/categories/${id}`;
        const response = await ApiClient.get(url);

        return response.data;
      } catch (error) {
        console.error('Ошибка при загрузке категории:', error);
        return null;
      }
    },
    async addCategory(newCategory: any) {
      try {
        const url = '/categories';

        const response = await ApiClient.post<Category>(url, newCategory);

        const createdCategory = response.data;

        this.categories.set(createdCategory.id, { ...createdCategory, children: [] });

        if (createdCategory.parentId) {
          const parentCategory = this.categories.get(createdCategory.parentId);
          if (parentCategory && parentCategory.children) {
            parentCategory.children.push(createdCategory);
          }
        }

        return createdCategory;
      } catch (error) {
        console.error('Ошибка при добавлении категории:', error);
        return null;
      }
    },
    async editCategory(updatedCategory: any) {
      try {
        const url = `/categories/${updatedCategory.id}`;
        await ApiClient.put(url, updatedCategory);

        return true;
      } catch (error) {
        console.error('Ошибка при редактировании категории:', error);
        return false;
      }
    },
    async deleteCategory(id: number, typeOperation: number) {
      try {
        await ApiClient.delete(`/categories/${id}`);
        await this.fetchCategories(typeOperation);

        return true;
      } catch (error) {
        console.error('Ошибка при удалении категории:', error);
        return false;
      }
    },
    setSelectedOperationTypeCategories(type: number) {
      this.selectedOperationTypeCategories = type;
      console.log(this.selectedOperationTypeCategories);
    },
  },
});

export default {};
