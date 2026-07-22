import { Dispatch, SetStateAction } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { HorseCleaningSupplyEntry, HorseFeedEntry, HorseLogType } from '../types';

type Props = {
  selectedActivity: string | null;

  horseRiderName: string;
  setHorseRiderName: Dispatch<SetStateAction<string>>;

  horseName: string;
  setHorseName: Dispatch<SetStateAction<string>>;

  horseTrainingType: string;
  setHorseTrainingType: Dispatch<SetStateAction<string>>;

  horseTrainingIntensity: string;
  setHorseTrainingIntensity: Dispatch<SetStateAction<string>>;

  horseTrainingTime: string;
  setHorseTrainingTime: Dispatch<SetStateAction<string>>;

  horseRestDay: boolean;
  setHorseRestDay: Dispatch<SetStateAction<boolean>>;

  horseWalkingMinutes: string;
  setHorseWalkingMinutes: Dispatch<SetStateAction<string>>;

  horseWalkMinutes: string;
  setHorseWalkMinutes: Dispatch<SetStateAction<string>>;

  horseTrotMinutes: string;
  setHorseTrotMinutes: Dispatch<SetStateAction<string>>;

  horseCanterMinutes: string;
  setHorseCanterMinutes: Dispatch<SetStateAction<string>>;

  horseRideDistance: string;
  setHorseRideDistance: Dispatch<SetStateAction<string>>;

  horseAverageSpeed: string;
  setHorseAverageSpeed: Dispatch<SetStateAction<string>>;

  horseLeftTurns: string;
  setHorseLeftTurns: Dispatch<SetStateAction<string>>;

  horseRightTurns: string;
  setHorseRightTurns: Dispatch<SetStateAction<string>>;

  horseRideDate: string;
  setHorseRideDate: Dispatch<SetStateAction<string>>;

  horseCalendarNote: string;
  setHorseCalendarNote: Dispatch<SetStateAction<string>>;

  horseFarrierVisit: string;
  setHorseFarrierVisit: Dispatch<SetStateAction<string>>;

  horseNextFarrierVisit: string;
  setHorseNextFarrierVisit: Dispatch<SetStateAction<string>>;

  horseSafetyLocation: string;
  setHorseSafetyLocation: Dispatch<SetStateAction<string>>;

  horseSafetyContact: string;
  setHorseSafetyContact: Dispatch<SetStateAction<string>>;

  horseHayGiven: boolean;
  setHorseHayGiven: Dispatch<SetStateAction<boolean>>;

  horseWaterChecked: boolean;
  setHorseWaterChecked: Dispatch<SetStateAction<boolean>>;

  horseFoodOilGiven: boolean;
  setHorseFoodOilGiven: Dispatch<SetStateAction<boolean>>;

  horseShampooUsed: boolean;
  setHorseShampooUsed: Dispatch<SetStateAction<boolean>>;

  horsePadsCleaningSuppliesUsed: boolean;
  setHorsePadsCleaningSuppliesUsed: Dispatch<SetStateAction<boolean>>;

  horseHoofOilUsed: boolean;
  setHorseHoofOilUsed: Dispatch<SetStateAction<boolean>>;

  horseFeedEntries: HorseFeedEntry[];
  setHorseFeedEntries: Dispatch<SetStateAction<HorseFeedEntry[]>>;

  horseCustomCleaningSupplies: HorseCleaningSupplyEntry[];
  setHorseCustomCleaningSupplies: Dispatch<SetStateAction<HorseCleaningSupplyEntry[]>>;

  horseFoodOilBuyingDate: string;
  setHorseFoodOilBuyingDate: Dispatch<SetStateAction<string>>;

  horseShampooBuyingDate: string;
  setHorseShampooBuyingDate: Dispatch<SetStateAction<string>>;

  horsePadsCleaningSuppliesBuyingDate: string;
  setHorsePadsCleaningSuppliesBuyingDate: Dispatch<SetStateAction<string>>;

  horseHoofOilBuyingDate: string;
  setHorseHoofOilBuyingDate: Dispatch<SetStateAction<string>>;

  horseDressageTestDay: boolean;
  setHorseDressageTestDay: Dispatch<SetStateAction<boolean>>;

  horseDressageTestName: string;
  setHorseDressageTestName: Dispatch<SetStateAction<string>>;

  horseDressageScore: string;
  setHorseDressageScore: Dispatch<SetStateAction<string>>;

  horseDressageNotes: string;
  setHorseDressageNotes: Dispatch<SetStateAction<string>>;

  horseJumpingDay: boolean;
  setHorseJumpingDay: Dispatch<SetStateAction<boolean>>;

  horseFenceHeight: string;
  setHorseFenceHeight: Dispatch<SetStateAction<string>>;

  horseFenceCount: string;
  setHorseFenceCount: Dispatch<SetStateAction<string>>;

  horseJumpingNotes: string;
  setHorseJumpingNotes: Dispatch<SetStateAction<string>>;

  horseNotes: string;
  setHorseNotes: Dispatch<SetStateAction<string>>;
};

