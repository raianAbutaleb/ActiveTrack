import { Dispatch, SetStateAction } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { MatchRound } from '../types';

type Props = {
  selectedActivity: string | null;

  matchTeamOneName: string;
  setMatchTeamOneName: Dispatch<SetStateAction<string>>;

  matchTeamTwoName: string;
  setMatchTeamTwoName: Dispatch<SetStateAction<string>>;

  matchSetNumber: string;
  setMatchSetNumber: Dispatch<SetStateAction<string>>;

  matchTeamOneGames: string;
  setMatchTeamOneGames: Dispatch<SetStateAction<string>>;

  matchTeamTwoGames: string;
  setMatchTeamTwoGames: Dispatch<SetStateAction<string>>;

  matchTeamOnePoints: string;
  setMatchTeamOnePoints: Dispatch<SetStateAction<string>>;

  matchTeamTwoPoints: string;
  setMatchTeamTwoPoints: Dispatch<SetStateAction<string>>;

  matchServer: string;
  setMatchServer: Dispatch<SetStateAction<string>>;

  matchTiebreakScore: string;
  setMatchTiebreakScore: Dispatch<SetStateAction<string>>;

  matchTeamOneWinners: string;
  setMatchTeamOneWinners: Dispatch<SetStateAction<string>>;

  matchTeamTwoWinners: string;
  setMatchTeamTwoWinners: Dispatch<SetStateAction<string>>;

  matchTeamOneErrors: string;
  setMatchTeamOneErrors: Dispatch<SetStateAction<string>>;

  matchTeamTwoErrors: string;
  setMatchTeamTwoErrors: Dispatch<SetStateAction<string>>;

  matchRounds: MatchRound[];
  setMatchRounds: Dispatch<SetStateAction<MatchRound[]>>;
};

const matchActivities = ['Padel', 'Tennis'];

