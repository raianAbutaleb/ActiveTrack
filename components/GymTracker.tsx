import { Dispatch, SetStateAction } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { GymExercise, GymSet } from '../types';

const gymWorkoutDays = [
  'Chest',
  'Back',
  'Legs',
  'Shoulder',
  'Arms',
  'Abs',
  'Rest',
];

type Props = {
  selectedActivity: string | null;

  gymWorkoutDay: string;
  setGymWorkoutDay: Dispatch<SetStateAction<string>>;

  gymExerciseName: string;
  setGymExerciseName: Dispatch<SetStateAction<string>>;

  gymSetReps: string;
  setGymSetReps: Dispatch<SetStateAction<string>>;

  currentGymSets: GymSet[];
  setCurrentGymSets: Dispatch<SetStateAction<GymSet[]>>;

  gymExercises: GymExercise[];
  setGymExercises: Dispatch<SetStateAction<GymExercise[]>>;
};

export default function GymTracker(props: Props) {
  if (props.selectedActivity !== 'Gym') {
    return null;
  }

  const addGymSet = () => {
    const cleanReps = props.gymSetReps.trim();

    if (cleanReps === '') {
      alert('Please enter reps for this set');
      return;
    }

    const newSet: GymSet = {
      id: Date.now(),
      reps: cleanReps,
    };

    props.setCurrentGymSets([...props.currentGymSets, newSet]);
    props.setGymSetReps('');
  };

  const deleteCurrentGymSet = (setId: number) => {
    const newSets = props.currentGymSets.filter((set) => set.id !== setId);
    props.setCurrentGymSets(newSets);
  };

  const saveGymExercise = () => {
    const cleanExerciseName = props.gymExerciseName.trim();

    if (cleanExerciseName === '') {
      alert('Please enter exercise name');
      return;
    }

    if (props.currentGymSets.length === 0) {
      alert('Please add at least one set');
      return;
    }

    const newExercise: GymExercise = {
      id: Date.now(),
      name: cleanExerciseName,
      sets: props.currentGymSets,
    };

    props.setGymExercises([...props.gymExercises, newExercise]);

    props.setGymExerciseName('');
    props.setGymSetReps('');
    props.setCurrentGymSets([]);
  };

  const deleteGymExercise = (exerciseId: number) => {
    const newExercises = props.gymExercises.filter(
      (exercise) => exercise.id !== exerciseId
    );

    props.setGymExercises(newExercises);
  };

  return (
    <View style={styles.detailsBox}>
      <Text style={styles.detailsTitle}>Gym Workout</Text>
      <Text style={styles.detailsSubtitle}>Choose workout day</Text>

      <View style={styles.workoutGrid}>
        {gymWorkoutDays.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.workoutButton,
              props.gymWorkoutDay === day && styles.selectedWorkoutButton,
            ]}
            onPress={() => props.setGymWorkoutDay(day)}
          >
            <Text
              style={[
                styles.workoutButtonText,
                props.gymWorkoutDay === day && styles.selectedWorkoutButtonText,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.detailsSubtitle}>Current Exercise</Text>

      <TextInput
        style={styles.input}
        placeholder="Exercise name, example: Bench Press"
        placeholderTextColor="#888"
        value={props.gymExerciseName}
        onChangeText={props.setGymExerciseName}
      />

      <View style={styles.scoreRow}>
        <TextInput
          style={styles.scoreInput}
          placeholder="Set reps"
          placeholderTextColor="#888"
          value={props.gymSetReps}
          onChangeText={props.setGymSetReps}
          keyboardType="number-pad"
        />

        <TouchableOpacity style={styles.addSetButton} onPress={addGymSet}>
          <Text style={styles.addSetText}>+ Set</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.exerciseListBox}>
        <Text style={styles.exerciseListTitle}>Sets for This Exercise</Text>

        {props.currentGymSets.length === 0 ? (
          <Text style={styles.emptyHistory}>No sets added yet</Text>
        ) : (
          props.currentGymSets.map((set, index) => (
            <View key={set.id} style={styles.exerciseRow}>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>
                  Set {index + 1}: {set.reps} reps
                </Text>
              </View>

              <TouchableOpacity
                style={styles.exerciseDeleteButton}
                onPress={() => deleteCurrentGymSet(set.id)}
              >
                <Text style={styles.exerciseDeleteText}>X</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.addExerciseButton} onPress={saveGymExercise}>
        <Text style={styles.buttonText}>Save Exercise</Text>
      </TouchableOpacity>

      <View style={styles.exerciseListBox}>
        <Text style={styles.exerciseListTitle}>Exercises Added</Text>

        {props.gymExercises.length === 0 ? (
          <Text style={styles.emptyHistory}>No exercises saved yet</Text>
        ) : (
          props.gymExercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseRow}>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>
                  {index + 1}. {exercise.name}
                </Text>

                {exercise.sets.map((set, setIndex) => (
                  <Text key={set.id} style={styles.exerciseDetails}>
                    Set {setIndex + 1}: {set.reps} reps
                  </Text>
                ))}
              </View>

              <TouchableOpacity
                style={styles.exerciseDeleteButton}
                onPress={() => deleteGymExercise(exercise.id)}
              >
                <Text style={styles.exerciseDeleteText}>X</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  detailsBox: {
    backgroundColor: '#1b2733',
    padding: 18,
    borderRadius: 16,
    marginBottom: 22,
  },
  detailsTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  detailsSubtitle: {
    color: '#b0b0b0',
    fontSize: 16,
    marginBottom: 12,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    marginBottom: 12,
    color: '#000000',
  },
  workoutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  workoutButton: {
    backgroundColor: '#34495e',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  selectedWorkoutButton: {
    backgroundColor: '#1f8a70',
  },
  workoutButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  selectedWorkoutButtonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 10,
  },
  scoreInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
    color: '#000000',
  },
  addSetButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 18,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSetText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  addExerciseButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    marginTop: 14,
  },
  exerciseListBox: {
    backgroundColor: '#101820',
    padding: 14,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  exerciseListTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#34495e',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  exerciseDetails: {
    color: '#b0b0b0',
    fontSize: 15,
    marginBottom: 2,
  },
  exerciseDeleteButton: {
    backgroundColor: '#b84040',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  exerciseDeleteText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  emptyHistory: {
    color: '#b0b0b0',
    fontSize: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
});