export default function HorseRidingTracker(props: Props) {
  const horseLogTypes: HorseLogType[] = ['Horse Riding', 'Daily Care', 'Supplies and Feed', 'Riding Test'];

  if (!props.selectedActivity || !horseLogTypes.includes(props.selectedActivity as HorseLogType)) {
    return null;
  }

  const horseLogType = props.selectedActivity as HorseLogType;

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

  const updateFeedEntry = (
    index: number,
    key: keyof HorseFeedEntry,
    value: string
  ) => {
    props.setHorseFeedEntries((entries) =>
      entries.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [key]: value } : entry
      )
    );
  };

  const addFeedEntry = () => {
    props.setHorseFeedEntries((entries) => [
      ...entries,
      { amount: '', buyingDate: '' },
    ]);
  };

  const removeFeedEntry = (index: number) => {
    props.setHorseFeedEntries((entries) =>
      entries.filter((_, entryIndex) => entryIndex !== index)
    );
  };

  const updateCleaningSupply = (
    index: number,
    key: keyof HorseCleaningSupplyEntry,
    value: string
  ) => {
    props.setHorseCustomCleaningSupplies((entries) =>
      entries.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [key]: value } : entry
      )
    );
  };

  const addCleaningSupply = () => {
    props.setHorseCustomCleaningSupplies((entries) => [
      ...entries,
      { name: '', buyingDate: '' },
    ]);
  };

  const removeCleaningSupply = (index: number) => {
    props.setHorseCustomCleaningSupplies((entries) =>
      entries.filter((_, entryIndex) => entryIndex !== index)
    );
  };

  return (
    <View style={[styles.detailsBox, horseLogType === 'Riding Test' && styles.ridingTestContainer]}>
      {horseLogType !== 'Riding Test' && (
        <Text style={styles.detailsTitle}>{horseLogType}</Text>
      )}

      {horseLogType === 'Horse Riding' && (
        <TextInput
          style={styles.input}
          placeholder="Rider name"
          placeholderTextColor="#F4F7F6"
          value={props.horseRiderName}
          onChangeText={props.setHorseRiderName}
        />
      )}

      {horseLogType !== 'Riding Test' && (
        <TextInput
          style={styles.input}
          placeholder="Horse name, example: Durkji"
          placeholderTextColor="#F4F7F6"
          value={props.horseName}
          onChangeText={props.setHorseName}
        />
      )}

      {horseLogType === 'Horse Riding' && (
        <>

      <TextInput
        style={styles.input}
        placeholder="Training type, example: Dressage / Flatwork / Jumping"
        placeholderTextColor="#F4F7F6"
        value={props.horseTrainingType}
        onChangeText={props.setHorseTrainingType}
      />

      <Text style={styles.detailsSubtitle}>Training Intensity</Text>

      {['Easy', 'Medium', 'Hard'].map((level) => (
        <TouchableOpacity
          key={level}
          style={[
            styles.toggleButton,
            props.horseTrainingIntensity === level &&
              styles.selectedToggleButton,
          ]}
          onPress={() => props.setHorseTrainingIntensity(level)}
        >
          <Text
            style={[
              styles.toggleText,
              props.horseTrainingIntensity === level &&
                styles.selectedToggleText,
            ]}
          >
            {level}
          </Text>
        </TouchableOpacity>
      ))}

      <TextInput
        style={styles.input}
        placeholder="Time of training, example: 45 min"
        placeholderTextColor="#F4F7F6"
        value={props.horseTrainingTime}
        onChangeText={props.setHorseTrainingTime}
      />

      {renderYesNoButton('Rest Day', props.horseRestDay, () =>
        props.setHorseRestDay(!props.horseRestDay)
      )}

      <TextInput
        style={styles.input}
        placeholder="Daily walking minutes"
        placeholderTextColor="#F4F7F6"
        value={props.horseWalkingMinutes}
        onChangeText={props.setHorseWalkingMinutes}
        keyboardType="number-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Notes"
        placeholderTextColor="#F4F7F6"
        value={props.horseNotes}
        onChangeText={props.setHorseNotes}
        multiline
      />

      <View style={styles.performanceBox}>
        <Text style={styles.performanceTitle}>Gait Tracking and Ride Metrics</Text>

        <TextInput
          style={styles.input}
          placeholder="Walk minutes"
          placeholderTextColor="#F4F7F6"
          value={props.horseWalkMinutes}
          onChangeText={props.setHorseWalkMinutes}
          keyboardType="number-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Trot minutes"
          placeholderTextColor="#F4F7F6"
          value={props.horseTrotMinutes}
          onChangeText={props.setHorseTrotMinutes}
          keyboardType="number-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Canter minutes"
          placeholderTextColor="#F4F7F6"
          value={props.horseCanterMinutes}
          onChangeText={props.setHorseCanterMinutes}
          keyboardType="number-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Ride distance, example: 4.2 km"
          placeholderTextColor="#F4F7F6"
          value={props.horseRideDistance}
          onChangeText={props.setHorseRideDistance}
        />

        <TextInput
          style={styles.input}
          placeholder="Average speed, example: 8.5 km/h"
          placeholderTextColor="#F4F7F6"
          value={props.horseAverageSpeed}
          onChangeText={props.setHorseAverageSpeed}
        />

        <View style={styles.scoreRow}>
          <TextInput
            style={styles.scoreInput}
            placeholder="Left turns"
            placeholderTextColor="#F4F7F6"
            value={props.horseLeftTurns}
            onChangeText={props.setHorseLeftTurns}
            keyboardType="number-pad"
          />

          <TextInput
            style={styles.scoreInput}
            placeholder="Right turns"
            placeholderTextColor="#F4F7F6"
            value={props.horseRightTurns}
            onChangeText={props.setHorseRightTurns}
            keyboardType="number-pad"
          />
        </View>
      </View>

        </>
      )}

      {horseLogType === 'Daily Care' && (
        <>
          <Text style={styles.detailsSubtitle}>Daily Care</Text>

      {renderYesNoButton('Hay Given', props.horseHayGiven, () =>
        props.setHorseHayGiven(!props.horseHayGiven)
      )}

      {renderYesNoButton('Water Checked', props.horseWaterChecked, () =>
        props.setHorseWaterChecked(!props.horseWaterChecked)
      )}

      {renderYesNoButton('Food Oil Given', props.horseFoodOilGiven, () =>
        props.setHorseFoodOilGiven(!props.horseFoodOilGiven)
      )}

      {renderYesNoButton('Hoof Oil Used', props.horseHoofOilUsed, () =>
        props.setHorseHoofOilUsed(!props.horseHoofOilUsed)
      )}

      <TextInput
        style={styles.input}
        placeholder="Notes"
        placeholderTextColor="#F4F7F6"
        value={props.horseNotes}
        onChangeText={props.setHorseNotes}
        multiline
      />
        </>
      )}

      {horseLogType === 'Supplies and Feed' && (
        <>
          <Text style={styles.detailsSubtitle}>Farrier</Text>

          <TextInput
            style={styles.input}
            placeholder="Farrier visit date"
            placeholderTextColor="#F4F7F6"
            value={props.horseFarrierVisit}
            onChangeText={props.setHorseFarrierVisit}
          />

          <TextInput
            style={styles.input}
            placeholder="Next farrier visit"
            placeholderTextColor="#F4F7F6"
            value={props.horseNextFarrierVisit}
            onChangeText={props.setHorseNextFarrierVisit}
          />

          <TextInput
            style={styles.input}
            placeholder="Notes"
            placeholderTextColor="#F4F7F6"
            value={props.horseNotes}
            onChangeText={props.setHorseNotes}
            multiline
          />

          <Text style={styles.detailsSubtitle}>Care Supplies</Text>

          <TextInput
            style={styles.input}
            placeholder="Food oil buying date, example: 06/07/2026"
            placeholderTextColor="#F4F7F6"
            value={props.horseFoodOilBuyingDate}
            onChangeText={props.setHorseFoodOilBuyingDate}
          />

          <TextInput
            style={styles.input}
            placeholder="Hoof oil buying date, example: 06/07/2026"
            placeholderTextColor="#F4F7F6"
            value={props.horseHoofOilBuyingDate}
            onChangeText={props.setHorseHoofOilBuyingDate}
          />

      <Text style={styles.detailsSubtitle}>Cleaning Supplies</Text>

      {renderYesNoButton('Shampoo Used', props.horseShampooUsed, () =>
        props.setHorseShampooUsed(!props.horseShampooUsed)
      )}

      <TextInput
        style={styles.input}
        placeholder="Shampoo buying date, example: 06/07/2026"
        placeholderTextColor="#F4F7F6"
        value={props.horseShampooBuyingDate}
        onChangeText={props.setHorseShampooBuyingDate}
      />

      {renderYesNoButton('Pads Cleaning Supplies Used', props.horsePadsCleaningSuppliesUsed, () =>
        props.setHorsePadsCleaningSuppliesUsed(!props.horsePadsCleaningSuppliesUsed)
      )}

      <TextInput
        style={styles.input}
        placeholder="Pads cleaning supplies buying date"
        placeholderTextColor="#F4F7F6"
        value={props.horsePadsCleaningSuppliesBuyingDate}
        onChangeText={props.setHorsePadsCleaningSuppliesBuyingDate}
      />

      {props.horseCustomCleaningSupplies.map((supply, index) => (
        <View key={`cleaning-supply-${index}`} style={styles.feedEntryBox}>
          <View style={styles.feedEntryHeader}>
            <Text style={styles.feedEntryTitle}>Additional supply {index + 1}</Text>
            <TouchableOpacity
              style={styles.removeFeedButton}
              onPress={() => removeCleaningSupply(index)}
              accessibilityRole="button"
              accessibilityLabel={`Remove additional supply ${index + 1}`}
            >
              <Text style={styles.removeFeedButtonText}>−</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Supply name"
            placeholderTextColor="#F4F7F6"
            value={supply.name}
            onChangeText={(value) => updateCleaningSupply(index, 'name', value)}
          />
          <TextInput
            style={styles.input}
            placeholder="Buying date"
            placeholderTextColor="#F4F7F6"
            value={supply.buyingDate}
            onChangeText={(value) => updateCleaningSupply(index, 'buyingDate', value)}
          />
        </View>
      ))}

      <TouchableOpacity
        style={styles.addFeedButton}
        onPress={addCleaningSupply}
        accessibilityRole="button"
        accessibilityLabel="Add another cleaning supply"
      >
        <Text style={styles.addFeedButtonText}>+ Add cleaning supply</Text>
      </TouchableOpacity>

      <Text style={styles.detailsSubtitle}>Monthly Feed</Text>

      {props.horseFeedEntries.map((feed, index) => (
        <View key={`feed-${index}`} style={styles.feedEntryBox}>
          <View style={styles.feedEntryHeader}>
            <Text style={styles.feedEntryTitle}>Feed {index + 1}</Text>
            {props.horseFeedEntries.length > 1 && (
              <TouchableOpacity
                style={styles.removeFeedButton}
                onPress={() => removeFeedEntry(index)}
                accessibilityRole="button"
                accessibilityLabel={`Remove feed ${index + 1}`}
              >
                <Text style={styles.removeFeedButtonText}>−</Text>
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Feed amount, example: 2 kg"
            placeholderTextColor="#F4F7F6"
            value={feed.amount}
            onChangeText={(value) => updateFeedEntry(index, 'amount', value)}
          />
          <TextInput
            style={styles.input}
            placeholder="Buying date, example: 06/07/2026"
            placeholderTextColor="#F4F7F6"
            value={feed.buyingDate}
            onChangeText={(value) => updateFeedEntry(index, 'buyingDate', value)}
          />
        </View>
      ))}

      <TouchableOpacity
        style={styles.addFeedButton}
        onPress={addFeedEntry}
        accessibilityRole="button"
        accessibilityLabel="Add another feed"
      >
        <Text style={styles.addFeedButtonText}>+ Add another feed</Text>
      </TouchableOpacity>
        </>
      )}

      {horseLogType === 'Riding Test' && (
        <>
          <View style={styles.performanceBox}>
            <Text style={styles.performanceTitle}>Riding Info</Text>
            <TextInput
              style={styles.input}
              placeholder="Rider name"
              placeholderTextColor="#F4F7F6"
              value={props.horseRiderName}
              onChangeText={props.setHorseRiderName}
            />
            <TextInput
              style={styles.input}
              placeholder="Horse name"
              placeholderTextColor="#F4F7F6"
              value={props.horseName}
              onChangeText={props.setHorseName}
            />
            <TextInput
              style={styles.input}
              placeholder="Notes"
              placeholderTextColor="#F4F7F6"
              value={props.horseNotes}
              onChangeText={props.setHorseNotes}
              multiline
            />
          </View>

          <View style={styles.performanceBox}>
            <Text style={styles.performanceTitle}>Test</Text>
            <View style={styles.scoreRow}>
              <View style={styles.testDayOption}>
                {renderYesNoButton('Dressage Day', props.horseDressageTestDay, () =>
                  props.setHorseDressageTestDay(!props.horseDressageTestDay)
                )}
              </View>
              <View style={styles.testDayOption}>
                {renderYesNoButton('Jumping Day', props.horseJumpingDay, () =>
                  props.setHorseJumpingDay(!props.horseJumpingDay)
                )}
              </View>
            </View>

            {props.horseDressageTestDay && (
              <>
                <Text style={styles.detailsSubtitle}>Dressage</Text>
          <TextInput
            style={styles.input}
            placeholder="Dressage test name"
            placeholderTextColor="#F4F7F6"
            value={props.horseDressageTestName}
            onChangeText={props.setHorseDressageTestName}
          />

          <TextInput
            style={styles.input}
            placeholder="Dressage score %, example: 68.5"
            placeholderTextColor="#F4F7F6"
            value={props.horseDressageScore}
            onChangeText={props.setHorseDressageScore}
            keyboardType="decimal-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Dressage judge notes"
            placeholderTextColor="#F4F7F6"
            value={props.horseDressageNotes}
            onChangeText={props.setHorseDressageNotes}
          />
              </>
            )}

            {props.horseJumpingDay && (
              <>
                <Text style={styles.detailsSubtitle}>Jumping</Text>
          <TextInput
            style={styles.input}
            placeholder="Fence height, example: 80 cm"
            placeholderTextColor="#F4F7F6"
            value={props.horseFenceHeight}
            onChangeText={props.setHorseFenceHeight}
          />

          <TextInput
            style={styles.input}
            placeholder="Fence count"
            placeholderTextColor="#F4F7F6"
            value={props.horseFenceCount}
            onChangeText={props.setHorseFenceCount}
            keyboardType="number-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Jumping notes"
            placeholderTextColor="#F4F7F6"
            value={props.horseJumpingNotes}
            onChangeText={props.setHorseJumpingNotes}
          />
              </>
            )}
          </View>
        </>
      )}

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
  ridingTestContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
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
  performanceBox: {
    borderWidth: 1,
    borderColor: '#425655',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  performanceTitle: {
    color: '#F4F7F6',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
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
  testDayOption: {
    flex: 1,
  },
  feedEntryBox: {
    borderTopWidth: 1,
    borderTopColor: '#425655',
    paddingTop: 12,
    marginBottom: 4,
  },
  feedEntryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  feedEntryTitle: {
    color: '#F4F7F6',
    fontSize: 17,
    fontWeight: '700',
  },
  removeFeedButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeFeedButtonText: {
    color: '#F4F7F6',
    fontSize: 28,
    fontWeight: '700',
  },
  addFeedButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#425655',
    borderRadius: 10,
    marginBottom: 14,
  },
  addFeedButtonText: {
    color: '#F4F7F6',
    fontSize: 17,
    fontWeight: '700',
  },
  toggleButton: {
    backgroundColor: '#304243',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedToggleButton: {
    backgroundColor: '#22A398',
  },
  toggleText: {
    color: '#F4F7F6',
    fontSize: 19,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedToggleText: {
    color: '#F4F7F6',
    fontWeight: '800',
  },
});
