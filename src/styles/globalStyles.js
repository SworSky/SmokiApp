import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#FF6B35',      // Dragon orange
  secondary: '#F7931E',    // Golden orange
  accent: '#FFB84D',       // Light orange
  success: '#4CAF50',      // Green
  warning: '#FF9800',      // Orange
  danger: '#F44336',       // Red
  background: '#FFF3E0',   // Light cream
  surface: '#FFFFFF',      // White
  text: '#2C3E50',         // Dark blue-gray
  textLight: '#7F8C8D',    // Light gray
  border: '#E0E0E0',       // Light border
  shadow: '#000000',       // Shadow
  dragon: {
    fire: '#FF4444',       // Fire red
    scale: '#228B22',      // Scale green
    gold: '#FFD700',       // Gold
    purple: '#8A2BE2',     // Purple
  }
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  padding: {
    padding: 20,
  },
  margin: {
    margin: 10,
  },
  shadow: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: 'center',
    marginVertical: 8,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: 'center',
    marginVertical: 8,
  },
  outlineButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  column: {
    flexDirection: 'column',
  },
  flex1: {
    flex: 1,
  },
  textCenter: {
    textAlign: 'center',
  },
  textBold: {
    fontWeight: 'bold',
  },
  marginTop: {
    marginTop: 20,
  },
  marginBottom: {
    marginBottom: 20,
  },
});

export const dragonGradients = {
  fire: ['#FF6B35', '#FF4444'],
  gold: ['#FFD700', '#F7931E'],
  green: ['#228B22', '#32CD32'],
  purple: ['#8A2BE2', '#9932CC'],
  ocean: ['#1E90FF', '#00CED1'],
};
