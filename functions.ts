import AsyncStorage from '@react-native-async-storage/async-storage'
import { CyclicTask, Day, Task } from './types'

export async function setCyclicInstance(
  cyclicTasks: CyclicTask[],
  day: Date
): Promise<void> {
  console.log('🚀 ~ setCyclicInstance ~ cyclicTasks:', cyclicTasks)
  try {
    const storedTasks = await AsyncStorage.getItem('tasks')
    if (storedTasks) {
      const parsedTasks: Task[] = JSON.parse(storedTasks)

      // Dodaj tylko te zadania z cyclicTasks, których tytuły ORAZ daty nie występują w parsedTasks
      const filteredCyclicTasks = getFilteredCyclicTasks(
        cyclicTasks,
        parsedTasks,
        day
      )

      const cyclicTasksInstances: Task[] = getCyclicTasksInstances(
        filteredCyclicTasks,
        day
      )

      const newTasks = [...parsedTasks, ...cyclicTasksInstances]
      await AsyncStorage.setItem('tasks', JSON.stringify(newTasks))
    } else {
      // Jeśli nie ma zapisanych zadań, zapisujemy wszystkie z cyclicTasks
      await AsyncStorage.setItem('tasks', JSON.stringify(cyclicTasks))
    }
  } catch (e) {
    console.error(e)
  }
}

function getFilteredCyclicTasks(
  cyclicTasks: CyclicTask[],
  parsedTasks: Task[],
  day: Date
): CyclicTask[] {
  return cyclicTasks.filter(
    (cyclicTask: CyclicTask) =>
      !parsedTasks.some(
        (existingTask: Task) =>
          existingTask.title === cyclicTask.title &&
          existingTask.date === day.toLocaleDateString('en-CA')
      )
  )
}

function getCyclicTasksInstances(
  filteredCyclicTasks: CyclicTask[],
  day: Date
): Task[] {
  return filteredCyclicTasks.map(cyclicTask => ({
    title: cyclicTask.title,
    difficulty: cyclicTask.difficulty,
    priority: cyclicTask.priority,
    date: day.toLocaleDateString('en-CA'),
    time: cyclicTask.time,
    completed: false,
    dateOfCompletion: null,
    parent: cyclicTask.title,
  }))
}

export async function removeTasks(tasksToRemove: Task[]): Promise<void> {
  console.log('🚀 ~ do usunięcia:')
  tasksToRemove.forEach(task => {
    console.log(task.title, task.date)
  })
  try {
    const storedTasks = await AsyncStorage.getItem('tasks')
    if (!storedTasks) return

    const parsedTasks: Task[] = JSON.parse(storedTasks)

    const updatedTasks = parsedTasks.filter(
      task => !tasksToRemove.some(toRemove => toRemove.title === task.title)
    )

    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks))
  } catch (error) {
    console.error('Error removing tasks:', error)
  }
}

export async function toggleTaskCompletionAsync(title: string): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem('tasks')
    if (!stored) return

    const tasks = JSON.parse(stored)
    const updatedTasks = tasks.map((task: Task) =>
      task.title === title
        ? {
            ...task,
            completed: !task.completed,
            dateOfCompletion: !task.completed
              ? new Date().toLocaleDateString('en-CA')
              : null,
          }
        : task
    )

    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks))
  } catch (e) {
    console.error('Błąd podczas zapisywania zadania:', e)
  }
}

// pomocne jeśli chcemy wyświetlić cykliczne zadania, które są zaległe
export async function checkCyclicTasksBackwards(
  today: Date,
  cyclicTasksRaw: string
): Promise<void> {
  const parsedCyclicTasks: CyclicTask[] = JSON.parse(cyclicTasksRaw)

  // Ustal najwcześniejszą datę startu
  const minDate = parsedCyclicTasks.reduce((min, task) => {
    const taskDate = new Date(task.date)
    return taskDate < min ? taskDate : min
  }, new Date())

  // Iteruj po dniach od minDate do today
  for (
    let day = new Date(minDate);
    day <= today;
    day.setDate(day.getDate() + 1)
  ) {
    const copy = new Date(day) // unikaj mutacji referencji
    await checkCyclicTasks(copy, cyclicTasksRaw)
  }
}

// sprawdza czy na dany dzień zaplanowane są jakieś cykliczne zadania
export async function checkCyclicTasks(
  day: Date,
  cyclicTasks: string
): Promise<void> {
  const todayWeekDay = day
    .toLocaleDateString('en-US', { weekday: 'short' })
    .toLowerCase() // np. 'mon'
  const todayDate = day.getDate() // dzień miesiąca

  const parsedCyclicTasks = JSON.parse(cyclicTasks)
  const cyclicTasksForThatDay: CyclicTask[] = []

  parsedCyclicTasks.forEach((task: CyclicTask) => {
    const baseDate = new Date(task.date)
    const diffDays = Math.floor(
      (day.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    switch (task.type) {
      case 0:
        //@ts-ignore // co X dni
        if (diffDays % task.period === 0)
          //dodaj instancję do listy
          cyclicTasksForThatDay.push(task)

        break

      case 1:
        // w określone dni tygodnia
        if (task?.weekDays?.includes(todayWeekDay as Day))
          cyclicTasksForThatDay.push(task)

        break

      case 2:
        // w określone dni miesiąca
        if (task?.monthDays?.includes(todayDate))
          cyclicTasksForThatDay.push(task)

        break
    }
  })
  //** jeśli wypadają, to są tworzone ich instancje z odpowiednią datą, o ile nie zostały już wcześniej utworzone */
  await setCyclicInstance(cyclicTasksForThatDay, day)
}

export function getTasksToRemove(
  oldTasks: Task[],
  uniqueTasksState: Task[]
): Task[] {
  return oldTasks.filter(
    (task: Task) =>
      (task.dateOfCompletion &&
        task.dateOfCompletion < new Date().toLocaleDateString('en-CA')) ||
      (uniqueTasksState.some(t => t.title === task.title) &&
        task.parent !== null)
  )
}

export function getOldTasks(parsedTasks: Task[]): Task[] {
  return parsedTasks.filter(
    (task: Task) => task.date < new Date().toLocaleDateString('en-CA')
  )
}

export function getOverdueTasks(oldTasks: Task[], day: Date): Task[] {
  return oldTasks.filter(
    (task: Task) =>
      (!task.dateOfCompletion &&
        day.toLocaleDateString('en-CA') ===
          new Date().toLocaleDateString('en-CA')) ||
      task.dateOfCompletion === day.toLocaleDateString('en-CA')
  )
}

export function getTasksState(
  overdueTasks: Task[],
  parsedTasks: Task[],
  day: Date
): Task[] {
  return [
    ...overdueTasks,
    ...parsedTasks.filter(
      (task: Task) => task.date === day.toLocaleDateString('en-CA')
    ),
  ]
}
