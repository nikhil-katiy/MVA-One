import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../../../lib/supabase';

type Props = {
  onBack: () => void;
};

type Option = {
  id: number;
  name: string;
};

type SectionOption = {
  id: number;
  class_id: number;
  name: string;
};

type DateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maximumDate?: Date;
};

type FormState = {
  staffCode: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  mobile: string;
  email: string;
  genderId: string;
  designation: string;
  department: string;
  staffType: string;
  joiningDate: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  academicYearId: string;
  classId: string;
  sectionId: string;
};

const INITIAL_FORM: FormState = {
  staffCode: '',
  firstName: '',
  middleName: '',
  lastName: '',
  dateOfBirth: '',
  mobile: '',
  email: '',
  genderId: '',
  designation: '',
  department: 'Academic',
  staffType: '',
  joiningDate: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  academicYearId: '',
  classId: '',
  sectionId: '',
};

export default function TeacherManagement({
  onBack,
}: Props) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  const [genders, setGenders] = useState<Option[]>([]);
  const [academicYears, setAcademicYears] = useState<Option[]>([]);
  const [classes, setClasses] = useState<Option[]>([]);
  const [sections, setSections] = useState<SectionOption[]>([]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);

  const updateField = (
    field: keyof FormState,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /*
   * Load Gender, Academic Year and Classes
   */
  useEffect(() => {
    loadInitialOptions();
  }, []);

  /*
   * Load sections whenever class changes
   */
  useEffect(() => {
    if (!form.classId) {
      setSections([]);
      updateField('sectionId', '');
      return;
    }

    loadSections(Number(form.classId));
  }, [form.classId]);

  const selectedClassName = useMemo(() => {
    const selected = classes.find(
      (item) => String(item.id) === form.classId,
    );

    return selected?.name ?? '';
  }, [classes, form.classId]);

  const loadInitialOptions = async () => {
    try {
      setLoadingOptions(true);

      const [
        gendersResult,
        academicYearsResult,
        classesResult,
      ] = await Promise.all([
        supabase
          .from('genders')
          .select('id, gender_name')
          .order('id'),

        /*
         * If your academic_years display column is different,
         * change academic_year below to that column.
         */
        supabase
          .from('academic_years')
          .select('id, year_name, is_current')
          .order('id', { ascending: false }),

        supabase
          .from('classes')
          .select('id, class_name')
          .order('id'),
      ]);

      if (gendersResult.error) {
        throw new Error(
          `Gender loading failed: ${gendersResult.error.message}`,
        );
      }

      if (academicYearsResult.error) {
        throw new Error(
          `Academic year loading failed: ${academicYearsResult.error.message}`,
        );
      }

      if (classesResult.error) {
        throw new Error(
          `Class loading failed: ${classesResult.error.message}`,
        );
      }

      setGenders(
        (gendersResult.data ?? []).map((item) => ({
          id: item.id,
          name: item.gender_name,
        })),
      );

      const academicYearOptions =
        (academicYearsResult.data ?? []).map((item) => ({
          id: item.id,
          name: String(item.year_name),
          isCurrent: item.is_current,
        }));

      setAcademicYears(academicYearOptions);

      const currentAcademicYear =
        academicYearOptions.find(
          (item) => item.isCurrent,
        );

      if (currentAcademicYear) {
        setForm((previous) => ({
          ...previous,
          academicYearId: String(
            currentAcademicYear.id,
          ),
        }));
      }

      setClasses(
        (classesResult.data ?? []).map((item) => ({
          id: item.id,
          name: item.class_name,
        })),
      );
    } catch (error: any) {
      console.error(
        'TEACHER INITIAL OPTIONS ERROR:',
        error,
      );

      Alert.alert(
        'Unable to Load',
        error?.message ||
          'Unable to load teacher form data.',
      );
    } finally {
      setLoadingOptions(false);
    }
  };

  const loadSections = async (classId: number) => {
    try {
      setLoadingSections(true);
      setSections([]);
      updateField('sectionId', '');

      const { data, error } = await supabase
        .from('sections')
        .select('id, class_id, section_name')
        .eq('class_id', classId)
        .order('id');

      if (error) {
        throw new Error(
          `Section loading failed: ${error.message}`,
        );
      }

      setSections(
        (data ?? []).map((item) => ({
          id: item.id,
          class_id: item.class_id,
          name: item.section_name,
        })),
      );
    } catch (error: any) {
      console.error(
        'TEACHER SECTION ERROR:',
        error,
      );

      Alert.alert(
        'Unable to Load Sections',
        error?.message ||
          'Unable to load sections.',
      );
    } finally {
      setLoadingSections(false);
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateMobile = (mobile: string) => {
    return /^[6-9]\d{9}$/.test(mobile);
  };

  const validatePincode = (pincode: string) => {
    return /^\d{6}$/.test(pincode);
  };

  const textOnly = (value: string) =>
    value.replace(/[^a-zA-Z\s]/g, '');

  const validateForm = () => {
    // Staff Code
    if (!form.staffCode.trim()) {
      Alert.alert(
        'Required Field',
        'Please enter Staff Code.',
      );
      return false;
    }

    // First Name
    if (!form.firstName.trim()) {
      Alert.alert(
        'Required Field',
        'Please enter First Name.',
      );
      return false;
    }

    // Email
    if (!form.email.trim()) {
      Alert.alert(
        'Required Field',
        'Please enter Email.',
      );
      return false;
    }

    if (!validateEmail(form.email.trim())) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email address.',
      );
      return false;
    }

    // Mobile
    if (!form.mobile.trim()) {
      Alert.alert(
        'Required Field',
        'Please enter Mobile.',
      );
      return false;
    }

    if (!validateMobile(form.mobile.trim())) {
      Alert.alert(
        'Invalid Mobile',
        'Please enter a valid 10-digit mobile number.',
      );
      return false;
    }

    // Gender
    if (!form.genderId) {
      Alert.alert(
        'Required Field',
        'Please select Gender.',
      );
      return false;
    }

    // Staff Type
    if (!form.staffType) {
      Alert.alert(
        'Required Field',
        'Please select Staff Type.',
      );
      return false;
    }

    // Designation
    if (!form.designation) {
      Alert.alert(
        'Required Field',
        'Please select Designation.',
      );
      return false;
    }

    // Pincode - optional
    if (
      form.pincode.trim() &&
      !validatePincode(form.pincode.trim())
    ) {
      Alert.alert(
        'Invalid Pincode',
        'Pincode must contain exactly 6 digits.',
      );
      return false;
    }

    // Class Teacher Assignment
    if (
      form.staffType === 'Teaching' &&
      form.designation === 'Class Teacher'
    ) {
      if (!form.academicYearId) {
        Alert.alert(
          'Required Field',
          'Please select Academic Year.',
        );
        return false;
      }

      if (!form.classId) {
        Alert.alert(
          'Required Field',
          'Please select Class.',
        );
        return false;
      }

      if (!form.sectionId) {
        Alert.alert(
          'Required Field',
          'Please select Section.',
        );
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      /*
       * ------------------------------------------------
       * STEP 1
       * Check duplicate Staff Code
       * ------------------------------------------------
       */
      const { data: existingStaffCode, error: codeError } =
        await supabase
          .from('staff')
          .select('id')
          .eq('staff_code', form.staffCode.trim())
          .maybeSingle();

      if (codeError) {
        throw new Error(
          `Staff code check failed: ${codeError.message}`,
        );
      }

      if (existingStaffCode) {
        Alert.alert(
          'Duplicate Staff Code',
          'This Staff Code already exists.',
        );
        return;
      }

      /*
       * ------------------------------------------------
       * STEP 2
       * Check duplicate email
       * ------------------------------------------------
       */
      const { data: existingEmail, error: emailError } =
        await supabase
          .from('staff')
          .select('id')
          .eq('email', form.email.trim())
          .maybeSingle();

      if (emailError) {
        throw new Error(
          `Email check failed: ${emailError.message}`,
        );
      }

      if (existingEmail) {
        Alert.alert(
          'Duplicate Email',
          'This email is already registered with a staff member.',
        );
        return;
      }

      /*
       * ------------------------------------------------
       * STEP 3
       * Insert staff
       * ------------------------------------------------
       */
      const { data: newStaff, error: staffError } =
        await supabase
          .from('staff')
          .insert({
            staff_code: form.staffCode.trim(),
            first_name: form.firstName.trim(),
            middle_name:
              form.middleName.trim() || null,
            last_name:
              form.lastName.trim() || null,

            date_of_birth:
              form.dateOfBirth.trim() || null,

            mobile: form.mobile.trim(),
            email: form.email.trim(),

            gender_id: Number(form.genderId),

            /*
             * Teacher-specific values
             */
            designation: form.designation,
            department:
              form.department.trim() || 'Academic',
            staff_type: form.staffType,

            joining_date:
              form.joiningDate.trim() || null,

            address:
              form.address.trim() || null,
            city:
              form.city.trim() || null,
            state:
              form.state.trim() || null,
            pincode:
              form.pincode.trim() || null,

            is_active: true,
          })
          .select('id, staff_code, first_name, last_name')
          .single();

      if (staffError) {
        throw new Error(
          `Teacher could not be created: ${staffError.message}`,
        );
      }

      if (!newStaff) {
        throw new Error(
          'Teacher was created but staff ID was not returned.',
        );
      }

      /*
      * ------------------------------------------------
      * STEP 4
      * Insert Class Teacher Assignment
      * ------------------------------------------------
      */

      if (
        form.staffType === 'Teaching' &&
        form.designation === 'Class Teacher'
      ) {
        const {
          data: assignment,
          error: assignmentError,
        } = await supabase
          .from('class_section_teachers')
          .insert({
            academic_year_id:
              Number(form.academicYearId),

            class_id:
              Number(form.classId),

            section_id:
              Number(form.sectionId),

            teacher_id: newStaff.id,
          })
          .select('id')
          .single();

        /*
        * ------------------------------------------------
        * ROLLBACK
        * ------------------------------------------------
        */

        if (assignmentError || !assignment) {
          console.error(
            'CLASS TEACHER ASSIGNMENT ERROR:',
            assignmentError,
          );

          await supabase
            .from('staff')
            .delete()
            .eq('id', newStaff.id);

          throw new Error(
            assignmentError?.message ||
              'Class Teacher assignment could not be created.',
          );
        }
      }

      /*
       * ------------------------------------------------
       * SUCCESS
       * ------------------------------------------------
       */
      const successMessage =
        form.staffType === 'Teaching' &&
        form.designation === 'Class Teacher'
          ? `${newStaff.first_name}${
              newStaff.last_name
                ? ` ${newStaff.last_name}`
                : ''
            } has been added successfully as Class Teacher for ${selectedClassName}.`
          : `${newStaff.first_name}${
              newStaff.last_name
                ? ` ${newStaff.last_name}`
                : ''
            } has been added successfully as ${form.designation}.`;

      Alert.alert(
        'Staff Added',
        successMessage,
        [
          {
            text: 'OK',
            onPress: () => {
              setForm(INITIAL_FORM);
              setSections([]);
            },
          },
        ],
      );
    } catch (error: any) {
      console.error(
        'ADD TEACHER ERROR:',
        error,
      );

      Alert.alert(
        'Unable to Add Teacher',
        error?.message ||
          'Something went wrong while adding teacher.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingOptions) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Loading teacher form...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Pressable
        style={styles.backButton}
        onPress={onBack}
        disabled={saving}
      >
        <Text style={styles.backText}>
          ← Back to Manage Users
        </Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.title}>
          Add Class Teacher
        </Text>

        <Text style={styles.subtitle}>
          Create a teaching staff record and assign the
          teacher to a class and section.
        </Text>

        {/* BASIC INFORMATION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Basic Information
          </Text>

          <Field
            label="Staff Code *"
            value={form.staffCode}
            onChange={(v) =>
              updateField('staffCode', v)
            }
            placeholder="STF-0006"
            autoCapitalize="characters"
          />

          <Field
            label="First Name *"
            value={form.firstName}
            onChange={(v) =>
              updateField('firstName', textOnly(v))
            }
            placeholder="Enter first name"
          />

          <Field
            label="Middle Name"
            value={form.middleName}
            onChange={(v) =>
              updateField('middleName', textOnly(v))
            }
            placeholder="Enter middle name"
          />

          <Field
            label="Last Name"
            value={form.lastName}
            onChange={(v) =>
              updateField('lastName', textOnly(v))
            }
            placeholder="Enter last name"
          />

          <View style={styles.field}>
            <Text style={styles.label}>
              Gender *
            </Text>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.genderId}
                onValueChange={(value) =>
                  updateField(
                    'genderId',
                    String(value),
                  )
                }
              >
                <Picker.Item
                  label="Select Gender"
                  value=""
                />

                {genders.map((gender) => (
                  <Picker.Item
                    key={gender.id}
                    label={gender.name}
                    value={String(gender.id)}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <DateField
            label="Date of Birth"
            value={form.dateOfBirth}
            onChange={(value) =>
              updateField('dateOfBirth', value)
            }
            maximumDate={new Date()}
          />
        </View>

        {/* CONTACT */}
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
            autoCapitalize="none"
          />

          <Field
            label="Mobile *"
            value={form.mobile}
            onChange={(v) => {
              const digitsOnly = v.replace(/\D/g, '');

              if (digitsOnly.length <= 10) {
                updateField('mobile', digitsOnly);
              }
            }}
            placeholder="Enter 10-digit mobile number"
            keyboardType="number-pad"
          />
        </View>

        {/* PROFESSIONAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Professional Information
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>
              Staff Type *
            </Text>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.staffType}
                onValueChange={(value) =>
                  updateField('staffType', String(value))
                }
              >
                <Picker.Item
                  label="Select Staff Type"
                  value=""
                />

                <Picker.Item
                  label="Teaching"
                  value="Teaching"
                />

                <Picker.Item
                  label="Non-Teaching"
                  value="Non-Teaching"
                />

                <Picker.Item
                  label="Administrative"
                  value="Administrative"
                />
              </Picker>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Designation *
            </Text>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.designation}
                onValueChange={(value) =>
                  updateField(
                    'designation',
                    String(value),
                  )
                }
              >
                <Picker.Item
                  label="Select Designation"
                  value=""
                />

                <Picker.Item
                  label="Teacher"
                  value="Teacher"
                />

                <Picker.Item
                  label="Class Teacher"
                  value="Class Teacher"
                />

                <Picker.Item
                  label="Sport Teacher"
                  value="Sport Teacher"
                />

                <Picker.Item
                  label="Principal"
                  value="Principal"
                />
              </Picker>
            </View>
          </View>

          <Field
            label="Department"
            value={form.department}
            onChange={(v) =>
              updateField('department', v)
            }
            placeholder="Academic"
          />

          <DateField
            label="Joining Date"
            value={form.joiningDate}
            onChange={(value) =>
              updateField('joiningDate', value)
            }
            maximumDate={new Date()}
          />
        </View>

        {/* ADDRESS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Address
          </Text>

          <Field
            label="Address"
            value={form.address}
            onChange={(v) =>
              updateField('address', v)
            }
            placeholder="Enter address"
          />

          <Field
            label="City"
            value={form.city}
            onChange={(v) =>
              updateField('city', v)
            }
            placeholder="Enter city"
          />

          <Field
            label="State"
            value={form.state}
            onChange={(v) =>
              updateField('state', v)
            }
            placeholder="Enter state"
          />

          <Field
            label="Pincode"
            value={form.pincode}
            onChange={(v) => {
              const digitsOnly = v.replace(/\D/g, '');

              if (digitsOnly.length <= 6) {
                updateField('pincode', digitsOnly);
              }
            }}
            placeholder="Enter 6-digit pincode"
            keyboardType="number-pad"
          />
        </View>

        {/* CLASS ASSIGNMENT */}
        {/* CLASS TEACHER ASSIGNMENT */}
        {form.staffType === 'Teaching' &&
         form.designation === 'Class Teacher' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Class Teacher Assignment
            </Text>

          <View style={styles.field}>
            <Text style={styles.label}>
              Academic Year *
            </Text>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.academicYearId}
                onValueChange={(value) =>
                  updateField(
                    'academicYearId',
                    String(value),
                  )
                }
              >
                <Picker.Item
                  label="Select Academic Year"
                  value=""
                />

                {academicYears.map((year) => (
                  <Picker.Item
                    key={year.id}
                    label={year.name}
                    value={String(year.id)}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Class *
            </Text>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.classId}
                onValueChange={(value) =>
                  updateField(
                    'classId',
                    String(value),
                  )
                }
              >
                <Picker.Item
                  label="Select Class"
                  value=""
                />

                {classes.map((item) => (
                  <Picker.Item
                    key={item.id}
                    label={item.name}
                    value={String(item.id)}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Section *
            </Text>

            <View
              style={[
                styles.pickerContainer,
                !form.classId && styles.disabledPicker,
              ]}
            >
              <Picker
                selectedValue={form.sectionId}
                enabled={Boolean(form.classId) && !loadingSections}
                onValueChange={(value) =>
                  updateField(
                    'sectionId',
                    String(value),
                  )
                }
              >
                <Picker.Item
                  label={
                    loadingSections
                      ? 'Loading sections...'
                      : form.classId
                        ? 'Select Section'
                        : 'Select Class First'
                  }
                  value=""
                />

                {sections.map((section) => (
                  <Picker.Item
                    key={section.id}
                    label={section.name}
                    value={String(section.id)}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {form.classId &&
            !loadingSections &&
            sections.length === 0 ? (
            <Text style={styles.warningText}>
              No sections are available for {selectedClassName}.
            </Text>
          ) : null}
        </View>
        )}
        {/* STATUS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Account Status
          </Text>

          <View style={styles.readOnlyBox}>
            <Text style={styles.readOnlyText}>
              Active
            </Text>
          </View>

          <Text style={styles.helperText}>
            Teacher login account will be created in the
            next step.
          </Text>
        </View>

        {/* SAVE */}
        <Pressable
          style={[
            styles.saveButton,
            saving && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveText}>
              Save Teacher
            </Text>
          )}
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
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
  autoCapitalize,
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
        autoCapitalize={autoCapitalize}
        style={styles.input}
      />
    </View>
  );
}

function DateField({
  label,
  value,
  onChange,
  maximumDate,
}: DateFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  const selectedDate = value
    ? new Date(`${value}T00:00:00`)
    : new Date();

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // =========================
  // WEB DATE PICKER
  // =========================
  if (Platform.OS === 'web') {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>

        <input
          type="date"
          value={value || ''}
          max={maximumDate ? formatDate(maximumDate) : undefined}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            height: 44,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: '#D1D5DB',
            borderRadius: 8,
            paddingLeft: 12,
            paddingRight: 12,
            fontSize: 15,
            backgroundColor: '#FFFFFF',
            boxSizing: 'border-box',
          }}
        />
      </View>
    );
  }

  // =========================
  // ANDROID / iOS / iPAD
  // =========================
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        style={styles.dateInput}
        onPress={() => setShowPicker(true)}
      >
        <Text
          style={[
            styles.dateText,
            !value && styles.datePlaceholder,
          ]}
        >
          {value || 'Select date'}
        </Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          maximumDate={maximumDate}
          onChange={(event, date) => {
            if (Platform.OS === 'android') {
              setShowPicker(false);
            }

            if (date) {
              onChange(formatDate(date));
            }

            if (Platform.OS === 'ios') {
              setShowPicker(false);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    minHeight: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#6B7280',
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
    lineHeight: 19,
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

  pickerContainer: {
    minHeight: 48,
    justifyContent: 'center',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },

  disabledPicker: {
    opacity: 0.55,
  },

  readOnlyBox: {
    minHeight: 48,
    paddingHorizontal: 13,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
  },

  readOnlyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },

  warningText: {
    marginTop: -4,
    marginBottom: 10,
    fontSize: 12,
    color: '#B45309',
  },

  helperText: {
    marginTop: 7,
    fontSize: 11,
    lineHeight: 16,
    color: '#6B7280',
  },

  saveButton: {
    marginTop: 24,
    minHeight: 50,
    borderRadius: 9,
    backgroundColor: '#1C3358',
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    opacity: 0.7,
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  dateInput: {
    minHeight: 48,
    paddingHorizontal: 13,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
  },

  dateText: {
    fontSize: 13,
    color: '#111827',
  },

  datePlaceholder: {
    color: '#9CA3AF',
  },


});