import { defineStore } from 'pinia';

type Category = {
  id: number;
  label: string;
  children?: Category[];
};

export const useFinancialMonitoringStore = defineStore('financialMonitoringStore', {
  state: () => ({
    currentPage: 'expenses',
    currentPageTitle: '',
    pageParams: {},
    expenses: [
      {
        id: 2, idCategory: 2, amount: 30, category: 'Недвижимость', date: '2024/07/27', description: '', isIgnoredInCalculation: false, isFavorite: false,
      },
      {
        id: 1, idCategory: 1, amount: 15, category: 'Продукты', date: '2024/07/25', description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates ab deserunt, quia beatae molestias ratione natus repudiandae rem sunt nesciunt laborum maiores aliquam facere minus, impedit blanditiis quisquam atque dolor?', isIgnoredInCalculation: false, isFavorite: false,
      },
      {
        id: 3, idCategory: 1, amount: 10, category: 'Продукты', date: '2024/07/21', description: '', isIgnoredInCalculation: true, isFavorite: true,
      },
      {
        id: 4, idCategory: 3, amount: 50, category: 'Транспорт', date: '2024/08/09', description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit', isIgnoredInCalculation: false, isFavorite: false,
      },
      {
        id: 5, idCategory: 2, amount: 50, category: 'Недвижимость', date: '2024/08/09', description: '', isIgnoredInCalculation: false, isFavorite: false,
      },
      {
        id: 6, idCategory: 1, amount: 70, category: 'Продукты', date: '2024/08/07', description: '', isIgnoredInCalculation: false, isFavorite: false,
      },
      {
        id: 7, idCategory: 3, amount: 40, category: 'Транспорт', date: '2024/09/02', description: '', isIgnoredInCalculation: false, isFavorite: false,
      },
    ],
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
      const notes: object[] = this.expenses;
      notes.push(note);
    },
    deleteExpense(params: number) {
      const indexNote = this.expenses.findIndex((item) => item.id === params);
      this.expenses.splice(indexNote, 1);
    },
    getCategoryLabelById(params: number) {
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
      return findCategory(this.categories);
    },
  },
});

export default {};
