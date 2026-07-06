import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  GestureHandlerRootView,
  Swipeable,
} from 'react-native-gesture-handler';

import {
  BalootScore,
  GymExercise,
  GymSet,
  MatchRound,
  Session,
} from '../../types';

const defaultActivities = [
  'Football',
  'Gym',
  'Run',
  'Padel',
  'Tennis',
  'Golf',
  'Horse Riding',
  'Cycling',
  'Walking',
  'Swimming',
  'Studying',
  'Baloot',
];

const gymWorkoutDays = [
  'Chest',
  'Back',
  'Legs',
  'Shoulder',
  'Arms',
  'Abs',
  'Rest',
];

const lapActivities = ['Run', 'Walking', 'Cycling', 'Swimming'];
const matchActivities = ['Padel', 'Tennis'];
const dealerDirections = ['↑', '→', '↓', '←'];


export default function HomeScreen() {
  const [activities, setActivities] = useState<string[]>(defaultActivities);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const [showOtherModal, setShowOtherModal] = useState(false);
  const [otherActivityName, setOtherActivityName] = useState('');

  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  const [sessions, setSessions] = useState<Session[]>([]);

  const [footballTeamOneName, setFootballTeamOneName] = useState('');
  const [footballTeamTwoName, setFootballTeamTwoName] = useState('');
  const [footballTeamOneScore, setFootballTeamOneScore] = useState('');
  const [footballTeamTwoScore, setFootballTeamTwoScore] = useState('');

  const [gymWorkoutDay, setGymWorkoutDay] = useState('');
  const [gymExerciseName, setGymExerciseName] = useState('');
  const [gymSetReps, setGymSetReps] = useState('');
  const [currentGymSets, setCurrentGymSets] = useState<GymSet[]>([]);
  const [gymExercises, setGymExercises] = useState<GymExercise[]>([]);

  const [lapCount, setLapCount] = useState(0);
  const [lapDistance, setLapDistance] = useState('');
  const [lapDistanceUnit, setLapDistanceUnit] = useState('m');

  const [matchTeamOneName, setMatchTeamOneName] = useState('');
  const [matchTeamTwoName, setMatchTeamTwoName] = useState('');
  const [matchTeamOneGames, setMatchTeamOneGames] = useState('');
  const [matchTeamTwoGames, setMatchTeamTwoGames] = useState('');
  const [matchRounds, setMatchRounds] = useState<MatchRound[]>([]);

  const [balootUsScore, setBalootUsScore] = useState('');
  const [balootThemScore, setBalootThemScore] = useState('');
  const [balootScores, setBalootScores] = useState<BalootScore[]>([]);
  const [balootDealerDirection, setBalootDealerDirection] = useState('↑');

  const [horseName, setHorseName] = useState('');
  const [horseTrainingType, setHorseTrainingType] = useState('');
  const [horseRestDay, setHorseRestDay] = useState(false);
  const [horseWalkingMinutes, setHorseWalkingMinutes] = useState('');

  const [horseHayGiven, setHorseHayGiven] = useState(false);
  const [horseWaterChecked, setHorseWaterChecked] = useState(false);
  const [horseFoodOilGiven, setHorseFoodOilGiven] = useState(false);
  const [horseShampooUsed, setHorseShampooUsed] = useState(false);
  const [horsePadsCleaningSuppliesUsed, setHorsePadsCleaningSuppliesUsed] = useState(false);
  const [horseHoofOilUsed, setHorseHoofOilUsed] = useState(false);

  const [horseReleveAmount, setHorseReleveAmount] = useState('');
  const [horseReleveBuyingDate, setHorseReleveBuyingDate] = useState('');

  const [horseEquiJewelAmount, setHorseEquiJewelAmount] = useState('');
  const [horseEquiJewelBuyingDate, setHorseEquiJewelBuyingDate] = useState('');

  const [horseFoodOilBuyingDate, setHorseFoodOilBuyingDate] = useState('');
  const [horseShampooBuyingDate, setHorseShampooBuyingDate] = useState('');
  const [horsePadsCleaningSuppliesBuyingDate, setHorsePadsCleaningSuppliesBuyingDate] = useState('');
  const [horseHoofOilBuyingDate, setHorseHoofOilBuyingDate] = useState('');

  const [horseDressageTestDay, setHorseDressageTestDay] = useState(false);
  const [horseDressageTestName, setHorseDressageTestName] = useState('');
  const [horseDressageScore, setHorseDressageScore] = useState('');
  const [horseDressageNotes, setHorseDressageNotes] = useState('');

  const [horseJumpingDay, setHorseJumpingDay] = useState(false);
  const [horseFenceHeight, setHorseFenceHeight] = useState('');
  const [horseFenceCount, setHorseFenceCount] = useState('');
  const [horseJumpingNotes, setHorseJumpingNotes] = useState('');

  const [horseNotes, setHorseNotes] = useState('');

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const savedSessions = await AsyncStorage.getItem('sessions');
      const savedActivities = await AsyncStorage.getItem('activities');

      if (savedSessions) {
        setSessions(JSON.parse(savedSessions));
      }

      if (savedActivities) {
        setActivities(JSON.parse(savedActivities));
      }
    } catch (error) {
      alert('Error loading saved data');
    }
  };

  const saveSessionsToStorage = async (newSessions: Session[]) => {
    try {
      await AsyncStorage.setItem('sessions', JSON.stringify(newSessions));
    } catch (error) {
      alert('Error saving session');
    }
  };

  const saveActivitiesToStorage = async (newActivities: string[]) => {
    try {
      await AsyncStorage.setItem('activities', JSON.stringify(newActivities));
    } catch (error) {
      alert('Error saving activity list');
    }
  };

  const isLapActivity = (activity: string | null) => {
    if (!activity) {
      return false;
    }

    return lapActivities.includes(activity);
  };

  const isMatchActivity = (activity: string | null) => {
    if (!activity) {
      return false;
    }

    return matchActivities.includes(activity);
  };

  const isBalootActivity = (activity: string | null) => {
    return activity === 'Baloot';
  };

  const isHorseRidingActivity = (activity: string | null) => {
    return activity === 'Horse Riding';
  };

  const getDefaultLapDistance = (activity: string) => {
    if (activity === 'Cycling') {
      return {
        distance: '1',
        unit: 'km',
      };
    }

    if (activity === 'Swimming') {
      return {
        distance: '25',
        unit: 'm',
      };
    }

    return {
      distance: '400',
      unit: 'm',
    };
  };

  const resetActivityFields = () => {
    setFootballTeamOneName('');
    setFootballTeamTwoName('');
    setFootballTeamOneScore('');
    setFootballTeamTwoScore('');

    setGymWorkoutDay('');
    setGymExerciseName('');
    setGymSetReps('');
    setCurrentGymSets([]);
    setGymExercises([]);

    setLapCount(0);
    setLapDistance('');
    setLapDistanceUnit('m');

    setMatchTeamOneName('');
    setMatchTeamTwoName('');
    setMatchTeamOneGames('');
    setMatchTeamTwoGames('');
    setMatchRounds([]);

    setBalootUsScore('');
    setBalootThemScore('');
    setBalootScores([]);
    setBalootDealerDirection('↑');

    setHorseName('');
    setHorseTrainingType('');
    setHorseRestDay(false);
    setHorseWalkingMinutes('');

    setHorseHayGiven(false);
    setHorseWaterChecked(false);
    setHorseFoodOilGiven(false);
    setHorseShampooUsed(false);
    setHorsePadsCleaningSuppliesUsed(false);
    setHorseHoofOilUsed(false);

    setHorseReleveAmount('');
    setHorseReleveBuyingDate('');

    setHorseEquiJewelAmount('');
    setHorseEquiJewelBuyingDate('');

    setHorseFoodOilBuyingDate('');
    setHorseShampooBuyingDate('');
    setHorsePadsCleaningSuppliesBuyingDate('');
    setHorseHoofOilBuyingDate('');

    setHorseDressageTestDay(false);
    setHorseDressageTestName('');
    setHorseDressageScore('');
    setHorseDressageNotes('');

    setHorseJumpingDay(false);
    setHorseFenceHeight('');
    setHorseFenceCount('');
    setHorseJumpingNotes('');

    setHorseNotes('');
  };

  const openActivity = (activity: string) => {
    setSelectedActivity(activity);
    setStartTime(null);
    setEndTime(null);
    resetActivityFields();

    if (lapActivities.includes(activity)) {
      const defaultLap = getDefaultLapDistance(activity);
      setLapDistance(defaultLap.distance);
      setLapDistanceUnit(defaultLap.unit);
    }
  };

  const openOtherModal = () => {
    setOtherActivityName('');
    setShowOtherModal(true);
  };

  const addOtherActivity = () => {
    const cleanName = otherActivityName.trim();

    if (cleanName === '') {
      alert('Please enter an activity name');
      return;
    }

    const alreadyExists = activities.some(
      (activity) => activity.toLowerCase() === cleanName.toLowerCase()
    );

    if (alreadyExists) {
      alert('This activity already exists');
      return;
    }

    const newActivities = [...activities, cleanName];

    setActivities(newActivities);
    saveActivitiesToStorage(newActivities);

    setShowOtherModal(false);
    setSelectedActivity(cleanName);
    setStartTime(null);
    setEndTime(null);
    resetActivityFields();
  };

  const deleteActivity = (activityName: string) => {
    const newActivities = activities.filter((activity) => activity !== activityName);

    setActivities(newActivities);
    saveActivitiesToStorage(newActivities);
  };

  const confirmDeleteActivity = (activityName: string) => {
    Alert.alert(
      'Delete Activity',
      `Are you sure you want to delete ${activityName} from the activity list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteActivity(activityName),
        },
      ]
    );
  };

  const resetActivityList = () => {
    Alert.alert(
      'Reset Activity List',
      'This will restore the original activity list. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setActivities(defaultActivities);
            saveActivitiesToStorage(defaultActivities);
          },
        },
      ]
    );
  };

  const startActivity = () => {
    setStartTime(new Date());
    setEndTime(null);
  };

  const endActivity = () => {
    if (!startTime) {
      alert('Please start the activity first');
      return;
    }

    setEndTime(new Date());
  };

  const addLap = () => {
    if (!startTime) {
      alert('Please start the activity first');
      return;
    }

    if (endTime) {
      alert('Activity already ended');
      return;
    }

    setLapCount(lapCount + 1);
  };

  const resetLaps = () => {
    setLapCount(0);
  };

  const getTotalLapDistance = () => {
    const distanceNumber = Number(lapDistance);

    if (!distanceNumber || lapCount === 0) {
      return `0 ${lapDistanceUnit}`;
    }

    const total = distanceNumber * lapCount;

    if (lapDistanceUnit === 'm' && total >= 1000) {
      const kmTotal = total / 1000;
      return `${kmTotal.toFixed(2)} km`;
    }

    return `${total} ${lapDistanceUnit}`;
  };

  const getDurationSeconds = () => {
    if (!startTime || !endTime) {
      return 0;
    }

    return Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
  };

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours} hr ${minutes} min ${seconds} sec`;
    }

    if (minutes > 0) {
      return `${minutes} min ${seconds} sec`;
    }

    return `${seconds} sec`;
  };

  const getDuration = () => {
    if (!startTime || !endTime) {
      return 'Not finished yet';
    }

    return formatDuration(getDurationSeconds());
  };

  const addGymSet = () => {
    const cleanReps = gymSetReps.trim();

    if (cleanReps === '') {
      alert('Please enter reps for this set');
      return;
    }

    const newSet: GymSet = {
      id: Date.now(),
      reps: cleanReps,
    };

    setCurrentGymSets([...currentGymSets, newSet]);
    setGymSetReps('');
  };

  const deleteCurrentGymSet = (setId: number) => {
    const newSets = currentGymSets.filter((set) => set.id !== setId);
    setCurrentGymSets(newSets);
  };

  const saveGymExercise = () => {
    const cleanExerciseName = gymExerciseName.trim();

    if (cleanExerciseName === '') {
      alert('Please enter exercise name');
      return;
    }

    if (currentGymSets.length === 0) {
      alert('Please add at least one set');
      return;
    }

    const newExercise: GymExercise = {
      id: Date.now(),
      name: cleanExerciseName,
      sets: currentGymSets,
    };

    setGymExercises([...gymExercises, newExercise]);

    setGymExerciseName('');
    setGymSetReps('');
    setCurrentGymSets([]);
  };

  const deleteGymExercise = (exerciseId: number) => {
    const newExercises = gymExercises.filter((exercise) => exercise.id !== exerciseId);
    setGymExercises(newExercises);
  };

  const addMatchRound = () => {
    const cleanTeamOneGames = matchTeamOneGames.trim();
    const cleanTeamTwoGames = matchTeamTwoGames.trim();

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
      alert('Each round should be 6 games or less');
      return;
    }

    const newRound: MatchRound = {
      id: Date.now(),
      teamOneGames: cleanTeamOneGames,
      teamTwoGames: cleanTeamTwoGames,
    };

    setMatchRounds([...matchRounds, newRound]);
    setMatchTeamOneGames('');
    setMatchTeamTwoGames('');
  };

  const deleteMatchRound = (roundId: number) => {
    const newRounds = matchRounds.filter((round) => round.id !== roundId);
    setMatchRounds(newRounds);
  };

  const getMatchTeamOneTotal = () => {
    return matchRounds.reduce((total, round) => {
      return total + Number(round.teamOneGames || 0);
    }, 0);
  };

  const getMatchTeamTwoTotal = () => {
    return matchRounds.reduce((total, round) => {
      return total + Number(round.teamTwoGames || 0);
    }, 0);
  };

  const getBalootUsTotalFromScores = (scores: BalootScore[]) => {
    return scores.reduce((total, score) => {
      return total + Number(score.us || 0);
    }, 0);
  };

  const getBalootThemTotalFromScores = (scores: BalootScore[]) => {
    return scores.reduce((total, score) => {
      return total + Number(score.them || 0);
    }, 0);
  };

  const getBalootUsTotal = () => {
    return getBalootUsTotalFromScores(balootScores);
  };

  const getBalootThemTotal = () => {
    return getBalootThemTotalFromScores(balootScores);
  };

  const getBalootWinner = (usTotal: number, themTotal: number) => {
    if (usTotal >= 152 && usTotal > themTotal) {
      return 'Us';
    }

    if (themTotal >= 152 && themTotal > usTotal) {
      return 'Them';
    }

    if (usTotal >= 152 && themTotal >= 152 && usTotal === themTotal) {
      return 'Tie - play one more hand';
    }

    return 'Not finished yet';
  };

  const getCurrentBalootWinner = () => {
    return getBalootWinner(getBalootUsTotal(), getBalootThemTotal());
  };

  const addBalootScore = () => {
    const cleanUsScore = balootUsScore.trim();
    const cleanThemScore = balootThemScore.trim();

    if (cleanUsScore === '') {
      alert('Please enter Us score');
      return;
    }

    if (cleanThemScore === '') {
      alert('Please enter Them score');
      return;
    }

    const usNumber = Number(cleanUsScore);
    const themNumber = Number(cleanThemScore);

    if (Number.isNaN(usNumber) || Number.isNaN(themNumber)) {
      alert('Scores must be numbers');
      return;
    }

    if (usNumber < 0 || themNumber < 0) {
      alert('Scores cannot be negative');
      return;
    }

    const newScore: BalootScore = {
      id: Date.now(),
      us: cleanUsScore,
      them: cleanThemScore,
    };

    const newScores = [...balootScores, newScore];
    const usTotal = getBalootUsTotalFromScores(newScores);
    const themTotal = getBalootThemTotalFromScores(newScores);
    const winner = getBalootWinner(usTotal, themTotal);

    setBalootScores(newScores);
    setBalootUsScore('');
    setBalootThemScore('');

    if (winner === 'Us' || winner === 'Them') {
      Alert.alert('Baloot Winner', `${winner} reached 152 and won.`);
    }
  };

  const deleteBalootScore = (scoreId: number) => {
    const newScores = balootScores.filter((score) => score.id !== scoreId);
    setBalootScores(newScores);
  };

  const deleteLastBalootScore = () => {
    if (balootScores.length === 0) {
      alert('No score to delete');
      return;
    }

    const newScores = balootScores.slice(0, -1);
    setBalootScores(newScores);
  };

  const resetBalootScores = () => {
    setBalootScores([]);
    setBalootUsScore('');
    setBalootThemScore('');
  };

  const changeDealerDirection = () => {
    const currentIndex = dealerDirections.indexOf(balootDealerDirection);
    const nextIndex = (currentIndex + 1) % dealerDirections.length;

    setBalootDealerDirection(dealerDirections[nextIndex]);
  };

  const saveSession = () => {
    if (!selectedActivity || !startTime || !endTime) {
      alert('Please start and end the activity first');
      return;
    }

    if (selectedActivity === 'Gym' && gymWorkoutDay === '') {
      alert('Please choose workout day');
      return;
    }

    if (isLapActivity(selectedActivity) && lapDistance.trim() === '') {
      alert('Please enter lap distance');
      return;
    }

    if (isMatchActivity(selectedActivity)) {
      if (matchTeamOneName.trim() === '') {
        alert('Please enter Team 1 name');
        return;
      }

      if (matchTeamTwoName.trim() === '') {
        alert('Please enter Team 2 name');
        return;
      }
    }

    let finalGymExercises = gymExercises;

    if (selectedActivity === 'Gym') {
      const cleanExerciseName = gymExerciseName.trim();

      if (cleanExerciseName !== '' && currentGymSets.length > 0) {
        const unfinishedExercise: GymExercise = {
          id: Date.now(),
          name: cleanExerciseName,
          sets: currentGymSets,
        };

        finalGymExercises = [...gymExercises, unfinishedExercise];
      }
    }

    let finalMatchRounds = matchRounds;

    if (isMatchActivity(selectedActivity)) {
      const cleanTeamOneGames = matchTeamOneGames.trim();
      const cleanTeamTwoGames = matchTeamTwoGames.trim();

      if (cleanTeamOneGames !== '' && cleanTeamTwoGames !== '') {
        const unfinishedRound: MatchRound = {
          id: Date.now(),
          teamOneGames: cleanTeamOneGames,
          teamTwoGames: cleanTeamTwoGames,
        };

        finalMatchRounds = [...matchRounds, unfinishedRound];
      }
    }

    let finalBalootScores = balootScores;

    if (isBalootActivity(selectedActivity)) {
      const cleanUsScore = balootUsScore.trim();
      const cleanThemScore = balootThemScore.trim();

      if (cleanUsScore !== '' && cleanThemScore !== '') {
        const unfinishedScore: BalootScore = {
          id: Date.now(),
          us: cleanUsScore,
          them: cleanThemScore,
        };

        finalBalootScores = [...balootScores, unfinishedScore];
      }
    }

    const newSession: Session = {
      id: Date.now(),
      activity: selectedActivity,
      start: startTime.toLocaleTimeString(),
      end: endTime.toLocaleTimeString(),
      duration: getDuration(),
      durationSeconds: getDurationSeconds(),
      date: new Date().toLocaleDateString(),
    };

    if (selectedActivity === 'Football') {
      newSession.details = {
        teamOneName: footballTeamOneName.trim(),
        teamTwoName: footballTeamTwoName.trim(),
        teamOneScore: footballTeamOneScore.trim(),
        teamTwoScore: footballTeamTwoScore.trim(),
      };
    }

    if (selectedActivity === 'Gym') {
      newSession.details = {
        gymWorkoutDay: gymWorkoutDay.trim(),
        gymExercises: finalGymExercises,
      };
    }

    if (isLapActivity(selectedActivity)) {
      newSession.details = {
        laps: lapCount,
        lapDistance: lapDistance.trim(),
        lapDistanceUnit: lapDistanceUnit,
        totalDistance: getTotalLapDistance(),
      };
    }

    if (isMatchActivity(selectedActivity)) {
      const teamOneTotal = finalMatchRounds.reduce((total, round) => {
        return total + Number(round.teamOneGames || 0);
      }, 0);

      const teamTwoTotal = finalMatchRounds.reduce((total, round) => {
        return total + Number(round.teamTwoGames || 0);
      }, 0);

      newSession.details = {
        matchTeamOneName: matchTeamOneName.trim(),
        matchTeamTwoName: matchTeamTwoName.trim(),
        matchRounds: finalMatchRounds,
        matchTeamOneTotal: teamOneTotal,
        matchTeamTwoTotal: teamTwoTotal,
      };
    }

    if (isBalootActivity(selectedActivity)) {
      const usTotal = getBalootUsTotalFromScores(finalBalootScores);
      const themTotal = getBalootThemTotalFromScores(finalBalootScores);

      newSession.details = {
        balootScores: finalBalootScores,
        balootUsTotal: usTotal,
        balootThemTotal: themTotal,
        balootWinner: getBalootWinner(usTotal, themTotal),
        balootDealerDirection: balootDealerDirection,
      };
    }

    if (isHorseRidingActivity(selectedActivity)) {
      newSession.details = {
        horseRiding: {
          horseName: horseName.trim(),
          trainingType: horseTrainingType.trim(),
          restDay: horseRestDay,
          walkingMinutes: horseWalkingMinutes.trim(),

          hayGiven: horseHayGiven,
          waterChecked: horseWaterChecked,
          foodOilGiven: horseFoodOilGiven,
          shampooUsed: horseShampooUsed,
          padsCleaningSuppliesUsed: horsePadsCleaningSuppliesUsed,
          hoofOilUsed: horseHoofOilUsed,

          releveAmount: horseReleveAmount.trim(),
          releveBuyingDate: horseReleveBuyingDate.trim(),

          equiJewelAmount: horseEquiJewelAmount.trim(),
          equiJewelBuyingDate: horseEquiJewelBuyingDate.trim(),

          foodOilBuyingDate: horseFoodOilBuyingDate.trim(),
          shampooBuyingDate: horseShampooBuyingDate.trim(),
          padsCleaningSuppliesBuyingDate: horsePadsCleaningSuppliesBuyingDate.trim(),
          hoofOilBuyingDate: horseHoofOilBuyingDate.trim(),

          dressageTestDay: horseDressageTestDay,
          dressageTestName: horseDressageTestName.trim(),
          dressageScore: horseDressageScore.trim(),
          dressageNotes: horseDressageNotes.trim(),

          jumpingDay: horseJumpingDay,
          fenceHeight: horseFenceHeight.trim(),
          fenceCount: horseFenceCount.trim(),
          jumpingNotes: horseJumpingNotes.trim(),

          horseNotes: horseNotes.trim(),
        },
      };
    }

    const newSessions = [newSession, ...sessions];

    setSessions(newSessions);
    saveSessionsToStorage(newSessions);

    alert('Session saved successfully');

    setSelectedActivity(null);
    setStartTime(null);
    setEndTime(null);
    resetActivityFields();
  };

  const deleteSession = (sessionId: number) => {
    const newSessions = sessions.filter((session) => session.id !== sessionId);

    setSessions(newSessions);
    saveSessionsToStorage(newSessions);
  };

  const confirmDeleteSession = (sessionId: number) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSession(sessionId),
        },
      ]
    );
  };

  const clearAllHistory = () => {
    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all saved sessions?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            setSessions([]);
            saveSessionsToStorage([]);
          },
        },
      ]
    );
  };

  const goBackToList = () => {
    setSelectedActivity(null);
    setStartTime(null);
    setEndTime(null);
    resetActivityFields();
  };

  const getTotalTime = () => {
    const totalSeconds = sessions.reduce((total, session) => {
      return total + (session.durationSeconds || 0);
    }, 0);

    return formatDuration(totalSeconds);
  };

  const getMostPracticedActivity = () => {
    if (sessions.length === 0) {
      return 'None yet';
    }

    const activityCounts: Record<string, number> = {};

    sessions.forEach((session) => {
      activityCounts[session.activity] = (activityCounts[session.activity] || 0) + 1;
    });

    let mostPracticed = sessions[0].activity;
    let highestCount = 0;

    Object.keys(activityCounts).forEach((activity) => {
      if (activityCounts[activity] > highestCount) {
        mostPracticed = activity;
        highestCount = activityCounts[activity];
      }
    });

    return `${mostPracticed} (${highestCount})`;
  };

  const renderActivityDeleteAction = (activityName: string) => {
    return (
      <TouchableOpacity
        style={styles.swipeDeleteAction}
        onPress={() => confirmDeleteActivity(activityName)}
      >
        <Text style={styles.swipeDeleteText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  const renderSessionDeleteAction = (sessionId: number) => {
    return (
      <TouchableOpacity
        style={styles.swipeDeleteAction}
        onPress={() => confirmDeleteSession(sessionId)}
      >
        <Text style={styles.swipeDeleteText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  const renderYesNoButton = (
    label: string,
    value: boolean,
    onPress: () => void
  ) => {
    return (
      <TouchableOpacity
        style={[styles.toggleButton, value && styles.selectedToggleButton]}
        onPress={onPress}
      >
        <Text style={[styles.toggleText, value && styles.selectedToggleText]}>
          {label}: {value ? 'Yes' : 'No'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFootballFields = () => {
    if (selectedActivity !== 'Football') {
      return null;
    }

    return (
      <View style={styles.detailsBox}>
        <Text style={styles.detailsTitle}>Football Details</Text>

        <TextInput
          style={styles.input}
          placeholder="Team 1 name"
          placeholderTextColor="#888"
          value={footballTeamOneName}
          onChangeText={setFootballTeamOneName}
        />

        <TextInput
          style={styles.input}
          placeholder="Team 2 name"
          placeholderTextColor="#888"
          value={footballTeamTwoName}
          onChangeText={setFootballTeamTwoName}
        />

        <View style={styles.scoreRow}>
          <TextInput
            style={styles.scoreInput}
            placeholder="Team 1 score"
            placeholderTextColor="#888"
            value={footballTeamOneScore}
            onChangeText={setFootballTeamOneScore}
            keyboardType="number-pad"
          />

          <TextInput
            style={styles.scoreInput}
            placeholder="Team 2 score"
            placeholderTextColor="#888"
            value={footballTeamTwoScore}
            onChangeText={setFootballTeamTwoScore}
            keyboardType="number-pad"
          />
        </View>
      </View>
    );
  };

  const renderGymFields = () => {
    if (selectedActivity !== 'Gym') {
      return null;
    }

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
                gymWorkoutDay === day && styles.selectedWorkoutButton,
              ]}
              onPress={() => setGymWorkoutDay(day)}
            >
              <Text
                style={[
                  styles.workoutButtonText,
                  gymWorkoutDay === day && styles.selectedWorkoutButtonText,
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
          value={gymExerciseName}
          onChangeText={setGymExerciseName}
        />

        <View style={styles.scoreRow}>
          <TextInput
            style={styles.scoreInput}
            placeholder="Set reps"
            placeholderTextColor="#888"
            value={gymSetReps}
            onChangeText={setGymSetReps}
            keyboardType="number-pad"
          />

          <TouchableOpacity style={styles.addSetButton} onPress={addGymSet}>
            <Text style={styles.addSetText}>+ Set</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.exerciseListBox}>
          <Text style={styles.exerciseListTitle}>Sets for This Exercise</Text>

          {currentGymSets.length === 0 ? (
            <Text style={styles.emptyHistory}>No sets added yet</Text>
          ) : (
            currentGymSets.map((set, index) => (
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

          {gymExercises.length === 0 ? (
            <Text style={styles.emptyHistory}>No exercises saved yet</Text>
          ) : (
            gymExercises.map((exercise, index) => (
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
  };

  const renderLapFields = () => {
    if (!isLapActivity(selectedActivity)) {
      return null;
    }

    return (
      <View style={styles.detailsBox}>
        <Text style={styles.detailsTitle}>{selectedActivity} Laps</Text>

        <Text style={styles.detailsSubtitle}>Lap distance</Text>

        <View style={styles.scoreRow}>
          <TextInput
            style={styles.scoreInput}
            placeholder="Lap distance"
            placeholderTextColor="#888"
            value={lapDistance}
            onChangeText={setLapDistance}
            keyboardType="decimal-pad"
          />

          <TouchableOpacity
            style={[
              styles.unitButton,
              lapDistanceUnit === 'm' && styles.selectedUnitButton,
            ]}
            onPress={() => setLapDistanceUnit('m')}
          >
            <Text style={styles.unitButtonText}>m</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.unitButton,
              lapDistanceUnit === 'km' && styles.selectedUnitButton,
            ]}
            onPress={() => setLapDistanceUnit('km')}
          >
            <Text style={styles.unitButtonText}>km</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.lapBox}>
          <Text style={styles.lapNumber}>{lapCount}</Text>
          <Text style={styles.lapLabel}>laps completed</Text>
          <Text style={styles.totalDistanceText}>
            Total distance: {getTotalLapDistance()}
          </Text>
        </View>

        <TouchableOpacity style={styles.addExerciseButton} onPress={addLap}>
          <Text style={styles.buttonText}>+ Add Lap</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetLapButton} onPress={resetLaps}>
          <Text style={styles.buttonText}>Reset Laps</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderMatchFields = () => {
    if (!isMatchActivity(selectedActivity)) {
      return null;
    }

    return (
      <View style={styles.detailsBox}>
        <Text style={styles.detailsTitle}>{selectedActivity} Match</Text>

        <TextInput
          style={styles.input}
          placeholder="Team 1 name"
          placeholderTextColor="#888"
          value={matchTeamOneName}
          onChangeText={setMatchTeamOneName}
        />

        <TextInput
          style={styles.input}
          placeholder="Team 2 name"
          placeholderTextColor="#888"
          value={matchTeamTwoName}
          onChangeText={setMatchTeamTwoName}
        />

        <Text style={styles.detailsSubtitle}>Add round score</Text>

        <View style={styles.scoreRow}>
          <TextInput
            style={styles.scoreInput}
            placeholder="Team 1 games"
            placeholderTextColor="#888"
            value={matchTeamOneGames}
            onChangeText={setMatchTeamOneGames}
            keyboardType="number-pad"
          />

          <TextInput
            style={styles.scoreInput}
            placeholder="Team 2 games"
            placeholderTextColor="#888"
            value={matchTeamTwoGames}
            onChangeText={setMatchTeamTwoGames}
            keyboardType="number-pad"
          />
        </View>

        <TouchableOpacity style={styles.addExerciseButton} onPress={addMatchRound}>
          <Text style={styles.buttonText}>+ Add Round</Text>
        </TouchableOpacity>

        <View style={styles.exerciseListBox}>
          <Text style={styles.exerciseListTitle}>Rounds Added</Text>

          {matchRounds.length === 0 ? (
            <Text style={styles.emptyHistory}>No rounds added yet</Text>
          ) : (
            matchRounds.map((round, index) => (
              <View key={round.id} style={styles.exerciseRow}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>
                    Round {index + 1}: {round.teamOneGames} - {round.teamTwoGames}
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
          <Text style={styles.matchTotalTitle}>Total Games</Text>
          <Text style={styles.matchTotalText}>
            {matchTeamOneName || 'Team 1'}: {getMatchTeamOneTotal()}
          </Text>
          <Text style={styles.matchTotalText}>
            {matchTeamTwoName || 'Team 2'}: {getMatchTeamTwoTotal()}
          </Text>
        </View>
      </View>
    );
  };

  const renderBalootFields = () => {
    if (!isBalootActivity(selectedActivity)) {
      return null;
    }

    return (
      <View style={styles.detailsBox}>
        <Text style={styles.detailsTitle}>Baloot Calculator</Text>
        <Text style={styles.detailsSubtitle}>First side to 152 wins</Text>

        <View style={styles.balootTotalBox}>
          <View style={styles.balootTotalColumn}>
            <Text style={styles.balootSideTitle}>Us</Text>
            <Text style={styles.balootTotalNumber}>{getBalootUsTotal()}</Text>
          </View>

          <View style={styles.balootTotalColumn}>
            <Text style={styles.balootSideTitle}>Them</Text>
            <Text style={styles.balootTotalNumber}>{getBalootThemTotal()}</Text>
          </View>
        </View>

        <View style={styles.winnerBox}>
          <Text style={styles.winnerLabel}>Winner</Text>
          <Text style={styles.winnerText}>{getCurrentBalootWinner()}</Text>
        </View>

        <TouchableOpacity style={styles.dealerBox} onPress={changeDealerDirection}>
          <Text style={styles.dealerTitle}>Dealer Direction</Text>
          <Text style={styles.dealerArrow}>{balootDealerDirection}</Text>
          <Text style={styles.dealerHint}>Tap to change dealer</Text>
        </TouchableOpacity>

        <Text style={styles.detailsSubtitle}>Add hand score</Text>

        <View style={styles.scoreRow}>
          <TextInput
            style={styles.scoreInput}
            placeholder="Us"
            placeholderTextColor="#888"
            value={balootUsScore}
            onChangeText={setBalootUsScore}
            keyboardType="number-pad"
          />

          <TextInput
            style={styles.scoreInput}
            placeholder="Them"
            placeholderTextColor="#888"
            value={balootThemScore}
            onChangeText={setBalootThemScore}
            keyboardType="number-pad"
          />
        </View>

        <TouchableOpacity style={styles.addExerciseButton} onPress={addBalootScore}>
          <Text style={styles.buttonText}>+ Add Score</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteLastButton} onPress={deleteLastBalootScore}>
          <Text style={styles.buttonText}>Delete Last Score</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetLapButton} onPress={resetBalootScores}>
          <Text style={styles.buttonText}>Reset Baloot Scores</Text>
        </TouchableOpacity>

        <View style={styles.exerciseListBox}>
          <Text style={styles.exerciseListTitle}>Score History</Text>

          {balootScores.length === 0 ? (
            <Text style={styles.emptyHistory}>No scores added yet</Text>
          ) : (
            balootScores.map((score, index) => (
              <View key={score.id} style={styles.exerciseRow}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>
                    Hand {index + 1}: Us {score.us} - Them {score.them}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.exerciseDeleteButton}
                  onPress={() => deleteBalootScore(score.id)}
                >
                  <Text style={styles.exerciseDeleteText}>X</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </View>
    );
  };

  const renderHorseRidingFields = () => {
    if (!isHorseRidingActivity(selectedActivity)) {
      return null;
    }

    return (
      <View style={styles.detailsBox}>
        <Text style={styles.detailsTitle}>Horse Riding</Text>

        <TextInput
          style={styles.input}
          placeholder="Horse name, example: Durkji"
          placeholderTextColor="#888"
          value={horseName}
          onChangeText={setHorseName}
        />

        <TextInput
          style={styles.input}
          placeholder="Training type, example: Dressage / Flatwork / Jumping"
          placeholderTextColor="#888"
          value={horseTrainingType}
          onChangeText={setHorseTrainingType}
        />

        {renderYesNoButton('Rest Day', horseRestDay, () => setHorseRestDay(!horseRestDay))}

        <TextInput
          style={styles.input}
          placeholder="Daily walking minutes"
          placeholderTextColor="#888"
          value={horseWalkingMinutes}
          onChangeText={setHorseWalkingMinutes}
          keyboardType="number-pad"
        />

        <Text style={styles.detailsSubtitle}>Daily Care</Text>

        {renderYesNoButton('Hay Given', horseHayGiven, () => setHorseHayGiven(!horseHayGiven))}
        {renderYesNoButton('Water Checked', horseWaterChecked, () => setHorseWaterChecked(!horseWaterChecked))}

        {renderYesNoButton('Food Oil Given', horseFoodOilGiven, () => setHorseFoodOilGiven(!horseFoodOilGiven))}

        <TextInput
          style={styles.input}
          placeholder="Food oil buying date, example: 06/07/2026"
          placeholderTextColor="#888"
          value={horseFoodOilBuyingDate}
          onChangeText={setHorseFoodOilBuyingDate}
        />

        {renderYesNoButton('Hoof Oil Used', horseHoofOilUsed, () => setHorseHoofOilUsed(!horseHoofOilUsed))}

        <TextInput
          style={styles.input}
          placeholder="Hoof oil buying date, example: 06/07/2026"
          placeholderTextColor="#888"
          value={horseHoofOilBuyingDate}
          onChangeText={setHorseHoofOilBuyingDate}
        />

        <Text style={styles.detailsSubtitle}>Cleaning Supplies</Text>

        {renderYesNoButton('Shampoo Used', horseShampooUsed, () => setHorseShampooUsed(!horseShampooUsed))}

        <TextInput
          style={styles.input}
          placeholder="Shampoo buying date, example: 06/07/2026"
          placeholderTextColor="#888"
          value={horseShampooBuyingDate}
          onChangeText={setHorseShampooBuyingDate}
        />

        {renderYesNoButton('Pads Cleaning Supplies Used', horsePadsCleaningSuppliesUsed, () =>
          setHorsePadsCleaningSuppliesUsed(!horsePadsCleaningSuppliesUsed)
        )}

        <TextInput
          style={styles.input}
          placeholder="Pads cleaning supplies buying date"
          placeholderTextColor="#888"
          value={horsePadsCleaningSuppliesBuyingDate}
          onChangeText={setHorsePadsCleaningSuppliesBuyingDate}
        />

        <Text style={styles.detailsSubtitle}>Monthly Feed</Text>

        <TextInput
          style={styles.input}
          placeholder="Re-Leve amount, example: 2 kg"
          placeholderTextColor="#888"
          value={horseReleveAmount}
          onChangeText={setHorseReleveAmount}
        />

        <TextInput
          style={styles.input}
          placeholder="Re-Leve buying date, example: 06/07/2026"
          placeholderTextColor="#888"
          value={horseReleveBuyingDate}
          onChangeText={setHorseReleveBuyingDate}
        />

        <TextInput
          style={styles.input}
          placeholder="Equi Jewel amount, example: 0.5 kg"
          placeholderTextColor="#888"
          value={horseEquiJewelAmount}
          onChangeText={setHorseEquiJewelAmount}
        />

        <TextInput
          style={styles.input}
          placeholder="Equi Jewel buying date, example: 06/07/2026"
          placeholderTextColor="#888"
          value={horseEquiJewelBuyingDate}
          onChangeText={setHorseEquiJewelBuyingDate}
        />

        <Text style={styles.detailsSubtitle}>Dressage Test</Text>

        {renderYesNoButton('Dressage Test Day', horseDressageTestDay, () =>
          setHorseDressageTestDay(!horseDressageTestDay)
        )}

        {horseDressageTestDay && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Dressage test name"
              placeholderTextColor="#888"
              value={horseDressageTestName}
              onChangeText={setHorseDressageTestName}
            />

            <TextInput
              style={styles.input}
              placeholder="Dressage score %, example: 68.5"
              placeholderTextColor="#888"
              value={horseDressageScore}
              onChangeText={setHorseDressageScore}
              keyboardType="decimal-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Dressage judge notes"
              placeholderTextColor="#888"
              value={horseDressageNotes}
              onChangeText={setHorseDressageNotes}
            />
          </>
        )}

        <Text style={styles.detailsSubtitle}>Jumping</Text>

        {renderYesNoButton('Jumping Day', horseJumpingDay, () =>
          setHorseJumpingDay(!horseJumpingDay)
        )}

        {horseJumpingDay && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Fence height, example: 80 cm"
              placeholderTextColor="#888"
              value={horseFenceHeight}
              onChangeText={setHorseFenceHeight}
            />

            <TextInput
              style={styles.input}
              placeholder="Fence count"
              placeholderTextColor="#888"
              value={horseFenceCount}
              onChangeText={setHorseFenceCount}
              keyboardType="number-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Jumping notes"
              placeholderTextColor="#888"
              value={horseJumpingNotes}
              onChangeText={setHorseJumpingNotes}
            />
          </>
        )}

        <Text style={styles.detailsSubtitle}>Notes</Text>

        <TextInput
          style={styles.input}
          placeholder="Horse riding notes"
          placeholderTextColor="#888"
          value={horseNotes}
          onChangeText={setHorseNotes}
        />
      </View>
    );
  };

  const renderSessionDetails = (session: Session) => {
    if (session.activity === 'Football' && session.details) {
      return (
        <View style={styles.savedDetailsBox}>
          <Text style={styles.savedDetailsText}>
            Team 1: {session.details.teamOneName || 'Not filled'}
          </Text>
          <Text style={styles.savedDetailsText}>
            Team 2: {session.details.teamTwoName || 'Not filled'}
          </Text>
          <Text style={styles.savedDetailsText}>
            Score: {session.details.teamOneScore || '0'} - {session.details.teamTwoScore || '0'}
          </Text>
        </View>
      );
    }

    if (session.activity === 'Gym' && session.details) {
      return (
        <View style={styles.savedDetailsBox}>
          <Text style={styles.savedDetailsText}>
            Workout Day: {session.details.gymWorkoutDay || 'Not filled'}
          </Text>

          <Text style={styles.savedDetailsHeader}>Exercises:</Text>

          {!session.details.gymExercises || session.details.gymExercises.length === 0 ? (
            <Text style={styles.savedDetailsText}>No exercises saved</Text>
          ) : (
            session.details.gymExercises.map((exercise, index) => (
              <View key={exercise.id} style={styles.savedExerciseBlock}>
                <Text style={styles.savedDetailsText}>
                  {index + 1}. {exercise.name}
                </Text>

                {exercise.sets.map((set, setIndex) => (
                  <Text key={set.id} style={styles.savedSetText}>
                    Set {setIndex + 1}: {set.reps} reps
                  </Text>
                ))}
              </View>
            ))
          )}
        </View>
      );
    }

    if (isLapActivity(session.activity) && session.details) {
      return (
        <View style={styles.savedDetailsBox}>
          <Text style={styles.savedDetailsText}>
            Laps: {session.details.laps || 0}
          </Text>
          <Text style={styles.savedDetailsText}>
            Lap Distance: {session.details.lapDistance || '0'} {session.details.lapDistanceUnit || 'm'}
          </Text>
          <Text style={styles.savedDetailsText}>
            Total Distance: {session.details.totalDistance || '0 m'}
          </Text>
        </View>
      );
    }

    if (isMatchActivity(session.activity) && session.details) {
      return (
        <View style={styles.savedDetailsBox}>
          <Text style={styles.savedDetailsText}>
            Team 1: {session.details.matchTeamOneName || 'Not filled'}
          </Text>
          <Text style={styles.savedDetailsText}>
            Team 2: {session.details.matchTeamTwoName || 'Not filled'}
          </Text>

          <Text style={styles.savedDetailsHeader}>Rounds:</Text>

          {!session.details.matchRounds || session.details.matchRounds.length === 0 ? (
            <Text style={styles.savedDetailsText}>No rounds saved</Text>
          ) : (
            session.details.matchRounds.map((round, index) => (
              <Text key={round.id} style={styles.savedDetailsText}>
                Round {index + 1}: {round.teamOneGames} - {round.teamTwoGames}
              </Text>
            ))
          )}

          <Text style={styles.savedDetailsHeader}>Total Games:</Text>
          <Text style={styles.savedDetailsText}>
            {session.details.matchTeamOneName || 'Team 1'}: {session.details.matchTeamOneTotal || 0}
          </Text>
          <Text style={styles.savedDetailsText}>
            {session.details.matchTeamTwoName || 'Team 2'}: {session.details.matchTeamTwoTotal || 0}
          </Text>
        </View>
      );
    }

    if (isBalootActivity(session.activity) && session.details) {
      return (
        <View style={styles.savedDetailsBox}>
          <Text style={styles.savedDetailsHeader}>Baloot Total:</Text>
          <Text style={styles.savedDetailsText}>
            Us: {session.details.balootUsTotal || 0}
          </Text>
          <Text style={styles.savedDetailsText}>
            Them: {session.details.balootThemTotal || 0}
          </Text>
          <Text style={styles.savedDetailsText}>
            Winner: {session.details.balootWinner || 'Not finished yet'}
          </Text>
          <Text style={styles.savedDetailsText}>
            Dealer Direction: {session.details.balootDealerDirection || '↑'}
          </Text>

          <Text style={styles.savedDetailsHeader}>Hands:</Text>

          {!session.details.balootScores || session.details.balootScores.length === 0 ? (
            <Text style={styles.savedDetailsText}>No scores saved</Text>
          ) : (
            session.details.balootScores.map((score, index) => (
              <Text key={score.id} style={styles.savedDetailsText}>
                Hand {index + 1}: Us {score.us} - Them {score.them}
              </Text>
            ))
          )}
        </View>
      );
    }

    if (isHorseRidingActivity(session.activity) && session.details?.horseRiding) {
      const horse = session.details.horseRiding;

      return (
        <View style={styles.savedDetailsBox}>
          <Text style={styles.savedDetailsHeader}>Horse Riding:</Text>

          <Text style={styles.savedDetailsText}>
            Horse: {horse.horseName || 'Not filled'}
          </Text>
          <Text style={styles.savedDetailsText}>
            Training: {horse.trainingType || 'Not filled'}
          </Text>
          <Text style={styles.savedDetailsText}>
            Rest Day: {horse.restDay ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.savedDetailsText}>
            Walking Minutes: {horse.walkingMinutes || '0'}
          </Text>

          <Text style={styles.savedDetailsHeader}>Daily Care:</Text>
          <Text style={styles.savedDetailsText}>Hay: {horse.hayGiven ? 'Yes' : 'No'}</Text>
          <Text style={styles.savedDetailsText}>Water: {horse.waterChecked ? 'Yes' : 'No'}</Text>
          <Text style={styles.savedDetailsText}>Food Oil: {horse.foodOilGiven ? 'Yes' : 'No'}</Text>
          <Text style={styles.savedDetailsText}>
            Food Oil Bought: {horse.foodOilBuyingDate || 'Not filled'}
          </Text>
          <Text style={styles.savedDetailsText}>Hoof Oil: {horse.hoofOilUsed ? 'Yes' : 'No'}</Text>
          <Text style={styles.savedDetailsText}>
            Hoof Oil Bought: {horse.hoofOilBuyingDate || 'Not filled'}
          </Text>

          <Text style={styles.savedDetailsHeader}>Cleaning:</Text>
          <Text style={styles.savedDetailsText}>Shampoo: {horse.shampooUsed ? 'Yes' : 'No'}</Text>
          <Text style={styles.savedDetailsText}>
            Shampoo Bought: {horse.shampooBuyingDate || 'Not filled'}
          </Text>
          <Text style={styles.savedDetailsText}>
            Pads Cleaning Supplies: {horse.padsCleaningSuppliesUsed ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.savedDetailsText}>
            Pads Supplies Bought: {horse.padsCleaningSuppliesBuyingDate || 'Not filled'}
          </Text>

          <Text style={styles.savedDetailsHeader}>Monthly Feed:</Text>
          <Text style={styles.savedDetailsText}>
            Re-Leve: {horse.releveAmount || 'Not filled'}
          </Text>
          <Text style={styles.savedDetailsText}>
            Re-Leve Bought: {horse.releveBuyingDate || 'Not filled'}
          </Text>
          <Text style={styles.savedDetailsText}>
            Equi Jewel: {horse.equiJewelAmount || 'Not filled'}
          </Text>
          <Text style={styles.savedDetailsText}>
            Equi Jewel Bought: {horse.equiJewelBuyingDate || 'Not filled'}
          </Text>

          <Text style={styles.savedDetailsHeader}>Dressage:</Text>
          <Text style={styles.savedDetailsText}>
            Test Day: {horse.dressageTestDay ? 'Yes' : 'No'}
          </Text>

          {horse.dressageTestDay && (
            <>
              <Text style={styles.savedDetailsText}>
                Test Name: {horse.dressageTestName || 'Not filled'}
              </Text>
              <Text style={styles.savedDetailsText}>
                Score: {horse.dressageScore || '0'}%
              </Text>
              <Text style={styles.savedDetailsText}>
                Notes: {horse.dressageNotes || 'None'}
              </Text>
            </>
          )}

          <Text style={styles.savedDetailsHeader}>Jumping:</Text>
          <Text style={styles.savedDetailsText}>
            Jumping Day: {horse.jumpingDay ? 'Yes' : 'No'}
          </Text>

          {horse.jumpingDay && (
            <>
              <Text style={styles.savedDetailsText}>
                Fence Height: {horse.fenceHeight || 'Not filled'}
              </Text>
              <Text style={styles.savedDetailsText}>
                Fence Count: {horse.fenceCount || '0'}
              </Text>
              <Text style={styles.savedDetailsText}>
                Notes: {horse.jumpingNotes || 'None'}
              </Text>
            </>
          )}

          <Text style={styles.savedDetailsHeader}>Notes:</Text>
          <Text style={styles.savedDetailsText}>
            {horse.horseNotes || 'None'}
          </Text>
        </View>
      );
    }

    return null;
  };

  if (selectedActivity) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <ScrollView style={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={goBackToList}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{selectedActivity}</Text>
          <Text style={styles.subtitle}>Track your activity session</Text>

          {renderFootballFields()}
          {renderGymFields()}
          {renderLapFields()}
          {renderMatchFields()}
          {renderBalootFields()}
          {renderHorseRidingFields()}

          <TouchableOpacity style={styles.startButton} onPress={startActivity}>
            <Text style={styles.buttonText}>Start Activity</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.endButton} onPress={endActivity}>
            <Text style={styles.buttonText}>End Activity</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Start: {startTime ? startTime.toLocaleTimeString() : 'Not started'}
            </Text>

            <Text style={styles.infoText}>
              End: {endTime ? endTime.toLocaleTimeString() : 'Not ended'}
            </Text>

            <Text style={styles.durationText}>Duration: {getDuration()}</Text>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={saveSession}>
            <Text style={styles.buttonText}>Save Session</Text>
          </TouchableOpacity>
        </ScrollView>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.mainContainer}>
        <ScrollView style={styles.container}>
          <Text style={styles.title}>ActiveTrack</Text>
          <Text style={styles.subtitle}>Choose your activity</Text>

          <View style={styles.statsBox}>
            <Text style={styles.statsTitle}>Stats</Text>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Sessions</Text>
              <Text style={styles.statValue}>{sessions.length}</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Time</Text>
              <Text style={styles.statValue}>{getTotalTime()}</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Most Practiced</Text>
              <Text style={styles.statValue}>{getMostPracticedActivity()}</Text>
            </View>
          </View>

          <View style={styles.topActions}>
            <TouchableOpacity style={styles.addButton} onPress={openOtherModal}>
              <Text style={styles.smallActionText}>+ Add Activity</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetButton} onPress={resetActivityList}>
              <Text style={styles.smallActionText}>Reset List</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.hintText}>Swipe left on an activity to delete it</Text>

          <View style={styles.activityList}>
            {activities.length === 0 ? (
              <Text style={styles.emptyHistory}>
                No activities available. Press Add Activity or Reset List.
              </Text>
            ) : (
              activities.map((activity) => (
                <Swipeable
                  key={activity}
                  renderRightActions={() => renderActivityDeleteAction(activity)}
                >
                  <TouchableOpacity
                    style={styles.activityButton}
                    onPress={() => openActivity(activity)}
                  >
                    <Text style={styles.activityText}>{activity}</Text>
                  </TouchableOpacity>
                </Swipeable>
              ))
            )}
          </View>

          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>History</Text>

              {sessions.length > 0 && (
                <TouchableOpacity style={styles.clearHistoryButton} onPress={clearAllHistory}>
                  <Text style={styles.clearHistoryText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>

            {sessions.length > 0 && (
              <Text style={styles.hintText}>Swipe left on a session to delete it</Text>
            )}

            {sessions.length === 0 ? (
              <Text style={styles.emptyHistory}>No sessions saved yet</Text>
            ) : (
              sessions.map((session) => (
                <Swipeable
                  key={session.id}
                  renderRightActions={() => renderSessionDeleteAction(session.id)}
                >
                  <View style={styles.sessionCard}>
                    <Text style={styles.sessionActivity}>{session.activity}</Text>
                    <Text style={styles.sessionText}>Date: {session.date}</Text>
                    <Text style={styles.sessionText}>Start: {session.start}</Text>
                    <Text style={styles.sessionText}>End: {session.end}</Text>
                    <Text style={styles.sessionDuration}>
                      Duration: {session.duration}
                    </Text>

                    {renderSessionDetails(session)}
                  </View>
                </Swipeable>
              ))
            )}
          </View>
        </ScrollView>

        <Modal visible={showOtherModal} transparent animationType="slide">
          <View style={styles.modalBackground}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Add Activity</Text>
              <Text style={styles.modalSubtitle}>Enter activity name</Text>

              <TextInput
                style={styles.input}
                placeholder="Example: Boxing"
                placeholderTextColor="#888"
                value={otherActivityName}
                onChangeText={setOtherActivityName}
              />

              <TouchableOpacity style={styles.startButton} onPress={addOtherActivity}>
                <Text style={styles.buttonText}>Save and Start</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowOtherModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#101820',
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#101820',
  },
  backButton: {
    marginTop: 55,
    marginBottom: 20,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 60,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#b0b0b0',
    marginBottom: 24,
  },
  statsBox: {
    backgroundColor: '#1b2733',
    padding: 18,
    borderRadius: 16,
    marginBottom: 22,
  },
  statsTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  statRow: {
    marginBottom: 12,
  },
  statLabel: {
    color: '#b0b0b0',
    fontSize: 15,
    marginBottom: 3,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  hintText: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 12,
  },
  topActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#1f8a70',
    padding: 14,
    borderRadius: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#34495e',
    padding: 14,
    borderRadius: 12,
  },
  smallActionText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  activityList: {
    gap: 12,
    paddingBottom: 30,
  },
  activityButton: {
    backgroundColor: '#1f8a70',
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
  },
  activityText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  swipeDeleteAction: {
    backgroundColor: '#b84040',
    justifyContent: 'center',
    alignItems: 'center',
    width: 95,
    borderRadius: 14,
    marginBottom: 12,
  },
  swipeDeleteText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
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
  unitButton: {
    backgroundColor: '#34495e',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedUnitButton: {
    backgroundColor: '#1f8a70',
  },
  unitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
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
  deleteLastButton: {
    backgroundColor: '#b84040',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  resetLapButton: {
    backgroundColor: '#34495e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  lapBox: {
    backgroundColor: '#101820',
    padding: 22,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  lapNumber: {
    color: '#ffffff',
    fontSize: 54,
    fontWeight: 'bold',
  },
  lapLabel: {
    color: '#b0b0b0',
    fontSize: 17,
    marginTop: 4,
  },
  totalDistanceText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
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
  matchTotalBox: {
    backgroundColor: '#101820',
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  matchTotalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  matchTotalText: {
    color: '#ffffff',
    fontSize: 17,
    marginBottom: 4,
  },
  balootTotalBox: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  balootTotalColumn: {
    flex: 1,
    backgroundColor: '#101820',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  balootSideTitle: {
    color: '#b0b0b0',
    fontSize: 18,
    marginBottom: 8,
  },
  balootTotalNumber: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: 'bold',
  },
  winnerBox: {
    backgroundColor: '#101820',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  winnerLabel: {
    color: '#b0b0b0',
    fontSize: 15,
    marginBottom: 4,
  },
  winnerText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dealerBox: {
    backgroundColor: '#101820',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  dealerTitle: {
    color: '#b0b0b0',
    fontSize: 16,
    marginBottom: 8,
  },
  dealerArrow: {
    color: '#ffffff',
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dealerHint: {
    color: '#9ca3af',
    fontSize: 14,
  },
  toggleButton: {
    backgroundColor: '#34495e',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedToggleButton: {
    backgroundColor: '#1f8a70',
  },
  toggleText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedToggleText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  startButton: {
    backgroundColor: '#1f8a70',
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
  },
  endButton: {
    backgroundColor: '#b84040',
    padding: 18,
    borderRadius: 14,
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: '#2563eb',
    padding: 18,
    borderRadius: 14,
    marginTop: 24,
    marginBottom: 60,
  },
  cancelButton: {
    backgroundColor: '#b84040',
    padding: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#1b2733',
    padding: 18,
    borderRadius: 14,
  },
  infoText: {
    color: '#ffffff',
    fontSize: 17,
    marginBottom: 10,
  },
  durationText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#1b2733',
    borderRadius: 18,
    padding: 24,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: '#b0b0b0',
    fontSize: 16,
    marginBottom: 18,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    marginBottom: 12,
    color: '#000000',
  },
  historySection: {
    marginTop: 10,
    paddingBottom: 60,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  clearHistoryButton: {
    backgroundColor: '#b84040',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  clearHistoryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyHistory: {
    color: '#b0b0b0',
    fontSize: 16,
  },
  sessionCard: {
    backgroundColor: '#1b2733',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  sessionActivity: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sessionText: {
    color: '#d0d0d0',
    fontSize: 16,
    marginBottom: 4,
  },
  sessionDuration: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 6,
  },
  savedDetailsBox: {
    marginTop: 10,
    backgroundColor: '#101820',
    padding: 12,
    borderRadius: 10,
  },
  savedDetailsHeader: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  savedDetailsText: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 4,
  },
  savedSetText: {
    color: '#d0d0d0',
    fontSize: 15,
    marginLeft: 12,
    marginBottom: 3,
  },
  savedExerciseBlock: {
    marginBottom: 10,
  },
});