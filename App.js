import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialGoals = [
  {
    title: "Presentation på javadeveloper forum",
    description: "Presentation om modern utveckling med AI-verktyg för Java-utvecklare",
    comments: "",
    subtasks: [
      {
        task: "Planera och dela upp jobbet för en presentation med en kollega",
        description: "Boka möte med kollega och skapa presentation outline",
        comments: ""
      },
      {
        task: "Presentera",
        description: "Håll presentationen på Java forum",
        comments: ""
      },
      {
        task: "Skapa content",
        description: "Förbered slides och demo-material",
        comments: ""
      }
    ],
    color: '#FFD700' // Gold
  },
  {
    title: "Förbättra time management",
    description: "Implementera bättre rutiner för tidshantering",
    comments: "",
    subtasks: [
      {
        task: "Börja använda todo appen",
        description: "Daglig användning av todo-app för bättre struktur",
        comments: ""
      }
    ],
    color: '#98FB98' // Pale green
  },
  {
    title: "Bli bekväm med AI som utvecklingshjälp",
    description: "Utveckla kompetens inom AI-assisterad utveckling",
    comments: "",
    subtasks: [
      {
        task: "Utveckla smoketest-tjänst till Azureteamet mha Cursor",
        description: "Skapa automatiserade tester med Cursor AI",
        comments: ""
      },
      {
        task: "Utveckla tjänst i .NET mha Cursor som tex demas i Java forum",
        description: "Bygg demo-applikation för presentation",
        comments: ""
      }
    ],
    color: '#87CEEB' // Sky blue
  },
  {
    title: "Utveckla Azurekompetens",
    description: "Fördjupa kunskaper inom Azure-plattformen",
    comments: "",
    subtasks: [
      {
        task: "Certifiering AZ-204",
        description: "Genomför Azure Developer Associate certifiering",
        comments: ""
      },
      {
        task: "Flytta en tjänst till container apps",
        description: "Migrera befintlig tjänst till Azure Container Apps",
        comments: ""
      }
    ],
    color: '#DDA0DD' // Plum
  }
];

