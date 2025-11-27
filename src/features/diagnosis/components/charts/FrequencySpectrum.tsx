import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');
const chartWidth = width * 0.9;
const chartHeight = chartWidth * 0.6;
const padding = 30;
const graphWidth = chartWidth - padding * 2;
const graphHeight = chartHeight - padding * 2;

interface DetectedPeak {
  hz: number;
  amp: number;
  match: boolean;
  label?: string;
}

interface FrequencyAnalysisData {
  bpfo_frequency: number;
  detected_peaks: DetectedPeak[];
  diagnosis: string;
}

interface FrequencySpectrumProps {
  data: FrequencyAnalysisData;
}

export const FrequencySpectrum: React.FC<FrequencySpectrumProps> = ({ data }) => {
  
  // 데이터 정렬 (주파수 순)
  const sortedPeaks = [...data.detected_peaks].sort((a, b) => a.hz - b.hz);

  // X축 스케일 (최대 주파수 기준)
  const maxHz = Math.max(...sortedPeaks.map(p => p.hz), 500) * 1.1;
  
  // Y축 스케일 (최대 진폭 기준)
  const maxAmp = Math.max(...sortedPeaks.map(p => p.amp)) * 1.2; // 20% 여유

  const getX = (hz: number) => padding + (hz / maxHz) * graphWidth;
  const getY = (amp: number) => padding + graphHeight - (amp / maxAmp) * graphHeight;

  // 하모닉 커서 데이터 (예시: 1x RPM, 2x RPM)
  const harmonicCursors = [
      { hz: 60, label: '1x RPM', color: '#00E5FF' }, // Example for 60Hz power frequency
      { hz: 120, label: '2x RPM', color: '#00E5FF' },
      { hz: data.bpfo_frequency, label: 'BPFO', color: '#FF3366' } // BPFO Frequency
  ].filter(cursor => cursor.hz > 0); // 0Hz는 제외


  return (
    <View className="items-center p-5">
      <Text className="text-textPrimary text-lg font-bold mb-1">주파수 정밀 분석</Text>
      <Text className="text-textSecondary text-sm mb-4 text-center">{data.diagnosis}</Text>

      <Svg width={chartWidth} height={chartHeight}>
        {/* 그라데이션 정의 */}
        <Defs>
          <LinearGradient id="barGradientNormal" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#00E5FF" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#00E5FF" stopOpacity="0.2" />
          </LinearGradient>
          <LinearGradient id="barGradientCritical" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FF3366" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#FF3366" stopOpacity="0.2" />
          </LinearGradient>
        </Defs>

        {/* X, Y 축 */}
        <Line x1={padding} y1={padding} x2={padding} y2={padding + graphHeight} stroke="#505050" strokeWidth="1" />
        <Line x1={padding} y1={padding + graphHeight} x2={padding + graphWidth} y2={padding + graphHeight} stroke="#505050" strokeWidth="1" />

        {/* X축 라벨 */}
        <SvgText x={padding + graphWidth / 2} y={padding + graphHeight + 20} fill="#F5F5F5" fontSize="10" textAnchor="middle">
          주파수 (Hz)
        </SvgText>
        {/* Y축 라벨 */}
        <SvgText x={padding - 20} y={padding + graphHeight / 2} fill="#F5F5F5" fontSize="10" textAnchor="middle" transform={`rotate(-90, ${padding - 20}, ${padding + graphHeight / 2})`}>
          진폭
        </SvgText>

        {/* 데이터 바 */}
        {sortedPeaks.map((peak, i) => {
          const x = getX(peak.hz);
          const y = getY(peak.amp);
          const barHeight = (padding + graphHeight) - y;
          const gradientId = peak.match ? 'barGradientCritical' : 'barGradientNormal';

          return (
            <React.Fragment key={i}>
              <Rect
                x={x - 5}
                y={y}
                width={10}
                height={barHeight}
                fill={`url(#${gradientId})`}
                opacity={0.8}
              />
              {/* 라벨 */}
              <SvgText
                x={x}
                y={y - 5}
                fill="#F5F5F5"
                fontSize="8"
                textAnchor="middle"
              >
                {peak.label}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* 하모닉 커서 */}
        {harmonicCursors.map((cursor, i) => {
          const x = getX(cursor.hz);
          if (x < padding || x > padding + graphWidth) return null; // 차트 범위 밖이면 그리지 않음

          return (
            <React.Fragment key={`cursor-${i}`}>
              <Line
                x1={x}
                y1={padding}
                x2={x}
                y2={padding + graphHeight}
                stroke={cursor.color}
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <SvgText
                x={x}
                y={padding - 5}
                fill={cursor.color}
                fontSize="8"
                textAnchor="middle"
              >
                {cursor.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>

      {data.detected_peaks.some(p => p.match) && (
        <View className="mt-4 px-3 py-2 rounded-lg bg-red-900/20 border border-accentDanger">
          <Text className="text-accentDanger font-bold text-xs">
            {data.diagnosis}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  diagnosis: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
});