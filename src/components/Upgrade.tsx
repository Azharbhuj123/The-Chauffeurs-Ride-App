// @ts-nocheck

import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
} from "react-native";
import { COLORS } from "../utils/Enums";

const { width } = Dimensions.get("window");

const UpgradeModal = ({
  visible,
  onClose,
  onConfirm,
  fromClass = "Economy",
  toClass = "Business",
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      {/* BACKDROP */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* MODAL CARD */}
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.title}>🎉 Upgrade Available!</Text>

          <Text style={styles.text}>
            You can ride in{" "}
            <Text style={styles.highlight}>{toClass}</Text> while paying the{" "}
            <Text style={styles.highlight}>{fromClass}</Text> fare.
          </Text>

          <View style={styles.btnRow}>
            <TouchableOpacity  style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
              <Text style={styles.confirmText}>Use Upgrade</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default UpgradeModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  modalView: {
    width: width * 0.85,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 18,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
    color: "#111",
    fontFamily:"Poppins-Regular"
  },
  text: {
    fontSize: 15,
    textAlign: "center",
    color: "#444",
    lineHeight: 22,
    marginBottom: 18,
    fontFamily:"Poppins-Regular"

  },
  highlight: {
    fontWeight: "700",
    color: COLORS.success,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#bbb",
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.warning,
  },
  cancelText: {
    textAlign: "center",
    fontWeight: "600",
    fontFamily:"Poppins-Regular",

    color: "#000",
  },
  confirmText: {
    textAlign: "center",
    fontWeight: "700",
        color: "#000",
    fontFamily:"Poppins-Regular"


  },
});
