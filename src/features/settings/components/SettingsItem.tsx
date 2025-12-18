// src/features/settings/components/SettingsItem.tsx
// 만능 설정 항목 컴포넌트
// Updated to use @react-native-community/slider

import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Modal, FlatList } from 'react-native';
import Slider from '@react-native-community/slider';
import { SettingsItem as SettingsItemType } from '../types/settings';
import { useSettings } from '../hooks/useSettings';
import { ChevronRight, Info } from 'lucide-react-native';

interface SettingsItemProps {
  item: SettingsItemType;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({ item }) => {
  const { getSettingValue, updateSetting, toggleSetting, performAction } = useSettings();
  const [modalVisible, setModalVisible] = useState(false);
  
  // 설정 키 파싱 (예: 'audio.inputGain' -> ['audio', 'inputGain'])
  const [group, key] = item.key.split('.') as [keyof ReturnType<typeof useSettings>['settings'], string];
  
  // 현재 설정 값 가져오기
  const currentValue = getSettingValue(group, key as any);
  
  const renderItemByType = () => {
    switch (item.type) {
      case 'toggle':
        return (
          <View style={styles.toggleContainer}>
            <View style={styles.toggleInfo}>
              <Text style={styles.label}>{item.label}</Text>
              {item.description && (
                <Text style={styles.description}>{item.description}</Text>
              )}
            </View>
            <Switch
              value={currentValue as boolean}
              onValueChange={() => toggleSetting(group, key as any)}
              trackColor={{ false: '#333', true: '#00E5FF' }}
              thumbColor={currentValue ? '#00E5FF' : '#A0A0A0'}
            />
          </View>
        );
      
      case 'slider':
        return (
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.sliderValue}>{currentValue}{item.unit}</Text>
            </View>
            {item.description && (
              <Text style={styles.description}>{item.description}</Text>
            )}
            <Slider
              style={styles.slider}
              minimumValue={item.min || 0}
              maximumValue={item.max || 1}
              step={item.step || 0.1}
              value={currentValue as number}
              onValueChange={(value) => updateSetting(group, key as any, value)}
              minimumTrackTintColor="#00E5FF"
              maximumTrackTintColor="#333"
              thumbTintColor="#00E5FF"
            />
            <View style={styles.sliderRange}>
              <Text style={styles.rangeText}>{item.min}{item.unit}</Text>
              <Text style={styles.rangeText}>{item.max}{item.unit}</Text>
            </View>
          </View>
        );
      
      case 'select':
        return (
          <>
            <TouchableOpacity
              style={styles.selectContainer}
              onPress={() => setModalVisible(true)}
            >
              <View style={styles.selectInfo}>
                <Text style={styles.label}>{item.label}</Text>
                {item.description && (
                  <Text style={styles.description}>{item.description}</Text>
                )}
              </View>
              <View style={styles.selectValue}>
                <Text style={styles.selectValueText}>{currentValue as string}</Text>
                <ChevronRight size={20} color="#00E5FF" />
              </View>
            </TouchableOpacity>

            {/* 선택 모달 */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>{item.label}</Text>
                  <FlatList
                    data={item.options}
                    keyExtractor={(option) => option.value}
                    renderItem={({ item: option }) => (
                      <TouchableOpacity
                        style={[
                          styles.optionItem,
                          currentValue === option.value && styles.selectedOption
                        ]}
                        onPress={() => {
                          updateSetting(group, key as any, option.value);
                          setModalVisible(false);
                        }}
                      >
                        <Text style={styles.optionText}>{option.label}</Text>
                        {currentValue === option.value && (
                          <ChevronRight size={20} color="#00E5FF" />
                        )}
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelText}>취소</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </>
        );
      
      case 'action':
        return (
          <TouchableOpacity
            style={styles.actionContainer}
            onPress={() => {
              // 액션 실행
              performAction(item.id);
            }}
          >
            <Text style={styles.actionText}>{item.label}</Text>
            <ChevronRight size={20} color="#00E5FF" />
          </TouchableOpacity>
        );
      
      case 'info':
        return (
          <View style={styles.infoContainer}>
            <View style={styles.infoIcon}>
              <Info size={16} color="#00E5FF" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.label}>{item.label}</Text>
              {item.description && (
                <Text style={styles.description}>{item.description}</Text>
              )}
            </View>
          </View>
        );
      
      case 'input':
        return (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{item.label}</Text>
            {item.description && (
              <Text style={styles.description}>{item.description}</Text>
            )}
            <View style={styles.inputField}>
              <Text style={styles.inputText}>{currentValue as string}</Text>
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <View style={styles.itemContainer}>
      {renderItemByType()}
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleInfo: {
    flex: 1,
  },
  sliderContainer: {
    marginBottom: 8,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sliderValue: {
    color: '#00E5FF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeText: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  selectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  selectInfo: {
    flex: 1,
  },
  selectValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectValueText: {
    color: '#00E5FF',
    fontSize: 14,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionText: {
    color: '#00E5FF',
    fontSize: 14,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
  },
  infoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00E5FF20',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  inputContainer: {
    paddingVertical: 12,
  },
  inputField: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#333',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  inputText: {
    color: '#fff',
    fontSize: 14,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  selectedOption: {
    backgroundColor: '#00E5FF20',
    borderColor: '#00E5FF',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#333',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#00E5FF',
    fontSize: 16,
    fontWeight: '600',
  },
});