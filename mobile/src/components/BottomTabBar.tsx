import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const { bottom } = useSafeAreaInsets();
  const tabWidth = Dimensions.get("window").width / tabs.length;

  return (
    <View style={[styles.container, { paddingBottom: bottom + 8 }]}>
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
              ]}
            >
              <MaterialCommunityIcons
                name={tab.icon}
                size={24}
                color={isActive ? color : "#8e8e93"}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? color : "#8e8e93" },
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
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 8,
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
