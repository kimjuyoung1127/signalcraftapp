import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Linking, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ContactOption {
  label: string;
  phone: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const CONTACT_POINTS: { [key: string]: ContactOption } = {
  HQ: {
    label: '본사 기술지원팀',
    phone: '01085336898',
    desc: '공식 기술지원 및 부품 문의',
    icon: 'business',
    color: '#00E5FF' // Cyan
  },
  ENGINEER: {
    label: '현장 담당자',
    phone: '01026096593',
    desc: '긴급 조치 및 현장 방문 요청',
    icon: 'construct',
    color: '#FFC800' // Amber
  }
};

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const MaintenanceActionModal = ({ visible, onClose }: Props) => {
  const handleCall = (phoneNumber: string) => {
    const telUrl = `tel:${phoneNumber}`;
    Linking.openURL(telUrl).catch(err => console.error('통화 실패', err));
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.indicator} />
            <Text style={styles.title}>통신 링크</Text>
            <View style={styles.indicator} />
          </View>

          <Text style={styles.subtitle}>즉시 연결할 채널을 선택하십시오</Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {Object.values(CONTACT_POINTS).map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.optionButton, { borderColor: option.color + '40' }]}
                onPress={() => handleCall(option.phone)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconBox, { backgroundColor: option.color + '20' }]}>
                  <Ionicons name={option.icon} size={24} color={option.color} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[styles.optionLabel, { color: option.color }]}>{option.label}</Text>
                  <Text style={styles.optionDesc}>{option.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#555" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Cancel */}
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>연결 종료</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    width: width * 0.85,
    backgroundColor: '#101010',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#555',
  },
  title: {
    color: '#F5F5F5',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#666',
    fontSize: 12,
    marginBottom: 24,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  optionDesc: {
    color: '#888',
    fontSize: 12,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: '#444',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});