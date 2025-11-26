import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { CameraOff, Settings } from 'lucide-react-native'; // 아이콘 추가

export const DiagnosisCamera = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [permissionRequested, setPermissionRequested] = useState(false); // 권한 요청 시도 여부

  useEffect(() => {
    // 앱이 처음 로드되거나 권한 상태가 변경될 때마다 권한 요청 시도 여부 재설정
    if (permission?.granted) {
      setPermissionRequested(false);
    }
  }, [permission]);

  const handleRequestPermission = async () => {
    setPermissionRequested(true);
    const { granted } = await requestPermission();
    if (!granted) {
      Alert.alert(
        "카메라 권한 필요",
        "AR 진단을 위해 카메라 접근 권한이 필요합니다. 설정에서 직접 허용해주세요.",
        [
          { text: "나중에", style: "cancel" },
          { text: "설정으로 이동", onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  if (!permission) {
    // 권한 로딩 중이거나 첫 렌더링 시
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.text}>카메라 권한 확인 중...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // 권한이 없는 경우 (거부되었거나 아직 요청하지 않음)
    return (
      <View style={[styles.container, styles.centerContent, styles.permissionDenied]}>
        <CameraOff size={50} color="#FF3366" style={{ marginBottom: 20 }} />
        <Text style={[styles.text, styles.permissionText]}>
          AR 진단을 위해 카메라 권한이 필요합니다.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={handleRequestPermission}>
          <Text style={styles.permissionButtonText}>권한 요청하기</Text>
        </TouchableOpacity>
        {permissionRequested && !permission.granted && ( // 한번 요청했지만 거부된 경우 설정 버튼 표시
          <TouchableOpacity style={styles.settingsButton} onPress={() => Linking.openSettings()}>
            <Settings size={18} color="#00E5FF" />
            <Text style={styles.settingsButtonText}>설정으로 이동</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // 권한이 허용된 경우
  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFill} facing="back" />
      {/* 어두운 오버레이 (Scrim) - 텍스트 가독성을 위해 */}
      <View style={styles.scrim} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    zIndex: 0,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionDenied: {
    backgroundColor: '#050505', // 어두운 배경 유지
  },
  permissionText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#F5F5F5',
  },
  permissionButton: {
    backgroundColor: '#00E5FF', // accentPrimary
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 15,
  },
  permissionButtonText: {
    color: 'black', // 텍스트를 검은색으로
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00E5FF', // accentPrimary
  },
  settingsButtonText: {
    color: '#00E5FF',
    fontSize: 14,
    marginLeft: 8,
  },
  text: {
    color: 'white',
    textAlign: 'center',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 5, 5, 0.3)',
  },
});
