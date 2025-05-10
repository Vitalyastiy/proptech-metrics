import React, { useState, useEffect, useRef } from 'react';
import { Container, Grid, Paper, Typography, Tooltip as MuiTooltip, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, IconButton, Chip, Collapse, Drawer, List, ListItem, ListItemText, ListItemIcon, Divider, Tabs, Tab } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { metricsData } from './data/metrics';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import HelpIcon from '@mui/icons-material/Help';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { saveAs } from 'file-saver';
import DescriptionIcon from '@mui/icons-material/Description';
import BusinessIcon from '@mui/icons-material/Business';
import TimelineIcon from '@mui/icons-material/Timeline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SecurityIcon from '@mui/icons-material/Security';
import StorageIcon from '@mui/icons-material/Storage';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SaveIcon from '@mui/icons-material/Save';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Metric {
  title: string;
  description: string;
  value: string | number;
  color: string;
  calculation: string;
}

interface EditingMetric {
  metric: Metric;
  index: number;
  type: string;
  field: 'title' | 'description' | 'color' | 'calculation' | 'type';
}

interface SectionTitle {
  id: string;
  title: string;
}

interface Chart {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'table' | 'area';
  data: any[];
  dataKey: string;
  color: string;
}

interface DashboardLayout {
  id: string;
  title: string;
  clientMetrics: Metric[];
  financialMetrics: Metric[];
  satisfactionMetrics: Metric[];
  charts: Chart[];
  createdAt: string;
  updatedAt: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
  layout: {
    gridSpacing: number;
    cardHeight: number;
    chartHeight: number;
  };
}

interface MetricCategory {
  id: string;
  name: string;
  metrics: Metric[];
}

interface Requirement {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

interface DashboardRequirement {
  id: string;
  title: string;
  description: string;
  category: 'metrics' | 'visualization' | 'integration' | 'security' | 'performance' | 'customization';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  relatedMetrics?: string[];
  isEditing?: boolean;
}

interface CustomTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  cardBackgroundColor: string;
  cardTextColor: string;
  chartColors: string[];
  isDefault?: boolean;
}

interface CustomLayout {
  id: string;
  name: string;
  gridSpacing: number;
  cardHeight: number;
  chartHeight: number;
  isDefault?: boolean;
}

interface Template {
  id: string;
  name: string;
  metrics: Metric[];
  charts: Chart[];
  isDefault?: boolean;
}

const colorPalette = [
  '#1976d2', // blue
  '#2e7d32', // green
  '#d32f2f', // red
  '#9c27b0', // purple
  '#ed6c02', // orange
  '#0288d1', // light blue
  '#7b1fa2', // deep purple
  '#c2185b', // pink
  '#00796b', // teal
  '#5d4037', // brown
  '#455a64', // blue grey
  '#f57c00', // amber
];

const initialClientMetrics: Metric[] = [];

const initialFinancialMetrics: Metric[] = [];

const initialSatisfactionMetrics: Metric[] = [];

const initialSectionTitles: SectionTitle[] = [
  { id: 'client', title: 'Клиентские метрики' },
  { id: 'financial', title: 'Финансовые метрики' },
  { id: 'satisfaction', title: 'Метрики удовлетворенности' }
];

const initialCharts: Chart[] = [
  {
    id: 'projects-over-time',
    title: 'Динамика проектов',
    type: 'line',
    data: [
      { month: 'Янв', active: 35, completed: 28 },
      { month: 'Фев', active: 42, completed: 32 },
      { month: 'Мар', active: 45, completed: 38 }
    ],
    dataKey: 'active',
    color: '#1976d2'
  },
  {
    id: 'customer-satisfaction',
    title: 'Удовлетворенность заказчиков',
    type: 'bar',
    data: [
      { month: 'Янв', satisfaction: 88 },
      { month: 'Фев', satisfaction: 90 },
      { month: 'Мар', satisfaction: 92 }
    ],
    dataKey: 'satisfaction',
    color: '#2e7d32'
  },
  {
    id: 'project-success',
    title: 'Успешность проектов',
    type: 'pie',
    data: [
      { name: 'Успешные', value: 88 },
      { name: 'С задержкой', value: 8 },
      { name: 'Проваленные', value: 4 }
    ],
    dataKey: 'value',
    color: '#9c27b0'
  }
];

const defaultTheme = {
  primaryColor: '#1976d2',
  secondaryColor: '#2e7d32',
  backgroundColor: '#ffffff',
  textColor: '#000000'
};

const defaultLayout = {
  gridSpacing: 3,
  cardHeight: 140,
  chartHeight: 350
};

const predefinedMetrics: { [key: string]: Metric[] } = {
  'Финансовые показатели': [
    {
      title: 'Выручка',
      description: 'Общая выручка компании',
      value: '0',
      color: '#1976d2',
      calculation: 'Сумма всех доходов'
    },
    {
      title: 'Чистая прибыль',
      description: 'Прибыль после всех вычетов',
      value: '0',
      color: '#2e7d32',
      calculation: 'Выручка - Расходы - Налоги'
    },
    {
      title: 'EBITDA',
      description: 'Прибыль до вычета процентов, налогов и амортизации',
      value: '0',
      color: '#ed6c02',
      calculation: 'Операционная прибыль + Амортизация'
    },
    {
      title: 'ROI',
      description: 'Рентабельность инвестиций',
      value: '0',
      color: '#9c27b0',
      calculation: '(Прибыль / Инвестиции) * 100%'
    }
  ],
  'Клиентские метрики': [
    {
      title: 'NPS',
      description: 'Индекс лояльности клиентов',
      value: '0',
      color: '#1976d2',
      calculation: 'Процент промоутеров - Процент критиков'
    },
    {
      title: 'CAC',
      description: 'Стоимость привлечения клиента',
      value: '0',
      color: '#d32f2f',
      calculation: 'Маркетинговые расходы / Новые клиенты'
    },
    {
      title: 'LTV',
      description: 'Пожизненная ценность клиента',
      value: '0',
      color: '#2e7d32',
      calculation: 'Средний чек * Частота покупок * Срок жизни клиента'
    },
    {
      title: 'Churn Rate',
      description: 'Процент оттока клиентов',
      value: '0',
      color: '#ed6c02',
      calculation: '(Ушедшие клиенты / Общее число клиентов) * 100%'
    }
  ],
  'Операционные метрики': [
    {
      title: 'Конверсия',
      description: 'Процент конверсии в продажи',
      value: '0',
      color: '#1976d2',
      calculation: '(Количество продаж / Количество лидов) * 100%'
    },
    {
      title: 'Средний чек',
      description: 'Средняя сумма заказа',
      value: '0',
      color: '#2e7d32',
      calculation: 'Общая выручка / Количество заказов'
    },
    {
      title: 'Время обработки',
      description: 'Среднее время обработки заказа',
      value: '0',
      color: '#ed6c02',
      calculation: 'Общее время обработки / Количество заказов'
    },
    {
      title: 'Эффективность',
      description: 'Эффективность операций',
      value: '0',
      color: '#9c27b0',
      calculation: '(Фактический результат / Плановый результат) * 100%'
    }
  ]
};

