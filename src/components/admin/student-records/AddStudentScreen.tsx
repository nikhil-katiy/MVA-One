import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';

import styles from './AddStudentStyles';

import {
  createStudent,
  getCasteCategories,
  getGenders,
  MasterOption,
  CreateStudentInput,
} from '@/services/studentService';

/* =========================================================
   PROPS
========================================================= */

type Props = {
  onBack: () => void;
};

/* =========================================================
   STATUS
========================================================= */

const ALLOWED_STATUS = [
  'PENDING',
  'ACTIVE',
  'WITHDRAWN',
  'ALUMNI',
  'INACTIVE',
] as const;

type StatusValue = (typeof ALLOWED_STATUS)[number];

/* =========================================================
   STUDENT TYPE
========================================================= */

const STUDENT_TYPES = [
  {
    label: 'Day Scholar',
    value: 'Day Scholar',
  },
  {
    label: 'Day Boarder',
    value: 'DAY_BOARDER',
  },
];

/* =========================================================
   FIELD COMPONENT
   IMPORTANT:
   Keep this OUTSIDE AddStudentScreen.

   This prevents TextInput from being recreated
   whenever form state changes.
========================================================= */

function Field({
  label,
  children,
  isMobile,
}: {
  label: string;
  children: React.ReactNode;
  isMobile: boolean;
}) {
  return (
    <View
      style={[
        styles.field,
        isMobile
          ? styles.fieldMobile
          : styles.fieldDesktop,
      ]}
    >
      <Text style={styles.label}>
        {label}
      </Text>

      {children}
    </View>
  );
}

/* =========================================================
   SCREEN
========================================================= */

