import { Task } from '@/types'
import Feather from '@expo/vector-icons/Feather'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import React from 'react'
import { FlatList, Pressable, StyleSheet, View } from 'react-native'
import { ThemedText } from './ThemedText'
import { ThemedView } from './ThemedView'

export default function TaskList({
  tasks,
  day,
  handleDelete,
  toggleTaskCompletion,
}: {
  tasks: Task[]
  day: Date
  handleDelete: (task: Task) => void
  toggleTaskCompletion: (title: string) => void
}) {
  return (
    <FlatList
      data={tasks}
      contentContainerStyle={{ paddingBottom: 60 }}
      keyExtractor={(item, index) => `${item.title}-${index}`}
      ListEmptyComponent={() => (
        <FontAwesome
          name="list-ul"
          size={200}
          color="silver"
          style={{
            opacity: 0.22,
            alignSelf: 'center',
            flex: 1,
            lineHeight: 600,
          }}
        />
      )}
      renderItem={({ item: task }) => (
        <ThemedView
          style={[
            styles.stepContainer,
            { opacity: task.completed ? 0.3 : 1 },
            {
              borderWidth: 1,
              borderColor:
                task.date < day.toLocaleDateString('en-CA')
                  ? 'tomato'
                  : 'transparent',
            },
          ]}
        >
          <Pressable
            style={{ padding: 10 }}
            onPress={() => toggleTaskCompletion(task.title)}
          >
            <ThemedText
              style={{
                fontWeight: 'bold',
                fontSize: 25,
                color: task.parent ? 'turquoise' : 'white',
              }}
            >
              {task.title}
            </ThemedText>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <ThemedText>
                priorytet:
                <ThemedText style={{ fontWeight: 'bold' }}>
                  {' ' + task.priority}
                </ThemedText>
              </ThemedText>
              <ThemedText>
                trudność:
                <ThemedText style={{ fontWeight: 'bold' }}>
                  {' ' + task.difficulty}
                </ThemedText>
              </ThemedText>
            </View>
            <ThemedText
              style={{
                fontWeight: 'bold',
                fontSize: 20,
                color:
                  task.date < day.toLocaleDateString('en-CA')
                    ? 'tomato'
                    : 'white',
              }}
            >
              {task.date} {task.time ? ` • ${task.time}` : ''}
            </ThemedText>
            {!task.parent && (
              <Feather
                name="trash-2"
                size={24}
                color="white"
                onPress={() => handleDelete(task)}
                style={{
                  position: 'absolute',
                  padding: 10,
                  alignSelf: 'flex-end',
                  backgroundColor: 'crimson',
                  bottom: 0,
                  borderTopLeftRadius: 10,
                }}
              />
            )}
          </Pressable>
        </ThemedView>
      )}
    />
  )
}

const styles = StyleSheet.create({
  stepContainer: {
    gap: 8,
    marginBottom: 18,
    borderBottomWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    //padding: 10,
  },
})
