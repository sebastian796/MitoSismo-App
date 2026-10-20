import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { COUNTRIES } from "../../constants/countries";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CountryPicker({ label, value, onChange, open, onOpenChange }: Props) {
  const selected = COUNTRIES.find((country) => country.value === value);
  return (
    <View
      style={styles.container}
      // El formulario cierra el menú con pulsaciones exteriores. Las interiores
      // siguen llegando a las opciones y al scroll, sin cerrar antes de seleccionar.
      onTouchStart={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[styles.field, open && styles.fieldOpen]}
        accessibilityRole="button"
        accessibilityLabel={label + ": " + (selected?.label ?? "Selecciona tu país")}
        accessibilityState={{ expanded: open }}
        onPress={() => onOpenChange(!open)}
      >
        <Text style={styles.fieldText}>{selected?.label ?? "Selecciona tu país"}</Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color={Colors.textSecondary} />
      </Pressable>
      {open && (
        // En el flujo del formulario: desplaza el siguiente campo en vez de
        // superponerlo. Así no depende de zIndex ni queda detrás de otros inputs.
        <ScrollView
          style={styles.menu}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
          accessibilityLabel="Países disponibles"
        >
          {COUNTRIES.map((country) => {
            const isSelected = country.value === value;
            return (
              <Pressable
                key={country.value}
                style={[styles.option, isSelected && styles.selectedOption]}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  onChange(country.value);
                  onOpenChange(false);
                }}
              >
                <Text style={[styles.optionText, isSelected && styles.optionSelected]}>{country.label}</Text>
                {isSelected && <Ionicons name="checkmark" size={18} color={Colors.accent} />}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  label: { ...Typography.bodyMedium, fontWeight: "600", color: Colors.textPrimary, marginBottom: 6 },
  field: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radii.md,
    backgroundColor: Colors.surface, paddingHorizontal: Spacing.md, paddingVertical: 14,
  },
  fieldOpen: { borderColor: Colors.accent },
  fieldText: { ...Typography.bodyLarge },
  menu: {
    maxHeight: 220, marginTop: 6, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radii.md, backgroundColor: Colors.surface,
  },
  option: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
  },
  optionText: { ...Typography.bodyLarge },
  selectedOption: { backgroundColor: Colors.surfaceAlt },
  optionSelected: { color: Colors.accent, fontWeight: "700" },
});
