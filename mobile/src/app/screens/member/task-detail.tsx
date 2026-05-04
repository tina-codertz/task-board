import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../../_context/AuthContext";
import { taskAPI } from "../../../_lib/services";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Comment {
  id: number;
  content: string;
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdBy: {
    name: string;
    email: string;
  };
}

export default function TaskDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { taskId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState("");

  useEffect(() => {
    fetchTaskAndComments();
  }, []);

  const fetchTaskAndComments = async () => {
    try {
      setLoading(true);
      const [taskData, commentsData] = await Promise.all([
        taskAPI.getTaskById(parseInt(taskId as string)),
        taskAPI.getTaskComments(parseInt(taskId as string)),
      ]);

      setTask(taskData);
      setCurrentStatus(taskData.status);
      setComments(commentsData.comments || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load task details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert("Error", "Please enter a comment");
      return;
    }

    try {
      setPosting(true);
      const result = await taskAPI.addComment(parseInt(taskId as string), newComment.trim());
      setComments([...comments, result]);
      setNewComment("");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to add comment");
    } finally {
      setPosting(false);
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editText.trim()) {
      Alert.alert("Error", "Please enter comment text");
      return;
    }

    try {
      setPosting(true);
      const result = await taskAPI.updateComment(commentId, editText.trim());
      setComments(
        comments.map((c) => (c.id === commentId ? { ...c, content: result.content } : c))
      );
      setEditingId(null);
      setEditText("");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to update comment");
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = (commentId: number) => {
    Alert.alert("Delete Comment", "Are you sure you want to delete this comment?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await taskAPI.deleteComment(commentId);
            setComments(comments.filter((c) => c.id !== commentId));
          } catch (err: any) {
            Alert.alert("Error", err?.message || "Failed to delete comment");
          }
        },
      },
    ]);
  };

  const handleUpdateStatus = async () => {
    if (currentStatus === "DONE") {
      Alert.alert("Already Completed", "This task is already marked as done");
      return;
    }

    const nextStatus = currentStatus === "TODO" ? "IN_PROGRESS" : "DONE";

    try {
      setUpdating(true);
      await taskAPI.updateTaskStatus(parseInt(taskId as string), nextStatus);
      setCurrentStatus(nextStatus);
      const message = nextStatus === "DONE" ? "Task marked as completed!" : "Task status updated!";
      Alert.alert("Success", message);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to update task status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading task...</Text>
        </View>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={40} color="#f44" />
          <Text style={styles.errorText}>Task not found</Text>
        </View>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "#9C27B0";
      case "IN_PROGRESS":
        return "#FF9800";
      case "DONE":
        return "#4CAF50";
      default:
        return "#666";
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Info */}
        <View style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <View
              style={[styles.statusBadge, { backgroundColor: getStatusColor(currentStatus) + "20" }]}
            >
              <Text style={[styles.statusText, { color: getStatusColor(currentStatus) }]}>
                {currentStatus}
              </Text>
            </View>
          </View>

          {task.description && (
            <Text style={styles.taskDescription}>{task.description}</Text>
          )}

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account" size={16} color="#666" />
              <Text style={styles.infoText}>Created by: {task.createdBy.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="flag" size={16} color="#666" />
              <Text style={styles.infoText}>Priority: {task.priority}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleUpdateStatus}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name={currentStatus === "DONE" ? "restart" : "check"}
                  size={16}
                  color="#fff"
                />
                <Text style={styles.completeButtonText}>
                  {currentStatus === "DONE" ? "Task Completed" : "Mark Complete"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>

          {comments.length > 0 ? (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentUserInfo}>
                    <Text style={styles.commentAuthor}>{comment.user.name}</Text>
                    <Text style={styles.commentDate}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  {comment.userId.toString() === user?.id?.toString() && (
                    <View style={styles.commentActions}>
                      <TouchableOpacity
                        onPress={() => {
                          setEditingId(comment.id);
                          setEditText(comment.content);
                        }}
                      >
                        <MaterialCommunityIcons name="pencil" size={18} color="#FF9800" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteComment(comment.id)}
                        style={{ marginLeft: 12 }}
                      >
                        <MaterialCommunityIcons name="trash-can" size={18} color="#f44" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {editingId === comment.id ? (
                  <View style={styles.editContainer}>
                    <TextInput
                      style={styles.editInput}
                      multiline
                      value={editText}
                      onChangeText={setEditText}
                      placeholder="Edit your comment..."
                    />
                    <View style={styles.editActions}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => {
                          setEditingId(null);
                          setEditText("");
                        }}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() => handleEditComment(comment.id)}
                        disabled={posting}
                      >
                        {posting ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={styles.saveButtonText}>Save</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.commentText}>{comment.content}</Text>
                )}
              </View>
            ))
          ) : (
            <View style={styles.noCommentsContainer}>
              <MaterialCommunityIcons name="comment-outline" size={40} color="#ccc" />
              <Text style={styles.noCommentsText}>No comments yet</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Comment Input */}
      <View style={[styles.inputSection, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            multiline
            value={newComment}
            onChangeText={setNewComment}
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
            onPress={handleAddComment}
            disabled={posting || !newComment.trim()}
          >
            {posting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <MaterialCommunityIcons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: 12,
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
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  taskDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  infoSection: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#666",
  },
  completeButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  commentsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  commentCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#4CAF50",
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  commentUserInfo: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
  },
  commentDate: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
  commentActions: {
    flexDirection: "row",
    gap: 8,
  },
  commentText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
  },
  editContainer: {
    gap: 8,
  },
  editInput: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    fontSize: 13,
    color: "#000",
    maxHeight: 120,
  },
  editActions: {
    flexDirection: "row",
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  noCommentsContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 32,
    alignItems: "center",
    gap: 8,
  },
  noCommentsText: {
    fontSize: 14,
    color: "#999",
  },
  inputSection: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: "#000",
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
