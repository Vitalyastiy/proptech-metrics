export const metricsData = {
  // Клиентские метрики
  activeClients: 1250,
  newClients: 180,
  churnedClients: 45,
  retentionRate: 85.5,
  conversionRate: 15.8,
  
  // Финансовые метрики
  averageOrderValue: 45000,
  arpu: 35000,
  ltv: 420000,
  churnRate: 3.6,
  
  // Метрики удовлетворенности
  nps: 72,
  complaints: 12,
  averageRating: 4.7,
  
  // Метрики роста
  timeToFirstValue: 2.5,
  topFeatures: [
    { name: 'Поиск недвижимости', usage: 85 },
    { name: 'Онлайн-просмотр', usage: 78 },
    { name: 'Документооборот', usage: 65 }
  ],
  
  // Временные ряды
  clientsOverTime: [
    { month: 'Янв', clients: 800 },
    { month: 'Фев', clients: 950 },
    { month: 'Мар', clients: 1100 },
    { month: 'Апр', clients: 1250 },
    { month: 'Май', clients: 1400 },
    { month: 'Июн', clients: 1550 }
  ],
  
  revenueOverTime: [
    { month: 'Янв', revenue: 28000000 },
    { month: 'Фев', revenue: 33250000 },
    { month: 'Мар', revenue: 38500000 },
    { month: 'Апр', revenue: 43750000 },
    { month: 'Май', revenue: 49000000 },
    { month: 'Июн', revenue: 54250000 }
  ]
}; 