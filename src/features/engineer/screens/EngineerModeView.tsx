import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Wrench, Save, RefreshCw } from 'lucide-react-native';
import { useDeviceStore } from '../../../store/useDeviceStore';
import EngineerService from '../services/engineerService'; // [NEW] Import EngineerService

// [Placeholder] 슬라이더 컴포넌트가 없다면 기본 View로 대체하거나 라이브러리 추가 필요
// 여기서는 간단한 +/- 버튼으로 구현하겠습니다.
const TuningControl = ({ label, value, onValueChange, min, max, step }: { label: string, value: number, onValueChange: (val: number) => void, min: number, max: number, step: number }) => {
  return (
    <View style={styles.controlContainer}>
      <Text style={styles.controlLabel}>{label}</Text>
      <View style={styles.controlWrapper}>
        <TouchableOpacity 
          style={styles.adjustButton} 
          onPress={() => onValueChange(Math.max(min, Number((value - step).toFixed(1))))}
        >
          <Text style={styles.adjustButtonText}>-</Text>
        </TouchableOpacity>
        
        <Text style={styles.valueText}>{value.toFixed(1)}</Text>
        
        <TouchableOpacity 
          style={styles.adjustButton} 
          onPress={() => onValueChange(Math.min(max, Number((value + step).toFixed(1))))}
        >
          <Text style={styles.adjustButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const EngineerModeView = () => {
  const { selectedDevice } = useDeviceStore();
  const [thresholdMultiplier, setThresholdMultiplier] = useState(3.0);
  const [sensitivityLevel, setSensitivityLevel] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [isLoading, setIsLoading] = useState(false);
  
  // [NEW] 실제 서버에서 설정값 로드
  useEffect(() => {
    if (selectedDevice?.calibration_data) {
        setThresholdMultiplier(selectedDevice.calibration_data.threshold_multiplier || 3.0);
        setSensitivityLevel(selectedDevice.calibration_data.sensitivity_level || 'MEDIUM');
    } else {
        // 장비에 calibration_data가 없는 경우 기본값으로 초기화
        setThresholdMultiplier(3.0);
        setSensitivityLevel('MEDIUM');
    }
  }, [selectedDevice]);

  const handleSave = async () => {
    if (!selectedDevice?.device_id) {
        Alert.alert("오류", "선택된 장비가 없습니다.");
        return;
    }
    setIsLoading(true);
    try {
      await EngineerService.updateDeviceConfig(selectedDevice.device_id, {
        threshold_multiplier: thresholdMultiplier,
        sensitivity_level: sensitivityLevel,
      });
      Alert.alert("설정 저장 완료", "장비 설정이 성공적으로 저장되었습니다.");
    } catch (error) {
      console.error("장비 설정 저장 실패:", error);
      Alert.alert("오류", "장비 설정 저장에 실패했습니다. 네트워크를 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Wrench size={24} color="#00E5FF" />
        <Text style={styles.headerTitle}>Engineer Mode</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 장비 정보 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>대상 장비</Text>
          <Text style={styles.deviceInfo}>{selectedDevice?.name || '선택된 장비 없음'}</Text>
          <Text style={styles.deviceSubInfo}>{selectedDevice?.device_id}</Text>
        </View>

        {/* 튜닝 컨트롤 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Threshold Tuning</Text>
          <Text style={styles.description}>
            이상 감지 임계값을 조정합니다. 값이 높을수록 덜 민감해집니다.
          </Text>
          
          <TuningControl 
            label="Threshold Multiplier (σ)" 
            value={thresholdMultiplier} 
            onValueChange={setThresholdMultiplier}
            min={1.0}
            max={10.0}
            step={0.1}
          />

          <View style={styles.divider} />

          <Text style={styles.controlLabel}>Sensitivity Preset</Text>
          <View style={styles.presetButtons}>
            {['HIGH', 'MEDIUM', 'LOW'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.presetButton, 
                  sensitivityLevel === level && styles.presetButtonActive
                ]}
                onPress={() => setSensitivityLevel(level as any)}
              >
                <Text style={[
                  styles.presetButtonText,
                  sensitivityLevel === level && styles.presetButtonTextActive
                ]}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 그래프 Placeholder */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Analysis Trend</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.placeholderText}>Anomaly Score Graph Here</Text>
            {/* 여기에 차트 라이브러리 추가 예정 */}
          </View>
        </View>
      </ScrollView>

      {/* 하단 액션 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#050505" />
          ) : (
            <>
              <Save size={20} color="#050505" />
              <Text style={styles.saveButtonText}>설정 저장</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00E5FF',
    marginLeft: 10,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#101010',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#262626',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F5F5F5',
    marginBottom: 8,
  },
  deviceInfo: {
    fontSize: 18,
    color: '#00E5FF',
    fontWeight: 'bold',
  },
  deviceSubInfo: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  description: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 16,
  },
  controlContainer: {
    marginBottom: 16,
  },
  controlLabel: {
    fontSize: 14,
    color: '#F5F5F5',
    marginBottom: 8,
  },
  controlWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#050505',
    borderRadius: 8,
    padding: 8,
  },
  adjustButton: {
    width: 40,
    height: 40,
    backgroundColor: '#262626',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustButtonText: {
    fontSize: 24,
    color: '#00E5FF',
    lineHeight: 26,
  },
  valueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F5F5F5',
  },
  divider: {
    height: 1,
    backgroundColor: '#262626',
    marginVertical: 16,
  },
  presetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#262626',
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: '#00E5FF',
    borderColor: '#00E5FF',
  },
  presetButtonText: {
    color: '#A0A0A0',
    fontWeight: 'bold',
  },
  presetButtonTextActive: {
    color: '#050505',
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: '#050505',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#262626',
  },
  placeholderText: {
    color: '#262626',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#262626',
  },
  saveButton: {
    backgroundColor: '#00E5FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#050505',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});
