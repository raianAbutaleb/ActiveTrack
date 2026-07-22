import { Dispatch, SetStateAction } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  selectedActivity: string | null;

  lapCount: number;
  setLapCount: Dispatch<SetStateAction<number>>;

  lapDistance: string;
  setLapDistance: Dispatch<SetStateAction<string>>;

  lapDistanceUnit: string;
  setLapDistanceUnit: Dispatch<SetStateAction<string>>;

  routeName: string;
  setRouteName: Dispatch<SetStateAction<string>>;

  elevationGain: string;
  setElevationGain: Dispatch<SetStateAction<string>>;

  splitNotes: string;
  setSplitNotes: Dispatch<SetStateAction<string>>;

  movementGoal: string;
  setMovementGoal: Dispatch<SetStateAction<string>>;

  personalRecord: string;
  setPersonalRecord: Dispatch<SetStateAction<string>>;

  startTime: Date | null;
  endTime: Date | null;
};

const lapActivities = ['Run', 'Walking', 'Cycling', 'Swimming'];
const movementActivities = ['Run', 'Walking', 'Cycling'];

export default function LapTracker(props: Props) {
  if (!props.selectedActivity || !lapActivities.includes(props.selectedActivity)) {
    return null;
  }

  const showMovementFields = movementActivities.includes(props.selectedActivity);
  const distanceUnits = props.lapDistanceUnit === 'yd' || props.lapDistanceUnit === 'mi'
    ? ['yd', 'mi']
    : ['m', 'km'];

  const addLap = () => {
    if (!props.startTime) {
      alert('Please start the activity first');
      return;
    }

    if (props.endTime) {
      alert('Activity already ended');
      return;
    }

    props.setLapCount(props.lapCount + 1);
  };

  const resetLaps = () => {
    props.setLapCount(0);
  };

  const getTotalLapDistance = () => {
    const distanceNumber = Number(props.lapDistance);

    if (!distanceNumber || props.lapCount === 0) {
      return `0 ${props.lapDistanceUnit}`;
    }

    const total = distanceNumber * props.lapCount;

    if (props.lapDistanceUnit === 'm' && total >= 1000) {
      const kmTotal = total / 1000;
      return `${kmTotal.toFixed(2)} km`;
    }

    return `${total} ${props.lapDistanceUnit}`;
  };

  return (
    <View style={styles.detailsBox}>
      <Text style={styles.detailsTitle}>{props.selectedActivity} Laps</Text>

      {showMovementFields && (
        <>
          <Text style={styles.detailsSubtitle}>Route and goal</Text>

          <TextInput
            style={styles.input}
            placeholder="Route name or location"
            placeholderTextColor="#F4F7F6"
            value={props.routeName}
            onChangeText={props.setRouteName}
          />

          <TextInput
            style={styles.input}
            placeholder="Goal, example: 5 km easy pace"
            placeholderTextColor="#F4F7F6"
            value={props.movementGoal}
            onChangeText={props.setMovementGoal}
          />
        </>
      )}

      <Text style={styles.detailsSubtitle}>Lap distance</Text>

      <View style={styles.scoreRow}>
        <TextInput
          style={styles.scoreInput}
          placeholder="Lap distance"
          placeholderTextColor="#F4F7F6"
          value={props.lapDistance}
          onChangeText={props.setLapDistance}
          keyboardType="decimal-pad"
        />

        {distanceUnits.map((unit) => (
          <TouchableOpacity
            key={unit}
            style={[
              styles.unitButton,
              props.lapDistanceUnit === unit && styles.selectedUnitButton,
            ]}
            onPress={() => props.setLapDistanceUnit(unit)}
          >
            <Text style={styles.unitButtonText}>{unit}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.lapBox}>
        <Text style={styles.lapNumber}>{props.lapCount}</Text>
        <Text style={styles.lapLabel}>laps completed</Text>
        <Text style={styles.totalDistanceText}>
          Total distance: {getTotalLapDistance()}
        </Text>
      </View>

      {showMovementFields && (
        <>
          <Text style={styles.detailsSubtitle}>Performance notes</Text>

          <TextInput
            style={styles.input}
            placeholder="Elevation gain"
            placeholderTextColor="#F4F7F6"
            value={props.elevationGain}
            onChangeText={props.setElevationGain}
            keyboardType="decimal-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Splits, example: 1km 6:10, 2km 6:05"
            placeholderTextColor="#F4F7F6"
            value={props.splitNotes}
            onChangeText={props.setSplitNotes}
            multiline
          />

          <TextInput
            style={styles.input}
            placeholder="Personal record note"
            placeholderTextColor="#F4F7F6"
            value={props.personalRecord}
            onChangeText={props.setPersonalRecord}
            multiline
          />
        </>
      )}

      <TouchableOpacity style={styles.addExerciseButton} onPress={addLap}>
        <Text style={styles.buttonText}>+ Add Lap</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resetLapButton} onPress={resetLaps}>
        <Text style={styles.buttonText}>Reset Laps</Text>
      </TouchableOpacity>
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
    fontSize: 18,
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
  unitButton: {
    backgroundColor: '#304243',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedUnitButton: {
    backgroundColor: '#153B38',
    borderWidth: 1,
    borderColor: '#22A398',
  },
  unitButtonText: {
    color: '#F4F7F6',
    fontSize: 18,
    fontWeight: '800',
  },
  lapBox: {
    backgroundColor: '#080F10',
    padding: 22,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  lapNumber: {
    color: '#F4F7F6',
    fontSize: 56,
    fontWeight: 'bold',
  },
  lapLabel: {
    color: '#F4F7F6',
    fontSize: 19,
    marginTop: 4,
  },
  totalDistanceText: {
    color: '#F4F7F6',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 10,
  },
  addExerciseButton: {
    backgroundColor: '#22A398',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    marginTop: 14,
  },
  resetLapButton: {
    backgroundColor: '#22A398',
    padding: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  buttonText: {
    color: '#F4F7F6',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
});
