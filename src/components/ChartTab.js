import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

function num(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function carLabel(car) {
  const parts = [car.brand, car.make].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'Unnamed Car';
}

// Splits a car's expense object into the three timing buckets used by the
// chart: a one-off initial cost (month 0), an annual cost (month 0, 12, 24...)
// and a recurring monthly cost (every month).
function expenseBuckets(e) {
  if (!e) {
    return { initial: 0, annual: 0, monthly: 0 };
  }

  const initial =
    (e.financeType === 'Cash' ? num(e.cash && e.cash.totalAmount) : 0) +
    (e.financeType === 'Loan' ? num(e.loan && e.loan.initialPayment) : 0) +
    (e.financeType === 'Lease' ? num(e.lease && e.lease.initialPayment) : 0);

  const annual =
    num(e.motServicePerYear) +
    (e.taxPeriod === 'year' ? num(e.taxAmount) : 0) +
    (e.insurancePeriod === 'year' ? num(e.insuranceAmount) : 0);

  const monthly =
    num(e.fuelMonthly) +
    (e.financeType === 'Loan' ? num(e.loan && e.loan.monthlyPayment) : 0) +
    (e.financeType === 'Lease' ? num(e.lease && e.lease.monthlyPayment) : 0) +
    (e.taxPeriod === 'month' ? num(e.taxAmount) : 0) +
    (e.insurancePeriod === 'month' ? num(e.insuranceAmount) : 0);

  return { initial, annual, monthly };
}

// Builds the chart data: an array of month indices (0..totalMonths) and one
// series per car holding the cumulative total expense at each month. Nothing is
// evaluated beyond the ownership duration.
function computeChartSeries(cars, expenses, ownershipDuration) {
  const totalMonths = Math.max(0, Math.round(num(ownershipDuration) * 12));
  const months = [];
  for (let m = 0; m <= totalMonths; m += 1) {
    months.push(m);
  }

  const series = (cars || []).map((car) => {
    const { initial, annual, monthly } = expenseBuckets(expenses ? expenses[car.id] : null);
    const data = months.map((m) => {
      const annualOccurrences = Math.floor(m / 12) + 1; // months 0, 12, 24...
      const monthlyOccurrences = m; // one payment per elapsed month
      return initial + annual * annualOccurrences + monthly * monthlyOccurrences;
    });
    return { name: carLabel(car), data };
  });

  return { months, series };
}

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

export { computeChartSeries, expenseBuckets };
export default ChartTab;
