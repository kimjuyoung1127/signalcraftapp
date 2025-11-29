import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaintenanceActionModal } from './MaintenanceActionModal';

export const MaintenanceActionFab = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.fab}
        activeOpacity={0.7}
      >
        <Ionicons name="call" size={24} color="#A0A0A0" />
      </TouchableOpacity>

      <MaintenanceActionModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    backgroundColor: '#101010',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262626', // Updated to match Demo Control
    elevation: 5,
    // Removed colored shadow to maintain consistency
  },
});
