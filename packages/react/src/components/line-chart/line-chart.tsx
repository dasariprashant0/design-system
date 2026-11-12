'use client';
import {forwardRef} from 'react';
import {SeriesChart, type SeriesChartProps} from '../../utils/chart-series';

export interface LineChartProps extends SeriesChartProps {
  /** Mark each data point. A single point is always marked. */
  showPoints?: boolean;
}

/** Line chart in plain SVG. Series differ by dash pattern and marker shape as well as colour. The value axis follows the data (it does not have to include 0). */
export const LineChart = forwardRef<HTMLDivElement, LineChartProps>(function LineChart(props, ref) {
  return <SeriesChart ref={ref} kind="line" {...props} />;
});
