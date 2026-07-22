import { Dispatch, SetStateAction } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Props = {
  selectedActivity: string | null;

  footballTeamOneName: string;
  setFootballTeamOneName: Dispatch<SetStateAction<string>>;

  footballTeamTwoName: string;
  setFootballTeamTwoName: Dispatch<SetStateAction<string>>;

  footballTeamOneScore: string;
  setFootballTeamOneScore: Dispatch<SetStateAction<string>>;

  footballTeamTwoScore: string;
  setFootballTeamTwoScore: Dispatch<SetStateAction<string>>;
};

export default function FootballTracker(props: Props) {
  if (props.selectedActivity !== 'Football') {
    return null;
  }

  return (
    <View style={styles.detailsBox}>
      <Text style={styles.detailsTitle}>Football Details</Text>

      <TextInput
        style={styles.input}
        placeholder="Team 1 name"
        placeholderTextColor="#F4F7F6"
        value={props.footballTeamOneName}
        onChangeText={props.setFootballTeamOneName}
      />

      <TextInput
        style={styles.input}
        placeholder="Team 2 name"
        placeholderTextColor="#F4F7F6"
        value={props.footballTeamTwoName}
        onChangeText={props.setFootballTeamTwoName}
      />

      <View style={styles.scoreRow}>
        <TextInput
          style={styles.scoreInput}
          placeholder="Team 1 score"
          placeholderTextColor="#F4F7F6"
          value={props.footballTeamOneScore}
          onChangeText={props.setFootballTeamOneScore}
          keyboardType="number-pad"
        />

        <TextInput
          style={styles.scoreInput}
          placeholder="Team 2 score"
          placeholderTextColor="#F4F7F6"
          value={props.footballTeamTwoScore}
          onChangeText={props.setFootballTeamTwoScore}
          keyboardType="number-pad"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  detailsBox: {
    backgroundColor: 'rgba(12, 20, 21, 0.82)',
    borderWidth: 1,
    borderColor: '#304243',
    padding: 18,
    borderRadius: 16,
    marginBottom: 22,
  },
  detailsTitle: {
    color: '#F4F7F6',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  input: {
    backgroundColor: '#121C1D',
    borderWidth: 1,
    borderColor: '#304243',
    borderRadius: 12,
    padding: 16,
    fontSize: 20,
    marginBottom: 12,
    color: '#F4F7F6',
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 10,
  },
  scoreInput: {
    flex: 1,
    backgroundColor: '#121C1D',
    borderWidth: 1,
    borderColor: '#304243',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    marginBottom: 12,
    color: '#F4F7F6',
  },
});
