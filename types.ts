export type Task = {
  completed: boolean
  title: string
  difficulty: number
  priority: number
  date: string
  dateOfCompletion: string | null
  time: string | null
  parent: string | null
}

export type CyclicTask = {
  title: string
  difficulty: number
  priority: number
  date: string
  time: string | null

  type: 0 | 1 | 2
  period: number | null
  weekDays: Day[] | null
  monthDays: number[] | null
}

export type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
