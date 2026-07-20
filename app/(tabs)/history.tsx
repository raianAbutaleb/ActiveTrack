import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
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
import { Session } from '../../types';
import { getSupabaseSession } from '../../lib/authDatabase';
import {
  clearCloudSessions,
  deleteCloudSession,
  loadCloudSessions,
  saveCloudSession,
} from '../../lib/sessionDatabase';
import { shareSessionsCsv, shareSessionsPdf } from '../../lib/deviceFeatures';
import { loadLocalSettings } from '../../lib/userPreferences';

type EditableSessionField = {
  path: string;
  label: string;
  type: 'string' | 'number';
};

const calculatedEditFieldKeys = new Set([
  'historyNote',
  'expirationReminders',
  'candleSeconds',
  'candleTime',
  'candleTargetSeconds',
  'candleTargetTime',
  'balootShareText',
  'totalDistance',
  'averagePace',
  'averageSpeed',
]);

const formatFieldLabel = (path: string) => {
  const key = path.split('.').pop() || path;
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (letter) => letter.toUpperCase());
};

const collectEditableSessionFields = (
  value: unknown,
  path: string[] = []
): EditableSessionField[] => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return [];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, fieldValue]) => {
    const nextPath = [...path, key];
    const joinedPath = nextPath.join('.');

    if (calculatedEditFieldKeys.has(key) || Array.isArray(fieldValue)) {
      return [];
    }

    if (typeof fieldValue === 'string' || typeof fieldValue === 'number') {
      return [{
        path: joinedPath,
        label: formatFieldLabel(joinedPath),
        type: typeof fieldValue === 'number' ? 'number' : 'string',
      }];
    }

    return collectEditableSessionFields(fieldValue, nextPath);
  });
};

const setNestedFieldValue = (
  target: Record<string, unknown>,
  path: string,
  value: string,
  type: EditableSessionField['type']
) => {
  const keys = path.split('.');
  const finalKey = keys.pop();

  if (!finalKey) {
    return;
  }

  let current = target;
  keys.forEach((key) => {
    const next = current[key];
    if (!next || typeof next !== 'object' || Array.isArray(next)) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  });
  current[finalKey] = type === 'number' ? Number(value || 0) : value;
};

const calculateReminderDate = (expirationDate: string, daysBefore: number) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expirationDate)) {
    return '';
  }

  const expiration = new Date(`${expirationDate}T00:00:00Z`);
  if (Number.isNaN(expiration.getTime())) {
    return '';
  }
  expiration.setUTCDate(expiration.getUTCDate() - daysBefore);
  return expiration.toISOString().slice(0, 10);
};

const refreshExpirationReminders = (session: Session) => {
  const existingReminders = session.details?.expirationReminders;
  const daysBefore = existingReminders?.[0]?.daysBefore;

  if (!daysBefore || !session.details) {
    return;
  }

  const fields = session.activity === 'Personal Info' && session.details.personalInfo
    ? [
        ['ID expiration', session.details.personalInfo.idExpirationDate || ''],
        ['Driving license expiration', session.details.personalInfo.drivingLicenseExpirationDate || ''],
        ['Passport expiration', session.details.personalInfo.passportExpirationDate || ''],
      ]
    : session.activity === 'Vehicle Maintenance' && session.details.vehicleMaintenance
      ? [
          ['Insurance expiration', session.details.vehicleMaintenance.insuranceExpirationDate || ''],
          ['Registration expiration', session.details.vehicleMaintenance.registrationEndDate || ''],
        ]
      : [];

  session.details.expirationReminders = fields.flatMap(([label, expirationDate]) => {
    const remindOn = calculateReminderDate(expirationDate, daysBefore);
    return expirationDate && remindOn
      ? [{ label, expirationDate, remindOn, daysBefore }]
      : [];
  });
};

