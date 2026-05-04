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
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { teamAPI, authAPI } from "../../../_lib/services";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function AddMembersToTeamScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { teamId, teamName } = useLocalSearchParams();
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setFetchingData(true);
      const usersData = await authAPI.getAllUsers();
      const usersList = usersData.users || [];

      // Filter only members (role USER)
      const membersList = usersList.filter((u: Member) => u.role === "USER");
      setMembers(membersList);
    } catch (err: any) {
      setError(err?.message || "Failed to load members");
    } finally {
      setFetchingData(false);
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

      // Add each selected member to the team
      const promises = selectedMembers.map((memberId) =>
        teamAPI.addTeamMember(parseInt(teamId as string), memberId).catch((err) => {
          console.error(`Failed to add member ${memberId}:`, err);
          throw err;
        })
      );

      await Promise.all(promises);

      Alert.alert("Success", `${selectedMembers.length} member(s) added to team successfully!`, [
        {
          text: "OK",
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (err: any) {
      console.error("Error adding members:", err);
      setError(err?.message || "Failed to add members to team");
      setAdding(false);
    }
  };

  const handleSkip = () => {
    Alert.alert("Skip", "Add members to this team later?", [
      {
        text: "Cancel",
        onPress: () => {},
      },
      {
        text: "Yes, Skip",
        onPress: () => router.back(),
      },
    ]);
  };

  if (fetchingData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9800" />
          <Text style={styles.loadingText}>Loading members...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={{ backgroundColor: "#fff" }}>
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FF9800" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>Add Members to Team</Text>
            <Text style={styles.subtitle}>{teamName}</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {error && (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons name="alert-circle" size={20} color="#f44" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{members.length}</Text>
              <Text style={styles.statLabel}>Available Members</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{selectedMembers.length}</Text>
              <Text style={styles.statLabel}>Selected</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Members to Add</Text>
          {members.length > 0 ? (
            <View style={styles.membersList}>
              {members.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.memberItem,
                    selectedMembers.includes(member.id) && styles.memberItemSelected,
                  ]}
                  onPress={() => toggleMember(member.id)}
                >
                  <View style={styles.memberCheckbox}>
                    {selectedMembers.includes(member.id) ? (
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
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
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
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={adding}
        >
          <Text style={styles.skipButtonText}>Skip for Now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.addButton,
            (adding || selectedMembers.length === 0) && styles.addButtonDisabled,
          ]}
          onPress={handleAddMembers}
          disabled={adding || selectedMembers.length === 0}
        >
          {adding ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add Selected</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
    </SafeAreaView>
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
  subtitle: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
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
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  stat: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF9800",
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  membersList: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  memberItem: {
    flexDirection: "row",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
    gap: 12,
  },
  memberItemSelected: {
    backgroundColor: "#fff9e6",
  },
  memberCheckbox: {
    width: 40,
    alignItems: "center",
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
    fontSize: 16,
    color: "#999",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  skipButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  skipButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  addButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FF9800",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
