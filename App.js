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
  const [currentComments, setCurrentComments] = useState("");
  const [savedComments, setSavedComments] = useState({});
  const [completedTasks, setCompletedTasks] = useState({});
  const [editingGoalTitle, setEditingGoalTitle] = useState(null);
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [goalDetailsModalVisible, setGoalDetailsModalVisible] = useState(false);
  const [newGoalModalVisible, setNewGoalModalVisible] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');

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
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      setGoalDetailsModalVisible(true);
    }
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

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const GoalDetailsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={goalDetailsModalVisible}
      onRequestClose={() => setGoalDetailsModalVisible(false)}
    >
      <View style={styles.modalView}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{selectedGoal?.title}</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setGoalDetailsModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.label}>Beskrivning:</Text>
          <Text style={styles.description}>{selectedGoal?.description}</Text>
          
          <Text style={styles.label}>Deluppgifter och anteckningar:</Text>
          {selectedGoal && renderSubtaskComments(selectedGoal.index)}
        </ScrollView>
      </View>
    </Modal>
  );

  const addNewGoal = async () => {
    if (!newGoalTitle.trim()) return;

    const newGoal = {
      title: newGoalTitle,
      description: newGoalDescription,
      subtasks: [],
      color: getRandomColor(),
      comments: ''
    };

    const newGoals = [...goals, newGoal];
    await saveGoals(newGoals);
    
    setNewGoalTitle('');
    setNewGoalDescription('');
    setNewGoalModalVisible(false);
  };

  const getRandomColor = () => {
    const colors = [
      '#FFD700', // Gold
      '#98FB98', // Pale green
      '#87CEEB', // Sky blue
      '#DDA0DD', // Plum
      '#F0E68C', // Khaki
      '#E6E6FA', // Lavender
      '#FFA07A', // Light salmon
      '#B0E0E6', // Powder blue
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const NewGoalModal = () => (
    <Modal
      animationType="none"
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
                onChangeText={(text) => setNewGoalTitle(text)}
                placeholder="Ange målets titel"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Beskrivning</Text>
              <TextInput
                style={styles.descriptionInput}
                value={newGoalDescription}
                onChangeText={(text) => setNewGoalDescription(text)}
                placeholder="Beskriv målet"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
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
  );

  const SubtaskModal = () => (
    <Modal
      animationType="none"
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
              onChangeText={(text) => setCurrentComments(text)}
              placeholder="Lägg till anteckningar här..."
              placeholderTextColor="#999"
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
  );

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
      
      <View style={[styles.contentContainer, isSmallScreen && styles.contentContainerMobile]}>
        {/* Goals List */}
        <ScrollView style={[styles.goalsList, isSmallScreen && styles.goalsListMobile]}>
          {goals.map((goal, goalIndex) => (
            <View key={goalIndex} style={[styles.goalCard, { backgroundColor: goal.color }]}>
              <View style={styles.goalTitleContainer}>
                {editingGoalTitle === goalIndex ? (
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.goalTitleInput}
                      value={goal.title}
                      onChangeText={(text) => handleGoalTitleEdit(goalIndex, text)}
                      onBlur={() => setEditingGoalTitle(null)}
                      autoFocus
                    />
                    <TouchableOpacity 
                      style={styles.keyboardDoneButton}
                      onPress={dismissKeyboard}
                    >
                      <Text style={styles.keyboardDoneText}>Klar</Text>
                    </TouchableOpacity>
                  </View>
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
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.addSubtaskInput}
                    value={newSubtaskText}
                    onChangeText={setNewSubtaskText}
                    placeholder="Ny uppgift..."
                    onSubmitEditing={() => {
                      addSubtask(goalIndex);
                      dismissKeyboard();
                    }}
                  />
                  <TouchableOpacity 
                    style={styles.keyboardDoneButton}
                    onPress={dismissKeyboard}
                  >
                    <Text style={styles.keyboardDoneText}>Klar</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => {
                    addSubtask(goalIndex);
                    dismissKeyboard();
                  }}
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

      <NewGoalModal />
      <SubtaskModal />
      {isSmallScreen && <GoalDetailsModal />}
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
    flex: 1,
    backgroundColor: 'white',
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#636e72',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  keyboardDoneButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  keyboardDoneText: {
    color: '#2d3436',
    fontSize: 14,
    fontWeight: '500',
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
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
  inputWrapper: {
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
    width: Platform.OS === 'web' ? '80%' : '100%',
    maxWidth: Platform.OS === 'web' ? 500 : '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
  },
});
