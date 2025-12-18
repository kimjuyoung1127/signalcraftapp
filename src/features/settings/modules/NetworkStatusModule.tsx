// src/features/settings/modules/NetworkStatusModule.tsx
// 네트워크 상태 모니터링 모듈

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SettingsSection, SettingsItem } from '../../settings/types/settings';
import { SettingsSection as SettingsSectionComponent } from '../components/SettingsSection';
import { SettingsItem as SettingsItemComponent } from '../components/SettingsItem';
import { useSettings } from '../hooks/useSettings';
import { Wifi, Cloud, AlertTriangle, RefreshCw } from 'lucide-react-native';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import { API_CONFIG, getApiUrl } from '../../../config/env';

export const NetworkStatusModule: React.FC = () => {
  const { createSettingsSection, createSettingsItem } = useSettings();
  const [networkInfo, setNetworkInfo] = useState({
    isConnected: false,
    isInternetReachable: false,
    type: 'unknown',
    details: '',
  });
  const [apiStatus, setApiStatus] = useState({
    isOnline: false,
    lastChecked: '',
    responseTime: 0,
  });
  const [isChecking, setIsChecking] = useState(false);
  
  // 네트워크 정보 모니터링
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkInfo({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type || 'unknown',
        details: state.details ? JSON.stringify(state.details, null, 2) : '',
      });
    });

    return () => unsubscribe();
  }, []);

  // API 상태 체크
  const checkApiStatus = async () => {
    if (!networkInfo.isConnected) {
      setApiStatus({
        isOnline: false,
        lastChecked: new Date().toISOString(),
        responseTime: 0,
      });
      return;
    }

    setIsChecking(true);
    const startTime = Date.now();

    try {
      // 환경 설정에서 API 엔드포인트 사용
      const healthCheckUrl = getApiUrl(API_CONFIG.ENDPOINTS.HEALTH_CHECK);
      const response = await axios.get(healthCheckUrl, {
        timeout: API_CONFIG.TIMEOUTS.HEALTH_CHECK,
      });
      
      const responseTime = Date.now() - startTime;
      setApiStatus({
        isOnline: true,
        lastChecked: new Date().toISOString(),
        responseTime,
      });
    } catch (error) {
      setApiStatus({
        isOnline: false,
        lastChecked: new Date().toISOString(),
        responseTime: 0,
      });
    } finally {
      setIsChecking(false);
    }
  };

  // 설정 섹션 정의
  const networkSection = createSettingsSection(
    'network',
    '네트워크 상태',
    [
      createSettingsItem(
        'auto-upload',
        'toggle',
        '자동 업로드',
        'sync.autoUploadEnabled',
        {
          description: '네트워크 연결 시 자동으로 파일 업로드',
        }
      ),
    ],
    '네트워크 연결 상태 및 데이터 동기화 설정'
  );

  // 네트워크 상태 표시
  const getNetworkStatusIcon = () => {
    if (!networkInfo.isConnected) {
      return <AlertTriangle size={20} color="#FF5555" />;
    }
    if (networkInfo.type === 'wifi') {
      return <Wifi size={20} color="#00E5FF" />;
    }
    return <Cloud size={20} color="#00E5FF" />;
  };

  const getNetworkStatusText = () => {
    if (!networkInfo.isConnected) {
      return '오프라인';
    }
    if (networkInfo.type === 'wifi') {
      return 'Wi-Fi 연결됨';
    }
    return `${networkInfo.type} 연결됨`;
  };

  return (
    <SettingsSectionComponent section={networkSection}>
      {/* 네트워크 상태 정보 */}
      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          {getNetworkStatusIcon()}
          <View style={styles.statusText}>
            <Text style={styles.statusLabel}>네트워크 상태</Text>
            <Text style={styles.statusValue}>{getNetworkStatusText()}</Text>
          </View>
        </View>

        <View style={styles.statusItem}>
          <Cloud size={20} color={apiStatus.isOnline ? '#00E5FF' : '#FF5555'} />
          <View style={styles.statusText}>
            <Text style={styles.statusLabel}>API 서버</Text>
            <Text style={styles.statusValue}>
              {apiStatus.isOnline ? `온라인 (${apiStatus.responseTime}ms)` : '오프라인'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={checkApiStatus}
          disabled={isChecking}
        >
          <RefreshCw size={16} color={isChecking ? '#A0A0A0' : '#00E5FF'} />
          <Text style={styles.refreshText}>
            {isChecking ? '체크 중...' : '상태 새로고침'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Wi-Fi 전용 설정 읽기 전용 표시 */}
      <View style={styles.wifiOnlyInfo}>
        <Text style={styles.wifiOnlyLabel}>Wi-Fi 전용 업로드</Text>
        <Text style={styles.wifiOnlyValue}>
          {useSettings().getSettingValue('sync', 'wifiOnlyUpload') ? '활성화' : '비활성화'}
        </Text>
      </View>

      {/* 설정 항목 렌더링 */}
      {networkSection.items.map((item) => (
        <SettingsItemComponent key={item.id} item={item} />
      ))}
    </SettingsSectionComponent>
  );
};

const styles = StyleSheet.create({
  statusContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#000',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  statusText: {
    flex: 1,
  },
  statusLabel: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  statusValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: '#00E5FF20',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  refreshText: {
    color: '#00E5FF',
    fontSize: 14,
    fontWeight: '600',
  },
  wifiOnlyInfo: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#000',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  wifiOnlyLabel: {
    color: '#A0A0A0',
    fontSize: 12,
    marginBottom: 4,
  },
  wifiOnlyValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});