import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList } from 'react-native';
import { X, Check, Cpu } from 'lucide-react-native';

export interface AIModel {
  id: string;
  name: string;
  description: string;
  accuracy: string;
  isAvailable: boolean;
}

const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'level1', // Backend model_preference 'level1'
    name: 'Level 1 (Hybrid ML)',
    description: 'Rule-based + Isolation Forest 결합 모델. 고속 스크리닝 및 1차 이상 감지.',
    accuracy: '98.5%',
    isAvailable: true,
  },
  {
    id: 'level2', // Backend model_preference 'level2'
    name: 'Level 2 (Autoencoder)',
    description: 'Autoencoder 기반 정밀 분석. Level 1에서 감지된 이상 패턴 심층 진단.',
    accuracy: '96.2%', // Autoencoder의 정확도
    isAvailable: true,
  },
];

interface ModelSelectorProps {
  visible: boolean;
  currentModelId: string;
  onSelect: (modelId: string) => void;
  onClose: () => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ visible, currentModelId, onSelect, onClose }) => {
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
            data={AVAILABLE_MODELS}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isSelected = item.id === currentModelId;
              const isDisabled = !item.isAvailable;

              return (
                <TouchableOpacity
                  style={[
                    styles.modelCard,
                    isSelected && styles.modelCardSelected,
                    isDisabled && styles.modelCardDisabled
                  ]}
                  onPress={() => {
                    if (!isDisabled) {
                      onSelect(item.id);
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
                    <Text style={styles.metaLabel}>정확도:</Text>
                    <Text style={styles.metaValue}>{item.accuracy}</Text>
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
