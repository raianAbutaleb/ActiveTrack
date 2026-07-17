import { Dispatch, SetStateAction, useEffect, useState } from 'react';
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

  gymSetWeight: string;
  setGymSetWeight: Dispatch<SetStateAction<string>>;

  currentGymSets: GymSet[];
  setCurrentGymSets: Dispatch<SetStateAction<GymSet[]>>;

  gymExercises: GymExercise[];
  setGymExercises: Dispatch<SetStateAction<GymExercise[]>>;
};

export default function GymTracker(props: Props) {
  const [restSeconds, setRestSeconds] = useState(0);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false);

  useEffect(() => {
    if (!isRestTimerRunning) {
      return;
    }

    const intervalId = setInterval(() => {
      setRestSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRestTimerRunning]);

  const formatRestTime = () => {
    const minutes = Math.floor(restSeconds / 60);
    const seconds = restSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const getBestGymSet = () => {
    const allSets = props.gymExercises.flatMap((exercise) =>
      exercise.sets.map((set) => ({
        exerciseName: exercise.name,
        reps: Number(set.reps) || 0,
        weight: Number(set.weight) || 0,
      }))
    );

    const weightedSets = allSets.filter((set) => set.weight > 0);

    if (weightedSets.length === 0) {
      return null;
    }

    return weightedSets.reduce((bestSet, set) =>
      set.weight > bestSet.weight ? set : bestSet
    );
  };

  const bestGymSet = getBestGymSet();

  if (props.selectedActivity !== 'Gym') {
    return null;
  }

  const addGymSet = () => {
    const cleanReps = props.gymSetReps.trim();
    const cleanWeight = props.gymSetWeight.trim();

    if (cleanReps === '') {
      alert('Please enter reps for this set');
      return;
    }

    const newSet: GymSet = {
      id: Date.now(),
      reps: cleanReps,
      weight: cleanWeight,
    };

    props.setCurrentGymSets([...props.currentGymSets, newSet]);
    props.setGymSetReps('');
    props.setGymSetWeight('');
    setRestSeconds(0);
    setIsRestTimerRunning(true);
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
    props.setGymSetWeight('');
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
        placeholderTextColor="#8f8f92"
        value={props.gymExerciseName}
        onChangeText={props.setGymExerciseName}
      />

      <View style={styles.scoreRow}>
        <TextInput
          style={styles.scoreInput}
          placeholder="Weight"
          placeholderTextColor="#8f8f92"
          value={props.gymSetWeight}
          onChangeText={props.setGymSetWeight}
          keyboardType="decimal-pad"
        />

        <TextInput
          style={styles.scoreInput}
          placeholder="Set reps"
          placeholderTextColor="#8f8f92"
          value={props.gymSetReps}
          onChangeText={props.setGymSetReps}
          keyboardType="number-pad"
        />

        <TouchableOpacity style={styles.addSetButton} onPress={addGymSet}>
          <Text style={styles.addSetText}>+ Set</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.restTimerBox}>
        <Text style={styles.restTimerTitle}>Rest Timer</Text>
        <Text style={styles.restTimerValue}>{formatRestTime()}</Text>
        <View style={styles.restButtonRow}>
          <TouchableOpacity
            style={styles.restButton}
            onPress={() => setIsRestTimerRunning(true)}
          >
            <Text style={styles.restButtonText}>Start</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restButton}
            onPress={() => setIsRestTimerRunning(false)}
          >
            <Text style={styles.restButtonText}>Pause</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restButton}
            onPress={() => {
              setIsRestTimerRunning(false);
              setRestSeconds(0);
            }}
          >
            <Text style={styles.restButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
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
                  Set {index + 1}: {set.weight ? `${set.weight} kg, ` : ''}{set.reps} reps
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
                    Set {setIndex + 1}: {set.weight ? `${set.weight} kg, ` : ''}{set.reps} reps
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

      <View style={styles.exerciseListBox}>
        <Text style={styles.exerciseListTitle}>Progress Summary</Text>
        {bestGymSet ? (
          <Text style={styles.exerciseDetails}>
            Best set: {bestGymSet.exerciseName} - {bestGymSet.weight} kg x {bestGymSet.reps} reps
          </Text>
        ) : (
          <Text style={styles.emptyHistory}>
            Add weight to your sets to track personal records.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  detailsBox: {
    backgroundColor: '#1f1f22',
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
    color: '#b8b8bb',
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
    backgroundColor: '#3a3a3d',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  selectedWorkoutButton: {
    backgroundColor: '#4a4a4d',
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
    backgroundColor: '#5a5a5d',
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
  restTimerBox: {
    backgroundColor: '#0f0f10',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  restTimerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  restTimerValue: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  restButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  restButton: {
    flex: 1,
    backgroundColor: '#2c2c2f',
    borderRadius: 10,
    padding: 10,
  },
  restButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '700',
  },
  addExerciseButton: {
    backgroundColor: '#5a5a5d',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    marginTop: 14,
  },
  exerciseListBox: {
    backgroundColor: '#0f0f10',
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
    borderBottomColor: '#3a3a3d',
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
    color: '#b8b8bb',
    fontSize: 15,
    marginBottom: 2,
  },
  exerciseDeleteButton: {
    backgroundColor: '#3f3f42',
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
    color: '#b8b8bb',
    fontSize: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
});
