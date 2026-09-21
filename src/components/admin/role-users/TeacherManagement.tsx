import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Props = {
  onBack: () => void;
};

export default function TeacherManagement({
  onBack,
}: Props) {
  const [form, setForm] = useState({
    employeeId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    qualification: '',
    subject: '',
    department: '',
    assignedClass: '',
    joiningDate: '',
    employmentType: '',
    role: 'TEACHER',
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
      !form.firstName.trim() ||
      !form.email.trim() ||
      !form.phone.trim()
    ) {
      Alert.alert(
        'Required Fields',
        'Please enter teacher name, email and phone.'
      );
      return;
    }

    console.log('TEACHER FORM:', form);

    Alert.alert(
      'Teacher',
      'Teacher form is ready. Database save will be connected next.'
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
          Add Teacher
        </Text>

        <Text style={styles.subtitle}>
          Create and manage teacher information.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Basic Information
          </Text>

          <Field
            label="Employee ID"
            value={form.employeeId}
            onChange={(v) =>
              updateField('employeeId', v)
            }
            placeholder="Enter employee ID"
          />

          <Field
            label="First Name *"
            value={form.firstName}
            onChange={(v) =>
              updateField('firstName', v)
            }
            placeholder="Enter first name"
          />

          <Field
            label="Middle Name"
            value={form.middleName}
            onChange={(v) =>
              updateField('middleName', v)
            }
            placeholder="Enter middle name"
          />

          <Field
            label="Last Name"
            value={form.lastName}
            onChange={(v) =>
              updateField('lastName', v)
            }
            placeholder="Enter last name"
          />

          <Field
            label="Gender"
            value={form.gender}
            onChange={(v) =>
              updateField('gender', v)
            }
            placeholder="Male / Female / Other"
          />

          <Field
            label="Date of Birth"
            value={form.dateOfBirth}
            onChange={(v) =>
              updateField('dateOfBirth', v)
            }
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Contact Information
          </Text>

          <Field
            label="Email *"
            value={form.email}
            onChange={(v) =>
              updateField('email', v)
            }
            placeholder="teacher@example.com"
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Academic Information
          </Text>

          <Field
            label="Qualification"
            value={form.qualification}
            onChange={(v) =>
              updateField('qualification', v)
            }
            placeholder="B.Ed / M.Ed / M.Sc etc."
          />

          <Field
            label="Subject"
            value={form.subject}
            onChange={(v) =>
              updateField('subject', v)
            }
            placeholder="Mathematics / English etc."
          />

          <Field
            label="Department"
            value={form.department}
            onChange={(v) =>
              updateField('department', v)
            }
            placeholder="Enter department"
          />

          <Field
            label="Assigned Class"
            value={form.assignedClass}
            onChange={(v) =>
              updateField('assignedClass', v)
            }
            placeholder="Class 5 / Class 10 etc."
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
            label="Role"
            value={form.role}
            onChange={(v) =>
              updateField('role', v)
            }
            placeholder="TEACHER"
          />
        </View>

        <Pressable
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>
            Save Teacher
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  keyboardType?: any;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
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
        style={styles.input}
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
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
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