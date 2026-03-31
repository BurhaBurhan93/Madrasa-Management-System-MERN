/**
 * ECharts Components - Professional Data Visualization
 * Using Apache ECharts for enterprise-grade charts
 */

import React, { useEffect, useRef, useCallback } from 'react';
import * as echarts from 'echarts';
import { theme } from '../../theme';

// Default chart colors from theme
const CHART_COLORS = theme.colors.chart;

/**
 * Initialize ECharts instance
 */
const useECharts = (containerRef, options, onClick) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize chart
    const chart = echarts.init(containerRef.current, null, {
      renderer: 'svg',
    });
    chartRef.current = chart;

    // Set options
    chart.setOption(options);

    // Handle click events
    if (onClick) {
      chart.on('click', onClick);
    }

    // Handle resize
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [containerRef, options, onClick]);

  // Update options when they change
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.setOption(options, true);
    }
  }, [options]);

  return chartRef;
};

/**
 * Base chart container with loading and empty states
 */
const ChartContainer = ({ 
  title, 
  height = 400, 
  loading = false, 
  empty = false,
  emptyText = 'No data available',
  children,
  className = ''
}) => {
  return (
    <div className={`w-full bg-white rounded-2xl shadow-md border border-gray-200 p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      )}
      <div style={{ height }} className="relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : empty ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <p>{emptyText}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

/**
 * Bar Chart Component
 */
export const BarChartComponent = ({ 
  data = [], 
  dataKey = 'value', 
  nameKey = 'name',
  title,
  height = 350,
  loading = false,
  horizontal = false,
  stacked = false,
  showGrid = true,
  color,
  onClick,
  className = ''
}) => {
  const chartRef = useRef(null);

  const isEmpty = !data || data.length === 0;

  const options = useCallback(() => ({
    color: color ? [color] : CHART_COLORS,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: theme.colors.secondary[200],
      borderWidth: 1,
      textStyle: { color: theme.colors.secondary[800] },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: horizontal ? 'value' : 'category',
      data: horizontal ? undefined : data.map(item => item[nameKey]),
      axisLine: { lineStyle: { color: theme.colors.secondary[300] } },
      axisLabel: { 
        color: theme.colors.secondary[600],
        rotate: horizontal ? 0 : 45,
        interval: 0,
      },
    },
    yAxis: {
      type: horizontal ? 'category' : 'value',
      data: horizontal ? data.map(item => item[nameKey]) : undefined,
      axisLine: { lineStyle: { color: theme.colors.secondary[300] } },
      axisLabel: { color: theme.colors.secondary[600] },
      splitLine: showGrid ? {
        lineStyle: { type: 'dashed', color: theme.colors.secondary[200] }
      } : { show: false },
    },
    series: [{
      name: title || 'Value',
      type: 'bar',
      data: data.map(item => item[dataKey]),
      barWidth: '60%',
      itemStyle: {
        borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        }
      },
      animationDuration: 1000,
      animationEasing: 'elasticOut',
    }],
  }), [data, dataKey, nameKey, title, horizontal, showGrid, color]);

  useECharts(chartRef, options(), onClick);

  return (
    <ChartContainer 
      title={title} 
      height={height} 
      loading={loading} 
      empty={isEmpty}
      className={className}
    >
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </ChartContainer>
  );
};

/**
 * Line Chart Component
 */
export const LineChartComponent = ({ 
  data = [], 
  dataKey = 'value', 
  nameKey = 'name',
  title,
  height = 350,
  loading = false,
  showArea = false,
  showGrid = true,
  smooth = true,
  color,
  onClick,
  className = ''
}) => {
  const chartRef = useRef(null);

  const isEmpty = !data || data.length === 0;

  const options = useCallback(() => ({
    color: color ? [color] : CHART_COLORS,
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: theme.colors.secondary[200],
      borderWidth: 1,
      textStyle: { color: theme.colors.secondary[800] },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(item => item[nameKey]),
      axisLine: { lineStyle: { color: theme.colors.secondary[300] } },
      axisLabel: { color: theme.colors.secondary[600] },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: theme.colors.secondary[300] } },
      axisLabel: { color: theme.colors.secondary[600] },
      splitLine: showGrid ? {
        lineStyle: { type: 'dashed', color: theme.colors.secondary[200] }
      } : { show: false },
    },
    series: [{
      name: title || 'Value',
      type: 'line',
      data: data.map(item => item[dataKey]),
      smooth,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { width: 3 },
      itemStyle: { borderWidth: 2, borderColor: '#fff' },
      areaStyle: showArea ? {
        opacity: 0.3,
        gradient: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: CHART_COLORS[0] },
            { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
          ]
        }
      } : undefined,
      emphasis: {
        scale: true,
        focus: 'series',
      },
      animationDuration: 1500,
      animationEasing: 'cubicOut',
    }],
  }), [data, dataKey, nameKey, title, showArea, showGrid, smooth, color]);

  useECharts(chartRef, options(), onClick);

  return (
    <ChartContainer 
      title={title} 
      height={height} 
      loading={loading} 
      empty={isEmpty}
      className={className}
    >
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </ChartContainer>
  );
};

/**
 * Pie Chart Component
 */
export const PieChartComponent = ({ 
  data = [], 
  dataKey = 'value', 
  nameKey = 'name',
  title,
  height = 350,
  loading = false,
  donut = false,
  showLegend = true,
  onClick,
  className = ''
}) => {
  const chartRef = useRef(null);

  const isEmpty = !data || data.length === 0;

  const options = useCallback(() => ({
    color: CHART_COLORS,
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: theme.colors.secondary[200],
      borderWidth: 1,
      textStyle: { color: theme.colors.secondary[800] },
    },
    legend: showLegend ? {
      orient: 'horizontal',
      bottom: 'bottom',
      textStyle: { color: theme.colors.secondary[600] },
    } : { show: false },
    series: [{
      name: title || 'Distribution',
      type: 'pie',
      radius: donut ? ['40%', '70%'] : '70%',
      center: ['50%', '45%'],
      data: data.map(item => ({
        name: item[nameKey],
        value: item[dataKey],
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        }
      },
      label: {
        show: true,
        formatter: '{b}: {d}%',
        color: theme.colors.secondary[700],
      },
      labelLine: {
        lineStyle: { color: theme.colors.secondary[300] },
        smooth: 0.2,
        length: 10,
        length2: 20,
      },
      itemStyle: {
        borderRadius: donut ? 8 : 0,
        borderColor: '#fff',
        borderWidth: 2,
      },
      animationType: 'scale',
      animationEasing: 'elasticOut',
      animationDuration: 1000,
    }],
  }), [data, dataKey, nameKey, title, donut, showLegend]);

  useECharts(chartRef, options(), onClick);

  return (
    <ChartContainer 
      title={title} 
      height={height} 
      loading={loading} 
      empty={isEmpty}
      className={className}
    >
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </ChartContainer>
  );
};

/**
 * Doughnut Chart Component (alias for Pie with donut=true)
 */
export const DoughnutChartComponent = (props) => (
  <PieChartComponent {...props} donut={true} />
);

/**
 * Area Chart Component (alias for Line with showArea=true)
 */
export const AreaChartComponent = (props) => (
  <LineChartComponent {...props} showArea={true} />
);

/**
 * Radar Chart Component
 */
export const RadarChartComponent = ({ 
  data = [], 
  indicators = [],
  title,
  height = 350,
  loading = false,
  onClick,
  className = ''
}) => {
  const chartRef = useRef(null);

  const isEmpty = !data || data.length === 0 || !indicators || indicators.length === 0;

  const options = useCallback(() => ({
    color: CHART_COLORS,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: theme.colors.secondary[200],
      borderWidth: 1,
    },
    radar: {
      indicator: indicators.map(ind => ({
        name: ind.name,
        max: ind.max || 100,
      })),
      shape: 'polygon',
      splitNumber: 5,
      axisName: {
        color: theme.colors.secondary[600],
      },
      splitLine: {
        lineStyle: { color: theme.colors.secondary[200] }
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(59, 130, 246, 0.05)', 'rgba(59, 130, 246, 0.1)']
        }
      },
      axisLine: {
        lineStyle: { color: theme.colors.secondary[300] }
      },
    },
    series: [{
      name: title || 'Metrics',
      type: 'radar',
      data: data,
      areaStyle: { opacity: 0.3 },
      lineStyle: { width: 2 },
      symbol: 'circle',
      symbolSize: 6,
      emphasis: {
        areaStyle: { opacity: 0.5 }
      },
      animationDuration: 1000,
    }],
  }), [data, indicators, title]);

  useECharts(chartRef, options(), onClick);

  return (
    <ChartContainer 
      title={title} 
      height={height} 
      loading={loading} 
      empty={isEmpty}
      className={className}
    >
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </ChartContainer>
  );
};

/**
 * Gauge Chart Component
 */
export const GaugeChartComponent = ({ 
  value = 0,
  min = 0,
  max = 100,
  title,
  height = 350,
  loading = false,
  className = ''
}) => {
  const chartRef = useRef(null);

  const options = {
    series: [{
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      min,
      max,
      splitNumber: 8,
      axisLine: {
        lineStyle: {
          width: 6,
          color: [
            [0.25, theme.colors.error[500]],
            [0.5, theme.colors.warning[500]],
            [0.75, theme.colors.info[500]],
            [1, theme.colors.success[500]]
          ]
        }
      },
      pointer: {
        icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
        length: '12%',
        width: 20,
        offsetCenter: [0, '-60%'],
        itemStyle: { color: 'auto' }
      },
      axisTick: { length: 12, lineStyle: { color: 'auto', width: 2 } },
      splitLine: { length: 20, lineStyle: { color: 'auto', width: 5 } },
      axisLabel: {
        color: theme.colors.secondary[600],
        fontSize: 14,
        distance: -60,
        rotate: 'tangential',
        formatter: (value) => {
          if (value === max || value === min) return value.toString();
          return '';
        }
      },
      title: {
        offsetCenter: [0, '-20%'],
        fontSize: 20,
        color: theme.colors.secondary[800],
      },
      detail: {
        fontSize: 30,
        offsetCenter: [0, '0%'],
        valueAnimation: true,
        formatter: (value) => Math.round(value) + '%',
        color: 'auto'
      },
      data: [{ value, name: title || 'Score' }],
      animationDuration: 1500,
    }]
  };

  useECharts(chartRef, options);

  return (
    <ChartContainer 
      title={title} 
      height={height} 
      loading={loading}
      className={className}
    >
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </ChartContainer>
  );
};

// Export all chart components
export default {
  BarChartComponent,
  LineChartComponent,
  PieChartComponent,
  DoughnutChartComponent,
  AreaChartComponent,
  RadarChartComponent,
  GaugeChartComponent,
};
