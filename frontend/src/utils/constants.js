import { Platform } from 'react-native';

// Use your computer's LAN IP address here if running on a physical device
// You can find it by running 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux)
export const API_URL = Platform.OS === 'android' 
  ? 'http://192.168.100.30:5000/api' 
  : 'http://192.168.100.30:5000/api';
