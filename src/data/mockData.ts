export const mockData = {
  // Группа 1: Клиенты вообще есть?
  clients: {
    total: 1250,
    new: 150,
    churned: 45,
    active: {
      daily: 450,
      weekly: 780,
      monthly: 950
    },
    retention: 75 // процент
  },
  
  // Группа 2: Нравится ли продукт?
  satisfaction: {
    nps: 65, // от -100 до 100
    complaints: 12,
    averageRating: 4.2 // из 5
  },
  
  // Группа 3: Платят ли?
  financials: {
    arpu: 2500, // рублей
    ltv: 15000, // рублей
    churnRate: 3.5 // процент
  },
  
  // Группа 4: Где тормозит?
  growth: {
    conversionRate: 35, // процент
    timeToFirstValue: 2.5, // дней
    topFeatures: [
      { name: 'Поиск недвижимости', usage: 85 },
      { name: 'Онлайн-просмотр', usage: 65 },
      { name: 'Документооборот', usage: 45 }
    ]
  }
}; 