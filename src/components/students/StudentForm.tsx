import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {supabase} from '../../lib/supabase';

type StudentFormProps = {
  onBack: () => void;
  onSuccess: () => void;
};

const StudentForm = ({
  onBack,
  onSuccess,
}: StudentFormProps) => {
  // ================= STUDENT =================

  const [mvaid, setMvaid] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');

  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');

  const [dateOfAdmission, setDateOfAdmission] =
    useState('');

  const [joiningAcademicYear, setJoiningAcademicYear] =
    useState('');

  const [academicYear, setAcademicYear] =
    useState('');

  const [joiningClass, setJoiningClass] =
    useState('');

  const [section, setSection] = useState('');

  const [studentType, setStudentType] = useState('');

  const [studentAddress, setStudentAddress] =
    useState('');

  const [pincode, setPincode] = useState('');

  const [aadhaarNumber, setAadhaarNumber] =
    useState('');

  const [previousSchool, setPreviousSchool] =
    useState('');

  const [nationality, setNationality] =
    useState('Indian');

  const [staffChild, setStaffChild] =
    useState(false);

  const [casteCategory, setCasteCategory] =
    useState('');

  const [caste, setCaste] = useState('');

  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');

  // ================= FAMILY =================

  const [familyName, setFamilyName] = useState('');

  const [fatherName, setFatherName] =
    useState('');

  const [fatherMobile, setFatherMobile] =
    useState('');

  const [fatherOccupation, setFatherOccupation] =
    useState('');

  const [motherName, setMotherName] =
    useState('');

  const [motherMobile, setMotherMobile] =
    useState('');

  const [motherOccupation, setMotherOccupation] =
    useState('');

  const [guardianName, setGuardianName] =
    useState('');

  const [guardianMobile, setGuardianMobile] =
    useState('');

  const [guardianRelation, setGuardianRelation] =
    useState('');

  const [familyEmail, setFamilyEmail] =
    useState('');

  const [familyAddress, setFamilyAddress] =
    useState('');

  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [familyPincode, setFamilyPincode] =
    useState('');

  const [saving, setSaving] = useState(false);

  // ================= HELPERS =================

  const clean = (value: string) => {
    const trimmed = value.trim();

    return trimmed === '' ? null : trimmed;
  };

  const validateForm = () => {
    if (!mvaid.trim()) {
      Alert.alert('Validation', 'MVAID is required.');
      return false;
    }

    if (!firstName.trim()) {
      Alert.alert(
        'Validation',
        'First name is required.',
      );
      return false;
    }

    if (!studentType.trim()) {
      Alert.alert(
        'Validation',
        'Student type is required.',
      );
      return false;
    }

    return true;
  };

  // ================= CREATE =================

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      console.log('================================');
      console.log('ADD STUDENT: STARTED');
      console.log('================================');

      let familyId: number | null = null;

      // ==========================================
      // STEP 1: CREATE FAMILY
      // ==========================================

      const hasFamilyData =
        familyName.trim() ||
        fatherName.trim() ||
        fatherMobile.trim() ||
        motherName.trim() ||
        motherMobile.trim() ||
        guardianName.trim() ||
        guardianMobile.trim() ||
        familyEmail.trim() ||
        familyAddress.trim() ||
        city.trim() ||
        state.trim() ||
        familyPincode.trim();

      if (hasFamilyData) {
        console.log('ADD STUDENT: Creating family...');

        const {data: familyData, error: familyError} =
          await supabase
            .from('families')
            .insert({
              family_name: clean(familyName),

              father_name: clean(fatherName),
              father_mobile: clean(fatherMobile),
              father_occupation:
                clean(fatherOccupation),

              mother_name: clean(motherName),
              mother_mobile: clean(motherMobile),
              mother_occupation:
                clean(motherOccupation),

              guardian_name: clean(guardianName),
              guardian_mobile:
                clean(guardianMobile),
              guardian_relation:
                clean(guardianRelation),

              email:
                clean(familyEmail) ||
                clean(email),

              address:
                clean(familyAddress) ||
                clean(studentAddress),

              city: clean(city),
              state: clean(state),

              pincode:
                clean(familyPincode) ||
                clean(pincode),
            })
            .select('id')
            .single();

        if (familyError) {
          console.log(
            'ADD STUDENT: FAMILY ERROR',
            familyError,
          );

          Alert.alert(
            'Family Creation Failed',
            familyError.message,
          );

          return;
        }

        familyId = familyData.id;

        console.log(
          'ADD STUDENT: FAMILY CREATED',
          familyId,
        );
      }

      // ==========================================
      // STEP 2: CREATE STUDENT
      // ==========================================

      console.log('ADD STUDENT: Creating student...');

      const {data: studentData, error: studentError} =
        await supabase
          .from('students')
          .insert({
            mvaid: mvaid.trim(),

            first_name: firstName.trim(),
            middle_name: clean(middleName),
            last_name: clean(lastName),

            date_of_birth: clean(dateOfBirth),

            section: clean(section),
            gender: clean(gender),

            date_of_admission:
              clean(dateOfAdmission),

            joining_academic_year:
              clean(joiningAcademicYear),

            academic_year:
              clean(academicYear),

            joining_class:
              clean(joiningClass),

            class_residential_address:
              clean(studentAddress),

            pincode: clean(pincode),

            aadhaar_number:
              clean(aadhaarNumber),

            student_type:
              studentType.trim(),

            previous_school:
              clean(previousSchool),

            nationality:
              clean(nationality),

            staff_child: staffChild,

            caste_category:
              clean(casteCategory),

            caste: clean(caste),

            email: clean(email),
            mobile: clean(mobile),

            family_id: familyId,
          })
          .select('id, mvaid')
          .single();

      if (studentError) {
        console.log(
          'ADD STUDENT: STUDENT ERROR',
          studentError,
        );

        // If family was created but student failed,
        // remove the newly-created family.
        if (familyId !== null) {
          await supabase
            .from('families')
            .delete()
            .eq('id', familyId);
        }

        Alert.alert(
          'Student Creation Failed',
          studentError.message,
        );

        return;
      }

      console.log(
        'ADD STUDENT: STUDENT CREATED',
        studentData,
      );

      Alert.alert(
        'Success',
        `Student ${studentData.mvaid} added successfully.`,
        [
          {
            text: 'OK',
            onPress: onSuccess,
          },
        ],
      );
    } catch (error) {
      console.log(
        'ADD STUDENT: EXCEPTION',
        error,
      );

      Alert.alert(
        'Error',
        'Something went wrong while adding the student.',
      );
    } finally {
      setSaving(false);
    }
  };

  // ================= UI =================

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}>
          <Text style={styles.backButtonText}>
            ←
          </Text>
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Add Student
          </Text>

          <Text style={styles.headerSubtitle}>
            Register a new student
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* ================= STUDENT INFORMATION ================= */}

        <Text style={styles.sectionTitle}>
          Student Information
        </Text>

        <View style={styles.card}>
          <Input
            label="MVAID *"
            value={mvaid}
            onChangeText={setMvaid}
            placeholder="Example: MVAID-0004"
          />

          <Input
            label="First Name *"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
          />

          <Input
            label="Middle Name"
            value={middleName}
            onChangeText={setMiddleName}
            placeholder="Middle name"
          />

          <Input
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <Input
                label="Date of Birth"
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.half}>
              <Input
                label="Gender"
                value={gender}
                onChangeText={setGender}
                placeholder="Male / Female / Other"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <Input
                label="Joining Class"
                value={joiningClass}
                onChangeText={setJoiningClass}
                placeholder="Example: Class 5"
              />
            </View>

            <View style={styles.half}>
              <Input
                label="Section"
                value={section}
                onChangeText={setSection}
                placeholder="Example: A"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <Input
                label="Academic Year"
                value={academicYear}
                onChangeText={setAcademicYear}
                placeholder="2026-27"
              />
            </View>

            <View style={styles.half}>
              <Input
                label="Joining Academic Year"
                value={joiningAcademicYear}
                onChangeText={
                  setJoiningAcademicYear
                }
                placeholder="2026-27"
              />
            </View>
          </View>

          <Input
            label="Date of Admission"
            value={dateOfAdmission}
            onChangeText={setDateOfAdmission}
            placeholder="YYYY-MM-DD"
          />

          <Input
            label="Student Type *"
            value={studentType}
            onChangeText={setStudentType}
            placeholder="Example: Regular"
          />

          <Input
            label="Student Email"
            value={email}
            onChangeText={setEmail}
            placeholder="student@example.com"
            keyboardType="email-address"
          />

          <Input
            label="Student Mobile"
            value={mobile}
            onChangeText={setMobile}
            placeholder="10 digit mobile number"
            keyboardType="phone-pad"
          />

          <Input
            label="Residential Address"
            value={studentAddress}
            onChangeText={setStudentAddress}
            placeholder="Student address"
            multiline
          />

          <Input
            label="Pincode"
            value={pincode}
            onChangeText={setPincode}
            placeholder="Pincode"
            keyboardType="number-pad"
          />

          <Input
            label="Aadhaar Number"
            value={aadhaarNumber}
            onChangeText={setAadhaarNumber}
            placeholder="Aadhaar number"
            keyboardType="number-pad"
          />

          <Input
            label="Previous School"
            value={previousSchool}
            onChangeText={setPreviousSchool}
            placeholder="Previous school"
          />

          <Input
            label="Nationality"
            value={nationality}
            onChangeText={setNationality}
            placeholder="Nationality"
          />

          <Input
            label="Caste Category"
            value={casteCategory}
            onChangeText={setCasteCategory}
            placeholder="General / OBC / SC / ST"
          />

          <Input
            label="Caste"
            value={caste}
            onChangeText={setCaste}
            placeholder="Caste"
          />

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() =>
              setStaffChild(current => !current)
            }
            activeOpacity={0.7}>
            <View
              style={[
                styles.checkbox,
                staffChild &&
                  styles.checkboxSelected,
              ]}>
              {staffChild && (
                <Text style={styles.checkmark}>
                  ✓
                </Text>
              )}
            </View>

            <Text style={styles.checkboxText}>
              Staff Child
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= FAMILY INFORMATION ================= */}

        <Text style={styles.sectionTitle}>
          Family Information
        </Text>

        <View style={styles.card}>
          <Input
            label="Family Name"
            value={familyName}
            onChangeText={setFamilyName}
            placeholder="Family name"
          />

          <Input
            label="Father Name"
            value={fatherName}
            onChangeText={setFatherName}
            placeholder="Father name"
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <Input
                label="Father Mobile"
                value={fatherMobile}
                onChangeText={setFatherMobile}
                placeholder="Mobile"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.half}>
              <Input
                label="Father Occupation"
                value={fatherOccupation}
                onChangeText={
                  setFatherOccupation
                }
                placeholder="Occupation"
              />
            </View>
          </View>

          <Input
            label="Mother Name"
            value={motherName}
            onChangeText={setMotherName}
            placeholder="Mother name"
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <Input
                label="Mother Mobile"
                value={motherMobile}
                onChangeText={setMotherMobile}
                placeholder="Mobile"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.half}>
              <Input
                label="Mother Occupation"
                value={motherOccupation}
                onChangeText={
                  setMotherOccupation
                }
                placeholder="Occupation"
              />
            </View>
          </View>

          <Input
            label="Guardian Name"
            value={guardianName}
            onChangeText={setGuardianName}
            placeholder="Guardian name"
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <Input
                label="Guardian Mobile"
                value={guardianMobile}
                onChangeText={setGuardianMobile}
                placeholder="Mobile"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.half}>
              <Input
                label="Guardian Relation"
                value={guardianRelation}
                onChangeText={
                  setGuardianRelation
                }
                placeholder="Relation"
              />
            </View>
          </View>

          <Input
            label="Family Email"
            value={familyEmail}
            onChangeText={setFamilyEmail}
            placeholder="Family email"
            keyboardType="email-address"
          />

          <Input
            label="Family Address"
            value={familyAddress}
            onChangeText={setFamilyAddress}
            placeholder="Family address"
            multiline
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <Input
                label="City"
                value={city}
                onChangeText={setCity}
                placeholder="City"
              />
            </View>

            <View style={styles.half}>
              <Input
                label="State"
                value={state}
                onChangeText={setState}
                placeholder="State"
              />
            </View>
          </View>

          <Input
            label="Family Pincode"
            value={familyPincode}
            onChangeText={setFamilyPincode}
            placeholder="Pincode"
            keyboardType="number-pad"
          />
        </View>

        {/* ================= SAVE ================= */}

        <TouchableOpacity
          style={[
            styles.saveButton,
            saving && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.7}>

          {saving ? (
            <>
              <ActivityIndicator color="#fff" />
              <Text style={styles.saveButtonText}>
                Saving...
              </Text>
            </>
          ) : (
            <Text style={styles.saveButtonText}>
              ADD STUDENT
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onBack}
          disabled={saving}
          activeOpacity={0.7}>
          <Text style={styles.cancelButtonText}>
            CANCEL
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ==================================================
// INPUT COMPONENT
// ==================================================

type InputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: any;
  multiline?: boolean;
};

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline = false,
}: InputProps) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label}
      </Text>

      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={
          multiline ? 'top' : 'center'
        }
        autoCapitalize="sentences"
      />
    </View>
  );
};

// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },

  header: {
    minHeight: 76,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 9,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  backButtonText: {
    fontSize: 25,
    color: '#111827',
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#111827',
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#6b7280',
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 50,
    maxWidth: 1000,
    width: '100%',
    alignSelf: 'center',
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
    marginTop: 8,
    marginBottom: 12,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
  },

  inputContainer: {
    marginBottom: 15,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 7,
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 13,
    backgroundColor: '#fff',
    color: '#111827',
    fontSize: 14,
  },

  multilineInput: {
    minHeight: 90,
    paddingTop: 12,
  },

  row: {
    flexDirection: 'row',
    gap: 12,
  },

  half: {
    flex: 1,
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxSelected: {
    backgroundColor: '#1683df',
    borderColor: '#1683df',
  },

  checkmark: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },

  checkboxText: {
    marginLeft: 9,
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },

  saveButton: {
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: '#1683df',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },

  saveButtonDisabled: {
    opacity: 0.7,
  },

  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },

  cancelButton: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  cancelButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default StudentForm;