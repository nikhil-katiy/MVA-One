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

export default function ParentManagement({
  onBack,
}: Props) {
  const [form, setForm] = useState({
    parentId: '',
    parentName: '',
    relation: '',
    email: '',
    phone: '',
    alternatePhone: '',
    occupation: '',
    address: '',
    studentMvaId: '',
    studentName: '',
    emergencyContact: '',
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
      !form.parentName.trim() ||
      !form.relation.trim() ||
      !form.phone.trim() ||
      !form.studentMvaId.trim()
    ) {
      Alert.alert(
        'Required Fields',
        'Please enter parent name, relation, phone and student MVA ID.'
      );
      return;
    }

    console.log('PARENT FORM:', form);

    Alert.alert(
      'Parent',
      'Parent form is ready. Database save will be connected next.'
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
          Add Parent
        </Text>

        <Text style={styles.subtitle}>
          Manage parent and linked student information.
        </Text>

        <Section title="Parent Information">
          <Field
            label="Parent ID"
            value={form.parentId}
            onChange={(v) =>
              updateField('parentId', v)
            }
            placeholder="Enter parent ID"
          />

          <Field
            label="Parent Name *"
            value={form.parentName}
            onChange={(v) =>
              updateField('parentName', v)
            }
            placeholder="Enter parent name"
          />

          <Field
            label="Relation *"
            value={form.relation}
            onChange={(v) =>
              updateField('relation', v)
            }
            placeholder="Father / Mother / Guardian"
          />

          <Field
            label="Occupation"
            value={form.occupation}
            onChange={(v) =>
              updateField('occupation', v)
            }
            placeholder="Enter occupation"
          />
        </Section>

        <Section title="Contact Information">
          <Field
            label="Email"
            value={form.email}
            onChange={(v) =>
              updateField('email', v)
            }
            placeholder="parent@example.com"
            keyboardType="email-address"
          />

          <Field
            label="Phone *"
            value={form.phone}
            onChange={(v) =>
              updateField('phone', v)
            }
            placeholder="Primary phone number"
            keyboardType="phone-pad"
          />

          <Field
            label="Alternate Phone"
            value={form.alternatePhone}
            onChange={(v) =>
              updateField('alternatePhone', v)
            }
            placeholder="Alternate phone number"
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

        <Section title="Linked Student">
          <Field
            label="Student MVA ID *"
            value={form.studentMvaId}
            onChange={(v) =>
              updateField('studentMvaId', v)
            }
            placeholder="Enter student MVA ID"
          />

          <Field
            label="Student Name"
            value={form.studentName}
            onChange={(v) =>
              updateField('studentName', v)
            }
            placeholder="Student name"
          />
        </Section>

        <Section title="Other">
          <Field
            label="Emergency Contact"
            value={form.emergencyContact}
            onChange={(v) =>
              updateField(
                'emergencyContact',
                v
              )
            }
            placeholder="Emergency contact number"
            keyboardType="phone-pad"
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

        <Pressable
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>
            Save Parent
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