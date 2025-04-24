import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Tooltip as MuiTooltip, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, IconButton, Fab } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { metricsData } from './data/metrics';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

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
  type: 'bar' | 'line';
  data: any[];
  dataKey: string;
  color: string;
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

const initialClientMetrics: Metric[] = [
  {
    title: 'Активные клиенты',
    description: 'Количество клиентов, использующих сервис',
    value: metricsData.activeClients,
    color: '#1976d2',
    calculation: 'Количество уникальных клиентов, совершивших хотя бы одно действие в сервисе за последние 30 дней'
  },
  {
    title: 'Новые клиенты',
    description: 'Количество новых клиентов за период',
    value: metricsData.newClients,
    color: '#2e7d32',
    calculation: 'Количество клиентов, зарегистрировавшихся в сервисе за последние 30 дней'
  },
  {
    title: 'Ушедшие клиенты',
    description: 'Количество клиентов, прекративших использование',
    value: metricsData.churnedClients,
    color: '#d32f2f',
    calculation: 'Количество клиентов, не совершавших действий в сервисе более 30 дней'
  },
  {
    title: 'Удержание клиентов',
    description: 'Процент клиентов, продолжающих использовать сервис',
    value: `${metricsData.retentionRate}%`,
    color: '#9c27b0',
    calculation: '(Количество активных клиентов / Общее количество клиентов) * 100%'
  }
];

const initialFinancialMetrics: Metric[] = [
  {
    title: 'Средний чек',
    description: 'Средняя стоимость заказа',
    value: `${metricsData.averageOrderValue.toLocaleString()} ₽`,
    color: '#ed6c02',
    calculation: 'Общая сумма заказов / Количество заказов'
  },
  {
    title: 'ARPU',
    description: 'Средний доход с одного клиента',
    value: `${metricsData.arpu.toLocaleString()} ₽`,
    color: '#0288d1',
    calculation: 'Общий доход / Количество активных клиентов'
  },
  {
    title: 'LTV',
    description: 'Пожизненная ценность клиента',
    value: `${metricsData.ltv.toLocaleString()} ₽`,
    color: '#7b1fa2',
    calculation: 'ARPU * (1 / Процент оттока)'
  },
  {
    title: 'Процент оттока',
    description: 'Процент клиентов, прекративших использование',
    value: `${metricsData.churnRate}%`,
    color: '#c2185b',
    calculation: '(Количество ушедших клиентов / Общее количество клиентов) * 100%'
  }
];

const initialSatisfactionMetrics: Metric[] = [
  {
    title: 'NPS',
    description: 'Индекс лояльности клиентов',
    value: metricsData.nps,
    color: '#1976d2',
    calculation: 'Процент промоутеров (9-10) - Процент критиков (0-6)'
  },
  {
    title: 'Жалобы',
    description: 'Количество жалоб за период',
    value: metricsData.complaints,
    color: '#d32f2f',
    calculation: 'Количество обращений в поддержку с жалобами за последние 30 дней'
  },
  {
    title: 'Средняя оценка',
    description: 'Средняя оценка сервиса',
    value: `${metricsData.averageRating}/5`,
    color: '#2e7d32',
    calculation: 'Сумма всех оценок / Количество оценок'
  },
  {
    title: 'Time to First Value',
    description: 'Среднее время до получения ценности',
    value: `${metricsData.timeToFirstValue} дн.`,
    color: '#ed6c02',
    calculation: 'Среднее время от регистрации до первого успешного действия'
  }
];

const initialSectionTitles: SectionTitle[] = [
  { id: 'client', title: 'Клиентские метрики' },
  { id: 'financial', title: 'Финансовые метрики' },
  { id: 'satisfaction', title: 'Метрики удовлетворенности' }
];

