import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { computeChartSeries } from '../../domain/calculations';

function ChartTab({ cars, expenses, ownershipDuration }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  const { months, series } = computeChartSeries(cars, expenses, ownershipDuration);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const chart = echarts.init(containerRef.current);
    chartRef.current = chart;

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) {
      return;
    }

    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: series.map((s) => s.name),
        textStyle: { color: '#ffffff' },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        name: 'Months',
        nameTextStyle: { color: '#ffffff' },
        data: months,
        axisLabel: { color: '#ffffff' },
        axisLine: { lineStyle: { color: '#3c6e71' } },
      },
      yAxis: {
        type: 'value',
        name: 'Total Cost',
        nameTextStyle: { color: '#ffffff' },
        axisLabel: { color: '#ffffff' },
        axisLine: { lineStyle: { color: '#3c6e71' } },
        splitLine: { lineStyle: { color: '#3c6e71', opacity: 0.3 } },
      },
      series: series.map((s) => ({
        name: s.name,
        type: 'line',
        step: s.maintenanceMode === 'historic' ? 'end' : false,
        emphasis: { focus: 'series' },
        data: s.data,
      })),
    }, true);
  }, [months, series]);

  if (!cars || cars.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[#3c6e71]">
        <p>Add a car to see the cost chart.</p>
      </div>
    );
  }

  return <div ref={containerRef} style={{ width: '100%', height: 400 }} />;
}

export default ChartTab;
