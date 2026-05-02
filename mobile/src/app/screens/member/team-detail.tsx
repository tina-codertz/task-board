import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { teamAPI } from "../../../_lib/services";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Member {
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface Team {
  id: number;
  name: string;
  description?: string;
  members: Member[];
  owner: {
    name: string;
    email: string;
  };
}

export default function TeamDetailScreen() {
  const router = useRouter();
  const { teamId, teamName } = useLocalSearchParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamDetails();
  }, []);

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      const teamData = await teamAPI.getTeamById(parseInt(teamId as string));
      setTeam(teamData);
    } catch (err: any) {
      setError(err?.message || "Failed to load team details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Team Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.teamIcon}>
            <MaterialCommunityIcons name="account-multiple" size={32} color="#4CAF50" />
          </View>
          <Text style={styles.teamNameLarge}>{team.name}</Text>
          {team.description && (
            <Text style={styles.teamDescription}>{team.description}</Text>
          )}
          <View style={styles.ownerInfo}>
            <MaterialCommunityIcons name="crown" size={16} color="#FF9800" />
            <Text style={styles.ownerText}>Team Lead: {team.owner.name}</Text>
          </View>
        </View>

        {/* Members Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Team Members ({team.members?.length || 0})</Text>
          </View>

          {team.members && team.members.length > 0 ? (
            <View style={styles.membersList}>
              {team.members.map((member, index) => (
                <View
                  key={member.user.id}
                  style={[
                    styles.memberCard,
                    index !== team.members.length - 1 && styles.memberCardBorder,
                  ]}
                >
                  <View style={styles.memberAvatar}>
                    <MaterialCommunityIcons name="account" size={24} color="#4CAF50" />
                  </View>
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
              <Text style={styles.emptyText}>No members in this team</Text>
            </View>
          )}
        </View>

        {/* Team Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="account-multiple" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{team.members?.length || 0}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="calendar" size={24} color="#2196F3" />
            <Text style={styles.statValue}>-</Text>
            <Text style={styles.statLabel}>Created</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#f44",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  teamIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e8f5e9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  teamNameLarge: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  teamDescription: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 18,
  },
  ownerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff9e6",
    borderRadius: 8,
  },
  ownerText: {
    fontSize: 12,
    color: "#FF9800",
    fontWeight: "600",
  },
  section: {
    marginBottom: 20,
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
  membersList: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  memberCard: {
    flexDirection: "row",
    padding: 14,
    alignItems: "center",
    gap: 12,
  },
  memberCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e8f5e9",
    alignItems: "center",
    justifyContent: "center",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 11,
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
  statsSection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
  },
});