const App: React.FC = () => {
  const [clientMetrics, setClientMetrics] = useState<Metric[]>(() => {
    const saved = localStorage.getItem('clientMetrics');
    return saved ? JSON.parse(saved) : initialClientMetrics;
  });

  const [financialMetrics, setFinancialMetrics] = useState<Metric[]>(() => {
    const saved = localStorage.getItem('financialMetrics');
    return saved ? JSON.parse(saved) : initialFinancialMetrics;
  });

  const [satisfactionMetrics, setSatisfactionMetrics] = useState<Metric[]>(() => {
    const saved = localStorage.getItem('satisfactionMetrics');
    return saved ? JSON.parse(saved) : initialSatisfactionMetrics;
  });

  const [sectionTitles, setSectionTitles] = useState<SectionTitle[]>(() => {
    const saved = localStorage.getItem('sectionTitles');
    return saved ? JSON.parse(saved) : initialSectionTitles;
  });

  const [dashboardTitle, setDashboardTitle] = useState(() => {
    const saved = localStorage.getItem('dashboardTitle');
    return saved || 'Аналитика проектов и заказчиков';
  });

  const [editingMetric, setEditingMetric] = useState<EditingMetric | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingDashboardTitle, setEditingDashboardTitle] = useState(false);
  const [editValue, setEditValue] = useState('');

  const [charts, setCharts] = useState<Chart[]>(() => {
    const saved = localStorage.getItem('charts');
    return saved ? JSON.parse(saved) : initialCharts;
  });

  const [isAddingChart, setIsAddingChart] = useState(false);
  const [newChartType, setNewChartType] = useState<'bar' | 'line' | 'pie' | 'table' | 'area'>('bar');

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [currentTheme, setCurrentTheme] = useState(defaultTheme);
  const [currentLayout, setCurrentLayout] = useState(defaultLayout);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const [expandedCategories, setExpandedCategories] = useState<string[]>(['customer']);

  const [metricsData] = useState({
    newClients: '123',
    averageOrderValue: 15000,
    arpu: 2500,
    nps: '75',
    averageRating: 4.8,
    activeProjects: 45,
    completedProjects: 120,
    averageProjectDuration: 3.5,
    customerSatisfaction: 92,
    projectSuccessRate: 88,
    averageResponseTime: 2.4
  });

  const [metricCategories, setMetricCategories] = useState<MetricCategory[]>(() => {
    const saved = localStorage.getItem('metricCategories');
    if (saved) {
      return JSON.parse(saved);
    }
    
    return [
      {
        id: 'customer',
        name: 'Клиентские метрики',
        metrics: [
          {
            title: 'NPS',
            description: 'Индекс лояльности клиентов',
            value: metricsData.nps,
            color: '#1976d2',
            calculation: 'Процент промоутеров (9-10) - Процент критиков (0-6)'
          },
          {
            title: 'Удовлетворенность',
            description: 'Уровень удовлетворенности клиентов',
            value: `${metricsData.customerSatisfaction}%`,
            color: '#2e7d32',
            calculation: 'Средняя оценка по всем проектам'
          },
          {
            title: 'Скорость ответа',
            description: 'Среднее время ответа на запросы',
            value: `${metricsData.averageResponseTime} ч.`,
            color: '#ed6c02',
            calculation: 'Сумма времени ответов / Количество запросов'
          },
          {
            title: 'Новые клиенты',
            description: 'Количество новых клиентов за период',
            value: metricsData.newClients,
            color: '#0288d1',
            calculation: 'Количество клиентов, зарегистрировавшихся в сервисе за последние 30 дней'
          }
        ]
      }
    ];
  });

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [isAddingRequirement, setIsAddingRequirement] = useState(false);
  const [newRequirement, setNewRequirement] = useState<Partial<DashboardRequirement>>({
    title: '',
    description: '',
    category: 'metrics',
    priority: 'medium',
    status: 'pending',
    relatedMetrics: []
  });

  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [dashboardRequirements, setDashboardRequirements] = useState<DashboardRequirement[]>(() => {
    const saved = localStorage.getItem('dashboardRequirements');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        title: 'Требования к метрикам',
        description: 'Добавить метрики: NPS, удовлетворенность клиентов, скорость ответа'
      },
      {
        id: '2',
        title: 'Требования к визуализации',
        description: 'Добавить графики: динамика проектов, удовлетворенность заказчиков'
      }
    ];
  });

  const [editingRequirement, setEditingRequirement] = useState<DashboardRequirement | null>(null);

  const requirementCategories = [
    { 
      id: 'metrics', 
      title: 'Метрики и KPI', 
      icon: <AnalyticsIcon />,
      description: 'Требования к метрикам и показателям эффективности'
    },
    { 
      id: 'visualization', 
      title: 'Визуализация', 
      icon: <DashboardIcon />,
      description: 'Требования к отображению данных и графикам'
    },
    { 
      id: 'integration', 
      title: 'Интеграции', 
      icon: <StorageIcon />,
      description: 'Требования к интеграции с другими системами'
    },
    { 
      id: 'security', 
      title: 'Безопасность', 
      icon: <SecurityIcon />,
      description: 'Требования к безопасности и доступу'
    },
    { 
      id: 'performance', 
      title: 'Производительность', 
      icon: <TimelineIcon />,
      description: 'Требования к скорости загрузки и обновления'
    },
    { 
      id: 'customization', 
      title: 'Настройка', 
      icon: <BusinessIcon />,
      description: 'Требования к настройке и персонализации'
    }
  ];

  const [customThemes, setCustomThemes] = useState<CustomTheme[]>(() => {
    const saved = localStorage.getItem('customThemes');
    return saved ? JSON.parse(saved) : [
      {
        id: 'default',
        name: 'Стандартная',
        primaryColor: '#1976d2',
        secondaryColor: '#2e7d32',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        cardBackgroundColor: '#ffffff',
        cardTextColor: '#000000',
        chartColors: colorPalette,
        isDefault: true
      }
    ];
  });

  const [isThemeDialogOpen, setIsThemeDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<CustomTheme | null>(null);
  const [newTheme, setNewTheme] = useState<Partial<CustomTheme>>({
    name: '',
    primaryColor: '#1976d2',
    secondaryColor: '#2e7d32',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    cardBackgroundColor: '#ffffff',
    cardTextColor: '#000000',
    chartColors: colorPalette
  });

  const [customLayouts, setCustomLayouts] = useState<CustomLayout[]>(() => {
    const saved = localStorage.getItem('customLayouts');
    return saved ? JSON.parse(saved) : [
      {
        id: 'default',
        name: 'Стандартный',
        gridSpacing: 3,
        cardHeight: 140,
        chartHeight: 350,
        isDefault: true
      }
    ];
  });

  const [isLayoutDialogOpen, setIsLayoutDialogOpen] = useState(false);
  const [editingLayout, setEditingLayout] = useState<CustomLayout | null>(null);
  const [newLayout, setNewLayout] = useState<Partial<CustomLayout>>({
    name: '',
    gridSpacing: 3,
    cardHeight: 140,
    chartHeight: 350
  });

  const [templates, setTemplates] = useState<Template[]>(() => {
    const saved = localStorage.getItem('templates');
    return saved ? JSON.parse(saved) : [
      {
        id: 'default',
        name: 'Стандартный',
        metrics: [],
        charts: [],
        isDefault: true
      }
    ];
  });

  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({
    name: '',
    metrics: [],
    charts: []
  });

  const [settingsTab, setSettingsTab] = useState<'themes' | 'layouts' | 'templates'>('themes');

  const [isAddingMetric, setIsAddingMetric] = useState(false);
  const [selectedMetricCategory, setSelectedMetricCategory] = useState<string>('');
  const [selectedMetrics, setSelectedMetrics] = useState<Metric[]>([]);

  const theme = createTheme({
    palette: {
      primary: {
        main: currentTheme.primaryColor,
      },
      secondary: {
        main: currentTheme.secondaryColor,
      },
      background: {
        default: currentTheme.backgroundColor,
      },
      text: {
        primary: currentTheme.textColor,
      },
    },
  });

  const mainContentRef = useRef<HTMLDivElement>(null);
  const rightSidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('clientMetrics', JSON.stringify(clientMetrics));
  }, [clientMetrics]);

  useEffect(() => {
    localStorage.setItem('financialMetrics', JSON.stringify(financialMetrics));
  }, [financialMetrics]);

  useEffect(() => {
    localStorage.setItem('satisfactionMetrics', JSON.stringify(satisfactionMetrics));
  }, [satisfactionMetrics]);

  useEffect(() => {
    localStorage.setItem('sectionTitles', JSON.stringify(sectionTitles));
  }, [sectionTitles]);

  useEffect(() => {
    localStorage.setItem('dashboardTitle', dashboardTitle);
  }, [dashboardTitle]);

  useEffect(() => {
    localStorage.setItem('charts', JSON.stringify(charts));
  }, [charts]);

  useEffect(() => {
    localStorage.setItem('metricCategories', JSON.stringify(metricCategories));
  }, [metricCategories]);

  useEffect(() => {
    localStorage.setItem('expandedCategories', JSON.stringify(expandedCategories));
  }, [expandedCategories]);

  useEffect(() => {
    localStorage.setItem('dashboardRequirements', JSON.stringify(dashboardRequirements));
  }, [dashboardRequirements]);

  useEffect(() => {
    localStorage.setItem('customThemes', JSON.stringify(customThemes));
  }, [customThemes]);

  useEffect(() => {
    localStorage.setItem('customLayouts', JSON.stringify(customLayouts));
  }, [customLayouts]);

  useEffect(() => {
    localStorage.setItem('templates', JSON.stringify(templates));
  }, [templates]);

  const handleEditClick = (metric: Metric, index: number, type: string, field: 'title' | 'description' | 'color' | 'calculation') => {
    setEditingMetric({ metric, index, type, field });
    setEditValue(field === 'color' ? metric.color : field === 'title' ? metric.title : field === 'calculation' ? metric.calculation : metric.description);
  };

  const handleSectionTitleClick = (sectionId: string) => {
    setEditingSection(sectionId);
    const section = sectionTitles.find(s => s.id === sectionId);
    if (section) {
      setEditValue(section.title);
    }
  };

  const handleDeleteMetric = (index: number, categoryId: string) => {
    setMetricCategories(prev => 
      prev.map(category => 
        category.id === categoryId
          ? {
              ...category,
              metrics: category.metrics.filter((_, i) => i !== index)
            }
          : category
      )
    );
  };

  const handleAddNewChart = () => {
    const newChart: Chart = {
      id: `chart-${Date.now()}`,
      title: 'Новый график',
      type: newChartType,
      data: [
        { month: 'Янв', value: 100 },
        { month: 'Фев', value: 120 },
        { month: 'Мар', value: 140 }
      ],
      dataKey: 'value',
      color: colorPalette[Math.floor(Math.random() * colorPalette.length)]
    };
    setCharts(prev => [...prev, newChart]);
    setIsAddingChart(false);
  };

  const handleDeleteChart = (chartId: string) => {
    setCharts(prev => prev.filter(chart => chart.id !== chartId));
  };

  const handleEditChart = (chartId: string, field: 'title' | 'type' | 'color') => {
    const chart = charts.find(c => c.id === chartId);
    if (!chart) return;

    setEditingMetric({
      metric: {
        title: chart.title,
        description: '',
        value: '',
        color: chart.color,
        calculation: chart.type
      },
      index: charts.findIndex(c => c.id === chartId),
      type: 'chart',
      field: field as 'title' | 'description' | 'color' | 'calculation' | 'type'
    });
    setEditValue(field === 'color' ? chart.color : field === 'title' ? chart.title : chart.type);
  };

  const handleSaveEdit = () => {
    if (editingMetric) {
      const { index, type, field } = editingMetric;
      const newValue = editValue;

      if (type === 'chart') {
        const newCharts = [...charts];
        newCharts[index] = {
          ...newCharts[index],
          [field]: newValue
        };
        setCharts(newCharts);
      } else {
        switch (type) {
          case 'client':
            const newClientMetrics = [...clientMetrics];
            newClientMetrics[index] = { ...newClientMetrics[index], [field]: newValue };
            setClientMetrics(newClientMetrics);
            break;
          case 'financial':
            const newFinancialMetrics = [...financialMetrics];
            newFinancialMetrics[index] = { ...newFinancialMetrics[index], [field]: newValue };
            setFinancialMetrics(newFinancialMetrics);
            break;
          case 'satisfaction':
            const newSatisfactionMetrics = [...satisfactionMetrics];
            newSatisfactionMetrics[index] = { ...newSatisfactionMetrics[index], [field]: newValue };
            setSatisfactionMetrics(newSatisfactionMetrics);
            break;
        }
      }
      setEditingMetric(null);
    } else if (editingSection) {
      const newSectionTitles = sectionTitles.map(section => 
        section.id === editingSection ? { ...section, title: editValue } : section
      );
      setSectionTitles(newSectionTitles);
      setEditingSection(null);
    } else if (editingDashboardTitle) {
      setDashboardTitle(editValue);
      setEditingDashboardTitle(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingMetric(null);
    setEditingSection(null);
    setEditingDashboardTitle(false);
  };

  const handleExportLayout = () => {
    const layout: DashboardLayout = {
      id: Date.now().toString(),
      title: dashboardTitle,
      clientMetrics,
      financialMetrics,
      satisfactionMetrics,
      charts,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      theme: currentTheme,
      layout: currentLayout
    };

    const blob = new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' });
    saveAs(blob, `dashboard-layout-${layout.title}.json`);
  };

  const handleImportLayout = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const layout: DashboardLayout = JSON.parse(e.target?.result as string);
          setDashboardTitle(layout.title);
          setClientMetrics(layout.clientMetrics);
          setFinancialMetrics(layout.financialMetrics);
          setSatisfactionMetrics(layout.satisfactionMetrics);
          setCharts(layout.charts);
          setCurrentTheme(layout.theme || defaultTheme);
          setCurrentLayout(layout.layout || defaultLayout);
        } catch (error) {
          console.error('Error parsing layout file:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleToggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newState = prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId];
      return newState;
    });
  };

  const handleAddMetricToCategory = (categoryId: string, metric: Metric) => {
    setMetricCategories(prev => 
      prev.map(category => 
        category.id === categoryId
          ? { ...category, metrics: [...category.metrics, metric] }
          : category
      )
    );
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: MetricCategory = {
        id: `category-${Date.now()}`,
        name: newCategoryName.trim(),
        metrics: []
      };
      setMetricCategories(prev => [...prev, newCategory]);
      setNewCategoryName('');
      setIsCategoryDialogOpen(false);
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    setMetricCategories(prev => prev.filter(category => category.id !== categoryId));
  };

  const handleEditCategory = (categoryId: string, newName: string) => {
    setMetricCategories(prev => 
      prev.map(category => 
        category.id === categoryId
          ? { ...category, name: newName }
          : category
      )
    );
    setEditingCategory(null);
  };

  const handleAddSection = () => {
    if (newSectionName.trim()) {
      const newSection: MetricCategory = {
        id: `section-${Date.now()}`,
        name: newSectionName.trim(),
        metrics: []
      };
      setMetricCategories(prev => [...prev, newSection]);
      setNewSectionName('');
      setIsAddingSection(false);
    }
  };

  const handleDeleteSection = (sectionId: string) => {
    setMetricCategories(prev => prev.filter(section => section.id !== sectionId));
  };

  const handleAddRequirement = () => {
    const newRequirement: DashboardRequirement = {
      id: Date.now().toString(),
      title: 'Новое требование',
      description: 'Опишите требование...',
      category: 'metrics',
      priority: 'medium',
      status: 'pending',
      isEditing: true
    };
    setDashboardRequirements([...dashboardRequirements, newRequirement]);
    setEditingRequirement(newRequirement);
  };

  const handleEditRequirement = (requirement: DashboardRequirement) => {
    setEditingRequirement(requirement);
  };

  const handleSaveRequirement = (requirement: DashboardRequirement) => {
    setDashboardRequirements(prev => 
      prev.map(r => r.id === requirement.id ? { ...requirement, isEditing: false } : r)
    );
    setEditingRequirement(null);
  };

  const handleDeleteRequirement = (id: string) => {
    setDashboardRequirements(prev => prev.filter(r => r.id !== id));
  };

  const handleRequirementChange = (id: string, field: 'title' | 'description', value: string) => {
    setDashboardRequirements(prev =>
      prev.map(r => r.id === id ? { ...r, [field]: value } : r)
    );
  };

  const handleExportToPDF = async () => {
    if (!mainContentRef.current || !rightSidebarRef.current) return;

    try {
      // Создаем новый PDF документ
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Конвертируем основной контент
      const mainCanvas = await html2canvas(mainContentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      // Конвертируем правую панель
      const sidebarCanvas = await html2canvas(rightSidebarRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      // Получаем размеры страницы
      const pageWidth = 210; // A4 ширина в мм
      const pageHeight = 297; // A4 высота в мм
      const margin = 10; // отступы в мм

      // Рассчитываем размеры для основного контента
      const mainImgWidth = pageWidth - (margin * 2);
      const mainImgHeight = (mainCanvas.height * mainImgWidth) / mainCanvas.width;

      // Рассчитываем размеры для боковой панели
      const sidebarImgWidth = pageWidth - (margin * 2);
      const sidebarImgHeight = (sidebarCanvas.height * sidebarImgWidth) / sidebarCanvas.width;

      // Добавляем основной контент
      pdf.addImage(mainCanvas.toDataURL('image/png'), 'PNG', margin, margin, mainImgWidth, mainImgHeight);

      // Если есть место, добавляем боковую панель на той же странице
      if (mainImgHeight + sidebarImgHeight + (margin * 3) <= pageHeight) {
        pdf.addImage(sidebarCanvas.toDataURL('image/png'), 'PNG', margin, mainImgHeight + (margin * 2), sidebarImgWidth, sidebarImgHeight);
      } else {
        // Иначе добавляем на новую страницу
        pdf.addPage();
        pdf.addImage(sidebarCanvas.toDataURL('image/png'), 'PNG', margin, margin, sidebarImgWidth, sidebarImgHeight);
      }

      // Сохраняем PDF
      pdf.save(`dashboard-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleSaveTheme = () => {
    if (editingTheme) {
      setCustomThemes(prev => 
        prev.map(theme => 
          theme.id === editingTheme.id ? { ...editingTheme } : theme
        )
      );
    } else {
      const newThemeWithId: CustomTheme = {
        ...newTheme as CustomTheme,
        id: `theme-${Date.now()}`,
        chartColors: colorPalette
      };
      setCustomThemes(prev => [...prev, newThemeWithId]);
    }
    setIsThemeDialogOpen(false);
    setEditingTheme(null);
    setNewTheme({
      name: '',
      primaryColor: '#1976d2',
      secondaryColor: '#2e7d32',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      cardBackgroundColor: '#ffffff',
      cardTextColor: '#000000',
      chartColors: colorPalette
    });
  };

  const handleApplyTheme = (theme: CustomTheme) => {
    setCurrentTheme({
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      backgroundColor: theme.backgroundColor,
      textColor: theme.textColor
    });
  };

  const handleDeleteTheme = (themeId: string) => {
    setCustomThemes(prev => prev.filter(theme => theme.id !== themeId));
  };

  const handleSaveLayout = () => {
    if (editingLayout) {
      setCustomLayouts(prev => 
        prev.map(layout => 
          layout.id === editingLayout.id ? { ...editingLayout } : layout
        )
      );
    } else {
      const newLayoutWithId: CustomLayout = {
        ...newLayout as CustomLayout,
        id: `layout-${Date.now()}`
      };
      setCustomLayouts(prev => [...prev, newLayoutWithId]);
    }
    setIsLayoutDialogOpen(false);
    setEditingLayout(null);
    setNewLayout({
      name: '',
      gridSpacing: 3,
      cardHeight: 140,
      chartHeight: 350
    });
  };

  const handleApplyLayout = (layout: CustomLayout) => {
    setCurrentLayout({
      gridSpacing: layout.gridSpacing,
      cardHeight: layout.cardHeight,
      chartHeight: layout.chartHeight
    });
  };

  const handleDeleteLayout = (layoutId: string) => {
    setCustomLayouts(prev => prev.filter(layout => layout.id !== layoutId));
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      setTemplates(prev => 
        prev.map(template => 
          template.id === editingTemplate.id ? { ...editingTemplate } : template
        )
      );
    } else {
      const newTemplateWithId: Template = {
        ...newTemplate as Template,
        id: `template-${Date.now()}`
      };
      setTemplates(prev => [...prev, newTemplateWithId]);
    }
    setIsTemplateDialogOpen(false);
    setEditingTemplate(null);
    setNewTemplate({
      name: '',
      metrics: [],
      charts: []
    });
  };

  const handleApplyTemplate = (template: Template) => {
    setClientMetrics(template.metrics);
    setCharts(template.charts);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(template => template.id !== templateId));
  };

  const handleAddMetrics = () => {
    if (selectedMetrics.length > 0) {
      setMetricCategories(prev => 
        prev.map(category => 
          category.id === selectedMetricCategory
            ? { ...category, metrics: [...category.metrics, ...selectedMetrics] }
            : category
        )
      );
      setSelectedMetrics([]);
      setIsAddingMetric(false);
    }
  };

  const renderAddMetricDialog = () => (
    <Dialog 
      open={isAddingMetric} 
      onClose={() => {
        setIsAddingMetric(false);
        setSelectedMetrics([]);
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Добавить метрики</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            select
            label="Категория метрик"
            fullWidth
            value={selectedMetricCategory}
            onChange={(e) => setSelectedMetricCategory(e.target.value)}
            SelectProps={{
              native: true
            }}
          >
            <option value="">Выберите категорию</option>
            {Object.keys(predefinedMetrics).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </TextField>
          
          {selectedMetricCategory && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Доступные метрики
              </Typography>
              <Grid container spacing={2}>
                {predefinedMetrics[selectedMetricCategory].map((metric, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        bgcolor: selectedMetrics.includes(metric) ? 'action.selected' : 'background.paper',
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                      onClick={() => {
                        setSelectedMetrics(prev => 
                          prev.includes(metric)
                            ? prev.filter(m => m !== metric)
                            : [...prev, metric]
                        );
                      }}
                    >
                      <Typography variant="subtitle1">{metric.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {metric.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => {
            setIsAddingMetric(false);
            setSelectedMetrics([]);
          }}
        >
          Отмена
        </Button>
        <Button 
          onClick={handleAddMetrics}
          color="primary"
          disabled={selectedMetrics.length === 0}
        >
          Добавить выбранные метрики
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderCategoryDialog = () => (
    <Dialog open={isCategoryDialogOpen} onClose={() => setIsCategoryDialogOpen(false)}>
      <DialogTitle>Управление категориями</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Создать новую категорию
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Название категории"
              />
              <Button
                variant="contained"
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
              >
                Добавить
              </Button>
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Существующие категории
            </Typography>
            {metricCategories.map(category => (
              <Box
                key={category.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1,
                  mb: 1,
                  bgcolor: 'background.paper',
                  borderRadius: 1
                }}
              >
                {editingCategory === category.id ? (
                  <TextField
                    size="small"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onBlur={() => handleEditCategory(category.id, newCategoryName)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleEditCategory(category.id, newCategoryName);
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <Typography>{category.name}</Typography>
                )}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditingCategory(category.id);
                      setNewCategoryName(category.name);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsCategoryDialogOpen(false)}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );

  const renderMetricCard = (metric: Metric, index: number, categoryId: string) => (
    <Grid item xs={12} sm={6} md={3} key={metric.title}>
      <MuiTooltip 
        title={
          <Box>
            <Typography variant="body2">{metric.description}</Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
              {metric.calculation}
            </Typography>
          </Box>
        } 
        placement="top"
      >
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 140,
            bgcolor: metric.color,
            color: 'white',
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.9,
              '& .delete-button': {
                opacity: 1
              }
            },
            position: 'relative'
          }}
          onClick={() => handleEditClick(metric, index, categoryId, 'calculation')}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteMetric(index, categoryId);
            }}
            className="delete-button"
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              color: 'white',
              opacity: 0,
              transition: 'opacity 0.2s',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography 
              component="h2" 
              variant="h6" 
              gutterBottom
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(metric, index, categoryId, 'title');
              }}
              sx={{ cursor: 'pointer' }}
            >
              {metric.title}
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(metric, index, categoryId, 'color');
              }}
              sx={{ 
                color: 'white',
                opacity: 0.7,
                '&:hover': {
                  opacity: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: '2px solid white',
                  backgroundColor: metric.color
                }}
              />
            </IconButton>
          </Box>
          <Typography component="p" variant="h4">
            {metric.value}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ mt: 1, cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(metric, index, categoryId, 'description');
            }}
          >
            {metric.description}
          </Typography>
        </Paper>
      </MuiTooltip>
    </Grid>
  );

  const renderChart = (chart: Chart) => {
    const renderChartContent = (): React.ReactElement => {
      switch (chart.type) {
        case 'bar':
          return (
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey={chart.dataKey} fill={chart.color} />
            </BarChart>
          );
        case 'line':
          return (
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey={chart.dataKey} stroke={chart.color} />
            </LineChart>
          );
        case 'pie':
          return (
            <PieChart>
              <Pie
                data={chart.data}
                dataKey={chart.dataKey}
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill={chart.color}
                label
              >
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          );
        case 'area':
          return (
            <AreaChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey={chart.dataKey} stroke={chart.color} fill={chart.color} fillOpacity={0.3} />
            </AreaChart>
          );
        default:
          return <BarChart data={[]}><Bar dataKey="empty" fill="none" /></BarChart>;
      }
    };

    return (
      <Grid item xs={12} sm={6} md={4} key={chart.id}>
        <Paper 
          sx={{ 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column',
            position: 'relative',
            height: '100%',
            minHeight: 400
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography 
              component="h2" 
              variant="h6" 
              color="primary"
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.7
                }
              }}
              onClick={() => handleEditChart(chart.id, 'title')}
            >
              {chart.title}
            </Typography>
            <IconButton
              size="small"
              onClick={() => handleDeleteChart(chart.id)}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              {renderChartContent()}
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>
    );
  };

  const renderTopBar = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <IconButton
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        sx={{ mr: 2 }}
      >
        <MenuIcon />
      </IconButton>
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.7
          }
        }}
        onClick={() => {
          setEditingDashboardTitle(true);
          setEditValue(dashboardTitle);
        }}
      >
        {dashboardTitle}
      </Typography>
      <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
        <IconButton
          onClick={() => setIsCategoryDialogOpen(true)}
          color="primary"
          title="Управление категориями"
        >
          <EditIcon />
        </IconButton>
        <IconButton
          onClick={() => setIsSettingsOpen(true)}
          color="primary"
          title="Настройки"
        >
          <SettingsIcon />
        </IconButton>
        <IconButton
          onClick={handleExportLayout}
          color="primary"
          title="Экспорт макета"
        >
          <DownloadIcon />
        </IconButton>
        <IconButton
          onClick={handleExportToPDF}
          color="primary"
          title="Экспорт в PDF"
        >
          <PictureAsPdfIcon />
        </IconButton>
        <label>
          <input
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImportLayout}
          />
          <IconButton
            component="span"
            color="primary"
            title="Импорт макета"
          >
            <UploadIcon />
          </IconButton>
        </label>
        <IconButton
          onClick={() => setIsHelpOpen(true)}
          color="primary"
          title="Помощь"
        >
          <HelpIcon />
        </IconButton>
      </Box>
    </Box>
  );

  const renderMetricCategories = () => (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Разделы KPI
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsAddingMetric(true)}
          >
            Добавить метрики
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setIsAddingSection(true)}
          >
            Добавить раздел
          </Button>
        </Box>
      </Box>

      {metricCategories.map(category => (
        <Box key={category.id} sx={{ mb: 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 1
            }}
          >
            <Typography variant="h6">{category.name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  const newMetric: Metric = {
                    title: 'Новая метрика',
                    description: 'Описание метрики',
                    value: '0',
                    color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
                    calculation: 'Формула расчета'
                  };
                  handleAddMetricToCategory(category.id, newMetric);
                }}
              >
                Добавить KPI
              </Button>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSection(category.id);
                }}
                sx={{ color: 'error.main' }}
              >
                <DeleteIcon />
              </IconButton>
              <Chip 
                label={`${category.metrics.length} метрик`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
          </Box>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {category.metrics.map((metric, index) => renderMetricCard(metric, index, category.id))}
          </Grid>
        </Box>
      ))}

      {/* Диалог добавления нового раздела */}
      <Dialog open={isAddingSection} onClose={() => setIsAddingSection(false)}>
        <DialogTitle>Добавить новый раздел</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название раздела"
            fullWidth
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddingSection(false)}>Отмена</Button>
          <Button onClick={handleAddSection} color="primary" disabled={!newSectionName.trim()}>
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

  const renderAddRequirementDialog = () => (
    <Dialog open={isAddingRequirement} onClose={() => setIsAddingRequirement(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Добавить требование к дашборду</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Название требования"
          fullWidth
          value={newRequirement.title}
          onChange={(e) => setNewRequirement({ ...newRequirement, title: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Описание"
          fullWidth
          multiline
          rows={4}
          value={newRequirement.description}
          onChange={(e) => setNewRequirement({ ...newRequirement, description: e.target.value })}
          placeholder="Подробно опишите требование к дашборду..."
        />
        <TextField
          select
          margin="dense"
          label="Категория"
          fullWidth
          value={newRequirement.category}
          onChange={(e) => setNewRequirement({ ...newRequirement, category: e.target.value as DashboardRequirement['category'] })}
          SelectProps={{
            native: true
          }}
        >
          {requirementCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.title}
            </option>
          ))}
        </TextField>
        <TextField
          select
          margin="dense"
          label="Приоритет"
          fullWidth
          value={newRequirement.priority}
          onChange={(e) => setNewRequirement({ ...newRequirement, priority: e.target.value as 'low' | 'medium' | 'high' })}
          SelectProps={{
            native: true
          }}
        >
          <option value="low">Низкий</option>
          <option value="medium">Средний</option>
          <option value="high">Высокий</option>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsAddingRequirement(false)}>Отмена</Button>
        <Button onClick={handleAddRequirement} variant="contained">
          Добавить
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderRightSidebar = () => (
    <Drawer
      variant="permanent"
      anchor="right"
      sx={{
        width: 320,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 320,
          boxSizing: 'border-box',
          mt: '64px',
          height: 'calc(100% - 64px)',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Требования к дашборду
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          fullWidth
          sx={{ mb: 2 }}
          onClick={handleAddRequirement}
        >
          Добавить требование
        </Button>
      </Box>
      <Divider />
      <List>
        {dashboardRequirements.map((requirement) => (
          <ListItem
            key={requirement.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              mb: 2,
              p: 2
            }}
          >
            <Paper sx={{ p: 2, width: '100%' }}>
              {requirement.isEditing ? (
                <>
                  <TextField
                    fullWidth
                    value={requirement.title}
                    onChange={(e) => handleRequirementChange(requirement.id, 'title', e.target.value)}
                    margin="dense"
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    value={requirement.description}
                    onChange={(e) => handleRequirementChange(requirement.id, 'description', e.target.value)}
                    margin="dense"
                    multiline
                    rows={3}
                    variant="outlined"
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleSaveRequirement(requirement)}
                    >
                      <SaveIcon />
                    </IconButton>
                  </Box>
                </>
              ) : (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" gutterBottom>
                      {requirement.title}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleEditRequirement(requirement)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteRequirement(requirement.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {requirement.description}
                  </Typography>
                </>
              )}
            </Paper>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );

  const renderThemeDialog = () => (
    <Dialog 
      open={isThemeDialogOpen} 
      onClose={() => {
        setIsThemeDialogOpen(false);
        setEditingTheme(null);
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {editingTheme ? 'Редактировать тему' : 'Создать новую тему'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Название темы"
            fullWidth
            value={editingTheme?.name || newTheme.name}
            onChange={(e) => {
              if (editingTheme) {
                setEditingTheme({ ...editingTheme, name: e.target.value });
              } else {
                setNewTheme({ ...newTheme, name: e.target.value });
              }
            }}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Основной цвет"
                type="color"
                fullWidth
                value={editingTheme?.primaryColor || newTheme.primaryColor}
                onChange={(e) => {
                  if (editingTheme) {
                    setEditingTheme({ ...editingTheme, primaryColor: e.target.value });
                  } else {
                    setNewTheme({ ...newTheme, primaryColor: e.target.value });
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Дополнительный цвет"
                type="color"
                fullWidth
                value={editingTheme?.secondaryColor || newTheme.secondaryColor}
                onChange={(e) => {
                  if (editingTheme) {
                    setEditingTheme({ ...editingTheme, secondaryColor: e.target.value });
                  } else {
                    setNewTheme({ ...newTheme, secondaryColor: e.target.value });
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Цвет фона"
                type="color"
                fullWidth
                value={editingTheme?.backgroundColor || newTheme.backgroundColor}
                onChange={(e) => {
                  if (editingTheme) {
                    setEditingTheme({ ...editingTheme, backgroundColor: e.target.value });
                  } else {
                    setNewTheme({ ...newTheme, backgroundColor: e.target.value });
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Цвет текста"
                type="color"
                fullWidth
                value={editingTheme?.textColor || newTheme.textColor}
                onChange={(e) => {
                  if (editingTheme) {
                    setEditingTheme({ ...editingTheme, textColor: e.target.value });
                  } else {
                    setNewTheme({ ...newTheme, textColor: e.target.value });
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Цвет фона карточек"
                type="color"
                fullWidth
                value={editingTheme?.cardBackgroundColor || newTheme.cardBackgroundColor}
                onChange={(e) => {
                  if (editingTheme) {
                    setEditingTheme({ ...editingTheme, cardBackgroundColor: e.target.value });
                  } else {
                    setNewTheme({ ...newTheme, cardBackgroundColor: e.target.value });
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Цвет текста карточек"
                type="color"
                fullWidth
                value={editingTheme?.cardTextColor || newTheme.cardTextColor}
                onChange={(e) => {
                  if (editingTheme) {
                    setEditingTheme({ ...editingTheme, cardTextColor: e.target.value });
                  } else {
                    setNewTheme({ ...newTheme, cardTextColor: e.target.value });
                  }
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {
          setIsThemeDialogOpen(false);
          setEditingTheme(null);
        }}>
          Отмена
        </Button>
        <Button onClick={handleSaveTheme} color="primary">
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderSettingsDialog = () => (
    <Dialog
      open={isSettingsOpen}
      onClose={() => setIsSettingsOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Настройки</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={settingsTab}
            onChange={(_, newValue) => setSettingsTab(newValue)}
            aria-label="settings tabs"
          >
            <Tab label="Темы" value="themes" />
            <Tab label="Макеты" value="layouts" />
            <Tab label="Шаблоны" value="templates" />
          </Tabs>
        </Box>
        <Box sx={{ mt: 2 }}>
          {settingsTab === 'themes' && (
            <>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingTheme(null);
                  setIsThemeDialogOpen(true);
                }}
                sx={{ mb: 2 }}
              >
                Создать новую тему
              </Button>
              <Grid container spacing={2}>
                {customThemes.map((theme) => (
                  <Grid item xs={12} sm={6} md={4} key={theme.id}>
                    <Paper
                      sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: 3
                        }
                      }}
                      onClick={() => handleApplyTheme(theme)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">{theme.name}</Typography>
                        {!theme.isDefault && (
                          <Box>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTheme(theme);
                                setIsThemeDialogOpen(true);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTheme(theme.id);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: theme.primaryColor
                          }}
                        />
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: theme.secondaryColor
                          }}
                        />
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: theme.backgroundColor,
                            border: '1px solid #ccc'
                          }}
                        />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
          {settingsTab === 'layouts' && (
            <>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingLayout(null);
                  setIsLayoutDialogOpen(true);
                }}
                sx={{ mb: 2 }}
              >
                Создать новый макет
              </Button>
              <Grid container spacing={2}>
                {customLayouts.map((layout) => (
                  <Grid item xs={12} sm={6} md={4} key={layout.id}>
                    <Paper
                      sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: 3
                        }
                      }}
                      onClick={() => handleApplyLayout(layout)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">{layout.name}</Typography>
                        {!layout.isDefault && (
                          <Box>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingLayout(layout);
                                setIsLayoutDialogOpen(true);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLayout(layout.id);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                      <Typography variant="body2">
                        Отступ: {layout.gridSpacing}px
                      </Typography>
                      <Typography variant="body2">
                        Высота карточек: {layout.cardHeight}px
                      </Typography>
                      <Typography variant="body2">
                        Высота графиков: {layout.chartHeight}px
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
          {settingsTab === 'templates' && (
            <>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingTemplate(null);
                  setIsTemplateDialogOpen(true);
                }}
                sx={{ mb: 2 }}
              >
                Создать новый шаблон
              </Button>
              <Grid container spacing={2}>
                {templates.map((template) => (
                  <Grid item xs={12} sm={6} md={4} key={template.id}>
                    <Paper
                      sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: 3
                        }
                      }}
                      onClick={() => handleApplyTemplate(template)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">{template.name}</Typography>
                        {!template.isDefault && (
                          <Box>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTemplate(template);
                                setIsTemplateDialogOpen(true);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTemplate(template.id);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                      <Typography variant="body2">
                        Метрики: {template.metrics.length}
                      </Typography>
                      <Typography variant="body2">
                        Графики: {template.charts.length}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsSettingsOpen(false)}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );

  const renderAddChartDialog = () => (
    <Dialog open={isAddingChart} onClose={() => setIsAddingChart(false)}>
      <DialogTitle>Добавить новый график</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            select
            label="Тип графика"
            fullWidth
            value={newChartType}
            onChange={(e) => setNewChartType(e.target.value as 'bar' | 'line' | 'pie' | 'table' | 'area')}
            SelectProps={{
              native: true
            }}
          >
            <option value="bar">Столбчатый</option>
            <option value="line">Линейный</option>
            <option value="pie">Круговой</option>
            <option value="area">Областной</option>
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsAddingChart(false)}>Отмена</Button>
        <Button onClick={handleAddNewChart} color="primary">
          Добавить
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderEditDialog = () => (
    <Dialog open={!!editingMetric} onClose={handleCancelEdit}>
      <DialogTitle>
        {editingMetric?.field === 'title' ? 'Изменить название' :
         editingMetric?.field === 'description' ? 'Изменить описание' :
         editingMetric?.field === 'color' ? 'Изменить цвет' :
         editingMetric?.field === 'calculation' ? 'Изменить формулу' :
         'Редактировать'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {editingMetric?.field === 'color' ? (
            <TextField
              type="color"
              fullWidth
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
          ) : (
            <TextField
              fullWidth
              multiline={editingMetric?.field === 'description'}
              rows={editingMetric?.field === 'description' ? 4 : 1}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelEdit}>Отмена</Button>
        <Button onClick={handleSaveEdit} color="primary">
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <Box
          component="main"
          ref={mainContentRef}
          sx={{
            flexGrow: 1,
            ml: isSidebarOpen ? '320px' : 0,
            mr: isRightSidebarOpen ? '320px' : 0,
            transition: 'margin 0.3s ease-in-out',
            backgroundColor: currentTheme.backgroundColor,
            color: currentTheme.textColor
          }}
        >
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {renderTopBar()}
            {renderMetricCategories()}
            {/* Графики */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, mt: 4 }}>
              <Typography variant="h5" component="h2">
                Графики
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {charts.map(chart => renderChart(chart))}
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsAddingChart(true)}
              >
                Добавить график
              </Button>
            </Box>
          </Container>
        </Box>
        <Box ref={rightSidebarRef}>
          {renderRightSidebar()}
        </Box>
      </Box>
      {renderThemeDialog()}
      {renderSettingsDialog()}
      {renderAddChartDialog()}
      {renderEditDialog()}
      {renderAddMetricDialog()}
    </ThemeProvider>
  );
};

export default App; 