import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');
const chartSize = width * 0.7;
const center = chartSize / 2;
const radius = chartSize / 2 - 40; // 패딩 고려

interface VotingResult {
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  score: number;
}

interface EnsembleAnalysisData {
  consensus_score: number;
  voting_result: {
    [modelName: string]: VotingResult;
  };
  status?: {
      current_state?: 'NORMAL' | 'WARNING' | 'CRITICAL';
  }
}

interface EnsembleRadarProps {
  data: EnsembleAnalysisData;
}

export const EnsembleRadar: React.FC<EnsembleRadarProps> = ({ data }) => {
  // [DEBUG] Radar Chart 수신 데이터 확인
  console.log('[EnsembleRadar] Data prop:', JSON.stringify(data, null, 2));

  const modelNames = data.voting_result ? Object.keys(data.voting_result) : []; 
  const numModels = modelNames.length || 1; // 0으로 나누기 방지
  
  const getStatusColor = (status: 'NORMAL' | 'WARNING' | 'CRITICAL' | undefined) => {
    switch (status) {
      case 'NORMAL': return '#00E5FF'; // accentPrimary
      case 'WARNING': return '#FFC800'; // accentWarning
      case 'CRITICAL': return '#FF3366'; // accentDanger
      default: return '#A0A0A0'; // textSecondary
    }
  };

  const primaryColor = getStatusColor(data.status?.current_state);

  // 5각형 좌표 계산 함수 (값은 0~1 스케일)
  const getCoordinates = (value: number, index: number) => {
    const angle = (Math.PI * 2 * index) / numModels - Math.PI / 2; // -90도 시작 (위쪽)
    const r = radius * value;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // 데이터 포인트 좌표 (0~1 스케일)
  const dataPoints = modelNames.map((modelName, i) => {
    const score = (data.voting_result[modelName]?.score || 0); // 0~1 스케일
    return getCoordinates(score, i);
  });
  const pointsString = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Baseline 데이터 포인트 (모든 모델이 0.1 점수라고 가정)
  const normalDataPoints = modelNames.map((_, i) => getCoordinates(0.1, i)); // NORMAL 기준점
  const normalPointsString = normalDataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // 배경 가이드 라인 (0%, 20%, 40%, 60%, 80%, 100%)
  const guideScales = [0.2, 0.4, 0.6, 0.8, 1.0];
  const gridPoints = guideScales.map(scale =>
    modelNames.map((_, i) => getCoordinates(scale, i)).map(p => `${p.x},${p.y}`).join(' ')
  );


  return (
    <View className="items-center p-5">
      <Text className="text-textPrimary text-lg font-bold mb-1">앙상블 진단 결과</Text>
      <Text className="text-accentPrimary text-sm mb-4">
        Consensus Score: <Text className="font-bold">{(data.consensus_score * 100).toFixed(0)}%</Text>
      </Text>

      <View style={{ width: chartSize, height: chartSize }}>
        <Svg height={chartSize} width={chartSize}>
          {/* 가이드 라인 (다각형) */}
          {gridPoints.map((points, i) => (
            <Polygon
              key={i}
              points={points}
              stroke="#262626" // borderSubtle
              strokeWidth="1"
              fill="none"
            />
          ))}

          {/* 축 라인 */}
          {modelNames.map((_, i) => {
            const p = getCoordinates(1.0, i);
            return (
              <Line
                key={i}
                x1={center}
                y1={center}
                x2={p.x}
                y2={p.y}
                stroke="#262626" // borderSubtle
                strokeWidth="1"
              />
            );
          })}

          {/* 축 라벨 */}
          {modelNames.map((modelName, i) => {
            const p = getCoordinates(1.15, i); // 약간 바깥쪽
            return (
              <SvgText
                key={i}
                x={p.x}
                y={p.y}
                fill="#A0A0A0" // textSecondary
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {modelName}
              </SvgText>
            );
          })}

          {/* Baseline Polygon (정상 범위) */}
          <Polygon
            points={normalPointsString}
            fill="#A0A0A0" // textSecondary
            fillOpacity="0.1"
            stroke="#A0A0A0"
            strokeOpacity="0.5"
            strokeWidth="1"
            strokeDasharray="2,2"
          />

          {/* 데이터 폴리곤 (현재 상태) */}
          <Polygon
            points={pointsString}
            fill={primaryColor}
            fillOpacity="0.3"
            stroke={primaryColor}
            strokeWidth="2"
          />

          {/* 데이터 포인트 */}
          {dataPoints.map((p, i) => (
            <Circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3"
              fill={primaryColor}
            />
          ))}
        </Svg>
      </View>

      <View className="mt-5 w-full">
        {modelNames.map(modelName => {
          const modelResult = data.voting_result[modelName];
          return (
            <View key={modelName} className="flex-row justify-between mb-1">
              <Text className="text-textSecondary text-xs">{modelName}:</Text>
              <Text className="text-xs font-bold" style={{ color: getStatusColor(modelResult?.status) }}>
                {modelResult ? (modelResult.score * 100).toFixed(0) + '%' : 'N/A'} ({modelResult?.status || 'UNKNOWN'})
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // 컨테이너 스타일은 상위에서 처리 (Card)
  // 나머지 스타일은 className으로 대체
});