const initialCharts: Chart[] = [
  {
    id: 'active-clients',
    title: 'Динамика активных клиентов',
    type: 'bar',
    data: metricsData.clientsOverTime,
    dataKey: 'clients',
    color: '#1976d2'
  },
  {
    id: 'new-clients',
    title: 'Динамика новых клиентов',
    type: 'line',
    data: metricsData.clientsOverTime,
    dataKey: 'clients',
    color: '#2e7d32'
  }
];

const defaultMetric: Metric = {
  title: 'Новая метрика',
  description: 'Описание метрики',
  value: 0,
  color: colorPalette[0],
  calculation: 'Формула расчета'
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
    return saved || 'Аналитика PropTech';
  });

  const [editingMetric, setEditingMetric] = useState<EditingMetric | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingDashboardTitle, setEditingDashboardTitle] = useState(false);
  const [addingMetric, setAddingMetric] = useState<{ type: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const [charts, setCharts] = useState<Chart[]>(() => {
    const saved = localStorage.getItem('charts');
    return saved ? JSON.parse(saved) : initialCharts;
  });

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

  const handleAddMetric = (type: string) => {
    setAddingMetric({ type });
    setEditValue(JSON.stringify(defaultMetric));
  };

  const handleDeleteMetric = (index: number, type: string) => {
    switch (type) {
      case 'client':
        setClientMetrics(prev => prev.filter((_, i) => i !== index));
        break;
      case 'financial':
        setFinancialMetrics(prev => prev.filter((_, i) => i !== index));
        break;
      case 'satisfaction':
        setSatisfactionMetrics(prev => prev.filter((_, i) => i !== index));
        break;
    }
  };

  const handleAddChart = () => {
    const newChart: Chart = {
      id: `chart-${Date.now()}`,
      title: 'Новый график',
      type: 'bar',
      data: metricsData.clientsOverTime,
      dataKey: 'clients',
      color: colorPalette[Math.floor(Math.random() * colorPalette.length)]
    };
    setCharts(prev => [...prev, newChart]);
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
    } else if (addingMetric) {
      try {
        const newMetric = JSON.parse(editValue);
        switch (addingMetric.type) {
          case 'client':
            setClientMetrics(prev => [...prev, newMetric]);
            break;
          case 'financial':
            setFinancialMetrics(prev => [...prev, newMetric]);
            break;
          case 'satisfaction':
            setSatisfactionMetrics(prev => [...prev, newMetric]);
            break;
        }
      } catch (e) {
        console.error('Invalid metric data');
      }
      setAddingMetric(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingMetric(null);
    setEditingSection(null);
    setEditingDashboardTitle(false);
    setAddingMetric(null);
  };

  const renderMetricCard = (metric: Metric, index: number, type: string) => (
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
          onClick={() => handleEditClick(metric, index, type, 'calculation')}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteMetric(index, type);
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
                handleEditClick(metric, index, type, 'title');
              }}
              sx={{ cursor: 'pointer' }}
            >
              {metric.title}
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(metric, index, type, 'color');
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
              handleEditClick(metric, index, type, 'description');
            }}
          >
            {metric.description}
          </Typography>
        </Paper>
      </MuiTooltip>
    </Grid>
  );

  const renderSectionTitle = (sectionId: string) => {
    const section = sectionTitles.find(s => s.id === sectionId);
    if (!section) return null;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, mt: 4 }}>
        <Typography 
          variant="h5" 
          component="h2" 
          sx={{ 
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.7
            }
          }}
          onClick={() => handleSectionTitleClick(sectionId)}
        >
          {section.title}
        </Typography>
        <Fab
          size="small"
          color="primary"
          onClick={() => handleAddMetric(sectionId)}
          sx={{ 
            ml: 2,
            width: 32,
            height: 32,
            minHeight: 32,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 2px 4px rgba(0,0,0,0.2)'
            }
          }}
        >
          <AddIcon sx={{ fontSize: 20 }} />
        </Fab>
      </Box>
    );
  };

  const renderChart = (chart: Chart) => (
    <Grid item xs={12} md={6} key={chart.id}>
      <Paper 
        sx={{ 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative'
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
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => handleEditChart(chart.id, 'type')}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              {chart.type === 'bar' ? (
                <Box sx={{ width: 20, height: 20, display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
                  <Box sx={{ width: 4, height: 12, bgcolor: chart.color }} />
                  <Box sx={{ width: 4, height: 16, bgcolor: chart.color }} />
                  <Box sx={{ width: 4, height: 8, bgcolor: chart.color }} />
                </Box>
              ) : (
                <Box sx={{ width: 20, height: 20, position: 'relative' }}>
                  <Box sx={{ 
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    bgcolor: chart.color,
                    transform: 'rotate(-45deg)',
                    transformOrigin: 'bottom left'
                  }} />
                  <Box sx={{ 
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    bgcolor: chart.color,
                    transform: 'rotate(45deg)',
                    transformOrigin: 'bottom right'
                  }} />
                </Box>
              )}
            </IconButton>
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
        </Box>
        <ResponsiveContainer width="100%" height={300}>
          {chart.type === 'bar' ? (
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey={chart.dataKey} fill={chart.color} />
            </BarChart>
          ) : (
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey={chart.dataKey} stroke={chart.color} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </Paper>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
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

      {/* Клиентские метрики */}
      {renderSectionTitle('client')}
      <Grid container spacing={3}>
        {clientMetrics.map((metric, index) => renderMetricCard(metric, index, 'client'))}
      </Grid>

      {/* Финансовые метрики */}
      {renderSectionTitle('financial')}
      <Grid container spacing={3}>
        {financialMetrics.map((metric, index) => renderMetricCard(metric, index, 'financial'))}
      </Grid>

      {/* Метрики удовлетворенности */}
      {renderSectionTitle('satisfaction')}
      <Grid container spacing={3}>
        {satisfactionMetrics.map((metric, index) => renderMetricCard(metric, index, 'satisfaction'))}
      </Grid>

      {/* Графики */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, mt: 4 }}>
        <Typography variant="h5" component="h2">
          Графики
        </Typography>
        <Fab
          size="small"
          color="primary"
          onClick={handleAddChart}
          sx={{ 
            width: 32,
            height: 32,
            minHeight: 32,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 2px 4px rgba(0,0,0,0.2)'
            }
          }}
        >
          <AddIcon sx={{ fontSize: 20 }} />
        </Fab>
      </Box>
      <Grid container spacing={3}>
        {charts.map(chart => renderChart(chart))}
      </Grid>

      {/* Диалог редактирования */}
      <Dialog open={!!editingMetric || !!editingSection || editingDashboardTitle || !!addingMetric} onClose={handleCancelEdit}>
        <DialogTitle>
          {addingMetric ? 'Добавить новую метрику' :
           editingMetric?.type === 'chart' ? 'Редактировать график' :
           editingMetric?.field === 'title' ? 'Редактировать название' : 
           editingMetric?.field === 'color' ? 'Редактировать цвет' : 
           editingMetric?.field === 'calculation' ? 'Редактировать расчет' : 
           editingSection ? 'Редактировать название раздела' :
           editingDashboardTitle ? 'Редактировать название дашборда' :
           'Редактировать описание'}
        </DialogTitle>
        <DialogContent>
          {editingMetric?.type === 'chart' ? (
            <Box sx={{ mt: 2 }}>
              <TextField
                autoFocus
                margin="dense"
                label="Название графика"
                fullWidth
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
              />
              {editingMetric.field === 'type' && (
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant={editValue === 'bar' ? 'contained' : 'outlined'}
                    onClick={() => setEditValue('bar')}
                    startIcon={
                      <Box sx={{ width: 20, height: 20, display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
                        <Box sx={{ width: 4, height: 12, bgcolor: 'currentColor' }} />
                        <Box sx={{ width: 4, height: 16, bgcolor: 'currentColor' }} />
                        <Box sx={{ width: 4, height: 8, bgcolor: 'currentColor' }} />
                      </Box>
                    }
                  >
                    Столбчатый
                  </Button>
                  <Button
                    variant={editValue === 'line' ? 'contained' : 'outlined'}
                    onClick={() => setEditValue('line')}
                    startIcon={
                      <Box sx={{ width: 20, height: 20, position: 'relative' }}>
                        <Box sx={{ 
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: 2,
                          bgcolor: 'currentColor',
                          transform: 'rotate(-45deg)',
                          transformOrigin: 'bottom left'
                        }} />
                        <Box sx={{ 
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: 2,
                          bgcolor: 'currentColor',
                          transform: 'rotate(45deg)',
                          transformOrigin: 'bottom right'
                        }} />
                      </Box>
                    }
                  >
                    Линейный
                  </Button>
                </Box>
              )}
              {editingMetric.field === 'color' && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {colorPalette.map((color) => (
                    <Box
                      key={color}
                      onClick={() => setEditValue(color)}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: color,
                        cursor: 'pointer',
                        border: color === editValue ? '3px solid #000' : 'none',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          ) : editingMetric?.field === 'color' ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {colorPalette.map((color) => (
                <Box
                  key={color}
                  onClick={() => setEditValue(color)}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: color,
                    cursor: 'pointer',
                    border: color === editValue ? '3px solid #000' : 'none',
                    '&:hover': {
                      transform: 'scale(1.1)'
                    }
                  }}
                />
              ))}
            </Box>
          ) : addingMetric ? (
            <Box sx={{ mt: 2 }}>
              <TextField
                autoFocus
                margin="dense"
                label="Название"
                fullWidth
                value={JSON.parse(editValue).title}
                onChange={(e) => {
                  const metric = JSON.parse(editValue);
                  metric.title = e.target.value;
                  setEditValue(JSON.stringify(metric));
                }}
              />
              <TextField
                margin="dense"
                label="Описание"
                fullWidth
                multiline
                rows={2}
                value={JSON.parse(editValue).description}
                onChange={(e) => {
                  const metric = JSON.parse(editValue);
                  metric.description = e.target.value;
                  setEditValue(JSON.stringify(metric));
                }}
              />
              <TextField
                margin="dense"
                label="Значение"
                fullWidth
                value={JSON.parse(editValue).value}
                onChange={(e) => {
                  const metric = JSON.parse(editValue);
                  metric.value = e.target.value;
                  setEditValue(JSON.stringify(metric));
                }}
              />
              <TextField
                margin="dense"
                label="Расчет"
                fullWidth
                multiline
                rows={2}
                value={JSON.parse(editValue).calculation}
                onChange={(e) => {
                  const metric = JSON.parse(editValue);
                  metric.calculation = e.target.value;
                  setEditValue(JSON.stringify(metric));
                }}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {colorPalette.map((color) => (
                  <Box
                    key={color}
                    onClick={() => {
                      const metric = JSON.parse(editValue);
                      metric.color = color;
                      setEditValue(JSON.stringify(metric));
                    }}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: color,
                      cursor: 'pointer',
                      border: color === JSON.parse(editValue).color ? '3px solid #000' : 'none',
                      '&:hover': {
                        transform: 'scale(1.1)'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          ) : (
            <TextField
              autoFocus
              margin="dense"
              label={editingMetric?.field === 'title' ? 'Название' : 
                     editingMetric?.field === 'calculation' ? 'Расчет' : 
                     editingSection ? 'Название раздела' :
                     editingDashboardTitle ? 'Название дашборда' :
                     'Описание'}
              fullWidth
              multiline={editingMetric?.field === 'description' || editingMetric?.field === 'calculation'}
              rows={editingMetric?.field === 'description' || editingMetric?.field === 'calculation' ? 4 : 1}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Отмена</Button>
          <Button onClick={handleSaveEdit} color="primary">
            {addingMetric ? 'Добавить' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default App; 