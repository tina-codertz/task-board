import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface BottomTab {
  id: string;
  label: string;
  icon: string;
}

interface BottomTabBarProps {
  tabs: BottomTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  color?: string;
}

export default function BottomTabBar({
  tabs,
  activeTab,
  onTabChange,
  color = "#007AFF",
}: BottomTabBarProps) {
  const tabWidth = Dimensions.get("window").width / tabs.length;

  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, { width: tabWidth }]}
            onPress={() => onTabChange(tab.id)}
          >
            <View
              style={[
                styles.tabContent,
                isActive && { backgroundColor: "rgba(255, 255, 255, 0.2)" },
              ]}
            >
              <MaterialCommunityIcons
                name={tab.icon}
                size={24}
                color="#fff"
              />
              <Text
                style={[
                  styles.tabLabel,
                  !isActive && styles.tabLabelInactive,
                ]}
              >
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabLabel: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
  tabLabelInactive: {
    fontWeight: "500",
  },
});
