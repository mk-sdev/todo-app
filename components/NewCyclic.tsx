import { Day } from '@/types'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import RadioButton from 'react-native-ui-lib/radioButton'
import RadioGroup from 'react-native-ui-lib/radioGroup'
import Slider from 'react-native-ui-lib/slider'
import Checkbox from 'react-native-ui-lib/src/components/checkbox'
import { ThemedText } from './ThemedText'

export default function NewCyclic({
  cyclicType,
  setCyclicType,
  period,
  setPeriod,
  monthDays,
  setMonthDays,
  weekDays,
  setWeekDays,
}: any) {
  const daysOfWeek: { key: Day; label: string }[] = [
    { key: 'mon', label: 'Poniedziałek' },
    { key: 'tue', label: 'Wtorek' },
    { key: 'wed', label: 'Środa' },
    { key: 'thu', label: 'Czwartek' },
    { key: 'fri', label: 'Piątek' },
    { key: 'sat', label: 'Sobota' },
    { key: 'sun', label: 'Niedziela' },
  ]

  function toggleDay(day: Day) {
    setWeekDays((prev: Day[]) =>
      prev.includes(day) ? prev.filter((d: Day) => d !== day) : [...prev, day]
    )
  }

  return (
    <>
      <View>
        <ThemedText style={styles.text}>Jak często?</ThemedText>
        <RadioGroup initialValue={0} style={{ gap: 10, paddingTop: 20 }}>
          <RadioButton
            label="Co X dni"
            labelStyle={{ color: 'white' }}
            value={0}
            selected
            onPress={() => setCyclicType(0)}
          />
          <RadioButton
            label="W określone dni tygodnia"
            labelStyle={{ color: 'white' }}
            value={1}
            onPress={() => setCyclicType(1)}
          />
          <RadioButton
            label="W określone dni miesiąca"
            labelStyle={{ color: 'white' }}
            value={2}
            onPress={() => setCyclicType(2)}
          />
        </RadioGroup>
      </View>
      <View>
        {cyclicType === 0 && (
          <>
            <Text style={styles.text}>Co ile dni?</Text>
            <Slider
              style={{ width: 200, height: 40 }}
              minimumValue={1}
              maximumValue={30}
              value={period}
              onValueChange={value => setPeriod(value)}
              step={1} //? is it default?
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
            />
            <ThemedText style={styles.text}>
              {period === 1 ? 'codziennie' : 'co ' + period + ' dni'}
            </ThemedText>
          </>
        )}
        {cyclicType === 1 && (
          <>
            {daysOfWeek.map(({ key, label }) => (
              <Checkbox
                key={key}
                label={label}
                value={weekDays.includes(key as any)}
                onValueChange={() => toggleDay(key)}
                marginB-10
                labelStyle={{ color: 'white' }}
              />
            ))}
          </>
        )}
        {cyclicType === 2 && (
          <>
            <ThemedText>Wybierz dni miesiąca</ThemedText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {Array.from({ length: 31 }, (_, i) => (
                <Checkbox
                  key={i + 1}
                  label={`${i + 1}`}
                  value={monthDays.includes(i + 1)}
                  onValueChange={() =>
                    setMonthDays((prev: number[]) =>
                      prev.includes(i + 1)
                        ? prev.filter(d => d !== i + 1)
                        : [...prev, i + 1]
                    )
                  }
                  marginB-5
                  labelStyle={{ color: 'white' }}
                />
              ))}
            </View>
          </>
        )}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
  },
})
