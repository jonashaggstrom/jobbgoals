import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
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
  const [newGoalModalVisible, setNewGoalModalVisible] = useState(false);
  const [currentComments, setCurrentComments] = useState("");
  const [savedComments, setSavedComments] = useState({});
  const [completedTasks, setCompletedTasks] = useState({});
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [editingGoalTitle, setEditingGoalTitle] = useState(null);
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [goalDetailsModalVisible, setGoalDetailsModalVisible] = useState(false);

  const isSmallScreen = Platform.OS === 'ios' || Platform.OS === 'android';

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const savedGoals = await AsyncStorage.getItem('goals');
      const savedComments = await AsyncStorage.getItem('subtaskComments');
      const savedCompleted = await AsyncStorage.getItem('completedTasks');
      
      if (savedGoals) setGoals(JSON.parse(savedGoals));
      if (savedComments) setSavedComments(JSON.parse(savedComments));
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

  const handleGoalPress = (goal, goalIndex) => {
    setSelectedGoal({ ...goal, index: goalIndex });
    if (isSmallScreen) {
      setGoalDetailsModalVisible(true);
    }
  };

  const handleGoalTitleEdit = (goalIndex, newTitle) => {
    const newGoals = [...goals];
    newGoals[goalIndex].title = newTitle;
    saveGoals(newGoals);
  };

  const handleSubtaskPress = (subtask, goalIndex, subtaskIndex) => {
    setSelectedSubtask({ ...subtask, goalIndex, subtaskIndex });
    setCurrentComments(savedComments[`${goalIndex}-${subtaskIndex}`] || "");
    setModalVisible(true);
  };

  const handleSaveComments = async () => {
    if (!selectedSubtask) return;
    
    const key = `${selectedSubtask.goalIndex}-${selectedSubtask.subtaskIndex}`;
    const newComments = { ...savedComments, [key]: currentComments };
    
    try {
      await AsyncStorage.setItem('subtaskComments', JSON.stringify(newComments));
      setSavedComments(newComments);
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving comments:', error);
    }
  };

  const toggleSubtaskCompletion = async (goalIndex, subtaskIndex) => {
    const key = `${goalIndex}-${subtaskIndex}`;
    const newCompletedTasks = { 
      ...completedTasks, 
      [key]: !completedTasks[key] 
    };
    
    try {
      await AsyncStorage.setItem('completedTasks', JSON.stringify(newCompletedTasks));
      setCompletedTasks(newCompletedTasks);
    } catch (error) {
      console.error('Error toggling completion:', error);
    }
  };

  const isGoalCompleted = (goalIndex) => {
    return goals[goalIndex]?.subtasks?.every((_, subtaskIndex) => 
      completedTasks[`${goalIndex}-${subtaskIndex}`]
    );
  };

  const getRandomColor = () => {
    const colors = [
      '#FFD700', '#98FB98', '#87CEEB', '#DDA0DD', 
      '#F0E68C', '#E6E6FA', '#FFA07A', '#B0E0E6'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const addNewGoal = async () => {
    if (!newGoalTitle.trim()) return;

    const newGoal = {
      title: newGoalTitle,
      description: newGoalDescription,
      subtasks: [],
      color: getRandomColor()
    };

    const newGoals = [...goals, newGoal];
    await saveGoals(newGoals);
    
    setNewGoalTitle("");
    setNewGoalDescription("");
    setNewGoalModalVisible(false);
  };

  const addSubtask = (goalIndex) => {
    if (!newSubtaskText.trim()) return;

    const newGoals = [...goals];
    newGoals[goalIndex].subtasks.push({
      task: newSubtaskText,
      description: ""
    });
    
    saveGoals(newGoals);
    setNewSubtaskText("");
  };

  const removeSubtask = (goalIndex, subtaskIndex) => {
    const newGoals = [...goals];
    newGoals[goalIndex].subtasks.splice(subtaskIndex, 1);
    saveGoals(newGoals);
  };

  const renderSubtaskComments = (goalIndex) => {
    if (!goals[goalIndex]) return null;
    
    return goals[goalIndex].subtasks.map((subtask, subtaskIndex) => {
      const key = `${goalIndex}-${subtaskIndex}`;
      const comment = savedComments[key];
      if (!comment) return null;
      
      return (
        <View key={key} style={styles.subtaskCommentContainer}>
          <Text style={styles.subtaskTitle}>{subtask.task}</Text>
          <Text style={styles.subtaskComment}>{comment}</Text>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Goalie</Text>
        <TouchableOpacity 
          style={styles.addGoalButton}
          onPress={() => setNewGoalModalVisible(true)}
        >
          <Text style={styles.addGoalButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.goalsList}>
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
                    <Text style={styles.goalTitle}>
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

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalInner}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedSubtask?.task}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.label}>Beskrivning:</Text>
              <Text style={styles.description}>{selectedSubtask?.description}</Text>
              
              <Text style={styles.label}>Anteckningar:</Text>
              <TextInput
                style={styles.commentsInput}
                multiline
                value={currentComments}
                onChangeText={setCurrentComments}
                placeholder="Lägg till anteckningar här..."
              />
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.saveButton]} 
                  onPress={handleSaveComments}
                >
                  <Text style={styles.buttonText}>Spara</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Stäng</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={newGoalModalVisible}
        onRequestClose={() => setNewGoalModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalInner}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nytt mål</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setNewGoalModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Titel</Text>
                <TextInput
                  style={styles.titleInput}
                  value={newGoalTitle}
                  onChangeText={setNewGoalTitle}
                  placeholder="Ange målets titel"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Beskrivning</Text>
                <TextInput
                  style={styles.descriptionInput}
                  value={newGoalDescription}
                  onChangeText={setNewGoalDescription}
                  placeholder="Beskriv målet"
                  multiline
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.saveButton]}
                  onPress={addNewGoal}
                >
                  <Text style={styles.buttonText}>Skapa mål</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setNewGoalModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Avbryt</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  goalsList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3436',
  },
  addGoalButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00b894',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addGoalButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalInner: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: Platform.OS === 'web' ? '80%' : '90%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d3436',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#636e72',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#636e72',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  titleInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  descriptionInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  commentsInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#00b894',
  },
  cancelButton: {
    backgroundColor: '#b2bec3',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  subtaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 5,
  },
  checkbox: {
    marginRight: 8,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtaskTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  subtask: {
    fontSize: Platform.OS === 'ios' ? 14 : 16,
    color: '#636e72',
    lineHeight: 20,
  },
  completedSubtask: {
    textDecorationLine: 'line-through',
    color: '#b2bec3',
  },
  removeButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,99,99,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '600',
  },
  addSubtaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 5,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00b894',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  subtaskCommentContainer: {
    marginVertical: 8,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  subtaskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 8,
  },
  subtaskComment: {
    fontSize: 14,
    color: '#636e72',
    lineHeight: 20,
  },
  goalTitleButton: {
    flex: 1,
    marginRight: 8,
  },
  editButton: {
    padding: 4,
  },
  goalTitleInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 8,
    flex: 1,
  },
  goalTitleContainer: {
    marginBottom: 12,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});
