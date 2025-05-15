import { getOldTasks, getOverdueTasks } from './functions'
import { Task } from './types'

describe('getOldTasks', () => {
  beforeAll(() => {
    // Ustawiamy datę systemową na 2024-05-10 (format en-CA)
    jest.useFakeTimers().setSystemTime(new Date('2024-05-10'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('should return only tasks with dates before today', () => {
    const tasks: Task[] = [
      {
        title: 'Old Task 1',
        difficulty: 2,
        priority: 1,
        date: '2024-05-08',
        time: '08:00',
        completed: false,
        dateOfCompletion: null,
        parent: null,
      },
      {
        title: 'Today Task',
        difficulty: 3,
        priority: 2,
        date: '2024-05-10',
        time: '12:00',
        completed: false,
        dateOfCompletion: null,
        parent: null,
      },
      {
        title: 'Old Task 2',
        difficulty: 1,
        priority: 3,
        date: '2024-05-09',
        time: '10:00',
        completed: true,
        dateOfCompletion: '2024-05-09',
        parent: null,
      },
      {
        title: 'Future Task',
        difficulty: 2,
        priority: 2,
        date: '2024-05-11',
        time: '09:00',
        completed: false,
        dateOfCompletion: null,
        parent: null,
      },
    ]

    const result = getOldTasks(tasks)

    expect(result).toEqual([
      {
        title: 'Old Task 1',
        difficulty: 2,
        priority: 1,
        date: '2024-05-08',
        time: '08:00',
        completed: false,
        dateOfCompletion: null,
        parent: null,
      },
      {
        title: 'Old Task 2',
        difficulty: 1,
        priority: 3,
        date: '2024-05-09',
        time: '10:00',
        completed: true,
        dateOfCompletion: '2024-05-09',
        parent: null,
      },
    ])
  })
})

describe('getOverdueTasks', () => {
    const fixedDate = new Date('2025-05-11T00:00:00.000Z')

    beforeAll(() => {
      jest.useFakeTimers({ now: fixedDate, legacyFakeTimers: false }) // legacy = false => 'modern'
    })

    afterAll(() => {
      jest.useRealTimers()
    })

  it('should return only uncompleted tasks', () => {
    const tasks: Task[] = [
      {
        title: 'Old Task 1',
        difficulty: 2,
        priority: 1,
        date: '2024-05-08',
        time: '08:00',
        completed: false,
        dateOfCompletion: null,
        parent: null,
      },
      {
        title: 'Old Task 2',
        difficulty: 1,
        priority: 3,
        date: '2024-05-09',
        time: '10:00',
        completed: true,
        dateOfCompletion: '2025-05-11',
        parent: null,
      },
    ]

    console.log(new Date())

    const result = getOverdueTasks(tasks, fixedDate)

    expect(result).toEqual([
      {
        title: 'Old Task 2',
        difficulty: 1,
        priority: 3,
        date: '2024-05-09',
        time: '10:00',
        completed: true,
        dateOfCompletion: '2024-05-10',
        parent: null,
      },
    ])
  })
})