export default function HistoryScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [historyFilter, setHistoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month'>('all');
  const [historyView, setHistoryView] = useState<'list' | 'calendar'>('list');
  const [dateFormat, setDateFormat] = useState<'day-first' | 'month-first'>('day-first');
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editableFields, setEditableFields] = useState<EditableSessionField[]>([]);
  const [editFieldValues, setEditFieldValues] = useState<Record<string, string>>({});

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [])
  );

  const loadSessions = async () => {
    try {
      const authSession = await getSupabaseSession();
      const storageKey = authSession?.user.id
        ? `sessions:${authSession.user.id}`
        : 'sessions';
      const savedSettings = await loadLocalSettings(authSession?.user.id ?? null);
      setDateFormat(savedSettings.dateFormat);
      const savedSessions = await AsyncStorage.getItem(storageKey);
      const localSessions: Session[] = savedSessions ? JSON.parse(savedSessions) : [];
      const cloudSessions = await loadCloudSessions();

      const mergedSessions = new Map<number, Session>();
      localSessions.forEach((session) => mergedSessions.set(session.id, session));
      cloudSessions?.forEach((session) => mergedSessions.set(session.id, session));

      const restoredSessions = [...mergedSessions.values()].sort((first, second) => second.id - first.id);
      setSessions(restoredSessions);
      await AsyncStorage.setItem(storageKey, JSON.stringify(restoredSessions));
    } catch (error) {
      alert('Error loading history');
    }
  };

  const saveSessions = async (updatedSessions: Session[]) => {
    try {
      const authSession = await getSupabaseSession();
      const storageKey = authSession?.user.id
        ? `sessions:${authSession.user.id}`
        : 'sessions';
      await AsyncStorage.setItem(
        storageKey,
        JSON.stringify(updatedSessions)
      );
    } catch (error) {
      alert('Error saving history');
    }
  };

  const deleteSession = async (sessionId: number) => {
    const updatedSessions = sessions.filter(
      (session) => session.id !== sessionId
    );

    setSessions(updatedSessions);
    await saveSessions(updatedSessions);

    try {
      await deleteCloudSession(sessionId);
    } catch {
      alert('Deleted on this device, but cloud delete failed.');
    }
  };

  const duplicateSession = async (session: Session) => {
    const now = new Date();
    const duplicated: Session = {
      ...session,
      id: Date.now(),
      date: now.toISOString(),
      start: session.start ? now.toISOString() : '',
      end: session.end ? now.toISOString() : '',
      details: JSON.parse(JSON.stringify(session.details ?? {})),
    };
    const updatedSessions = [duplicated, ...sessions];
    setSessions(updatedSessions);
    await saveSessions(updatedSessions);
    try {
      await saveCloudSession(duplicated);
    } catch {
      alert('Duplicated on this device, but cloud sync failed.');
    }
  };

  const confirmDeleteSession = (sessionId: number) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSession(sessionId),
        },
      ]
    );
  };

  const openEditSession = (session: Session) => {
    const fields = collectEditableSessionFields(session.details);
    setEditingSession(session);
    setEditDate(session.date || '');
    setEditNote(session.details?.historyNote || '');
    setEditableFields(fields);
    setEditFieldValues(Object.fromEntries(fields.map((field) => {
      const value = field.path.split('.').reduce<unknown>((current, key) => {
        if (!current || typeof current !== 'object') {
          return '';
        }
        return (current as Record<string, unknown>)[key];
      }, session.details);
      return [field.path, String(value ?? '')];
    })));
  };

  const closeEditSession = () => {
    setEditingSession(null);
    setEditDate('');
    setEditNote('');
    setEditableFields([]);
    setEditFieldValues({});
  };

  const saveEditedSession = async () => {
    if (!editingSession) {
      return;
    }

    const updatedDetails = JSON.parse(JSON.stringify(editingSession.details || {}));
    editableFields.forEach((field) => {
      setNestedFieldValue(updatedDetails, field.path, editFieldValues[field.path] ?? '', field.type);
    });
    const updatedSession: Session = {
      ...editingSession,
      date: editDate.trim() || editingSession.date,
      details: {
        ...updatedDetails,
        historyNote: editNote.trim(),
      },
    };
    refreshExpirationReminders(updatedSession);
    const updatedSessions = sessions.map((session) =>
      session.id === updatedSession.id ? updatedSession : session
    );

    setSessions(updatedSessions);
    await saveSessions(updatedSessions);

    try {
      await saveCloudSession(updatedSession);
    } catch {
      alert('Saved on this device, but cloud update failed.');
    }

    closeEditSession();
  };

  const clearAllHistory = () => {
    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all saved sessions?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setSessions([]);
            setHistoryFilter('All');
            await saveSessions([]);

            try {
              await clearCloudSessions();
            } catch {
              alert('Cleared on this device, but cloud clear failed.');
            }
          },
        },
      ]
    );
  };

  const getActivityFilters = () => {
    const activityNames = sessions.map(
      (session) => session.activity
    );

    const uniqueActivities = Array.from(
      new Set(activityNames)
    );

    return ['All', ...uniqueActivities];
  };

  const getFilteredSessions = () => {
    const rangeDays = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : null;
    const rangeStart = rangeDays ? Date.now() - rangeDays * 24 * 60 * 60 * 1000 : null;
    const query = searchQuery.trim().toLowerCase();

    return sessions.filter((session) => {
      if (historyFilter !== 'All' && session.activity !== historyFilter) return false;
      const sessionTime = new Date(session.date).getTime();
      if (rangeStart && (!Number.isFinite(sessionTime) || sessionTime < rangeStart)) return false;
      if (!query) return true;
      return `${session.activity} ${session.date} ${JSON.stringify(session.details ?? {})}`
        .toLowerCase()
        .includes(query);
    });
  };

  const getCalendarDays = () => {
    const grouped = new Map<string, Session[]>();
    getFilteredSessions().forEach((session) => {
      const parsed = new Date(session.date);
      const key = Number.isNaN(parsed.getTime()) ? session.date : parsed.toISOString().slice(0, 10);
      grouped.set(key, [...(grouped.get(key) ?? []), session]);
    });
    return [...grouped.entries()].sort(([first], [second]) => second.localeCompare(first));
  };

  const formatSessionDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString(dateFormat === 'month-first' ? 'en-US' : 'en-GB');
  };

  const getRecentSessions = (days: number) => {
    const now = Date.now();
    const rangeMilliseconds = days * 24 * 60 * 60 * 1000;

    return sessions.filter((session) => {
      const sessionTime = new Date(session.date).getTime();
      return Number.isFinite(sessionTime) && now - sessionTime >= 0 && now - sessionTime <= rangeMilliseconds;
    });
  };

  const formatTotalTime = (selectedSessions: Session[]) => {
    const totalMinutes = Math.round(
      selectedSessions.reduce((total, session) => total + (session.durationSeconds || 0), 0) / 60
    );

    if (totalMinutes < 60) {
      return `${totalMinutes} min`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const getMonthlyActivityCounts = () => {
    const counts: Record<string, number> = {};

    getRecentSessions(30).forEach((session) => {
      counts[session.activity] = (counts[session.activity] || 0) + 1;
    });

    return Object.entries(counts).sort(([, firstCount], [, secondCount]) => secondCount - firstCount);
  };

  const isVehicleMaintenanceActivity = (
    activity: string | null
  ) => {
    return activity === 'Vehicle Maintenance';
  };

  const isNonTimedActivity = (activity: string | null) => {
    return activity === 'Vehicle Maintenance' || activity === 'Personal Info';
  };

  const isSessionNonTimed = (session: Session) => {
    return isNonTimedActivity(session.activity) || session.start === 'Not timed' || session.start === '';
  };

  const renderSessionDetails = (session: Session) => {
    if (session.activity === 'Football' && session.details) {
      return (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsTitle}>Football</Text>

          <Text style={styles.detailsText}>
            Team 1: {session.details.teamOneName || 'Not filled'}
          </Text>

          <Text style={styles.detailsText}>
            Team 2: {session.details.teamTwoName || 'Not filled'}
          </Text>

          <Text style={styles.detailsText}>
            Score: {session.details.teamOneScore || '0'} -{' '}
            {session.details.teamTwoScore || '0'}
          </Text>
        </View>
      );
    }

    if (session.activity === 'Gym' && session.details) {
      return (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsTitle}>Gym Workout</Text>

          <Text style={styles.detailsText}>
            Workout Day:{' '}
            {session.details.gymWorkoutDay || 'Not filled'}
          </Text>

          <Text style={styles.detailsSectionTitle}>
            Exercises
          </Text>

          {!session.details.gymExercises ||
          session.details.gymExercises.length === 0 ? (
            <Text style={styles.detailsText}>
              No exercises saved
            </Text>
          ) : (
            session.details.gymExercises.map(
              (exercise, exerciseIndex) => (
                <View
                  key={exercise.id}
                  style={styles.exerciseBlock}
                >
                  <Text style={styles.detailsText}>
                    {exerciseIndex + 1}. {exercise.name}
                  </Text>

                  {exercise.sets.map((set, setIndex) => (
                    <Text
                      key={set.id}
                      style={styles.setText}
                    >
                      Set {setIndex + 1}: {set.reps} reps
                    </Text>
                  ))}
                </View>
              )
            )
          )}
        </View>
      );
    }

    if (
      ['Run', 'Walking', 'Cycling', 'Swimming'].includes(
        session.activity
      ) &&
      session.details
    ) {
      return (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsTitle}>
            Distance Details
          </Text>

          <Text style={styles.detailsText}>
            Laps: {session.details.laps || 0}
          </Text>

          <Text style={styles.detailsText}>
            Lap Distance:{' '}
            {session.details.lapDistance || '0'}{' '}
            {session.details.lapDistanceUnit || 'm'}
          </Text>

          <Text style={styles.detailsText}>
            Total Distance:{' '}
            {session.details.totalDistance || '0 m'}
          </Text>
        </View>
      );
    }

    if (
      ['Padel', 'Tennis'].includes(session.activity) &&
      session.details
    ) {
      return (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsTitle}>
            Match Details
          </Text>

          <Text style={styles.detailsText}>
            Team 1:{' '}
            {session.details.matchTeamOneName || 'Not filled'}
          </Text>

          <Text style={styles.detailsText}>
            Team 2:{' '}
            {session.details.matchTeamTwoName || 'Not filled'}
          </Text>

          <Text style={styles.detailsSectionTitle}>
            Rounds
          </Text>

          {!session.details.matchRounds ||
          session.details.matchRounds.length === 0 ? (
            <Text style={styles.detailsText}>
              No rounds saved
            </Text>
          ) : (
            session.details.matchRounds.map(
              (round, roundIndex) => (
                <Text
                  key={round.id}
                  style={styles.detailsText}
                >
                  Round {roundIndex + 1}:{' '}
                  {round.teamOneGames} - {round.teamTwoGames}
                </Text>
              )
            )
          )}

          <Text style={styles.detailsSectionTitle}>
            Total Games
          </Text>

          <Text style={styles.detailsText}>
            {session.details.matchTeamOneName || 'Team 1'}:{' '}
            {session.details.matchTeamOneTotal || 0}
          </Text>

          <Text style={styles.detailsText}>
            {session.details.matchTeamTwoName || 'Team 2'}:{' '}
            {session.details.matchTeamTwoTotal || 0}
          </Text>
        </View>
      );
    }

    if (
      session.activity === 'Baloot' &&
      session.details
    ) {
      return (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsTitle}>
            Baloot Results
          </Text>

          <Text style={styles.detailsText}>
            Us: {session.details.balootUsTotal || 0}
          </Text>

          <Text style={styles.detailsText}>
            Them: {session.details.balootThemTotal || 0}
          </Text>

          <Text style={styles.detailsText}>
            Winner:{' '}
            {session.details.balootWinner ||
              'Not finished yet'}
          </Text>

          <Text style={styles.detailsText}>
            Dealer Direction:{' '}
            {session.details.balootDealerDirection || '↑'}
          </Text>

          <Text style={styles.detailsSectionTitle}>
            Hands
          </Text>

          {!session.details.balootScores ||
          session.details.balootScores.length === 0 ? (
            <Text style={styles.detailsText}>
              No scores saved
            </Text>
          ) : (
            session.details.balootScores.map(
              (score, scoreIndex) => (
                <Text
                  key={score.id}
                  style={styles.detailsText}
                >
                  Hand {scoreIndex + 1}: Us {score.us} - Them{' '}
                  {score.them}
                </Text>
              )
            )
          )}
        </View>
      );
    }

    if (session.activity === 'Work' && session.details?.work) {
      const work = session.details.work;

      return (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsTitle}>Work</Text>
          <Text style={styles.detailsText}>
            Project: {work.projectName || 'Not filled'}
          </Text>
          <Text style={styles.detailsText}>
            Set Time: {work.candleTargetTime || 'Not set'}
          </Text>
          <Text style={styles.detailsText}>
            Candle Timer: {work.candleTime || '00:00:00'}
          </Text>
          <Text style={styles.detailsText}>
            Notes: {work.notes || 'None'}
          </Text>
        </View>
      );
    }

    if (
      session.details?.horseRiding
    ) {
      const horse = session.details.horseRiding;
      const showAllHorseFields = !horse.logType;
      const showRideFields = showAllHorseFields || horse.logType === 'Horse Riding';
      const showDailyCareFields = showAllHorseFields || horse.logType === 'Daily Care';
      const showSupplyFields = showAllHorseFields || horse.logType === 'Supplies and Feed';
      const showTestFields = showAllHorseFields || horse.logType === 'Riding Test';

      return (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsTitle}>
            {horse.logType || 'Previous Horse Log'}
          </Text>

          {(showRideFields || showTestFields) && (
            <Text style={styles.detailsText}>
              Rider: {horse.riderName || 'Not filled'}
            </Text>
          )}

          <Text style={styles.detailsText}>
            Horse: {horse.horseName || 'Not filled'}
          </Text>

          {showRideFields && (
            <>
          <Text style={styles.detailsText}>
            Training: {horse.trainingType || 'Not filled'}
          </Text>

          <Text style={styles.detailsText}>
            Intensity: {horse.trainingIntensity || 'Not filled'}
          </Text>

          <Text style={styles.detailsText}>
            Training Time: {horse.trainingTime || 'Not filled'}
          </Text>

          <Text style={styles.detailsText}>
            Rest Day: {horse.restDay ? 'Yes' : 'No'}
          </Text>

          <Text style={styles.detailsText}>
            Walking Minutes: {horse.walkingMinutes || '0'}
          </Text>

          <Text style={styles.detailsSectionTitle}>
            Gait Tracking
          </Text>

          <Text style={styles.detailsText}>
            Walk: {horse.walkMinutes || '0'} min
          </Text>

          <Text style={styles.detailsText}>
            Trot: {horse.trotMinutes || '0'} min
          </Text>

          <Text style={styles.detailsText}>
            Canter: {horse.canterMinutes || '0'} min
          </Text>

          <Text style={styles.detailsText}>
            Distance: {horse.rideDistance || 'Not filled'}
          </Text>

          <Text style={styles.detailsText}>
            Average Speed: {horse.averageSpeed || 'Not filled'}
          </Text>

          <Text style={styles.detailsText}>
            Turns: Left {horse.leftTurns || '0'} / Right {horse.rightTurns || '0'}
          </Text>
            </>
          )}

          {showSupplyFields && (
            <>
          <Text style={styles.detailsText}>
            Farrier Visit: {horse.farrierVisit || 'Not filled'}
          </Text>

          <Text style={styles.detailsText}>
            Next Farrier Visit: {horse.nextFarrierVisit || 'Not filled'}
          </Text>
            </>
          )}

          {showDailyCareFields && (
            <>
          <Text style={styles.detailsSectionTitle}>
            Daily Care
          </Text>

          <Text style={styles.detailsText}>
            Hay: {horse.hayGiven ? 'Yes' : 'No'}
          </Text>

          <Text style={styles.detailsText}>
            Water: {horse.waterChecked ? 'Yes' : 'No'}
          </Text>

          <Text style={styles.detailsText}>
            Food Oil: {horse.foodOilGiven ? 'Yes' : 'No'}
          </Text>

          <Text style={styles.detailsText}>
            Hoof Oil: {horse.hoofOilUsed ? 'Yes' : 'No'}
          </Text>
            </>
          )}

          {showSupplyFields && (
            <>
          <Text style={styles.detailsSectionTitle}>Cleaning Supplies</Text>

          <Text style={styles.detailsText}>
            Shampoo Used: {horse.shampooUsed ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.detailsText}>
            Shampoo Bought: {horse.shampooBuyingDate || 'Not filled'}
          </Text>
          <Text style={styles.detailsText}>
            Pads / Cleaning Supplies Used: {horse.padsCleaningSuppliesUsed ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.detailsText}>
            Pads / Cleaning Supplies Bought: {horse.padsCleaningSuppliesBuyingDate || 'Not filled'}
          </Text>
          <Text style={styles.detailsText}>
            Food Oil Bought: {horse.foodOilBuyingDate || 'Not filled'}
          </Text>
          <Text style={styles.detailsText}>
            Hoof Oil Bought: {horse.hoofOilBuyingDate || 'Not filled'}
          </Text>

          <Text style={styles.detailsSectionTitle}>Feed</Text>

          {horse.feedEntries?.length ? (
            horse.feedEntries.map((feed, index) => (
              <View key={`history-feed-${index}`}>
                <Text style={styles.detailsText}>
                  Feed {index + 1} Amount: {feed.amount || 'Not filled'}
                </Text>
                <Text style={styles.detailsText}>
                  Feed {index + 1} Bought: {feed.buyingDate || 'Not filled'}
                </Text>
              </View>
            ))
          ) : (
            <>
              <Text style={styles.detailsText}>
                Re-Leve Amount: {horse.releveAmount || 'Not filled'}
              </Text>
              <Text style={styles.detailsText}>
                Re-Leve Bought: {horse.releveBuyingDate || 'Not filled'}
              </Text>
              <Text style={styles.detailsText}>
                Equi Jewel Amount: {horse.equiJewelAmount || 'Not filled'}
              </Text>
              <Text style={styles.detailsText}>
                Equi Jewel Bought: {horse.equiJewelBuyingDate || 'Not filled'}
              </Text>
            </>
          )}
            </>
          )}

          {showTestFields && (
            <>
          <Text style={styles.detailsSectionTitle}>
            Dressage
          </Text>

          <Text style={styles.detailsText}>
            Test Day: {horse.dressageTestDay ? 'Yes' : 'No'}
          </Text>

          {horse.dressageTestDay && (
            <>
              <Text style={styles.detailsText}>
                Test Name:{' '}
                {horse.dressageTestName || 'Not filled'}
              </Text>

              <Text style={styles.detailsText}>
                Score: {horse.dressageScore || '0'}%
              </Text>

              <Text style={styles.detailsText}>
                Notes: {horse.dressageNotes || 'None'}
              </Text>
            </>
          )}

          <Text style={styles.detailsSectionTitle}>
            Jumping
          </Text>

          <Text style={styles.detailsText}>
            Jumping Day: {horse.jumpingDay ? 'Yes' : 'No'}
          </Text>

          {horse.jumpingDay && (
            <>
              <Text style={styles.detailsText}>
                Fence Height:{' '}
                {horse.fenceHeight || 'Not filled'}
              </Text>

              <Text style={styles.detailsText}>
                Fence Count: {horse.fenceCount || '0'}
              </Text>

              <Text style={styles.detailsText}>
                Notes: {horse.jumpingNotes || 'None'}
              </Text>
            </>
          )}
            </>
          )}

          <Text style={styles.detailsSectionTitle}>
            General Notes
          </Text>

          <Text style={styles.detailsText}>
            {horse.horseNotes || 'None'}
          </Text>
        </View>
      );
    }

    if (
      isVehicleMaintenanceActivity(session.activity) &&
      session.details?.vehicleMaintenance
    ) {
      const vehicle =
        session.details.vehicleMaintenance;

      return (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsTitle}>
            Vehicle Maintenance
          </Text>

          <Text style={styles.detailsText}>
            Vehicle: {vehicle.vehicleName || 'Not filled'}
          </Text>

          <Text style={styles.detailsText}>
            Plate: {vehicle.plateNumber || 'Not filled'}
          </Text>

          <Text style={styles.detailsText}>
            Model / Year: {vehicle.modelYear || 'Not filled'}
          </Text>

          <Text style={styles.detailsText}>
            Service: {vehicle.serviceType || 'Not filled'}
          </Text>

          <Text style={styles.detailsText}>
            Service Date: {vehicle.serviceDate || 'Not filled'}
          </Text>

          <Text style={styles.detailsText}>
            Mileage: {vehicle.mileage || 'Not filled'}
          </Text>

          <Text style={styles.detailsText}>
            Cost: {vehicle.cost || '0'}
          </Text>

          <Text style={styles.detailsText}>
            Shop / Place: {vehicle.shopName || 'Not filled'}
          </Text>

          <Text style={styles.detailsSectionTitle}>Upcoming</Text>

          <Text style={styles.detailsText}>
            Next Service Date: {vehicle.nextServiceDate || 'Not filled'}
          </Text>

          <Text style={styles.detailsText}>
            Next Service Mileage: {vehicle.nextServiceMileage || 'Not filled'}
          </Text>

          <Text style={styles.detailsText}>
            Insurance Expiration: {vehicle.insuranceExpirationDate || 'Not filled'}
          </Text>

          <Text style={styles.detailsText}>
            Registration End Date: {vehicle.registrationEndDate || 'Not filled'}
          </Text>

          <Text style={styles.detailsText}>
            Notes: {vehicle.notes || 'None'}
          </Text>
        </View>
      );
    }

    if (session.details?.customFields) {
      return (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsTitle}>Custom Details</Text>
          {session.details.customFields.map((field, index) => (
            <Text key={`${field.label}-${index}`} style={styles.detailsText}>
              {field.label}: {field.value || 'Not filled'}
            </Text>
          ))}
        </View>
      );
    }

    if (session.activity === 'Personal Info' && session.details?.personalInfo) {
      const personalInfo = session.details.personalInfo;

      return (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsTitle}>Personal Info</Text>
          <Text style={styles.detailsText}>
            ID number ending: {personalInfo.idNumberEnding || 'Not filled'}
          </Text>
          <Text style={styles.detailsText}>
            ID expiration: {personalInfo.idExpirationDate || 'Not filled'}
          </Text>
          <Text style={styles.detailsText}>
            Driving license expiration: {personalInfo.drivingLicenseExpirationDate || 'Not filled'}
          </Text>
          <Text style={styles.detailsText}>
            Passport ending: {personalInfo.passportNumberEnding || 'Not filled'}
          </Text>
          <Text style={styles.detailsText}>
            Passport expiration: {personalInfo.passportExpirationDate || 'Not filled'}
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace('/')}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <Ionicons name="arrow-back" size={27} color="#050505" />
      </TouchableOpacity>

      <View style={styles.headerRow}>
        <Text style={styles.title}>History</Text>
        <View style={styles.headerActions}>
          {sessions.length > 0 && (
            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => shareSessionsCsv(getFilteredSessions())}
              accessibilityLabel="Export CSV"
            >
              <Ionicons name="share-outline" size={20} color="#050505" />
            </TouchableOpacity>
          )}
          {sessions.length > 0 && (
            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => shareSessionsPdf(getFilteredSessions())}
              accessibilityLabel="Export PDF"
            >
              <Ionicons name="document-text-outline" size={20} color="#050505" />
            </TouchableOpacity>
          )}
          {sessions.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearAllHistory}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.subtitle}>
        Your saved sessions and records
      </Text>

      {sessions.length > 0 && (
        <View style={styles.historyControls}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search activity, horse, project, vehicle or note"
            placeholderTextColor="#667085"
          />
          <View style={styles.controlRow}>
            {(['all', 'week', 'month'] as const).map((range) => (
              <TouchableOpacity
                key={range}
                style={[styles.controlButton, dateRange === range && styles.controlButtonActive]}
                onPress={() => setDateRange(range)}
              >
                <Text style={styles.controlButtonText}>{range === 'all' ? 'All dates' : range === 'week' ? '7 days' : '30 days'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.controlRow}>
            {(['list', 'calendar'] as const).map((view) => (
              <TouchableOpacity
                key={view}
                style={[styles.controlButton, historyView === view && styles.controlButtonActive]}
                onPress={() => setHistoryView(view)}
              >
                <Text style={styles.controlButtonText}>{view === 'list' ? 'List' : 'Calendar'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {sessions.length > 0 && (
        <View style={styles.progressBox}>
          <Text style={styles.progressTitle}>Progress</Text>
          <View style={styles.progressSummaryRow}>
            <View style={styles.progressSummaryCard}>
              <Text style={styles.progressLabel}>Last 7 days</Text>
              <Text style={styles.progressValue}>{getRecentSessions(7).length} sessions</Text>
              <Text style={styles.progressMeta}>{formatTotalTime(getRecentSessions(7))}</Text>
            </View>
            <View style={styles.progressSummaryCard}>
              <Text style={styles.progressLabel}>Last 30 days</Text>
              <Text style={styles.progressValue}>{getRecentSessions(30).length} sessions</Text>
              <Text style={styles.progressMeta}>{formatTotalTime(getRecentSessions(30))}</Text>
            </View>
          </View>

          <Text style={styles.progressSectionTitle}>Activity breakdown (30 days)</Text>
          {getMonthlyActivityCounts().length === 0 ? (
            <Text style={styles.progressMeta}>No activity in the last 30 days.</Text>
          ) : (
            getMonthlyActivityCounts().map(([activity, count]) => {
              const highestCount = getMonthlyActivityCounts()[0][1];
              const barWidth = `${Math.max(8, Math.round((count / highestCount) * 100))}%` as `${number}%`;

              return (
                <View key={activity} style={styles.progressActivityRow}>
                  <View style={styles.progressActivityHeader}>
                    <Text style={styles.progressActivityName}>{activity}</Text>
                    <Text style={styles.progressMeta}>{count}</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressBar, { width: barWidth }]} />
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}

      {sessions.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {getActivityFilters().map((activity) => (
            <TouchableOpacity
              key={activity}
              style={[
                styles.filterButton,
                historyFilter === activity &&
                  styles.filterButtonActive,
              ]}
              onPress={() => setHistoryFilter(activity)}
            >
              <Text
                style={[
                  styles.filterText,
                  historyFilter === activity &&
                    styles.filterTextActive,
                ]}
              >
                {activity}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {sessions.length === 0 ? (
        <Text style={styles.emptyText}>
          No sessions saved yet
        </Text>
      ) : getFilteredSessions().length === 0 ? (
        <Text style={styles.emptyText}>
          No sessions for {historyFilter} yet
        </Text>
      ) : historyView === 'calendar' ? (
        getCalendarDays().map(([day, daySessions]) => (
          <View key={day} style={styles.calendarDay}>
            <View style={styles.calendarDateBox}>
              <Text style={styles.calendarDate}>{day}</Text>
              <Text style={styles.calendarCount}>{daySessions.length} records</Text>
            </View>
            <Text style={styles.calendarActivities}>
              {[...new Set(daySessions.map((session) => session.activity))].join(' • ')}
            </Text>
          </View>
        ))
      ) : (
        getFilteredSessions().map((session) => (
          <View key={session.id} style={styles.card}>
            <View style={styles.topRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {session.activity}
                </Text>
              </View>

              <Text style={styles.dateText}>
                {formatSessionDate(session.date)}
              </Text>
            </View>

            {!isSessionNonTimed(session) && (
              <>
                <Text style={styles.durationText}>
                  {session.duration}
                </Text>

                <View style={styles.timeBox}>
                  <Text style={styles.timeText}>
                    Start: {session.start}
                  </Text>

                  <Text style={styles.timeText}>
                    End: {session.end}
                  </Text>
                </View>
              </>
            )}

            {renderSessionDetails(session)}

            {session.details?.reminder && (
              <View style={styles.detailsBox}>
                <Text style={styles.detailsTitle}>Reminder</Text>
                <Text style={styles.detailsText}>
                  Date: {session.details.reminder.date || 'Not set'}
                </Text>
                <Text style={styles.detailsText}>
                  Time: {session.details.reminder.time || 'Not set'}
                </Text>
                <Text style={styles.detailsText}>
                  Note: {session.details.reminder.note || 'No note'}
                </Text>
              </View>
            )}

            {session.details?.expirationReminders?.map((reminder) => (
              <View key={`${session.id}-${reminder.label}`} style={styles.detailsBox}>
                <Text style={styles.detailsTitle}>{reminder.label}</Text>
                <Text style={styles.detailsText}>
                  Expires: {reminder.expirationDate}
                </Text>
                <Text style={styles.detailsText}>
                  Remind on: {reminder.remindOn} ({reminder.daysBefore} days before)
                </Text>
              </View>
            ))}

            {session.details?.historyNote && (
              <View style={styles.detailsBox}>
                <Text style={styles.detailsTitle}>History Note</Text>
                <Text style={styles.detailsText}>{session.details.historyNote}</Text>
              </View>
            )}

            <View style={styles.sessionActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => duplicateSession(session)}
              >
                <Text style={styles.editButtonText}>Duplicate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => openEditSession(session)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => confirmDeleteSession(session.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <Modal
        visible={Boolean(editingSession)}
        transparent
        animationType="fade"
        onRequestClose={closeEditSession}
      >
        <View style={styles.modalBackground}>
          <View style={styles.editModal}>
            <Text style={styles.editModalTitle}>Edit Session</Text>
            <ScrollView style={styles.editFieldsScroll} keyboardShouldPersistTaps="handled">
              <Text style={styles.editLabel}>Session date</Text>
              <TextInput
                style={styles.editInput}
                value={editDate}
                onChangeText={setEditDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#050505"
              />
              {editableFields.map((field) => (
                <View key={field.path}>
                  <Text style={styles.editLabel}>{field.label}</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editFieldValues[field.path] ?? ''}
                    onChangeText={(value) => setEditFieldValues((current) => ({
                      ...current,
                      [field.path]: value,
                    }))}
                    keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                    placeholderTextColor="#050505"
                  />
                </View>
              ))}
              <Text style={styles.editLabel}>History note</Text>
              <TextInput
                style={[styles.editInput, styles.editNoteInput]}
                value={editNote}
                onChangeText={setEditNote}
                placeholder="Add a note"
                placeholderTextColor="#050505"
                multiline
              />
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={closeEditSession}>
                <Text style={styles.editButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveButton} onPress={saveEditedSession}>
                <Text style={styles.editButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F9',
    padding: 24,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exportButton: {
    width: 42,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyControls: {
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E7E9EE',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    color: '#050505',
    fontSize: 16,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  controlButton: {
    minHeight: 40,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E7E9EE',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  controlButtonActive: {
    backgroundColor: '#E7E9EE',
    borderColor: '#667085',
  },
  controlButtonText: {
    color: '#050505',
    fontSize: 14,
    fontWeight: '700',
  },
  calendarDay: {
    marginBottom: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E9EE',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.34)',
  },
  calendarDateBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  calendarDate: {
    color: '#050505',
    fontSize: 17,
    fontWeight: '900',
  },
  calendarCount: {
    color: '#050505',
    fontSize: 14,
    fontWeight: '700',
  },
  calendarActivities: {
    marginTop: 8,
    color: '#050505',
    fontSize: 15,
  },

  backButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    marginTop: 52,
    width: 44,
    justifyContent: 'center',
    paddingHorizontal: 0,
    borderWidth: 0,
    borderRadius: 8,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#050505',
  },

  subtitle: {
    fontSize: 17,
    color: '#050505',
    marginBottom: 24,
  },

  clearButton: {
    backgroundColor: '#E7E9EE',
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 10,
  },

  clearButtonText: {
    color: '#050505',
    fontSize: 16,
    fontWeight: '700',
  },

  filterScroll: {
    marginBottom: 18,
  },

  progressBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    borderWidth: 1,
    borderColor: '#E7E9EE',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
  },

  progressTitle: {
    color: '#050505',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  progressSummaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },

  progressSummaryCard: {
    flex: 1,
    backgroundColor: '#F6F7F9',
    borderRadius: 10,
    padding: 12,
  },

  progressLabel: {
    color: '#050505',
    fontSize: 15,
    marginBottom: 5,
  },

  progressValue: {
    color: '#050505',
    fontSize: 19,
    fontWeight: 'bold',
  },

  progressMeta: {
    color: '#050505',
    fontSize: 15,
  },

  progressSectionTitle: {
    color: '#050505',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  progressActivityRow: {
    marginBottom: 10,
  },

  progressActivityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },

  progressActivityName: {
    color: '#050505',
    fontSize: 16,
    fontWeight: '600',
  },

  progressTrack: {
    height: 8,
    backgroundColor: '#E7E9EE',
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressBar: {
    height: 8,
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },

  filterButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E7E9EE',
  },

  filterButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },

  filterText: {
    color: '#050505',
    fontSize: 16,
    fontWeight: '600',
  },

  filterTextActive: {
    color: '#050505',
  },

  emptyText: {
    color: '#050505',
    fontSize: 18,
  },

  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    borderWidth: 1,
    borderColor: '#E7E9EE',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  badge: {
    backgroundColor: '#2563EB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },

  badgeText: {
    color: '#050505',
    fontSize: 16,
    fontWeight: '700',
  },

  dateText: {
    color: '#050505',
    fontSize: 16,
    fontWeight: '600',
  },

  durationText: {
    color: '#050505',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  timeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F6F7F9',
    padding: 12,
    borderRadius: 10,
  },

  timeText: {
    color: '#050505',
    fontSize: 16,
    fontWeight: '600',
  },

  detailsBox: {
    marginTop: 10,
    backgroundColor: '#F6F7F9',
    padding: 12,
    borderRadius: 10,
  },

  detailsTitle: {
    color: '#050505',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  detailsSectionTitle: {
    color: '#050505',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },

  detailsText: {
    color: '#050505',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },

  exerciseBlock: {
    marginBottom: 10,
  },

  setText: {
    color: '#050505',
    fontSize: 17,
    marginLeft: 12,
    marginBottom: 3,
  },

  sessionActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },

  editButton: {
    flex: 1,
    backgroundColor: '#E7E9EE',
    padding: 12,
    borderRadius: 10,
  },

  editButtonText: {
    color: '#050505',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },

  deleteButton: {
    flex: 1,
    backgroundColor: '#E7E9EE',
    padding: 12,
    borderRadius: 10,
  },

  deleteButtonText: {
    color: '#050505',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },

  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },

  editModal: {
    maxHeight: '86%',
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    backgroundColor: '#F6F7F9',
  },

  editModalTitle: {
    color: '#050505',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
  },

  editFieldsScroll: {
    marginBottom: 16,
  },

  editLabel: {
    color: '#050505',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 7,
  },

  editInput: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    color: '#050505',
    fontSize: 18,
    marginBottom: 16,
  },

  editNoteInput: {
    minHeight: 96,
    paddingTop: 12,
    textAlignVertical: 'top',
  },

  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },

  modalCancelButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },

  modalSaveButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    backgroundColor: '#E7E9EE',
  },

  bottomSpace: {
    height: 80,
  },
});
