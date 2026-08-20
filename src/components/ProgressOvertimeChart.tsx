import React, { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { CurveType } from 'gifted-charts-core';

import { colors } from '../utils/colors';
import { hp, wp } from '../helpers/responsive';

type ChartPoint = {
  value: number;
};

type ProgressOvertimeChartProps = {
  data: ChartPoint[];
  width?: number;
};

const ChartPointDot = () => (
  <View style={styles.pointOuter}>
    <View style={styles.pointInner} />
  </View>
);

const ProgressOvertimeChart = ({ data, width }: ProgressOvertimeChartProps) => {
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = Math.max((width ?? screenWidth) - wp(24), 280);

  const chartData = useMemo(
    () =>
      data.map(point => ({
        value: point.value,
        customDataPoint: ChartPointDot,
      })),
    [data],
  );

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        areaChart
        // curved
        curveType={CurveType.QUADRATIC}
        color="#C60000"
        startFillColor="#C60000"
        endFillColor="#C60000"
        startOpacity={0.32}
        endOpacity={0.02}
        thickness={2.5}
        hideRules
        hideYAxisText
        hideAxesAndRules
        hideOrigin
        showVerticalLines={false}
        hideDataPoints={false}
        yAxisLabelWidth={0}
        noOfSections={4}
        initialSpacing={14}
        endSpacing={14}
        parentWidth={chartWidth}
        adjustToWidth
        height={hp(194)}
        overflowTop={22}
        overflowBottom={14}
        dataPointsHeight={18}
        dataPointsWidth={18}
        dataPointsRadius={9}
        isAnimated={false}
        xAxisColor="transparent"
        yAxisColor="transparent"
        xAxisThickness={0}
        yAxisThickness={0}
        pointerConfig={{
          pointerStripColor: 'transparent',
          pointerStripWidth: 0,
          activatePointersOnLongPress: false,
          autoAdjustPointerLabelPosition: false,
        }}
      />
    </View>
  );
};

export default ProgressOvertimeChart;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pointOuter: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(9),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(198, 0, 0, 0.18)',
  },
  pointInner: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: '#C60000',
    borderWidth: 2,
    borderColor: colors.white,
  },
});
