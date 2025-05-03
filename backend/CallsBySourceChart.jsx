import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  ToggleButtonGroup, 
  ToggleButton 
} from '@mui/material';
import { format, subDays, subMonths } from 'date-fns';
import BarChartIcon from '@mui/icons-material/BarChart';
import AreaChartIcon from '@mui/icons-material/ShowChart';

const CallsBySourceChart = () => {
  const [chartData, setChartData] = useState({
    series: [],
    categories: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [interval, setInterval] = useState('daily');
  const [chartType, setChartType] = useState('area');

  useEffect(() => {
    fetchCallData();
  }, [timeRange, interval]);

  const fetchCallData = async () => {
    setIsLoading(true);
    
    // Calculate date range based on selected time range
    const now = new Date();
    let fromDate;
    
    switch (timeRange) {
      case '7days':
        fromDate = subDays(now, 7);
        break;
      case '30days':
        fromDate = subDays(now, 30);
        break;
      case '90days':
        fromDate = subDays(now, 90);
        break;
      case '6months':
        fromDate = subMonths(now, 6);
        break;
      case '1year':
        fromDate = subMonths(now, 12);
        break;
      default:
        fromDate = subDays(now, 30);
    }
    
    try {
      const response = await axios.get('/api/voice-ai/calls-by-source', {
        params: {
          from: format(fromDate, 'yyyy-MM-dd'),
          to: format(now, 'yyyy-MM-dd'),
          interval
        }
      });
      
      if (response.data.success) {
        setChartData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching call data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  // ApexCharts options
  const chartOptions = {
    chart: {
      type: chartType,
      height: 350,
      stacked: true,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      zoom: {
        enabled: true
      }
    },
    dataLabels: {
      enabled: chartType === 'bar', // Enable data labels for bar charts
      formatter: function (val) {
        return val > 0 ? val : '';
      }
    },
    stroke: {
      curve: 'smooth',
      width: chartType === 'area' ? 2 : 0
    },
    fill: {
      type: chartType === 'area' ? 'gradient' : 'solid',
      gradient: chartType === 'area' ? {
        opacityFrom: 0.6,
        opacityTo: 0.2
      } : undefined
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right'
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        rotate: -45,
        rotateAlways: false
      }
    },
    colors: ['#4f46e5', '#f97316'], // Indigo for web, orange for phone
    tooltip: {
      y: {
        formatter: (value) => `${value} calls`
      }
    },
    plotOptions: {
      bar: {
        columnWidth: '70%',
        borderRadius: 3
      }
    }
  };

  return (
    <Card elevation={3}>
      <CardHeader 
        title="Calls by Source"
        subheader="Web vs Phone Calls"
        action={
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <FormControl size="small" style={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="7days">Last 7 Days</MenuItem>
                <MenuItem value="30days">Last 30 Days</MenuItem>
                <MenuItem value="90days">Last 90 Days</MenuItem>
                <MenuItem value="6months">Last 6 Months</MenuItem>
                <MenuItem value="1year">Last Year</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" style={{ minWidth: 120 }}>
              <InputLabel>Interval</InputLabel>
              <Select
                value={interval}
                label="Interval"
                onChange={(e) => setInterval(e.target.value)}
              >
                <MenuItem value="hourly">Hourly</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
            
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={handleChartTypeChange}
              size="small"
              aria-label="chart type"
            >
              <ToggleButton value="area" aria-label="area chart">
                <AreaChartIcon />
              </ToggleButton>
              <ToggleButton value="bar" aria-label="bar chart">
                <BarChartIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
        }
      />
      <CardContent>
        {isLoading ? (
          <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Loading chart data...
          </div>
        ) : (
          <ReactApexChart 
            options={chartOptions} 
            series={chartData.series} 
            type={chartType} 
            height={350} 
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CallsBySourceChart; 