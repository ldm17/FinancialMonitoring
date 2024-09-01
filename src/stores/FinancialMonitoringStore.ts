import { defineStore } from 'pinia';

export const useFinancialMonitoringStore = defineStore('financialMonitoringStore', {
  state: () => ({
    currentPage: 'expenses',
    currentPageTitle: '',
    pageParams: {},
    expenses: [
      {
        id: 2, idCategory: 2, amount: 30, category: 'Недвижимость', date: '2024/07/27 00:00', description: '', isIgnoredInCalculation: false, isFavorite: false,
      },
      {
        id: 1, idCategory: 1, amount: 15, category: 'Продукты', date: '2024/07/25 00:00', description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates ab deserunt, quia beatae molestias ratione natus repudiandae rem sunt nesciunt laborum maiores aliquam facere minus, impedit blanditiis quisquam atque dolor?', isIgnoredInCalculation: false, isFavorite: false,
      },
      {
        id: 3, idCategory: 1, amount: 10, category: 'Продукты', date: '2024/07/21 00:00', description: '', isIgnoredInCalculation: true, isFavorite: true,
      },
      {
        id: 4, idCategory: 3, amount: 50, category: 'Транспорт', date: '2024/08/09 12:00', description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit', isIgnoredInCalculation: false, isFavorite: false,
      },
      {
        id: 5, idCategory: 2, amount: 50, category: 'Недвижимость', date: '2024/08/09 15:00', description: '', isIgnoredInCalculation: false, isFavorite: false,
      },
      {
        id: 6, idCategory: 1, amount: 70, category: 'Продукты', date: '2024/08/07 00:00', description: '', isIgnoredInCalculation: false, isFavorite: false,
      },
      {
        id: 7, idCategory: 3, amount: 40, category: 'Транспорт', date: '2024/09/02 00:59', description: '', isIgnoredInCalculation: false, isFavorite: false,
      },
    ],
    categories: [
      {
        id: 1,
        category: 'Продукты',
      },
      {
        id: 2,
        category: 'Недвижимость',
      },
      {
        id: 3,
        category: 'Транспорт',
      },
    ],
  }),
  actions: {
    setPage(page: string, params = {}) {
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
    addNote(note = {}) {
      const notes : object[] = this.expenses;
      notes.push(note);
    },
    deleteExpense(params: number) {
      const indexNote = this.expenses.findIndex((item) => item.id === params);
      this.expenses.splice(indexNote, 1);
    },
  },
});

export default {};