export default function App() {
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentComments, setCurrentComments] = useState("");
  const [savedComments, setSavedComments] = useState({});
  const [completedTasks, setCompletedTasks] = useState({});
  const [editingGoalTitle, setEditingGoalTitle] = useState(null);
  const [newSubtaskText, setNewSubtaskText] = useState("");

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const savedGoals = await AsyncStorage.getItem('goals');
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      } else {
        setGoals(initialGoals);
      }
      
      const savedComments = await AsyncStorage.getItem('subtaskComments');
      if (savedComments) setSavedComments(JSON.parse(savedComments));
      
      const savedCompleted = await AsyncStorage.getItem('completedTasks');
      if (savedCompleted) setCompletedTasks(JSON.parse(savedCompleted));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveGoals = async (newGoals) => {
    try {
      await AsyncStorage.setItem('goals', JSON.stringify(newGoals));
      setGoals(newGoals);
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  };

  const handleGoalTitleEdit = (goalIndex, newTitle) => {
    const newGoals = [...goals];
    newGoals[goalIndex].title = newTitle;
    saveGoals(newGoals);
  };

  const addSubtask = (goalIndex) => {
    if (!newSubtaskText.trim()) return;

    const newGoals = [...goals];
    newGoals[goalIndex].subtasks.push({
      task: newSubtaskText,
      description: "",
      comments: ""
    });
    
    saveGoals(newGoals);
    setNewSubtaskText("");
  };

  const removeSubtask = async (goalIndex, subtaskIndex) => {
    const newGoals = [...goals];
    newGoals[goalIndex].subtasks.splice(subtaskIndex, 1);
    
    const newComments = { ...savedComments };
    const newCompleted = { ...completedTasks };
    delete newComments[`${goalIndex}-${subtaskIndex}`];
    delete newCompleted[`${goalIndex}-${subtaskIndex}`];
    
    try {
      await Promise.all([
        AsyncStorage.setItem('goals', JSON.stringify(newGoals)),
        AsyncStorage.setItem('subtaskComments', JSON.stringify(newComments)),
        AsyncStorage.setItem('completedTasks', JSON.stringify(newCompleted))
      ]);
      
      setGoals(newGoals);
      setSavedComments(newComments);
      setCompletedTasks(newCompleted);
    } catch (error) {
      console.error('Error removing subtask:', error);
    }
  };

  const handleGoalPress = (goal, goalIndex) => {
    setSelectedGoal({ ...goal, index: goalIndex });
    setSelectedSubtask(null);
  };

  const handleSubtaskPress = (subtask, goalIndex, subtaskIndex) => {
    const commentKey = `${goalIndex}-${subtaskIndex}`;
    setSelectedSubtask({
      ...subtask,
      goalIndex,
      subtaskIndex
    });
    setCurrentComments(savedComments[commentKey] || "");
    setModalVisible(true);
  };

  const toggleSubtaskCompletion = async (goalIndex, subtaskIndex) => {
    const taskKey = `${goalIndex}-${subtaskIndex}`;
    const newCompletedTasks = {
      ...completedTasks,
      [taskKey]: !completedTasks[taskKey]
    };
    
    try {
      await AsyncStorage.setItem('completedTasks', JSON.stringify(newCompletedTasks));
      setCompletedTasks(newCompletedTasks);
    } catch (error) {
      console.error('Error saving completion state:', error);
    }
  };

  const isGoalCompleted = (goalIndex) => {
    return goals[goalIndex].subtasks.every((_, subtaskIndex) => 
      completedTasks[`${goalIndex}-${subtaskIndex}`]
    );
  };

  const handleSaveComments = async () => {
    if (selectedSubtask) {
      const commentKey = `${selectedSubtask.goalIndex}-${selectedSubtask.subtaskIndex}`;
      const newComments = {
        ...savedComments,
        [commentKey]: currentComments
      };
      
      try {
        await AsyncStorage.setItem('subtaskComments', JSON.stringify(newComments));
        setSavedComments(newComments);
      } catch (error) {
        console.error('Error saving comments:', error);
      }
    }
    setModalVisible(false);
  };

  const renderSubtaskComments = (goalIndex) => {
    return goals[goalIndex].subtasks.map((subtask, subtaskIndex) => {
      const commentKey = `${goalIndex}-${subtaskIndex}`;
      const comment = savedComments[commentKey];
      
      if (!comment) return null;
      
      return (
        <View key={subtaskIndex} style={styles.subtaskCommentContainer}>
          <Text style={styles.subtaskTitle}>{subtask.task}:</Text>
          <Text style={styles.subtaskComment}>{comment}</Text>
        </View>
      );
    });
  };

  const isSmallScreen = Platform.OS === 'ios' || Platform.OS === 'android';

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.header}>Jobbmål 2024</Text>
      
      <View style={[styles.contentContainer, isSmallScreen && styles.contentContainerMobile]}>
        {/* Goals List */}
        <ScrollView style={[styles.goalsList, isSmallScreen && styles.goalsListMobile]}>
          {goals.map((goal, goalIndex) => (
            <View key={goalIndex} style={[styles.goalCard, { backgroundColor: goal.color }]}>
              <View style={styles.goalTitleContainer}>
                {editingGoalTitle === goalIndex ? (
                  <TextInput
                    style={styles.goalTitleInput}
                    value={goal.title}
                    onChangeText={(text) => handleGoalTitleEdit(goalIndex, text)}
                    onBlur={() => setEditingGoalTitle(null)}
                    autoFocus
                  />
                ) : (
                  <View style={styles.goalTitleRow}>
                    <TouchableOpacity 
                      style={styles.goalTitleButton} 
                      onPress={() => handleGoalPress(goal, goalIndex)}
                    >
                      <Text style={styles.goalTitle} numberOfLines={2}>
                        {goal.title} {isGoalCompleted(goalIndex) ? "✅" : ""}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => setEditingGoalTitle(goalIndex)}
                    >
                      <Text>✏️</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              
              {goal.subtasks.map((subtask, subtaskIndex) => (
                <View key={subtaskIndex} style={styles.subtaskContainer}>
                  <TouchableOpacity 
                    style={styles.checkbox}
                    onPress={() => toggleSubtaskCompletion(goalIndex, subtaskIndex)}
                  >
                    <Text>{completedTasks[`${goalIndex}-${subtaskIndex}`] ? "☑️" : "⬜"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.subtaskTextContainer}
                    onPress={() => handleSubtaskPress(subtask, goalIndex, subtaskIndex)}
                  >
                    <Text 
                      style={[
                        styles.subtask,
                        completedTasks[`${goalIndex}-${subtaskIndex}`] && styles.completedSubtask
                      ]}
                      numberOfLines={2}
                    >
                      {subtask.task}
                      {savedComments[`${goalIndex}-${subtaskIndex}`] ? " 📝" : ""}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeSubtask(goalIndex, subtaskIndex)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              
              <View style={styles.addSubtaskContainer}>
                <TextInput
                  style={styles.addSubtaskInput}
                  value={newSubtaskText}
                  onChangeText={setNewSubtaskText}
                  placeholder="Ny uppgift..."
                  onSubmitEditing={() => addSubtask(goalIndex)}
                />
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => addSubtask(goalIndex)}
                >
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Details Panel - Only show on larger screens */}
        {!isSmallScreen && (
          <ScrollView style={styles.detailsPanel}>
            {selectedGoal ? (
              <>
                <Text style={styles.detailsTitle}>{selectedGoal.title}</Text>
                <Text style={styles.label}>Beskrivning:</Text>
                <Text style={styles.description}>{selectedGoal.description}</Text>
                <Text style={styles.label}>Kommentarer:</Text>
                <View style={styles.commentsContainer}>
                  {renderSubtaskComments(selectedGoal.index)}
                </View>
              </>
            ) : (
              <Text style={styles.noSelection}>Välj ett mål för att se detaljer</Text>
            )}
          </ScrollView>
        )}
      </View>

      {/* Subtask Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{selectedSubtask?.task}</Text>
          
          <Text style={styles.label}>Description:</Text>
          <Text style={styles.description}>{selectedSubtask?.description}</Text>
          
          <Text style={styles.label}>Progress Journal:</Text>
          <TextInput
            style={styles.commentsInput}
            multiline
            value={currentComments}
            onChangeText={setCurrentComments}
            placeholder="Add your progress notes here..."
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={handleSaveComments}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 15,
    gap: 20,
  },
  contentContainerMobile: {
    flexDirection: 'column',
    padding: 10,
  },
  header: {
    fontSize: Platform.OS === 'ios' ? 22 : 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
    color: '#2d3436',
  },
  goalsList: {
    flex: 1,
    marginRight: 15,
  },
  goalsListMobile: {
    marginRight: 0,
  },
  goalCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalTitleContainer: {
    marginBottom: 15,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalTitleButton: {
    flex: 1,
    marginRight: 10,
  },
  editButton: {
    padding: 5,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  goalTitle: {
    fontSize: Platform.OS === 'ios' ? 16 : 18,
    fontWeight: '600',
    color: '#2d3436',
  },
  subtaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 5,
  },
  subtaskTextContainer: {
    flex: 1,
  },
  completedSubtask: {
    textDecorationLine: 'line-through',
    color: '#a0a0a0',
  },
  subtask: {
    fontSize: Platform.OS === 'ios' ? 14 : 16,
    color: '#636e72',
    lineHeight: 20,
  },
  detailsPanel: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    color: '#2d3436',
    borderBottomWidth: 2,
    borderBottomColor: '#f1f2f6',
    paddingBottom: 15,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#2d3436',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#636e72',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f2f6',
  },
  commentsContainer: {
    marginTop: 10,
  },
  subtaskCommentContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  subtaskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#444',
  },
  subtaskComment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 8,
    marginTop: 100,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    color: '#2d3436',
    borderBottomWidth: 2,
    borderBottomColor: '#f1f2f6',
    paddingBottom: 15,
  },
  commentsInput: {
    borderWidth: 1,
    borderColor: '#f1f2f6',
    borderRadius: 12,
    padding: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#636e72',
    backgroundColor: '#f8f9fa',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 25,
    gap: 15,
  },
  button: {
    padding: 15,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: '#00b894',
  },
  cancelButton: {
    backgroundColor: '#ff7675',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noSelection: {
    fontSize: 16,
    color: '#b2bec3',
    textAlign: 'center',
    marginTop: 20,
  },
  goalTitleInput: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d3436',
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addSubtaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  addSubtaskInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: Platform.OS === 'ios' ? 8 : 10,
    fontSize: Platform.OS === 'ios' ? 14 : 16,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#00b894',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  removeButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,99,99,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeButtonText: {
    color: '#ff6666',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
