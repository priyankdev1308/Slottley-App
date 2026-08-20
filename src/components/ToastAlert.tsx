import { Alert } from 'react-native';

type ToastType = 'success' | 'error' | 'info';

interface ToastAlertParams {
  title: string;
  description?: string;
  toastType?: ToastType;
}

const ToastAlert = ({ title, description }: ToastAlertParams) => {
  Alert.alert(title, description);
};

export default ToastAlert;
