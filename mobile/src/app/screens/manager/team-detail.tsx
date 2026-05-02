import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { teamAPI, authAPI } from "../../../_lib/services";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface TeamMember {
  user: Member;
}

export default function TeamDetailScreen() {
  const router = useRouter();
  const { teamId, teamName } = useLocalSearchParams();
  const [team, setTeam] = useState<any>(null);
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);

  useEffect(() => {
    fetchTeamAndMembers();
  }, []);

  const fetchTeamAndMembers = async () => {
    try {
      setLoading(true);
      const [teamData, usersData] = await Promise.all([
        teamAPI.getTeamById(parseInt(teamId as string)),
        authAPI.getAllUsers(),
      ]);

      const usersList = usersData.users || [];
      const membersList = usersList.filter((u: Member) => u.role === "USER");
      
      // Get already added member IDs
      const addedMemberIds = (teamData.members || []).map((m: TeamMember) => m.user.id);
      
      // Filter to show only members not already in team
      const availableMembersToAdd = membersList.filter(
        (m: Member) => !addedMemberIds.includes(m.id)
      );

      setTeam(teamData);
      setAvailableMembers(availableMembersToAdd);
    } catch (err: any) {
      setError(err?.message || "Failed to load team details");
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (memberId: number) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) {
      setError("Please select at least one member");
      return;
    }

    try {
      setError(null);
      setAdding(true);

      await Promise.all(
        selectedMembers.map((memberId) =>
          teamAPI.addTeamMember(parseInt(teamId as string), memberId)
        )
      );

      Alert.alert("Success", `${selectedMembers.length} member(s) added successfully!`, [
        {
          text: "OK",
          onPress: () => {
            setShowAddMembersModal(false);
            setSelectedMembers([]);
            fetchTeamAndMembers();
          },
        },
      ]);
    } catch (err: any) {
      setError(err?.message || "Failed to add members");
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9800" />
          <Text style={styles.loadingText}>Loading team...</Text>
        </View>
      </View>
    );
  }

  if (!team) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={40} color="#f44" />
          <Text style={styles.errorText}>Team not found</Text>
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
          <View style={styles.headerTitle}>
            <Text style={styles.title}>{team.name}</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {error && (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons name="alert-circle" size={20} color="#f44" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {team.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{team.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Team Members ({team.members?.length || 0})</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddMembersModal(true)}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {team.members && team.members.length > 0 ? (
            <View style={styles.membersList}>
              {team.members.map((member: TeamMember, index: number) => (
                <View
                  key={member.user.id}
                  style={[
                    styles.memberItem,
                    index !== team.members.length - 1 && styles.memberItemBorder,
                  ]}
                >
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.user.name}</Text>
                    <Text style={styles.memberEmail}>{member.user.email}</Text>
                  </View>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="account-multiple-outline" size={40} color="#ccc" />
              <Text style={styles.emptyText}>No members in this team yet</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Members Modal */}
      <Modal
        visible={showAddMembersModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddMembersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Members to Team</Text>
              <TouchableOpacity onPress={() => setShowAddMembersModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {availableMembers.length > 0 ? (
              <>
                <FlatList
                  data={availableMembers}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.listItem,
                        selectedMembers.includes(item.id) && styles.listItemSelected,
                      ]}
                      onPress={() => toggleMember(item.id)}
                    >
                      <View style={styles.checkbox}>
                        {selectedMembers.includes(item.id) ? (
                          <MaterialCommunityIcons
                            name="checkbox-marked"
                            size={24}
                            color="#FF9800"
                          />
                        ) : (
                          <MaterialCommunityIcons
                            name="checkbox-blank-outline"
                            size={24}
                            color="#ddd"
                          />
                        )}
                      </View>
                      <View style={styles.itemContent}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemEmail}>{item.email}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowAddMembersModal(false);
                      setSelectedMembers([]);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.confirmButton,
                      selectedMembers.length === 0 && styles.confirmButtonDisabled,
                    ]}
                    onPress={handleAddMembers}
                    disabled={adding || selectedMembers.length === 0}
                  >
                    {adding ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.confirmButtonText}>
                        Add ({selectedMembers.length})
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="account-multiple-outline" size={40} color="#ccc" />
                <Text style={styles.emptyText}>All available members are already in this team</Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
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
    marginVertical: 16,
    alignItems: "center",
    gap: 10,
  },
  errorText: {
    flex: 1,
    color: "#f44",
    fontSize: 14,
  },
  section: {
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#FF9800",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
    gap: 4,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  membersList: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  memberItem: {
    flexDirection: "row",
    padding: 14,
    alignItems: "center",
    justifyContent: "space-between",
  },
  memberItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 12,
    color: "#999",
  },
  emptyContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 40,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
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
    maxHeight: "90%",
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
    gap: 12,
  },
  listItemSelected: {
    backgroundColor: "#fff9e6",
  },
  checkbox: {
    width: 40,
    alignItems: "center",
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
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: "#f5f5f5",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#FF9800",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
