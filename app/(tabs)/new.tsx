import AsyncStorage from '@react-native-async-storage/async-storage'
import Slider from 'react-native-ui-lib/slider'
import Switch from 'react-native-ui-lib/switch'
import RadioGroup from 'react-native-ui-lib/radioGroup'
import RadioButton from 'react-native-ui-lib/radioButton'
import { useState } from 'react'
import { Alert, Button, Text, TextInput, View } from 'react-native'
import DatePicker from 'react-native-date-picker'
import Checkbox from 'react-native-ui-lib/src/components/checkbox'

export default function NewTaskScreen() {
  const [title, setTitle] = useState<string>('')
  const [difficulty, setDifficulty] = useState<number>(0)
  const [priority, setPriority] = useState<number>(0)
  const [date, setDate] = useState<Date>(new Date())
  const [time, setTime] = useState<Date>(new Date())
  const [isTime, setIsTime] = useState<boolean>(false)
  const [openDatePicker, setOpenDatePicker] = useState(false)
  const [openTimePicker, setOpenTimePicker] = useState(false)
  //*** */
  const [isCyclic, setIsCyclic] = useState<boolean>(false)
  const [cyclicType, setCyclicType] = useState<0 | 1 | 2>(0)
  const [period, setPeriod] = useState<number>(1)
  const [monthDay, setMonthDay] = useState<number>(1)
  const [weekDay, setWeekDay] = useState<
    ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[] | null
  >(null)

  function addTask() {
    if (!title || !date) {
      Alert.alert('Błąd', 'Tytuł i data są wymagane')
      return
    }

    const newTask = {
      title,
      difficulty,
      priority,
      date,
      time: isTime ? time : null,
      //cyclic,
      //parent: null,
    }

    if (!isCyclic)
      try {
        ;(async () => {
          const tasks = await AsyncStorage.getItem('tasks')
          if (tasks) {
            const parsedTasks = JSON.parse(tasks)
            parsedTasks.push(newTask)
            await AsyncStorage.setItem('tasks', JSON.stringify(parsedTasks))
          } else {
            await AsyncStorage.setItem('tasks', JSON.stringify([newTask]))
          }
        })()

        setTitle('')
        setDifficulty(0)
        setPriority(0)
        setIsTime(false)
        console.log('Task saved successfully!')
      } catch (error) {
        console.error('Error saving task:', error)
      }
  }

  return (
    <View>
      <TextInput
        value={title}
        onChangeText={value => setTitle(value)}
      ></TextInput>
      <Text style={{ fontSize: 20 }} onPress={() => setOpenDatePicker(true)}>
        {date.toLocaleString('pl-PL', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        })}{' '}
        Zmień datę
      </Text>
      <Text>Czy ustawić godzinę?</Text>
      <Switch
        value={isTime}
        onValueChange={() => setIsTime(prev => !prev)}
      ></Switch>
      <Text style={{ fontSize: 20 }} onPress={() => setOpenTimePicker(true)}>
        {isTime
          ? time.toLocaleString('pl-PL', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Zmień godzinę'}
      </Text>
      <Slider
        style={{ width: 200, height: 40 }}
        minimumValue={0}
        maximumValue={5}
        value={difficulty}
        onValueChange={value => setDifficulty(value)}
        step={1} //? is it default?
        minimumTrackTintColor="#FFFFFF"
        maximumTrackTintColor="#000000"
      />
      <Slider
        style={{ width: 200, height: 40 }}
        minimumValue={0}
        maximumValue={5}
        value={priority}
        onValueChange={value => setPriority(value)}
        step={1} //? is it default?
        minimumTrackTintColor="#FFFFFF"
        maximumTrackTintColor="#000000"
      />
      <Text>Czy zadanie jest cykliczne?</Text>
      <Switch
        value={isCyclic}
        onValueChange={() => setIsCyclic(prev => !prev)}
      ></Switch>
      {isCyclic && (
        <>
          <View>
            <Text>Jak często?</Text>
            <RadioGroup>
              <RadioButton
                label="Co X dni"
                value={0}
                onPress={() => setDifficulty(0)}
              />
              <RadioButton
                label="W określone dni tygodnia"
                value={1}
                onPress={() => setDifficulty(1)}
              />
              <RadioButton
                label="W określone dni miesiąca"
                value={2}
                onPress={() => setDifficulty(2)}
              />
            </RadioGroup>
          </View>
          <View>
            {cyclicType === 1 && (
              <>
                {/* <Checkbox value={value} onValueChange={setValue} /> */}
                {/* <Checkbox value={value} onValueChange={setValue} /> */}
              </>
            )}
          </View>
        </>
      )}
      <DatePicker
        modal
        mode="date"
        open={openDatePicker}
        date={date}
        onConfirm={date => {
          setOpenDatePicker(false)
          setDate(date)
          // console.log(date)
        }}
        onCancel={() => {
          setOpenDatePicker(false)
        }}
        locale="pl-PL"
        title="Wybierz datę"
        cancelText="anuluj"
        confirmText="zatwierdź"
      />
      <DatePicker
        modal
        mode="time"
        open={openTimePicker}
        date={time}
        onConfirm={time => {
          setOpenTimePicker(false)
          setTime(time)
          // console.log(date)
        }}
        onCancel={() => {
          setOpenTimePicker(false)
        }}
        locale="pl-PL"
        title="Wybierz godzinę"
        cancelText="anuluj"
        confirmText="zatwierdź"
      />
      <Button title="Dodaj zadanie" onPress={() => addTask()}></Button>
    </View>
  )
}
