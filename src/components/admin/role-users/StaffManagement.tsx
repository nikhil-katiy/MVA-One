import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

type Props = {
  onBack: () => void;
};

export default function StaffManagement({
  onBack,
}: Props) {
  const [form, setForm] = useState({
    staffId: '',
    name: '',
    designation: '',
    department: '',
    email: '',
    phone: '',
    joiningDate: '',
    shift: '',
    employmentType: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    status: 'ACTIVE',
  });

  const updateField = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (
      !form.name.trim() ||
      !form.designation.trim() ||
      !form.phone.trim()
    ) {
      Alert.alert(
        'Required Fields',
        'Please enter staff name, designation and phone.'
      );
      return;
    }

    console.log('STAFF FORM:', form);

    Alert.alert(
      'Staff',
      'Staff form is ready. Database save will be connected next.'
    );
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Pressable
        style={styles.backButton}
        onPress={onBack}
      >
        <Text style={styles.backText}>
          ← Back to Manage Users
        </Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.title}>
          Add Staff
        </Text>

        <Text style={styles.subtitle}>
          Manage non-teaching staff information.
        </Text>

        <Section title="Staff Information">
          <Field
            label="Staff ID"
            value={form.staffId}
            onChange={(v) =>
              updateField('staffId', v)
            }
            placeholder="Enter staff ID"
          />

          <Field
            label="Full Name *"
            value={form.name}
            onChange={(v) =>
              updateField('name', v)
            }
            placeholder="Enter full name"
          />

          <Field
            label="Designation *"
            value={form.designation}
            onChange={(v) =>
              updateField('designation', v)
            }
            placeholder="Accountant / Clerk / Security etc."
          />

          <Field
            label="Department"
            value={form.department}
            onChange={(v) =>
              updateField('department', v)
            }
            placeholder="Administration / Finance etc."
          />

          <Field
            label="Joining Date"
            value={form.joiningDate}
            onChange={(v) =>
              updateField('joiningDate', v)
            }
            placeholder="YYYY-MM-DD"
          />

          <Field
            label="Employment Type"
            value={form.employmentType}
            onChange={(v) =>
              updateField('employmentType', v)
            }
            placeholder="Permanent / Contract"
          />

          <Field
            label="Shift"
            value={form.shift}
            onChange={(v) =>
              updateField('shift', v)
            }
            placeholder="Morning / General / Evening"
          />

          <Field
            label="Status"
            value={form.status}
            onChange={(v) =>
              updateField('status', v)
            }
            placeholder="ACTIVE"
          />
        </Section>

        <Section title="Contact Information">
          <Field
            label="Email"
            value={form.email}
            onChange={(v) =>
              updateField('email', v)
            }
            placeholder="staff@example.com"
            keyboardType="email-address"
          />

          <Field
            label="Phone *"
            value={form.phone}
            onChange={(v) =>
              updateField('phone', v)
            }
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />

          <Field
            label="Address"
            value={form.address}
            onChange={(v) =>
              updateField('address', v)
            }
            placeholder="Enter address"
            multiline
          />
        </Section>

        <Section title="Emergency Contact">
          <Field
            label="Contact Name"
            value={form.emergencyContactName}
            onChange={(v) =>
              updateField(
                'emergencyContactName',
                v
              )
            }
            placeholder="Emergency contact name"
          />

          <Field
            label="Contact Phone"
            value={form.emergencyContactPhone}
            onChange={(v) =>
              updateField(
                'emergencyContactPhone',
                v
              )
            }
            placeholder="Emergency contact number"
            keyboardType="phone-pad"
          />
        </Section>

        <Pressable
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>
            Save Staff
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      {children}
    </View>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  keyboardType?: TextInputProps['keyboardType'];
  multiline?: boolean;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
  multiline = false,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={
          multiline ? 'top' : 'center'
        }
        style={[
          styles.input,
          multiline && styles.multilineInput,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },

  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 14,
  },

  backText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '800',
  },

  card: {
    padding: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  title: {
    fontSize: 23,
    fontWeight: '900',
    color: '#1C3358',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#6B7280',
  },

  section: {
    marginTop: 24,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  sectionTitle: {
    marginBottom: 14,
    fontSize: 14,
    fontWeight: '900',
    color: '#1C3358',
  },

  field: {
    marginBottom: 14,
  },

  label: {
    marginBottom: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },

  input: {
    minHeight: 48,
    paddingHorizontal: 13,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    fontSize: 13,
    color: '#111827',
  },

  multilineInput: {
    minHeight: 90,
    paddingTop: 12,
  },

  saveButton: {
    marginTop: 24,
    minHeight: 50,
    borderRadius: 9,
    backgroundColor: '#1C3358',
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});