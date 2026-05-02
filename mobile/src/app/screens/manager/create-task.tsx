import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { taskAPI, teamAPI, authAPI } from "../../../_lib/services";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Team {
  id: number;
  name: string;
  description?: string;
}

export default function CreateTaskScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [assignmentType, setAssignmentType] = useState<"member" | "team" | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [showTeamPicker, setShowTeamPicker] = useState(false);

  const priorities = ["LOW", "MEDIUM", "HIGH"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setFetchingData(true);
      const [usersData, teamsData] = await Promise.all([
        authAPI.getAllUsers(),
        teamAPI.getMyTeams(),
      ]);

      const usersList = usersData.users || [];
      const teamsList = Array.isArray(teamsData) ? teamsData : (teamsData.teams || []);

      // Filter only members (role USER)
      const membersList = usersList.filter((u: Member) => u.role === "USER");
      
      setMembers(membersList);
      setTeams(teamsList);
    } catch (err: any) {
      setError(err?.message || "Failed to load data");
    } finally {
      setFetchingData(false);
    }
  };

  const handleCreateTask = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!assignmentType || (!selectedMember && !selectedTeam)) {
      setError("Please select a member or team to assign task to");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const taskData: any = {
        title: title.trim(),
        description: description.trim(),
        priority,
        status: "TODO",
      };

      if (assignmentType === "member" && selectedMember) {
        taskData.assignedToId = selectedMember.id;
      } else if (assignmentType === "team" && selectedTeam) {
        taskData.teamId = selectedTeam.id;
      }

      await taskAPI.createTask(taskData);

      Alert.alert("Success", "Task created successfully", [
        {
          text: "OK",
          onPress: () => {
            setTitle("");
            setDescription("");
            setPriority("MEDIUM");
            setAssignmentType(null);
            setSelectedMember(null);
            setSelectedTeam(null);
            router.back();
          },
        },
      ]);
    } catch (err: any) {
      setError(err?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };


  if (fetchingData) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9800" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FF9800" />
          </TouchableOpacity>
          <Text style={styles.title}>Create New Task</Text>
          <View style={{ width: 24 }} />
        </View>

        {error && (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons name="alert-circle" size={20} color="#f44" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.label}>Task Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter task title"
            value={title}
            onChangeText={setTitle}
            editable={!loading}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter task description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            editable={!loading}
          />

          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityButtons}>
            {priorities.map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityButton,
                  priority === p && styles.priorityButtonActive,
                ]}
                onPress={() => setPriority(p)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.priorityButtonText,
                    priority === p && styles.priorityButtonTextActive,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Assign To</Text>
          <View style={styles.assignmentTypeButtons}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                assignmentType === "member" && styles.typeButtonActive,
              ]}
              onPress={() => {
                setAssignmentType("member");
                setSelectedTeam(null);
              }}
            >
              <MaterialCommunityIcons 
                name="account" 
                size={18} 
                color={assignmentType === "member" ? "#fff" : "#FF9800"} 
              />
              <Text
                style={[
                  styles.typeButtonText,
                  assignmentType === "member" && styles.typeButtonTextActive,
                ]}
              >
                Member
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                assignmentType === "team" && styles.typeButtonActive,
              ]}
              onPress={() => {
                setAssignmentType("team");
                setSelectedMember(null);
              }}
            >
              <MaterialCommunityIcons 
                name="account-multiple" 
                size={18} 
                color={assignmentType === "team" ? "#fff" : "#FF9800"} 
              />
              <Text
                style={[
                  styles.typeButtonText,
                  assignmentType === "team" && styles.typeButtonTextActive,
                ]}
              >
                Team
              </Text>
            </TouchableOpacity>
          </View>

          {assignmentType === "member" && (
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={() => setShowMemberPicker(true)}
            >
              <MaterialCommunityIcons name="account" size={20} color="#FF9800" />
              <Text style={styles.selectionButtonText}>
                {selectedMember ? selectedMember.name : "Select a member"}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
          )}

          {assignmentType === "team" && (
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={() => setShowTeamPicker(true)}
            >
              <MaterialCommunityIcons name="account-multiple" size={20} color="#FF9800" />
              <Text style={styles.selectionButtonText}>
                {selectedTeam ? selectedTeam.name : "Select a team"}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.createButton, loading && styles.createButtonDisabled]}
            onPress={handleCreateTask}
            disabled={loading || !assignmentType || (!selectedMember && !selectedTeam)}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                <Text style={styles.createButtonText}>Create Task</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Member Picker Modal */}
      <Modal
        visible={showMemberPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMemberPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Member</Text>
              <TouchableOpacity onPress={() => setShowMemberPicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {members.length > 0 ? (
              <FlatList
                data={members}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.listItem,
                      selectedMember?.id === item.id && styles.listItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedMember(item);
                      setShowMemberPicker(false);
                    }}
                  >
                    <View style={styles.itemContent}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemEmail}>{item.email}</Text>
                    </View>
                    {selectedMember?.id === item.id && (
                      <MaterialCommunityIcons 
                        name="check-circle" 
                        size={24} 
                        color="#FF9800" 
                      />
                    )}
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons 
                  name="account-multiple-outline" 
                  size={40} 
                  color="#ccc" 
                />
                <Text style={styles.emptyText}>No members available</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Team Picker Modal */}
      <Modal
        visible={showTeamPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTeamPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Team</Text>
              <TouchableOpacity onPress={() => setShowTeamPicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {teams.length > 0 ? (
              <FlatList
                data={teams}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.listItem,
                      selectedTeam?.id === item.id && styles.listItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedTeam(item);
                      setShowTeamPicker(false);
                    }}
                  >
                    <View style={styles.itemContent}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {item.description && (
                        <Text style={styles.itemEmail}>{item.description}</Text>
                      )}
                    </View>
                    {selectedTeam?.id === item.id && (
                      <MaterialCommunityIcons 
                        name="check-circle" 
                        size={24} 
                        color="#FF9800" 
                      />
                    )}
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons 
                  name="account-multiple-outline" 
                  size={40} 
                  color="#ccc" 
                />
                <Text style={styles.emptyText}>No teams available</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#FF9800",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  errorBox: {
    flexDirection: "row",
    backgroundColor: "#ffebee",
    borderLeftWidth: 4,
    borderLeftColor: "#f44",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    alignItems: "center",
    gap: 10,
  },
  errorText: {
    flex: 1,
    color: "#f44",
    fontSize: 14,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  textArea: {
    textAlignVertical: "top",
  },
  priorityButtons: {
    flexDirection: "row",
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#FF9800",
    borderRadius: 6,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  priorityButtonActive: {
    backgroundColor: "#FF9800",
  },
  priorityButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FF9800",
  },
  priorityButtonTextActive: {
    color: "#fff",
  },
  assignmentTypeButtons: {
    flexDirection: "row",
    gap: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: "#FF9800",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    gap: 6,
  },
  typeButtonActive: {
    backgroundColor: "#FF9800",
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FF9800",
  },
  typeButtonTextActive: {
    color: "#fff",
  },
  selectionButton: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: "center",
    gap: 10,
  },
  selectionButtonText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  createButton: {
    flexDirection: "row",
    backgroundColor: "#FF9800",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  listItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listItemSelected: {
    backgroundColor: "#fff9e6",
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  itemEmail: {
    fontSize: 12,
    color: "#999",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});
