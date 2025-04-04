import { defineStore } from 'pinia';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

interface Expense {
  id: number;
  idCategory: number;
  amount: number;
  category: string;
  date: string;
  description?: string;
  isIgnoredInCalculation?: boolean;
  isFavorite?: boolean;
  operationType: number;
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
  label: string;
  children?: Category[];
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
    },
    currentPage: 'expenses',
    currentPageTitle: '',
    pageParams: {},
    expenses: [] as Expense[],
    incomes: [] as Expense[],
    categories: [
      {
        id: 1,
        label: 'Питание',
        children: [
          {
            id: 15,
            label: 'Рестораны',
          },
          {
            id: 16,
            label: 'Кафе',
          },
        ],
      },
      {
        id: 2,
        label: 'Транспорт',
        children: [
          {
            id: 17,
            label: 'Такси',
          },
          {
            id: 18,
            label: 'Топливо',
          },
          {
            id: 19,
            label: 'Обслуживание автомобиля',
          },
        ],
      },
      {
        id: 3,
        label: 'Счета и коммунальные услуги',
        children: [
          {
            id: 20,
            label: 'Счет за телефон',
          },
          {
            id: 21,
            label: 'Счет за воду',
          },
          {
            id: 22,
            label: 'Счет за электроэнергию',
          },
          {
            id: 23,
            label: 'Счет за интернет',
          },
          {
            id: 24,
            label: 'Арендные платы',
          },
        ],
      },
      {
        id: 4,
        label: 'Развлечения и досуг',
        children: [
          {
            id: 25,
            label: 'Кино',
          },
          {
            id: 26,
            label: 'Игры',
          },
          {
            id: 27,
            label: 'Хобби',
          },
        ],
      },
      {
        id: 5,
        label: 'Покупки',
        children: [
          {
            id: 28,
            label: 'Одежда',
          },
          {
            id: 29,
            label: 'Обувь',
          },
          {
            id: 30,
            label: 'Аксессуары',
          },
          {
            id: 31,
            label: 'Электроника',
          },
        ],
      },
      {
        id: 6,
        label: 'Здоровье и фитнесс',
        children: [
          {
            id: 32,
            label: 'Аптека',
          },
          {
            id: 33,
            label: 'Спорт',
          },
          {
            id: 34,
            label: 'Врач',
          },
          {
            id: 35,
            label: 'Личная гигиена',
          },
        ],
      },
      {
        id: 7,
        label: 'Образование',
        children: [
          {
            id: 36,
            label: 'Школьные и университетские взносы',
          },
          {
            id: 37,
            label: 'Учебные материалы',
          },
          {
            id: 38,
            label: 'Курсы и тренинги',
          },
          {
            id: 39,
            label: 'Репетиторы',
          },
        ],
      },
      {
        id: 8,
        label: 'Подарки и пожертвования',
        children: [
          {
            id: 40,
            label: 'Свадьба',
          },
          {
            id: 41,
            label: 'Учебные материалы',
          },
          {
            id: 42,
            label: 'Благотворительность',
          },
          {
            id: 43,
            label: 'Похороны',
          },
        ],
      },
      {
        id: 9,
        label: 'Семья',
        children: [
          {
            id: 44,
            label: 'Дети',
          },
          {
            id: 45,
            label: 'Ремонт',
          },
          {
            id: 46,
            label: 'Домашние расходы',
          },
          {
            id: 47,
            label: 'Домашние животные',
          },
        ],
      },
      {
        id: 10,
        label: 'Путешествия',
      },
      {
        id: 11,
        label: 'Инвестиции',
      },
      {
        id: 12,
        label: 'Налоги и сборы',
      },
      {
        id: 13,
        label: 'Прочие расходы',
      },
      {
        id: 14,
        label: 'Исходящий перевод',
      },
    ] as Category[],
    categoriesIncomes: [
      {
        id: 55,
        label: 'Зарплата',
      },
      {
        id: 56,
        label: 'Премия',
      },
      {
        id: 57,
        label: 'Проценты',
      },
      {
        id: 58,
        label: 'Подарки',
      },
      {
        id: 59,
        label: 'Прочие поступления',
      },
    ] as Category[],
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
    async fetchNotes(typeOperation: number) {
      try {
        const url = `${baseUrl}/transactions?operationType=${typeOperation}`;
        const notesArray = typeOperation === OperationType.Expenses ? 'expenses' : 'incomes';

        const response = await axios.get<Expense[]>(url);

        this[notesArray] = response.data.map((note) => ({
          id: note.id,
          idCategory: note.idCategory,
          amount: note.amount,
          category: note.category,
          date: format(parseISO(note.date), 'yyyy/MM/dd HH:mm'),
          description: note.description,
          isIgnoredInCalculation: note.isIgnoredInCalculation,
          isFavorite: note.isFavorite,
          operationType: note.operationType,
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
    // eslint-disable-next-line default-param-last
    async addNote(note: Note = {}, typeOperation: number) {
      try {
        const url = `${baseUrl}/transactions`;
        const utcDate = note.date ? new Date(note.date).toISOString() : null;

        await axios.post(url, {
          ...note,
          date: utcDate,
        });
        await this.fetchNotes(typeOperation);
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
        console.error('Ошибка при добавлении записи:', error);
        return false;
      }
    },
    async deleteExpense(id: number, typeOperation: number) {
      try {
        await axios.delete(`${baseUrl}/transactions/${id}`);
        await this.fetchNotes(typeOperation);
      } catch (error) {
        console.error('Ошибка при удалении записи:', error);
      }
    },
    getCategoryLabelById(params: number, typeOperation: number) {
      const categoriesToUse = typeOperation === OperationType.Expenses ? this.categories : this.categoriesIncomes;

      const findCategory = (categories: Category[]): string | null => {
        if (categories.length === 0) return null;
        const category = categories[0];
        if (category.id === params) {
          return category.label;
        }
        if (category.children) {
          const foundLabel = findCategory(category.children);
          if (foundLabel) {
            return foundLabel;
          }
        }
        return findCategory(categories.slice(1));
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
