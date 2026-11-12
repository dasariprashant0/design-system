'use client';
import {forwardRef} from 'react';
import {SeriesChart, type SeriesChartProps} from '../../utils/chart-series';

export interface AreaChartProps extends SeriesChartProps {
  /** Stack series on top of each other so the top edge is the running total. */
  stacked?: boolean;
  /** Mark each data point. A single point is always marked. */
  showPoints?: boolean;
}

/** Area chart in plain SVG: a line chart filled down to zero. The value axis always includes 0. */
export const AreaChart = forwardRef<HTMLDivElement, AreaChartProps>(function AreaChart(props, ref) {
  return <SeriesChart ref={ref} kind="area" {...props} />;
});
