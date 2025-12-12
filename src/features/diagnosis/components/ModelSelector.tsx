import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList } from 'react-native';
import { X, Check, Cpu } from 'lucide-react-native';
import { ModelInfo } from '../services/analysisService'; // Backend ModelInfo 임포트

// AIModel 인터페이스를 ModelInfo와 동일하게 정의
export interface AIModel extends ModelInfo {}

interface ModelSelectorProps {
  visible: boolean;
  currentModelId: string;
  models: AIModel[]; // 동적으로 받아온 모델 목록
  onSelect: (modelId: string, modelType: string, modelName: string) => void; // 시그니처 변경
  onClose: () => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ visible, currentModelId, models, onSelect, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Cpu color="#00E5FF" size={20} />
              <Text style={styles.title}>AI 분석 엔진 선택</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color="#A0A0A0" size={24} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            진단 대상 장비에 최적화된 AI 모델을 선택하세요.
          </Text>

          <FlatList
            data={models} // 하드코딩된 목록 대신 props로 받은 models 사용
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isSelected = item.id === currentModelId;
              // isAvailable 필드는 백엔드 ModelInfo에 없으므로, 항상 사용 가능하다고 가정
              const isDisabled = false; 

              return (
                <TouchableOpacity
                  style={[
                    styles.modelCard,
                    isSelected && styles.modelCardSelected,
                    isDisabled && styles.modelCardDisabled
                  ]}
                  onPress={() => {
                    if (!isDisabled) {
                      onSelect(item.id, item.type, item.name); // item.type, item.name 전달
                      onClose();
                    }
                  }}
                  disabled={isDisabled}
                >
                  <View style={styles.cardHeader}>
                    <Text style={[styles.modelName, isSelected && styles.modelNameSelected, isDisabled && styles.modelNameDisabled]}>
                      {item.name}
                    </Text>
                    {isSelected && <Check color="#00E5FF" size={20} />}
                  </View>
                  <Text style={styles.modelDesc}>{item.description}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>타입:</Text>
                    <Text style={styles.metaValue}>{item.type}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#101010',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: '#262626',
    height: '60%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#F5F5F5',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#A0A0A0',
    fontSize: 14,
    marginBottom: 20,
  },
  closeButton: {
    padding: 4,
  },
  listContent: {
    paddingBottom: 40,
  },
  modelCard: {
    backgroundColor: '#050505',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#262626',
  },
  modelCardSelected: {
    borderColor: '#00E5FF',
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
  },
  modelCardDisabled: {
    opacity: 0.5,
    borderColor: '#1a1a1a',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modelName: {
    color: '#F5F5F5',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modelNameSelected: {
    color: '#00E5FF',
  },
  modelNameDisabled: {
    color: '#555',
  },
  modelDesc: {
    color: '#A0A0A0',
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLabel: {
    color: '#555',
    fontSize: 11,
    marginRight: 4,
  },
  metaValue: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: 'bold',
  }
});