export default function MatchTracker(props: Props) {
  if (!props.selectedActivity || !matchActivities.includes(props.selectedActivity)) {
    return null;
  }

  const addMatchRound = () => {
    const cleanSetNumber = props.matchSetNumber.trim();
    const cleanTeamOneGames = props.matchTeamOneGames.trim();
    const cleanTeamTwoGames = props.matchTeamTwoGames.trim();

    if (cleanTeamOneGames === '') {
      alert('Please enter Team 1 games');
      return;
    }

    if (cleanTeamTwoGames === '') {
      alert('Please enter Team 2 games');
      return;
    }

    const teamOneNumber = Number(cleanTeamOneGames);
    const teamTwoNumber = Number(cleanTeamTwoGames);

    if (Number.isNaN(teamOneNumber) || Number.isNaN(teamTwoNumber)) {
      alert('Games must be numbers');
      return;
    }

    if (teamOneNumber > 6 || teamTwoNumber > 6) {
      alert('Each set should be 6 games or less unless it is a tiebreak set');
      return;
    }

    const winner =
      teamOneNumber > teamTwoNumber
        ? props.matchTeamOneName.trim() || 'Team 1'
        : teamTwoNumber > teamOneNumber
          ? props.matchTeamTwoName.trim() || 'Team 2'
          : 'Tie';

    const newRound: MatchRound = {
      id: Date.now(),
      setNumber: cleanSetNumber,
      teamOneGames: cleanTeamOneGames,
      teamTwoGames: cleanTeamTwoGames,
      teamOnePoints: props.matchTeamOnePoints.trim(),
      teamTwoPoints: props.matchTeamTwoPoints.trim(),
      server: props.matchServer.trim(),
      tiebreakScore: props.matchTiebreakScore.trim(),
      winner,
      teamOneWinners: props.matchTeamOneWinners.trim(),
      teamTwoWinners: props.matchTeamTwoWinners.trim(),
      teamOneErrors: props.matchTeamOneErrors.trim(),
      teamTwoErrors: props.matchTeamTwoErrors.trim(),
    };

    props.setMatchRounds([...props.matchRounds, newRound]);
    props.setMatchSetNumber('');
    props.setMatchTeamOneGames('');
    props.setMatchTeamTwoGames('');
    props.setMatchTeamOnePoints('');
    props.setMatchTeamTwoPoints('');
    props.setMatchServer('');
    props.setMatchTiebreakScore('');
    props.setMatchTeamOneWinners('');
    props.setMatchTeamTwoWinners('');
    props.setMatchTeamOneErrors('');
    props.setMatchTeamTwoErrors('');
  };

  const deleteMatchRound = (roundId: number) => {
    const newRounds = props.matchRounds.filter((round) => round.id !== roundId);
    props.setMatchRounds(newRounds);
  };

  const getMatchTeamOneTotal = () => {
    return props.matchRounds.reduce((total, round) => {
      return total + Number(round.teamOneGames || 0);
    }, 0);
  };

  const getMatchTeamTwoTotal = () => {
    return props.matchRounds.reduce((total, round) => {
      return total + Number(round.teamTwoGames || 0);
    }, 0);
  };

  const getSetWins = (team: 'teamOne' | 'teamTwo') => {
    return props.matchRounds.filter((round) => {
      const teamOneGames = Number(round.teamOneGames || 0);
      const teamTwoGames = Number(round.teamTwoGames || 0);

      if (team === 'teamOne') {
        return teamOneGames > teamTwoGames;
      }

      return teamTwoGames > teamOneGames;
    }).length;
  };

  return (
    <View style={styles.detailsBox}>
      <Text style={styles.detailsTitle}>{props.selectedActivity} Match</Text>

      <TextInput
        style={styles.input}
        placeholder="Team 1 name"
        placeholderTextColor="#F4F7F6"
        value={props.matchTeamOneName}
        onChangeText={props.setMatchTeamOneName}
      />

      <TextInput
        style={styles.input}
        placeholder="Team 2 name"
        placeholderTextColor="#F4F7F6"
        value={props.matchTeamTwoName}
        onChangeText={props.setMatchTeamTwoName}
      />

      <Text style={styles.detailsSubtitle}>Add round score</Text>

      <TextInput
        style={styles.input}
        placeholder="Set number"
        placeholderTextColor="#F4F7F6"
        value={props.matchSetNumber}
        onChangeText={props.setMatchSetNumber}
        keyboardType="number-pad"
      />

      <View style={styles.scoreRow}>
        <TextInput
          style={styles.scoreInput}
          placeholder="Team 1 games"
          placeholderTextColor="#F4F7F6"
          value={props.matchTeamOneGames}
          onChangeText={props.setMatchTeamOneGames}
          keyboardType="number-pad"
        />

        <TextInput
          style={styles.scoreInput}
          placeholder="Team 2 games"
          placeholderTextColor="#F4F7F6"
          value={props.matchTeamTwoGames}
          onChangeText={props.setMatchTeamTwoGames}
          keyboardType="number-pad"
        />
      </View>

      <Text style={styles.detailsSubtitle}>Current points</Text>

      <View style={styles.scoreRow}>
        <TextInput
          style={styles.scoreInput}
          placeholder="Team 1 points"
          placeholderTextColor="#F4F7F6"
          value={props.matchTeamOnePoints}
          onChangeText={props.setMatchTeamOnePoints}
        />

        <TextInput
          style={styles.scoreInput}
          placeholder="Team 2 points"
          placeholderTextColor="#F4F7F6"
          value={props.matchTeamTwoPoints}
          onChangeText={props.setMatchTeamTwoPoints}
        />
      </View>

      <Text style={styles.detailsSubtitle}>Server</Text>

      <View style={styles.scoreRow}>
        {[props.matchTeamOneName || 'Team 1', props.matchTeamTwoName || 'Team 2'].map((server) => (
          <TouchableOpacity
            key={server}
            style={[
              styles.serverButton,
              props.matchServer === server && styles.selectedServerButton,
            ]}
            onPress={() => props.setMatchServer(server)}
          >
            <Text style={styles.serverButtonText}>{server}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Tiebreak score, example: 7-5"
        placeholderTextColor="#F4F7F6"
        value={props.matchTiebreakScore}
        onChangeText={props.setMatchTiebreakScore}
      />

      <Text style={styles.detailsSubtitle}>Team stats</Text>

      <View style={styles.scoreRow}>
        <TextInput
          style={styles.scoreInput}
          placeholder="Team 1 winners"
          placeholderTextColor="#F4F7F6"
          value={props.matchTeamOneWinners}
          onChangeText={props.setMatchTeamOneWinners}
          keyboardType="number-pad"
        />

        <TextInput
          style={styles.scoreInput}
          placeholder="Team 2 winners"
          placeholderTextColor="#F4F7F6"
          value={props.matchTeamTwoWinners}
          onChangeText={props.setMatchTeamTwoWinners}
          keyboardType="number-pad"
        />
      </View>

      <View style={styles.scoreRow}>
        <TextInput
          style={styles.scoreInput}
          placeholder="Team 1 errors"
          placeholderTextColor="#F4F7F6"
          value={props.matchTeamOneErrors}
          onChangeText={props.setMatchTeamOneErrors}
          keyboardType="number-pad"
        />

        <TextInput
          style={styles.scoreInput}
          placeholder="Team 2 errors"
          placeholderTextColor="#F4F7F6"
          value={props.matchTeamTwoErrors}
          onChangeText={props.setMatchTeamTwoErrors}
          keyboardType="number-pad"
        />
      </View>

      <TouchableOpacity style={styles.addExerciseButton} onPress={addMatchRound}>
        <Text style={styles.buttonText}>+ Add Round</Text>
      </TouchableOpacity>

      <View style={styles.exerciseListBox}>
        <Text style={styles.exerciseListTitle}>Rounds Added</Text>

        {props.matchRounds.length === 0 ? (
          <Text style={styles.emptyHistory}>No rounds added yet</Text>
        ) : (
          props.matchRounds.map((round, index) => (
            <View key={round.id} style={styles.exerciseRow}>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>
                  Set {round.setNumber || index + 1}: {round.teamOneGames} - {round.teamTwoGames}
                </Text>
                <Text style={styles.exerciseDetails}>
                  Points: {round.teamOnePoints || '0'} - {round.teamTwoPoints || '0'}
                </Text>
                <Text style={styles.exerciseDetails}>
                  Server: {round.server || 'Not filled'}
                </Text>
                <Text style={styles.exerciseDetails}>
                  Winner: {round.winner || 'Not finished'}
                </Text>
                <Text style={styles.exerciseDetails}>
                  Tiebreak: {round.tiebreakScore || 'None'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.exerciseDeleteButton}
                onPress={() => deleteMatchRound(round.id)}
              >
                <Text style={styles.exerciseDeleteText}>X</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <View style={styles.matchTotalBox}>
        <Text style={styles.matchTotalTitle}>Match Stats</Text>
        <Text style={styles.matchTotalText}>
          Sets: {props.matchTeamOneName || 'Team 1'} {getSetWins('teamOne')} - {getSetWins('teamTwo')} {props.matchTeamTwoName || 'Team 2'}
        </Text>
        <Text style={styles.matchTotalText}>
          {props.matchTeamOneName || 'Team 1'}: {getMatchTeamOneTotal()}
        </Text>
        <Text style={styles.matchTotalText}>
          {props.matchTeamTwoName || 'Team 2'}: {getMatchTeamTwoTotal()}
        </Text>
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
  detailsSubtitle: {
    color: '#F4F7F6',
    fontSize: 18,
    marginBottom: 12,
    marginTop: 6,
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
  addExerciseButton: {
    backgroundColor: '#22A398',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    marginTop: 14,
  },
  exerciseListBox: {
    backgroundColor: '#080F10',
    padding: 14,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  exerciseListTitle: {
    color: '#F4F7F6',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#304243',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: '#F4F7F6',
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 4,
  },
  exerciseDetails: {
    color: '#F4F7F6',
    fontSize: 16,
    marginBottom: 2,
  },
  serverButton: {
    flex: 1,
    backgroundColor: '#304243',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  selectedServerButton: {
    backgroundColor: '#153B38',
    borderWidth: 1,
    borderColor: '#22A398',
  },
  serverButtonText: {
    color: '#F4F7F6',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  exerciseDeleteButton: {
    backgroundColor: '#304243',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  exerciseDeleteText: {
    color: '#F4F7F6',
    fontWeight: 'bold',
    fontSize: 17,
  },
  matchTotalBox: {
    backgroundColor: '#080F10',
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  matchTotalTitle: {
    color: '#F4F7F6',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  matchTotalText: {
    color: '#F4F7F6',
    fontSize: 19,
    marginBottom: 4,
  },
  emptyHistory: {
    color: '#F4F7F6',
    fontSize: 18,
  },
  buttonText: {
    color: '#F4F7F6',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
});
