import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import Svg, { Polyline, Line, Circle, Text as SvgText, Polygon } from 'react-native-svg';

const { width } = Dimensions.get('window');
const chartPaddingRight = 80; // "고장 임계치" 텍스트를 위한 추가 패딩
const chartWidth = width * 0.9 + chartPaddingRight; // 차트 너비 확장
const chartHeight = chartWidth * 0.6; // 차트 높이는 기존 비율 유지
const padding = 30; // 좌측, 상단 패딩
const graphWidth = chartWidth - padding * 2 - chartPaddingRight; // 그래프 실제 너비 (우측 패딩 고려)
const graphHeight = chartHeight - padding * 2;

// 고장 임계치 (Threshold)
const FAILURE_THRESHOLD = 0.8; // 80%

interface AnomalyScoreHistory {
  date: string; // "YYYY-MM-DD"
  value: number; // 0~1 스케일
}

interface PredictiveInsightData {
  rul_prediction_days: number;
  anomaly_score_history: AnomalyScoreHistory[];
}

interface PredictiveTrendChartProps {
  data: PredictiveInsightData;
}

export const PredictiveTrendChart: React.FC<PredictiveTrendChartProps> = ({ data }) => {
  
  // 날짜 파싱 및 정렬
  const parsedData = data.anomaly_score_history
    .map(d => ({ x: new Date(d.date), y: d.value }))
    .sort((a, b) => a.x.getTime() - b.x.getTime());

  // 현재 시점까지의 데이터 (과거)
  const historicalData = parsedData.filter(d => d.x <= new Date());
  // 미래 예측 데이터 (오늘 이후)
  const futureData = parsedData.filter(d => d.x > new Date());

  // 예측 라인을 위해 과거 데이터의 마지막 점을 미래 데이터의 첫 점으로 추가
  if (historicalData.length > 0 && futureData.length > 0) {
      futureData.unshift(historicalData[historicalData.length - 1]);
  }

  // 스케일 계산
  const minTime = parsedData[0]?.x.getTime() || Date.now() - (29 * 86400000); // 30일 전 기본값
  // 30일 과거 + RUL 예측 기간까지 X축 확장
  const maxTime = minTime + (30 + data.rul_prediction_days) * 86400000;
  const timeRange = maxTime - minTime;

  const getX = (date: Date) => padding + ((date.getTime() - minTime) / timeRange) * graphWidth;
  const getY = (value: number) => padding + graphHeight - (value * graphHeight); // 값은 0~1 가정

  // 포인트 문자열 생성
  const getPoints = (dataset: typeof parsedData) => {
      return dataset.map(d => `${getX(d.x)},${getY(d.y)}`).join(' ');
  };

  const RULColor = data.rul_prediction_days <= 30 ? '#FF3366' : (data.rul_prediction_days <= 90 ? '#FFC800' : '#00E5FF');
  const RULText = data.rul_prediction_days <= 0 ? '수명 종료 임박' : `잔여 수명: ${data.rul_prediction_days}일`;

  // 신뢰 구간 (Confidence Interval) 데이터 생성 (간단한 예시)
  // 과거 데이터의 5% 상하 오차
  const confidenceUpperPoints = parsedData.map(d => `${getX(d.x)},${getY(Math.min(1.0, d.y + 0.05))}`).join(' ');
  const confidenceLowerPoints = parsedData.map(d => `${getX(d.x)},${getY(Math.max(0.0, d.y - 0.05))}`).reverse().join(' '); // 반대로 정렬
  const confidencePolygonPoints = `${confidenceUpperPoints} ${confidenceLowerPoints}`;

  return (
    <View className="items-center p-5">
      <Text className="text-textPrimary text-lg font-bold mb-1">예측 인사이트</Text>
      <Text className="text-sm font-bold mb-4" style={{ color: RULColor }}>{RULText}</Text>

      <Svg width={chartWidth} height={chartHeight}>
        {/* X, Y 축 */}
        <Line x1={padding} y1={padding} x2={padding} y2={padding + graphHeight} stroke="#505050" strokeWidth="1" />
        <Line x1={padding} y1={padding + graphHeight} x2={padding + graphWidth} y2={padding + graphHeight} stroke="#505050" strokeWidth="1" />

        {/* X축 라벨 */}
        <SvgText x={getX(new Date(minTime + timeRange / 2))} y={padding + graphHeight + 20} fill="#F5F5F5" fontSize="10" textAnchor="middle">
          날짜
        </SvgText>
        {/* Y축 라벨 */}
        <SvgText x={padding - 20} y={padding + graphHeight / 2} fill="#F5F5F5" fontSize="10" textAnchor="middle" transform={`rotate(-90, ${padding - 20}, ${padding + graphHeight / 2})`}>
          이상 점수 (%)
        </SvgText>
        
        {/* 임계치 라인 */}
        <Line
            x1={padding}
            y1={getY(FAILURE_THRESHOLD)}
            x2={padding + graphWidth}
            y2={getY(FAILURE_THRESHOLD)}
            stroke="#FF3366"
            strokeWidth="1"
            strokeDasharray="5,5"
        />
        <SvgText
            x={chartWidth - chartPaddingRight - 5}
            y={getY(FAILURE_THRESHOLD) - 5} // 라인 위로 텍스트 이동
            fill="#FF3366"
            fontSize="10"
            textAnchor="end"
            alignmentBaseline="baseline" // 텍스트 기준선을 baseline으로 변경하여 y-5가 상단 기준이 되도록
        >
            고장 임계치
        </SvgText>

        {/* 신뢰 구간 */}
        <Polygon
            points={confidencePolygonPoints}
            fill="#00E5FF" // accentPrimary
            fillOpacity="0.1"
            stroke="none"
        />

        {/* 과거 데이터 라인 (실선) */}
        <Polyline
            points={getPoints(historicalData)}
            fill="none"
            stroke="#00E5FF" // accentPrimary
            strokeWidth="2"
        />

        {/* 예측 데이터 라인 (점선) */}
        <Polyline
            points={getPoints(futureData)}
            fill="none"
            stroke={RULColor}
            strokeWidth="2"
            strokeDasharray="5, 5"
        />

        {/* 현재 시점 포인트 */}
        {historicalData.length > 0 && (
            <Circle
                cx={getX(historicalData[historicalData.length - 1].x)}
                cy={getY(historicalData[historicalData.length - 1].y)}
                r="4"
                fill="#00E5FF" // accentPrimary
            />
        )}

        {/* RUL 예측 지점 (고장 임계치와 만나는 지점) */}
        {data.rul_prediction_days > 0 && (
            <Circle
                cx={getX(new Date(maxTime - data.rul_prediction_days * 86400000))}
                cy={getY(FAILURE_THRESHOLD)}
                r="5"
                fill="#FF3366" // accentDanger
            />
        )}
      </Svg>
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
  rulText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
