import {
  StyleSheet,
  View,
} from 'react-native';

import StudentRecordsScreen from './StudentRecordsScreen';

type Props = {
  onBack?: () => void;
};

export default function StudentDetailsScreen({
  onBack,
}: Props) {
  return (
    <View style={styles.container}>
      <StudentRecordsScreen
        onBack={onBack}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
});