export default function AddStudentScreen({
  onBack,
}: Props) {
  const { width } = useWindowDimensions();

  const isMobile = width < 700;

  /* =======================================================
     FORM
  ======================================================= */

  const [mvaId, setMvaId] = useState('');

  const [firstName, setFirstName] = useState('');

  const [middleName, setMiddleName] = useState('');

  const [lastName, setLastName] = useState('');

  const [dateOfBirth, setDateOfBirth] = useState('');

  const [dateOfAdmission, setDateOfAdmission] =
    useState('');

  const [academicYear, setAcademicYear] =
    useState('');

  const [joiningClass, setJoiningClass] =
    useState('');

  const [address, setAddress] = useState('');

  const [pincode, setPincode] = useState('');

  const [aadhaar, setAadhaar] = useState('');

  const [studentType, setStudentType] =
    useState('');

  const [previousSchool, setPreviousSchool] =
    useState('');

  const [nationality, setNationality] =
    useState('Indian');

  const [staffChild, setStaffChild] =
    useState(false);

  const [caste, setCaste] = useState('');

  const [email, setEmail] = useState('');

  const [mobile, setMobile] = useState('');

  const [status, setStatus] =
    useState<StatusValue>('ACTIVE');

  /* =======================================================
     MASTER DATA
  ======================================================= */

  const [casteCategories, setCasteCategories] =
    useState<MasterOption[]>([]);

  const [genders, setGenders] =
    useState<MasterOption[]>([]);

  const [casteCategoryId, setCasteCategoryId] =
    useState<string>('');

  const [genderId, setGenderId] =
    useState<string>('');

  /* =======================================================
     LOADING
  ======================================================= */

  const [loadingMasters, setLoadingMasters] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [formError, setFormError] =
    useState('');

  /* =======================================================
     LOAD MASTER DATA
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadMasterData() {
      try {
        setLoadingMasters(true);
        setFormError('');

        const [
          casteData,
          genderData,
        ] = await Promise.all([
          getCasteCategories(),
          getGenders(),
        ]);

        if (!mounted) {
          return;
        }

        setCasteCategories(casteData);
        setGenders(genderData);

        console.log(
          'CASTE CATEGORIES:',
          casteData
        );

        console.log(
          'GENDERS:',
          genderData
        );
      } catch (error) {
        console.error(
          'MASTER DATA ERROR:',
          error
        );

        if (mounted) {
          setFormError(
            error instanceof Error
              ? error.message
              : 'Unable to load dropdown data.'
          );
        }
      } finally {
        if (mounted) {
          setLoadingMasters(false);
        }
      }
    }

    loadMasterData();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     DATE NORMALIZER
  ======================================================= */

  function normalizeDate(
    value: string
  ): string | null {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    const normalized =
      trimmed.replace(/\//g, '-');

    const parts =
      normalized.split('-');

    if (parts.length !== 3) {
      return null;
    }

    let [
      year,
      month,
      day,
    ] = parts;

    if (
      year.length === 4 &&
      month.length <= 2 &&
      day.length <= 2
    ) {
      month =
        month.padStart(2, '0');

      day =
        day.padStart(2, '0');

      return `${year}-${month}-${day}`;
    }

    return null;
  }

  /* =======================================================
     VALIDATION
  ======================================================= */

  function validateForm(): string | null {
    if (!mvaId.trim()) {
      return 'MVA ID is required.';
    }

    if (!firstName.trim()) {
      return 'First name is required.';
    }

    /*
     * Family ID is intentionally NOT required.
     *
     * It will be automatically created/reused
     * by studentService.
     */

    if (!studentType) {
      return 'Please select student type.';
    }

    if (!casteCategoryId) {
      return 'Please select caste category.';
    }

    if (!genderId) {
      return 'Please select gender.';
    }

    if (!joiningClass.trim()) {
      return 'Joining class is required.';
    }

    if (!status) {
      return 'Status is required.';
    }

    if (
      !ALLOWED_STATUS.includes(status)
    ) {
      return 'Invalid status value.';
    }

    /* EMAIL */

    if (email.trim()) {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(
          email.trim()
        )
      ) {
        return 'Please enter a valid email address.';
      }
    }

    /* DATE OF BIRTH */

    const dob =
      normalizeDate(dateOfBirth);

    if (
      dateOfBirth.trim() &&
      !dob
    ) {
      return 'Date of birth must be YYYY-MM-DD.';
    }

    /* DATE OF ADMISSION */

    const admission =
      normalizeDate(
        dateOfAdmission
      );

    if (
      dateOfAdmission.trim() &&
      !admission
    ) {
      return 'Date of admission must be YYYY-MM-DD.';
    }

    return null;
  }

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function handleSubmit() {
    if (submitting) {
      return;
    }

    setFormError('');

    const validationError =
      validateForm();

    if (validationError) {
      setFormError(
        validationError
      );

      Alert.alert(
        'Validation Error',
        validationError
      );

      return;
    }

    const selectedCaste =
      casteCategories.find(
        item =>
          String(item.id) ===
          casteCategoryId
      );

    const selectedGender =
      genders.find(
        item =>
          String(item.id) ===
          genderId
      );

    if (!selectedCaste) {
      setFormError(
        'Selected caste category was not found.'
      );

      return;
    }

    if (!selectedGender) {
      setFormError(
        'Selected gender was not found.'
      );

      return;
    }

    /*
     * IMPORTANT:
     *
     * family_id is NOT sent from the form.
     *
     * studentService will:
     *
     * 1. Find matching student using email/mobile.
     * 2. Reuse existing family_id if available.
     * 3. Create a new family if required.
     * 4. Create student using that family_id.
     */

    const payload: CreateStudentInput = {
      mva_id:
        mvaId.trim(),

      family_id: null,

      first_name:
        firstName.trim(),

      middle_name:
        middleName.trim() ||
        null,

      last_name:
        lastName.trim() ||
        null,

      date_of_birth:
        normalizeDate(
          dateOfBirth
        ),

      date_of_admission:
        normalizeDate(
          dateOfAdmission
        ),

      joining_academic_year:
        academicYear.trim() ||
        null,

      joining_class:
        joiningClass.trim() ||
        null,

      class_residential_address:
        address.trim() ||
        null,

      pincode:
        pincode.trim() ||
        null,

      aadhaar_number:
        aadhaar.trim() ||
        null,

      student_type:
        studentType,

      previous_school:
        previousSchool.trim() ||
        null,

      nationality:
        nationality.trim() ||
        null,

      staff_child:
        staffChild,

      caste_category_id:
        selectedCaste.id,

      caste:
        caste.trim() ||
        null,

      gender_id:
        selectedGender.id,

      student_image:
        null,

      email:
        email.trim() ||
        null,

      mobile:
        mobile.trim() ||
        null,

      status:
        status,
    };

    try {
      setSubmitting(true);

      console.log(
        'CREATE STUDENT DATA:',
        payload
      );

      const created =
        await createStudent(
          payload
        );

      console.log(
        'STUDENT CREATED:',
        created
      );

      Alert.alert(
        'Success',
        'Student created successfully.'
      );

      onBack();
    } catch (error) {
      console.error(
        'CREATE STUDENT ERROR:',
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : 'Unable to create student.';

      setFormError(message);

      Alert.alert(
        'Create Student Error',
        message
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Text
                style={
                  styles.headerIconText
                }
              >
                +
              </Text>
            </View>

            <View style={styles.headerText}>
              <Text style={styles.title}>
                Add Student
              </Text>

              <Text style={styles.subtitle}>
                Create a new student record
              </Text>
            </View>
          </View>

          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Text
              style={styles.backText}
            >
              Back
            </Text>
          </Pressable>
        </View>

        {/* ERROR */}

        {formError ? (
          <View style={styles.formError}>
            <Text
              style={
                styles.formErrorText
              }
            >
              {formError}
            </Text>
          </View>
        ) : null}

        {/* BASIC INFORMATION */}

        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Basic Information
          </Text>

          <View
            style={[
              styles.grid,
              isMobile &&
                styles.gridMobile,
            ]}
          >
            <Field
              label="MVA ID *"
              isMobile={isMobile}
            >
              <TextInput
                value={mvaId}
                onChangeText={setMvaId}
                placeholder="MVA26SRCM01"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                style={styles.input}
              />
            </Field>

            <Field
              label="First Name *"
              isMobile={isMobile}
            >
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </Field>

            <Field
              label="Middle Name"
              isMobile={isMobile}
            >
              <TextInput
                value={middleName}
                onChangeText={setMiddleName}
                placeholder="Middle name"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </Field>

            <Field
              label="Last Name"
              isMobile={isMobile}
            >
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </Field>

            <Field
              label="Date of Birth"
              isMobile={isMobile}
            >
              <TextInput
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </Field>

            <Field
              label="Date of Admission"
              isMobile={isMobile}
            >
              <TextInput
                value={dateOfAdmission}
                onChangeText={
                  setDateOfAdmission
                }
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </Field>

            <Field
              label="Academic Year"
              isMobile={isMobile}
            >
              <TextInput
                value={academicYear}
                onChangeText={setAcademicYear}
                placeholder="2026-27"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </Field>

            <Field
              label="Joining Class *"
              isMobile={isMobile}
            >
              <TextInput
                value={joiningClass}
                onChangeText={setJoiningClass}
                placeholder="7"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                style={styles.input}
              />
            </Field>
          </View>
        </View>

        {/* CONTACT */}

        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Contact Information
          </Text>

          <View
            style={[
              styles.grid,
              isMobile &&
                styles.gridMobile,
            ]}
          >
            <Field
              label="Mobile"
              isMobile={isMobile}
            >
              <TextInput
                value={mobile}
                onChangeText={setMobile}
                placeholder="Mobile number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                style={styles.input}
              />
            </Field>

            <Field
              label="Email"
              isMobile={isMobile}
            >
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="student@example.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </Field>

            <Field
              label="Residential Address"
              isMobile={isMobile}
            >
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Address"
                placeholderTextColor="#94A3B8"
                multiline
                style={[
                  styles.input,
                  styles.textArea,
                ]}
              />
            </Field>

            <Field
              label="Pincode"
              isMobile={isMobile}
            >
              <TextInput
                value={pincode}
                onChangeText={setPincode}
                placeholder="461228"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                style={styles.input}
              />
            </Field>
          </View>
        </View>

        {/* ACADEMIC */}

        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Academic & Student Details
          </Text>

          <View
            style={[
              styles.grid,
              isMobile &&
                styles.gridMobile,
            ]}
          >
            <Field
              label="Student Type *"
              isMobile={isMobile}
            >
              <View
                style={
                  styles.selectContainer
                }
              >
                <Picker
                  selectedValue={
                    studentType
                  }
                  onValueChange={value =>
                    setStudentType(
                      String(value)
                    )
                  }
                  style={
                    styles.picker
                  }
                >
                  <Picker.Item
                    label="Select student type"
                    value=""
                  />

                  {STUDENT_TYPES.map(
                    item => (
                      <Picker.Item
                        key={item.value}
                        label={item.label}
                        value={item.value}
                      />
                    )
                  )}
                </Picker>
              </View>
            </Field>

            <Field
              label="Previous School"
              isMobile={isMobile}
            >
              <TextInput
                value={previousSchool}
                onChangeText={
                  setPreviousSchool
                }
                placeholder="Previous school"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </Field>

            <Field
              label="Nationality"
              isMobile={isMobile}
            >
              <TextInput
                value={nationality}
                onChangeText={
                  setNationality
                }
                placeholder="Indian"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </Field>

            <Field
              label="Aadhaar Number"
              isMobile={isMobile}
            >
              <TextInput
                value={aadhaar}
                onChangeText={setAadhaar}
                placeholder="Aadhaar number"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                style={styles.input}
              />
            </Field>
          </View>
        </View>

        {/* MASTER DATA */}

        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Category & Gender
          </Text>

          {loadingMasters ? (
            <View
              style={
                styles.dropdownLoading
              }
            >
              <ActivityIndicator
                size="small"
                color="#1C3358"
              />

              <Text
                style={
                  styles.loadingText
                }
              >
                Loading dropdown data...
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.grid,
                isMobile &&
                  styles.gridMobile,
              ]}
            >
              <Field
                label="Caste Category *"
                isMobile={isMobile}
              >
                <View
                  style={
                    styles.selectContainer
                  }
                >
                  <Picker
                    selectedValue={
                      casteCategoryId
                    }
                    onValueChange={value =>
                      setCasteCategoryId(
                        String(value)
                      )
                    }
                    style={
                      styles.picker
                    }
                  >
                    <Picker.Item
                      label="Select caste category"
                      value=""
                    />

                    {casteCategories.map(
                      item => (
                        <Picker.Item
                          key={item.id}
                          label={`${item.name} (${item.code})`}
                          value={String(
                            item.id
                          )}
                        />
                      )
                    )}
                  </Picker>
                </View>
              </Field>

              <Field
                label="Gender *"
                isMobile={isMobile}
              >
                <View
                  style={
                    styles.selectContainer
                  }
                >
                  <Picker
                    selectedValue={
                      genderId
                    }
                    onValueChange={value =>
                      setGenderId(
                        String(value)
                      )
                    }
                    style={
                      styles.picker
                    }
                  >
                    <Picker.Item
                      label="Select gender"
                      value=""
                    />

                    {genders.map(
                      item => (
                        <Picker.Item
                          key={item.id}
                          label={item.name}
                          value={String(
                            item.id
                          )}
                        />
                      )
                    )}
                  </Picker>
                </View>
              </Field>

              <Field
                label="Caste"
                isMobile={isMobile}
              >
                <TextInput
                  value={caste}
                  onChangeText={setCaste}
                  placeholder="Caste"
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                />
              </Field>

              <Field
                label="Staff Child"
                isMobile={isMobile}
              >
                <View
                  style={
                    styles.switchRow
                  }
                >
                  <View
                    style={
                      styles.switchText
                    }
                  >
                    <Text
                      style={
                        styles.switchTitle
                      }
                    >
                      Staff Child
                    </Text>

                    <Text
                      style={
                        styles.switchSubtitle
                      }
                    >
                      Mark if student is a
                      staff member's child
                    </Text>
                  </View>

                  <Switch
                    value={staffChild}
                    onValueChange={
                      setStaffChild
                    }
                    trackColor={{
                      false:
                        '#CBD5E1',
                      true:
                        '#94A3B8',
                    }}
                    thumbColor={
                      staffChild
                        ? '#1C3358'
                        : '#FFFFFF'
                    }
                  />
                </View>
              </Field>
            </View>
          )}
        </View>

        {/* STATUS */}

        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Student Status
          </Text>

          <View
            style={[
              styles.grid,
              isMobile &&
                styles.gridMobile,
            ]}
          >
            <Field
              label="Status *"
              isMobile={isMobile}
            >
              <TextInput
                value={status}
                onChangeText={value => {
                  const upper =
                    value
                      .toUpperCase()
                      .replace(
                        /\s+/g,
                        '_'
                      );

                  /*
                   * Only accept valid complete values.
                   */

                  if (
                    upper === '' ||
                    ALLOWED_STATUS.includes(
                      upper as StatusValue
                    )
                  ) {
                    setStatus(
                      upper as StatusValue
                    );
                  }
                }}
                placeholder="ACTIVE"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                style={styles.input}
              />
            </Field>
          </View>
        </View>

        {/* ACTIONS */}

        <View
          style={[
            styles.actions,
            isMobile &&
              styles.actionsMobile,
          ]}
        >
          <Pressable
            onPress={onBack}
            disabled={submitting}
            style={({ pressed }) => [
              styles.cancelButton,
              pressed &&
                styles.buttonPressed,
              submitting &&
                styles.buttonDisabled,
            ]}
          >
            <Text
              style={
                styles.cancelText
              }
            >
              Cancel
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={({ pressed }) => [
              styles.submitButton,
              pressed &&
                styles.buttonPressed,
              submitting &&
                styles.submitDisabled,
            ]}
          >
            {submitting ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={
                  styles.submitText
                }
              >
                Create Student
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}