import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { colors } from '../styles/globalStyles';

const NumpadModal = ({ visible, onClose, onSubmit, title, currentValue = '' }) => {
  const [value, setValue] = React.useState(currentValue);

  React.useEffect(() => {
    setValue(currentValue);
  }, [currentValue, visible]);

  const handleNumberPress = (number) => {
    if (value.length < 4) { // Max 4 characters to allow for negative values like -999
      setValue(value + number);
    }
  };

  const handleBackspace = () => {
    setValue(value.slice(0, -1));
  };

  const handleToggleSign = () => {
    if (value === '' || value === '0') {
      setValue('-');
    } else if (value === '-') {
      setValue('');
    } else if (value.startsWith('-')) {
      setValue(value.substring(1));
    } else {
      setValue('-' + value);
    }
  };

  const handleSubmit = () => {
    onSubmit(value);
    onClose();
  };

  const renderNumberButton = (number) => (
    <TouchableOpacity
      key={number}
      style={styles.numberButton}
      onPress={() => handleNumberPress(number.toString())}
    >
      <Text style={styles.numberButtonText}>{number}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          
          {/* Display */}
          <View style={styles.display}>
            <Text style={styles.displayText}>
              {value || '0'}
            </Text>
          </View>

          {/* Numpad */}
          <View style={styles.numpad}>
            {/* Row 1 */}
            <View style={styles.numpadRow}>
              {renderNumberButton(1)}
              {renderNumberButton(2)}
              {renderNumberButton(3)}
            </View>
            
            {/* Row 2 */}
            <View style={styles.numpadRow}>
              {renderNumberButton(4)}
              {renderNumberButton(5)}
              {renderNumberButton(6)}
            </View>
            
            {/* Row 3 */}
            <View style={styles.numpadRow}>
              {renderNumberButton(7)}
              {renderNumberButton(8)}
              {renderNumberButton(9)}
            </View>
            
            {/* Row 4 */}
            <View style={styles.numpadRow}>
              <TouchableOpacity style={styles.actionButton} onPress={handleToggleSign}>
                <Text style={styles.actionButtonText}>+/-</Text>
              </TouchableOpacity>
              
              {renderNumberButton(0)}
              
              <TouchableOpacity style={styles.actionButton} onPress={handleBackspace}>
                <Text style={styles.actionButtonText}>⌫</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Anuluj</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    maxWidth: 350,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: colors.text,
  },
  display: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  displayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    minHeight: 40,
  },
  numpad: {
    marginBottom: 20,
  },
  numpadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  numberButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  numberButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  actionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.textLight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: colors.textLight,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  submitButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: colors.success,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
};

export default NumpadModal;
