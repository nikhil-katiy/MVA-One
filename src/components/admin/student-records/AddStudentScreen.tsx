import React, { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import styles from './AddStudentStyles';

import {
  ClassOption,
  createStudent,
  CreateStudentInput,
  ExistingFamilyMatch,
  findExistingFamily,
  getCasteCategories,
  getClasses,
  getGenders,
  getStudentEditData,
  MasterOption,
  Student,
  updateStudent,
  uploadStudentPhoto,
} from '@/services/studentService';

/* =========================================================
   PROPS
========================================================= */

type Props = {
  onBack: () => void;
  editStudent?: Student | null;
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

function getCurrentAcademicYear(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  if (month >= 4) {
    return `${year}-${String(year + 1).slice(-2)}`;
  }

  return `${year - 1}-${String(year).slice(-2)}`;
}

function onlyLetters(value: string): string {
  return value.replace(/[^A-Za-z\s]/g, '');
}

function onlyDigits(value: string, maxLength: number): string {
  return value.replace(/\D/g, '').slice(0, maxLength);
}

/* =========================================================
   STUDENT TYPE
========================================================= */

const STUDENT_TYPES = [
  {
    label: 'DAY_BOARDER',
    value: 'DAY_BOARDER',
  },
  {
    label: 'HOSTELER',
    value: 'HOSTELER',
  },
];

/* =========================================================
   FIELD-LEVEL ERROR KEYS
   (used only for inline UI highlighting — the underlying
   validation logic / messages are unchanged)
========================================================= */

type FieldErrors = Partial<{
  mvaId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  studentType: string;
  casteCategoryId: string;
  genderId: string;
  joiningClass: string;
  status: string;
  email: string;
  studentMobile: string;
  address: string;
  city: string;
  pincode: string;
  dateOfBirth: string;
  dateOfAdmission: string;
  academicYear: string;
  fatherName: string;
  fatherMobile: string;
  fatherEmail: string;
  fatherOccupation: string;
  motherName: string;
  motherMobile: string;
  motherEmail: string;
  motherOccupation: string;
  guardianName: string;
  guardianMobile: string;
  guardianEmail: string;
  guardianRelation: string;
  familyAddress: string;
  familyCity: string;
  familyState: string;
  familyPincode: string;
  previousSchool: string;
  nationality: string;
  aadhaar: string;
  caste: string;
}>;

/* =========================================================
   INLINE (NON-STYLESHEET) UI HELPERS
   These are additive visual-only styles so we don't need to
   touch / assume the contents of AddStudentStyles.ts.
========================================================= */

const inline = {
  errorBorder: {
    borderColor: '#DC2626',
    borderWidth: 1,
  },
  fieldErrorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
  },
  requiredMark: {
    color: '#DC2626',
  },
  sectionSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10,
  },
  helperText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },
  dateButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  dateButtonPressed: {
    backgroundColor: '#F8FAFC',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#0F172A',
  },
  dateButtonPlaceholder: {
    fontSize: 14,
    color: '#94A3B8',
  },
  dateIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
};

/* =========================================================
   DATE FORMATTING HELPERS (display only)
========================================================= */

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isoToDisplay(iso: string): string {
  if (!iso) {
    return '';
  }
  const [year, month, day] = iso.split('-');
  const monthIndex = Number(month) - 1;
  const label = MONTH_LABELS[monthIndex] ?? month;
  return `${day} ${label} ${year}`;
}

function isoToDate(iso: string): Date | undefined {
  if (!iso) {
    return undefined;
  }
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) {
    return undefined;
  }
  return new Date(year, month - 1, day);
}

/* =========================================================
   DATE PICKER FIELD
   Wraps @react-native-community/datetimepicker behind a
   tappable, styled field. Value in/out is always a
   YYYY-MM-DD string (or ''), same shape the rest of the
   form/service already expects.
========================================================= */

function DatePickerField({
  value,
  onChange,
  placeholder,
  maximumDate,
  minimumDate,
  hasError,
}: {
  value: string;
  onChange: (isoValue: string) => void;
  placeholder: string;
  maximumDate?: Date;
  minimumDate?: Date;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);

  function handleChange(
    event: DateTimePickerEvent,
    selected?: Date
  ) {
    if (event.type === 'dismissed') {
      setOpen(false);
      return;
    }

    if (selected) {
      onChange(toIsoDate(selected));
    }

    if (event.type === 'set') {
      setOpen(false);
    }
  }

  /*
   * WEB
   * Use browser's native date input.
   */
  if (Platform.OS === 'web') {
    return (
      <View>
        {React.createElement('input', {
          type: 'date',
          value: value || '',
          min: minimumDate
            ? toIsoDate(minimumDate)
            : undefined,
          max: maximumDate
            ? toIsoDate(maximumDate)
            : undefined,

          onChange: (event: any) => {
            onChange(event.target.value);
          },

          style: {
            width: '100%',
            height: 48,
            boxSizing: 'border-box',
            border: hasError
              ? '1px solid #DC2626'
              : '1px solid #CBD5E1',
            borderRadius: 10,
            padding: '0 14px',
            backgroundColor: '#FFFFFF',
            color: value
              ? '#0F172A'
              : '#94A3B8',
            fontSize: 14,
            outline: 'none',
          },
        })}
      </View>
    );
  }

  /*
   * ANDROID / IOS
   * Keep existing native calendar.
   */
  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          inline.dateButton,
          hasError && inline.errorBorder,
          pressed && inline.dateButtonPressed,
        ]}
      >
        <Text
          style={
            value
              ? inline.dateButtonText
              : inline.dateButtonPlaceholder
          }
        >
          {value
            ? isoToDisplay(value)
            : placeholder}
        </Text>

        <Text style={inline.dateIcon}>
          📅
        </Text>
      </Pressable>

      {open ? (
        <DateTimePicker
          value={
            isoToDate(value) ?? new Date()
          }
          mode="date"
          display="default"
          onChange={handleChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      ) : null}
    </View>
  );
}

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
  error,
  helperText,
}: {
  label: string;
  children: React.ReactNode;
  isMobile: boolean;
  error?: string;
  helperText?: string;
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

      {error ? (
        <Text style={inline.fieldErrorText}>
          {error}
        </Text>
      ) : helperText ? (
        <Text style={inline.helperText}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

/* =========================================================
   SCREEN
========================================================= */

export default function AddStudentScreen({
  onBack,
  editStudent = null,
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
    useState(getCurrentAcademicYear());

  const [joiningClass, setJoiningClass] =
    useState('');

  const [classes, setClasses] = useState<ClassOption[]>([]);  

  const [address, setAddress] = useState('');

  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');

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

  /* Student contact */
  const [studentEmail, setStudentEmail] = useState('');
  const [studentMobile, setStudentMobile] = useState('');

  /* Family / parent contacts */
  const [fatherName, setFatherName] = useState('');
  const [fatherMobile, setFatherMobile] = useState('');
  const [fatherEmail, setFatherEmail] = useState('');
  const [fatherOccupation, setFatherOccupation] = useState('');

  const [motherName, setMotherName] = useState('');
  const [motherMobile, setMotherMobile] = useState('');
  const [motherEmail, setMotherEmail] = useState('');
  const [motherOccupation, setMotherOccupation] = useState('');

  const [guardianName, setGuardianName] = useState('');
  const [guardianMobile, setGuardianMobile] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('');

  const [isGuardian, setIsGuardian] = useState(false);

  /* Family address - kept separate from student's residential address */
  const [familyAddress, setFamilyAddress] = useState('');
  const [familyCity, setFamilyCity] = useState('');
  const [familyState, setFamilyState] = useState('');
  const [familyPincode, setFamilyPincode] = useState('');

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

  const [studentPhoto, setStudentPhoto] =
    useState<ImagePicker.ImagePickerAsset | null>(null); 

  /* =======================================================
     LOADING
  ======================================================= */

  const [loadingMasters, setLoadingMasters] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [formError, setFormError] =
    useState('');

  /* NEW: per-field errors for inline UI highlighting only.
     This does not change validation logic — it mirrors the
     same checks performed in validateForm(). */
  const [fieldErrors, setFieldErrors] =
    useState<FieldErrors>({});

  const [loadingEditData, setLoadingEditData] = useState(!!editStudent);

  /* =======================================================
     LIVE FAMILY MATCHING
     Shared Expo logic: Android + iOS + Web use the same
     service and debounce. No platform-specific matching.
  ======================================================= */

  const [matchedFamily, setMatchedFamily] =
    useState<ExistingFamilyMatch | null>(null);

  const [familyConfirmed, setFamilyConfirmed] =
    useState(false);

  const [familyMatchConflict, setFamilyMatchConflict] =
    useState('');

  const [checkingFamily, setCheckingFamily] =
    useState(false);

  const autoFilledFamilyIdRef = useRef<number | null>(null);

  const isEditMode = !!editStudent;
  const familyFieldsLocked = familyConfirmed;

  function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function buildFamilyMatchInput(): CreateStudentInput {
    return {
      mva_id: '',
      family_id: null,
      first_name: '',
      caste_category_id: 0,
      student_type: '',
      status: 'ACTIVE',

      student_email: studentEmail.trim() || null,
      student_mobile: studentMobile.trim() || null,

      father_email: isGuardian ? null : fatherEmail.trim() || null,
      father_mobile: isGuardian ? null : fatherMobile.trim() || null,
      mother_email: isGuardian ? null : motherEmail.trim() || null,
      mother_mobile: isGuardian ? null : motherMobile.trim() || null,
      guardian_email: isGuardian ? guardianEmail.trim() || null : null,
      guardian_mobile: isGuardian ? guardianMobile.trim() || null : null,
    };
  }

  function applyMatchedFamily(match: ExistingFamilyMatch) {
    const family = match.family;

    setFatherName(family.father_name ?? '');
    setFatherMobile(family.father_mobile ?? '');
    setFatherEmail(family.father_email ?? '');
    setFatherOccupation(family.father_occupation ?? '');

    setMotherName(family.mother_name ?? '');
    setMotherMobile(family.mother_mobile ?? '');
    setMotherEmail(family.mother_email ?? '');
    setMotherOccupation(family.mother_occupation ?? '');

    setGuardianName(family.guardian_name ?? '');
    setGuardianMobile(family.guardian_mobile ?? '');
    setGuardianEmail(family.guardian_email ?? '');
    setGuardianRelation(family.guardian_relation ?? '');

    setFamilyAddress(family.address ?? '');
    setFamilyCity(family.city ?? '');
    setFamilyState(family.state ?? '');
    setFamilyPincode(family.pincode ?? '');

    setIsGuardian(
      !!family.guardian_name &&
      !family.father_name &&
      !family.mother_name
    );
  }

  useEffect(() => {
    if (loadingEditData) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      const input = buildFamilyMatchInput();

      const searchableContacts = [
        input.student_email && isValidEmail(input.student_email),
        input.student_mobile && /^\d{10}$/.test(input.student_mobile),
        input.father_email && isValidEmail(input.father_email),
        input.father_mobile && /^\d{10}$/.test(input.father_mobile),
        input.mother_email && isValidEmail(input.mother_email),
        input.mother_mobile && /^\d{10}$/.test(input.mother_mobile),
        input.guardian_email && isValidEmail(input.guardian_email),
        input.guardian_mobile && /^\d{10}$/.test(input.guardian_mobile),
      ].some(Boolean);

      if (!searchableContacts) {
        setMatchedFamily(null);
        setFamilyMatchConflict('');
        setFamilyConfirmed(false);

        if (autoFilledFamilyIdRef.current !== null) {
          setFatherName('');
          setFatherMobile('');
          setFatherEmail('');
          setFatherOccupation('');
          setMotherName('');
          setMotherMobile('');
          setMotherEmail('');
          setMotherOccupation('');
          setGuardianName('');
          setGuardianMobile('');
          setGuardianEmail('');
          setGuardianRelation('');
          setFamilyAddress('');
          setFamilyCity('');
          setFamilyState('');
          setFamilyPincode('');
          autoFilledFamilyIdRef.current = null;
        }

        setCheckingFamily(false);
        return;
      }

      setCheckingFamily(true);
      setFamilyMatchConflict('');

      try {
        const match = await findExistingFamily(input);

        if (cancelled) return;

        setMatchedFamily(match);

        if (match) {
          autoFilledFamilyIdRef.current = match.family.id;
          applyMatchedFamily(match);
        } else {
          autoFilledFamilyIdRef.current = null;
        }
      } catch (error) {
        if (cancelled) return;

        const message =
          error instanceof Error
            ? error.message
            : 'Unable to check existing family information.';

        if (message.startsWith('FAMILY_MATCH_CONFLICT:')) {
          setMatchedFamily(null);
          setFamilyConfirmed(false);
          autoFilledFamilyIdRef.current = null;
          setFamilyMatchConflict(
            'Information Conflict\nPlease check the details again. The entered information may belong to another family.'
          );
        } else {
          console.error('LIVE FAMILY MATCH ERROR:', error);
          setFamilyMatchConflict('Unable to check existing family information. Please try again.');
        }
      } finally {
        if (!cancelled) setCheckingFamily(false);
      }
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    loadingEditData,
    isEditMode,
    editStudent?.family_id,
    studentEmail,
    studentMobile,
    fatherEmail,
    fatherMobile,
    motherEmail,
    motherMobile,
    guardianEmail,
    guardianMobile,
    isGuardian,
  ]);

  function resetFamilyConfirmation() {
    setFamilyConfirmed(false);
  }

  useEffect(() => {
  if (!editStudent) {
    setLoadingEditData(false);
    return;
  }

  const studentToEdit = editStudent;

  let cancelled = false;

  async function loadEditStudent() {
    try {
      setLoadingEditData(true);
      setFormError('');

      const { student, family } =
        await getStudentEditData(studentToEdit.id);

      if (cancelled) {
        return;
      }

      // Student data
      setMvaId(student.mva_id ?? '');
      setFirstName(student.first_name ?? '');
      setMiddleName(student.middle_name ?? '');
      setLastName(student.last_name ?? '');

      setDateOfBirth(student.date_of_birth ?? '');
      setDateOfAdmission(student.date_of_admission ?? '');

      setAcademicYear(
        student.joining_academic_year ?? ''
      );

      setJoiningClass(
        student.joining_class ?? ''
      );

      setAddress(
        student.class_residential_address ?? ''
      );

      setPincode(
        student.pincode ?? ''
      );

      setAadhaar(
        student.aadhaar_number ?? ''
      );

      setStudentType(
        student.student_type ?? ''
      );

      setPreviousSchool(
        student.previous_school ?? ''
      );

      setNationality(
        student.nationality ?? ''
      );

      setStaffChild(
        student.staff_child ?? false
      );

      setCasteCategoryId(
        student.caste_category_id
          ? String(student.caste_category_id)
          : ''
      );

      setCaste(
        student.caste ?? ''
      );

      setGenderId(
        student.gender_id
          ? String(student.gender_id)
          : ''
      );

      setStudentEmail(
        student.email ?? ''
      );

      setStudentMobile(
        student.mobile ?? ''
      );

      const loadedStatus = student.status;

      setStatus(
        loadedStatus &&
        ALLOWED_STATUS.includes(
          loadedStatus as StatusValue
        )
          ? (loadedStatus as StatusValue)
          : 'ACTIVE'
      );

      // Family data
      if (family) {
        setFatherName(
          family.father_name ?? ''
        );

        setFatherMobile(
          family.father_mobile ?? ''
        );

        setFatherEmail(
          family.father_email ?? ''
        );

        setFatherOccupation(
          family.father_occupation ?? ''
        );

        setMotherName(
          family.mother_name ?? ''
        );

        setMotherMobile(
          family.mother_mobile ?? ''
        );

        setMotherEmail(
          family.mother_email ?? ''
        );

        setMotherOccupation(
          family.mother_occupation ?? ''
        );

        setGuardianName(
          family.guardian_name ?? ''
        );

        setGuardianMobile(
          family.guardian_mobile ?? ''
        );

        setGuardianEmail(
          family.guardian_email ?? ''
        );

        setGuardianRelation(
          family.guardian_relation ?? ''
        );

        setFamilyAddress(
          family.address ?? ''
        );

        setFamilyCity(
          family.city ?? ''
        );

        setFamilyState(
          family.state ?? ''
        );

        setFamilyPincode(
          family.pincode ?? ''
        );

        setIsGuardian(
          !!family.guardian_name &&
          !family.father_name &&
          !family.mother_name
        );
      }

      // Existing photo
      // Do NOT put existing DB image into studentPhoto state.
      // studentPhoto is only for a newly selected ImagePicker asset.

    } catch (error) {
      console.error(
        'LOAD EDIT STUDENT ERROR:',
        error
      );

      if (!cancelled) {
        const message =
          error instanceof Error
            ? error.message
            : 'Unable to load student information.';

        setFormError(message);

        Alert.alert(
          'Error',
          message
        );
      }
    } finally {
      if (!cancelled) {
        setLoadingEditData(false);
      }
    }
  }

  loadEditStudent();

  return () => {
    cancelled = true;
  };
}, [editStudent]);

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
        classData,
      ] = await Promise.all([
        getCasteCategories(),
        getGenders(),
        getClasses(),
      ]);

      if (!mounted) {
        return;
      }

      setCasteCategories(casteData);
      setGenders(genderData);
      setClasses(classData);

      console.log(
        'CASTE CATEGORIES:',
        casteData
      );

      console.log(
        'GENDERS:',
        genderData
      );

      console.log(
        'CLASSES:',
        classData
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
            : 'Unable to load dropdown data. Please check your connection and try again.'
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
     (Same checks/order as before. Now also builds a
     field-level error map so the UI can highlight the
     exact field, in addition to the existing top-level
     message + Alert.)
  ======================================================= */

  function validateForm(): {
    message: string | null;
    errors: FieldErrors;
  } {
    const errors: FieldErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!mvaId.trim()) errors.mvaId = 'MVA ID is required.';
    if (!firstName.trim()) errors.firstName = 'First name is required.';
    if (!middleName.trim()) errors.middleName = 'Middle name is required.';
    if (!lastName.trim()) errors.lastName = 'Last name is required.';

    if (!dateOfBirth.trim()) {
      errors.dateOfBirth = 'Date of birth is required.';
    } else if (!normalizeDate(dateOfBirth)) {
      errors.dateOfBirth = 'Invalid date of birth.';
    }

    if (!dateOfAdmission.trim()) {
      errors.dateOfAdmission = 'Date of admission is required.';
    } else if (!normalizeDate(dateOfAdmission)) {
      errors.dateOfAdmission = 'Invalid date of admission.';
    }

    if (!academicYear.trim()) errors.academicYear = 'Academic year is required.';
    if (!joiningClass.trim()) errors.joiningClass = 'Joining class is required.';

    if (!studentType) errors.studentType = 'Please select a student type.';
    if (!casteCategoryId) errors.casteCategoryId = 'Please select a caste category.';
    if (!genderId) errors.genderId = 'Please select a gender.';

    if (!studentMobile.trim()) {
      errors.studentMobile = 'Student mobile is required.';
    } else if (!/^\d{10}$/.test(studentMobile.trim())) {
      errors.studentMobile = 'Student mobile must be exactly 10 digits.';
    }

    if (!studentEmail.trim()) {
      errors.email = 'Student email is required.';
    } else if (!emailRegex.test(studentEmail.trim())) {
      errors.email = 'Please enter a valid student email.';
    }

    if (!address.trim()) errors.address = 'Student residential address is required.';
    if (!city.trim()) errors.city = 'Student city is required.';

    if (!pincode.trim()) {
      errors.pincode = 'Student pincode is required.';
    } else if (!/^\d{6}$/.test(pincode.trim())) {
      errors.pincode = 'Student pincode must be exactly 6 digits.';
    }

    if (!previousSchool.trim()) errors.previousSchool = 'Previous school is required.';
    if (!nationality.trim()) errors.nationality = 'Nationality is required.';
    if (!caste.trim()) errors.caste = 'Caste is required.';

    if (!aadhaar.trim()) {
      errors.aadhaar = 'Aadhaar number is required.';
    } else if (!/^\d{12}$/.test(aadhaar.trim())) {
      errors.aadhaar = 'Aadhaar number must be exactly 12 digits.';
    }

    if (!familyAddress.trim()) errors.familyAddress = 'Family address is required.';
    if (!familyCity.trim()) errors.familyCity = 'Family city is required.';
    if (!familyState.trim()) errors.familyState = 'Family state is required.';
    if (!familyPincode.trim()) {
      errors.familyPincode = 'Family pincode is required.';
    } else if (!/^\d{6}$/.test(familyPincode.trim())) {
      errors.familyPincode = 'Family pincode must be exactly 6 digits.';
    }

    if (isGuardian) {
      if (!guardianName.trim()) errors.guardianName = 'Guardian name is required.';
      if (!guardianMobile.trim()) {
        errors.guardianMobile = 'Guardian mobile is required.';
      } else if (!/^\d{10}$/.test(guardianMobile.trim())) {
        errors.guardianMobile = 'Guardian mobile must be exactly 10 digits.';
      }
      if (!guardianEmail.trim()) {
        errors.guardianEmail = 'Guardian email is required.';
      } else if (!emailRegex.test(guardianEmail.trim())) {
        errors.guardianEmail = 'Please enter a valid guardian email.';
      }
      if (!guardianRelation.trim()) errors.guardianRelation = 'Guardian relation is required.';
    } else {
      if (!fatherName.trim()) errors.fatherName = 'Father name is required.';
      if (!fatherMobile.trim()) {
        errors.fatherMobile = 'Father mobile is required.';
      } else if (!/^\d{10}$/.test(fatherMobile.trim())) {
        errors.fatherMobile = 'Father mobile must be exactly 10 digits.';
      }
      if (!fatherEmail.trim()) {
        errors.fatherEmail = 'Father email is required.';
      } else if (!emailRegex.test(fatherEmail.trim())) {
        errors.fatherEmail = 'Please enter a valid father email.';
      }
      if (!fatherOccupation.trim()) errors.fatherOccupation = 'Father occupation is required.';

      if (!motherName.trim()) errors.motherName = 'Mother name is required.';
      if (!motherMobile.trim()) {
        errors.motherMobile = 'Mother mobile is required.';
      } else if (!/^\d{10}$/.test(motherMobile.trim())) {
        errors.motherMobile = 'Mother mobile must be exactly 10 digits.';
      }
      if (!motherEmail.trim()) {
        errors.motherEmail = 'Mother email is required.';
      } else if (!emailRegex.test(motherEmail.trim())) {
        errors.motherEmail = 'Please enter a valid mother email.';
      }
      if (!motherOccupation.trim()) errors.motherOccupation = 'Mother occupation is required.';
    }

    if (!status || !ALLOWED_STATUS.includes(status)) {
      errors.status = 'Please select a valid status.';
    }

    const message = Object.values(errors)[0] ?? null;
    return { message, errors };
  }

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function handleSubmit() {
    if (submitting) {
      return;
    }

    setFormError('');
    setFieldErrors({});

    if (familyMatchConflict) {
      setFormError(
        'Information Conflict. Please check the details again. The entered information may belong to another family.'
      );
      Alert.alert(
        'Information Conflict',
        'Please check the details again. The entered information may belong to another family.'
      );
      return;
    }

    if (matchedFamily && !familyConfirmed) {
      const msg =
        'This information already exists in the system. Please confirm the family information before saving.';
      setFormError(msg);
      Alert.alert('Confirm Family Information', msg);
      return;
    }

    const { message: validationError, errors } =
      validateForm();

    if (validationError) {
      setFormError(validationError);
      setFieldErrors(errors);

      const errorCount =
        Object.keys(errors).length;

      Alert.alert(
        'Validation Error',
        errorCount > 1
          ? `${validationError}\n\n(${errorCount} fields need attention — see highlighted fields below.)`
          : validationError
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
      const msg =
        'Selected caste category was not found. Please re-select it from the list.';

      setFormError(msg);

      setFieldErrors({
        casteCategoryId: msg,
      });

      Alert.alert(
        'Validation Error',
        msg
      );

      return;
    }

    if (!selectedGender) {
      const msg =
        'Selected gender was not found. Please re-select it from the list.';

      setFormError(msg);

      setFieldErrors({
        genderId: msg,
      });

      Alert.alert(
        'Validation Error',
        msg
      );

      return;
    }

    /*
     * IMPORTANT:
     *
     * family_id is NOT selected in this form.
     *
     * studentService will check ALL available contacts:
     * Student + Father + Mother + Guardian.
     *
     * If any contact matches one existing family,
     * that family_id is reused.
     * If contacts point to different families,
     * the service returns a conflict instead of guessing.
     */

    const payload: CreateStudentInput = {
      mva_id:
        mvaId.trim(),

      family_id: matchedFamily?.family.id ?? editStudent?.family_id ?? null,

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

      /* Student residential address */
      // NOTE: city is collected by the UI but is intentionally not sent yet.
      // The students table/service must first expose a dedicated city column.
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

      /* Student contact */
      student_email:
        studentEmail.trim() ||
        null,

      student_mobile:
        studentMobile.trim() ||
        null,

      /* Father / parent */
      father_name:
        isGuardian ? null : fatherName.trim() || null,
      father_mobile:
        isGuardian ? null : fatherMobile.trim() || null,
      father_email:
        isGuardian ? null : fatherEmail.trim() || null,
      father_occupation:
        isGuardian ? null : fatherOccupation.trim() || null,

      /* Mother / parent */
      mother_name:
        isGuardian ? null : motherName.trim() || null,
      mother_mobile:
        isGuardian ? null : motherMobile.trim() || null,
      mother_email:
        isGuardian ? null : motherEmail.trim() || null,
      mother_occupation:
        isGuardian ? null : motherOccupation.trim() || null,

      /* Guardian */
      guardian_name:
        isGuardian ? guardianName.trim() || null : null,
      guardian_mobile:
        isGuardian ? guardianMobile.trim() || null : null,
      guardian_email:
        isGuardian ? guardianEmail.trim() || null : null,
      guardian_relation:
        isGuardian ? guardianRelation.trim() || null : null,

      /* Family address */
      family_address:
        familyAddress.trim() ||
        null,
      family_city:
        familyCity.trim() ||
        null,
      family_state:
        familyState.trim() ||
        null,
      family_pincode:
        familyPincode.trim() ||
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

      const saved = isEditMode
        ? await updateStudent(Number(editStudent!.id), {
            ...payload,
            family_id: editStudent!.family_id ?? null,
          })
        : await createStudent(payload);

      console.log(
        isEditMode ? 'STUDENT UPDATED:' : 'STUDENT CREATED:',
        saved
      );

      if (studentPhoto?.uri) {
        const photoPath = await uploadStudentPhoto(
          Number(saved.id),
          studentPhoto.uri,
          studentPhoto.mimeType
        );

        console.log('STUDENT PHOTO SAVED:', photoPath);
      }

      Alert.alert(
        'Success',
        isEditMode
          ? (studentPhoto?.uri ? 'Student and photo updated successfully.' : 'Student updated successfully.')
          : (studentPhoto?.uri ? 'Student and photo saved successfully.' : 'Student created successfully.')
      );

      onBack();
    } catch (error) {
      console.error(
        isEditMode ? 'UPDATE STUDENT ERROR:' : 'CREATE STUDENT ERROR:',
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : 'Unable to create student. Please check your connection and try again.';

      setFormError(message);

      Alert.alert(
        isEditMode ? 'Update Student Error' : 'Create Student Error',
        message
      );
    } finally {
      setSubmitting(false);
    }
  }

  

  const formatAadhaar = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 12);

    return digits.replace(
      /(\d{4})(\d{4})(\d{0,4})/,
      (_, first, second, third) =>
        third
          ? `${first}-${second}-${third}`
          : second
            ? `${first}-${second}`
            : first
    );
  };

  const handlePickStudentPhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow photo library permission to select a student photo.'
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];

      if (!asset?.uri) {
        Alert.alert(
          'Photo Error',
          'Selected image could not be read.'
        );
        return;
      }

      setStudentPhoto(asset);
    } catch (error) {
      console.error('PHOTO PICKER ERROR:', error);

      Alert.alert(
        'Error',
        'Unable to select student photo.'
      );
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  if (loadingEditData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1C3358" />
        <Text style={{ marginTop: 12, color: '#64748B' }}>Loading student information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, minWidth: 0 }}>
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
                {isEditMode ? 'Edit Student' : 'Add Student'}
              </Text>

              <Text style={styles.subtitle}>
                {isEditMode
                  ? 'Update existing student information'
                  : 'Create a new student record'}
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

          <Text style={inline.sectionSubtitle}>
            Fields marked with{' '}
            <Text style={inline.requiredMark}>
              *
            </Text>{' '}
            are required.
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
              error={fieldErrors.mvaId}
            >
              <TextInput
                value={mvaId}
                onChangeText={value => setMvaId(value.replace(/[^A-Za-z0-9]/g, ""))}
                placeholder="MVA26SRCM01"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                style={[
                  styles.input,
                  fieldErrors.mvaId &&
                    inline.errorBorder,
                ]}
              />
            </Field>

            <Field
              label="First Name *"
              isMobile={isMobile}
              error={fieldErrors.firstName}
            >
              <TextInput
                value={firstName}
                onChangeText={value => setFirstName(onlyLetters(value))}
                placeholder="First name"
                placeholderTextColor="#94A3B8"
                style={[
                  styles.input,
                  fieldErrors.firstName &&
                    inline.errorBorder,
                ]}
              />
            </Field>

            <Field
              label="Middle Name *"
              isMobile={isMobile}
              error={fieldErrors.middleName}
            >
              <TextInput
                value={middleName}
                onChangeText={value => setMiddleName(onlyLetters(value))}
                placeholder="Middle name"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </Field>

            <Field
              label="Last Name *"
              isMobile={isMobile}
              error={fieldErrors.lastName}
            >
              <TextInput
                value={lastName}
                onChangeText={value => setLastName(onlyLetters(value))}
                placeholder="Last name"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </Field>

            <Field
              label="Date of Birth *"
              isMobile={isMobile}
              error={fieldErrors.dateOfBirth}
            >
              <DatePickerField
                value={dateOfBirth}
                onChange={setDateOfBirth}
                placeholder="Select date of birth"
                maximumDate={new Date()}
                hasError={!!fieldErrors.dateOfBirth}
              />
            </Field>

            <Field
              label="Date of Admission *"
              isMobile={isMobile}
              error={fieldErrors.dateOfAdmission}
            >
              <DatePickerField
                value={dateOfAdmission}
                onChange={setDateOfAdmission}
                placeholder="Select date of admission"
                hasError={!!fieldErrors.dateOfAdmission}
              />
            </Field>

            <Field
              label="Academic Year *"
              isMobile={isMobile}
              error={fieldErrors.academicYear}
            >
              <TextInput
                value={academicYear}
                editable={false}
                placeholder="2026-27"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </Field>

            <Field
              label="Joining Class *"
              isMobile={isMobile}
              error={fieldErrors.joiningClass}
            >
              <View style={styles.selectContainer}>
                <Picker
                  selectedValue={joiningClass}
                  onValueChange={(value) => setJoiningClass(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Joining Class" value="" />

                  {classes.map((item) => (
                    <Picker.Item
                      key={item.id}
                      label={item.class_name}
                      value={item.class_name}
                    />
                ))}
              </Picker>
            </View>
            </Field>
          </View>
        </View>

        {/* STUDENT CONTACT */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Student Contact Information
          </Text>

          <Text style={inline.sectionSubtitle}>
            These contact details belong to the student. They are stored in the student record.
          </Text>

          <View
            style={[
              styles.grid,
              isMobile && styles.gridMobile,
            ]}
          >
            <Field
              label="Student Mobile *"
              isMobile={isMobile}
              error={fieldErrors.studentMobile}
            >
              <TextInput
                value={studentMobile}
                onChangeText={value => {
                  resetFamilyConfirmation();
                  setStudentMobile(onlyDigits(value, 10));
                }}
                placeholder="Student mobile number"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={10}
                style={styles.input}
              />
            </Field>

            <Field
              label="Student Email"
              isMobile={isMobile}
              error={fieldErrors.email}
            >
              <TextInput
                value={studentEmail}
                onChangeText={value => {
                  resetFamilyConfirmation();
                  setStudentEmail(value);
                }}
                placeholder="student@example.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                  styles.input,
                  fieldErrors.email && inline.errorBorder,
                ]}
              />
            </Field>

            {/* Residential address + city stay on one row on tablet.
                On mobile, the existing responsive Field styles stack them. */}
            <View
              style={{
                flexDirection: isMobile ? 'column' : 'row',
                width: '100%',
                gap: isMobile ? 0 : 14,
              }}
            >
              <View style={{ flex: isMobile ? undefined : 2 }}>
                <Field
                  label="Student Residential Address *"
                  isMobile={isMobile}
                  error={fieldErrors.address}
                >
                  <TextInput
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Student residential address"
                    placeholderTextColor="#94A3B8"
                    multiline
                    style={[
                      styles.input,
                      styles.textArea,
                    ]}
                  />
                </Field>
              </View>

              <View style={{ flex: isMobile ? undefined : 1 }}>
                <Field
                  label="Student City *"
                  isMobile={isMobile}
                  error={fieldErrors.city}
                >
                  <TextInput
                    value={city}
                    onChangeText={value => setCity(onlyLetters(value))}
                    placeholder="City"
                    placeholderTextColor="#94A3B8"
                    style={styles.input}
                  />
                </Field>
              </View>
            </View>

            <Field
              label="Student Pincode *"
              isMobile={isMobile}
              error={fieldErrors.pincode}
            >
              <TextInput
                value={pincode}
                onChangeText={value => setPincode(onlyDigits(value, 6))}
                maxLength={6}
                placeholder="461228"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                style={styles.input}
              />
            </Field>
          </View>
        </View>

        {/* FAMILY / PARENT / GUARDIAN */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Family & Parent Information
          </Text>

          <Text style={inline.sectionSubtitle}>
            Any student, father, mother, or guardian email/mobile can be used to find an existing family.
          </Text>

          {checkingFamily ? (
            <View style={{
              marginBottom: 14,
              padding: 12,
              borderRadius: 10,
              backgroundColor: '#F8FAFC',
              borderWidth: 1,
              borderColor: '#E2E8F0',
            }}>
              <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '600' }}>
                Checking existing family information...
              </Text>
            </View>
          ) : null}

          {familyMatchConflict ? (
            <View style={{
              marginBottom: 14,
              padding: 14,
              borderRadius: 10,
              backgroundColor: '#FEF2F2',
              borderWidth: 1,
              borderColor: '#FCA5A5',
            }}>
              <Text style={{ color: '#B91C1C', fontWeight: '800', fontSize: 14 }}>
                Information Conflict
              </Text>
              <Text style={{ color: '#991B1B', marginTop: 5, lineHeight: 20 }}>
                Please check the details again. The entered information may belong to another family.
              </Text>
            </View>
          ) : matchedFamily ? (
            <View style={{
              marginBottom: 14,
              padding: 14,
              borderRadius: 10,
              backgroundColor: familyConfirmed ? '#F0FDF4' : '#EFF6FF',
              borderWidth: 1,
              borderColor: familyConfirmed ? '#86EFAC' : '#93C5FD',
            }}>
              <Text style={{ color: familyConfirmed ? '#166534' : '#1D4ED8', fontWeight: '800', fontSize: 14 }}>
                This information already exists in the system.
              </Text>
              <Text style={{ color: '#334155', marginTop: 5 }}>
                Family ID: {matchedFamily.family.id}
              </Text>
              <Text style={{ color: '#64748B', marginTop: 3 }}>
                Matching contact: {matchedFamily.matchedBy.join(', ')}
              </Text>

              {!familyConfirmed ? (
                <Pressable
                  onPress={() => setFamilyConfirmed(true)}
                  style={{
                    marginTop: 12,
                    minHeight: 42,
                    paddingHorizontal: 14,
                    borderRadius: 9,
                    backgroundColor: '#1C3358',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>
                    Confirm Family Information
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => setFamilyConfirmed(false)}
                  style={{
                    marginTop: 12,
                    minHeight: 40,
                    paddingHorizontal: 14,
                    borderRadius: 9,
                    borderWidth: 1,
                    borderColor: '#CBD5E1',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <Text style={{ color: '#1C3358', fontWeight: '800' }}>
                    Change Family Information
                  </Text>
                </Pressable>
              )}
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>
            Parent / Guardian
          </Text>

          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchTitle}>
                Guardian instead of Parent
              </Text>
              <Text style={styles.switchSubtitle}>
                Turn this on if father/mother information is not available.
              </Text>
            </View>

            <Switch
              value={isGuardian}
              onValueChange={value => {
                resetFamilyConfirmation();
                setIsGuardian(value);
              }}
              disabled={familyFieldsLocked}
              trackColor={{
                false: '#CBD5E1',
                true: '#94A3B8',
              }}
              thumbColor={isGuardian ? '#1C3358' : '#FFFFFF'}
            />
          </View>

          {!isGuardian ? (
            <View
              style={[
                styles.grid,
                isMobile && styles.gridMobile,
              ]}
            >
              <Field label="Father Name *" isMobile={isMobile} error={fieldErrors.fatherName}>
                <TextInput
                  value={fatherName}
                  editable={!familyFieldsLocked}
                  onChangeText={value => setFatherName(onlyLetters(value))}
                  placeholder="Father name"
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                />
              </Field>

              <Field label="Father Mobile *" isMobile={isMobile} error={fieldErrors.fatherMobile}>
                <TextInput
                  value={fatherMobile}
                  editable={!familyFieldsLocked}
                  onChangeText={value => setFatherMobile(onlyDigits(value, 10))}
                  placeholder="Father mobile number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={10}
                  style={styles.input}
                />
              </Field>

              <Field label="Father Email *" isMobile={isMobile} error={fieldErrors.fatherEmail}>
                <TextInput
                  value={fatherEmail}
                  editable={!familyFieldsLocked}
                  onChangeText={setFatherEmail}
                  placeholder="father@example.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </Field>

              <Field label="Father Occupation *" isMobile={isMobile} error={fieldErrors.fatherOccupation}>
                <TextInput
                  value={fatherOccupation}
                  editable={!familyFieldsLocked}
                  onChangeText={value => setFatherOccupation(onlyLetters(value))}
                  placeholder="Father occupation"
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                />
              </Field>

              <Field label="Mother Name *" isMobile={isMobile} error={fieldErrors.motherName}>
                <TextInput
                  value={motherName}
                  editable={!familyFieldsLocked}
                  onChangeText={value => setMotherName(onlyLetters(value))}
                  placeholder="Mother name"
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                />
              </Field>

              <Field label="Mother Mobile *" isMobile={isMobile} error={fieldErrors.motherMobile}>
                <TextInput
                  value={motherMobile}
                  editable={!familyFieldsLocked}
                  onChangeText={value => setMotherMobile(onlyDigits(value, 10))}
                  placeholder="Mother mobile number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={10}
                  style={styles.input}
                />
              </Field>

              <Field label="Mother Email *" isMobile={isMobile} error={fieldErrors.motherEmail}>
                <TextInput
                  value={motherEmail}
                  editable={!familyFieldsLocked}
                  onChangeText={setMotherEmail}
                  placeholder="mother@example.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </Field>

              <Field label="Mother Occupation *" isMobile={isMobile} error={fieldErrors.motherOccupation}>
                <TextInput
                  value={motherOccupation}
                  editable={!familyFieldsLocked}
                  onChangeText={value => setMotherOccupation(onlyLetters(value))}
                  placeholder="Mother occupation"
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                />
              </Field>
            </View>
          ) : (
            <View
              style={[
                styles.grid,
                isMobile && styles.gridMobile,
              ]}
            >
              <Field label="Guardian Name *" isMobile={isMobile} error={fieldErrors.guardianName}>
                <TextInput
                  value={guardianName}
                  editable={!familyFieldsLocked}
                  onChangeText={value => setGuardianName(onlyLetters(value))}
                  placeholder="Guardian name"
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                />
              </Field>

              <Field label="Guardian Mobile *" isMobile={isMobile} error={fieldErrors.guardianMobile}>
                <TextInput
                  value={guardianMobile}
                  editable={!familyFieldsLocked}
                  onChangeText={value => setGuardianMobile(onlyDigits(value, 10))}
                  placeholder="Guardian mobile number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={10}
                  style={styles.input}
                />
              </Field>

              <Field label="Guardian Email *" isMobile={isMobile} error={fieldErrors.guardianEmail}>
                <TextInput
                  value={guardianEmail}
                  editable={!familyFieldsLocked}
                  onChangeText={setGuardianEmail}
                  placeholder="guardian@example.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </Field>

              <Field label="Guardian Relation *" isMobile={isMobile} error={fieldErrors.guardianRelation}>
                <TextInput
                  value={guardianRelation}
                  editable={!familyFieldsLocked}
                  onChangeText={value => setGuardianRelation(onlyLetters(value))}
                  placeholder="Uncle, Aunt, Grandfather"
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                />
              </Field>
            </View>
          )}

          <Text style={styles.sectionTitle}>
            Family Address
          </Text>

          <Text style={inline.sectionSubtitle}>
            This is the parent/family address. It is separate from the student's residential address above.
          </Text>

          <View
            style={[
              styles.grid,
              isMobile && styles.gridMobile,
            ]}
          >
            <Field label="Family Address *" isMobile={isMobile} error={fieldErrors.familyAddress}>
              <TextInput
                value={familyAddress}
                editable={!familyFieldsLocked}
                onChangeText={setFamilyAddress}
                placeholder="Family / parent address"
                placeholderTextColor="#94A3B8"
                multiline
                style={[
                  styles.input,
                  styles.textArea,
                ]}
              />
            </Field>

            <Field label="Family City *" isMobile={isMobile} error={fieldErrors.familyCity}>
              <TextInput
                value={familyCity}
                editable={!familyFieldsLocked}
                onChangeText={value => setFamilyCity(onlyLetters(value))}
                placeholder="City"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </Field>

            <Field label="Family State *" isMobile={isMobile} error={fieldErrors.familyState}>
              <TextInput
                value={familyState}
                editable={!familyFieldsLocked}
                onChangeText={value => setFamilyState(onlyLetters(value))}
                placeholder="State"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </Field>

            <Field label="Family Pincode *" isMobile={isMobile} error={fieldErrors.familyPincode}>
              <TextInput
                value={familyPincode}
                editable={!familyFieldsLocked}
                onChangeText={value => setFamilyPincode(onlyDigits(value, 6))}
                maxLength={6}
                placeholder="Pincode"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
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
              error={fieldErrors.studentType}
            >
              <View style={styles.selectContainer}>
                <Picker
                  selectedValue={studentType}
                  onValueChange={(value) => {
                    setStudentType(value);
                  }}
                  style={styles.picker}
                >
                  <Picker.Item
                    label="Select student type"
                    value=""
                  />

                  <Picker.Item
                    label="DAY_BOARDER"
                    value="DAY_BOARDER"
                  />

                  <Picker.Item
                    label="HOSTELER"
                    value="HOSTELER"
                  />
                </Picker>
              </View>
            </Field>

            <Field
              label="Previous School *"
              isMobile={isMobile}
              error={fieldErrors.previousSchool}
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
              label="Nationality *"
              isMobile={isMobile}
              error={fieldErrors.nationality}
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
              label="Aadhaar Number *"
              isMobile={isMobile}
              error={fieldErrors.aadhaar}
            >
              <TextInput
                value={formatAadhaar(aadhaar)}
                onChangeText={value => {
                  const digits = value
                    .replace(/\D/g, '')
                    .slice(0, 12);

                  setAadhaar(digits);
                }}
                maxLength={14}
                placeholder="1234-5678-9012"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
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
                error={
                  fieldErrors.casteCategoryId
                }
              >
                <View
                  style={[
                    styles.selectContainer,
                    fieldErrors.casteCategoryId &&
                      inline.errorBorder,
                  ]}
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
                error={fieldErrors.genderId}
              >
                <View
                  style={[
                    styles.selectContainer,
                    fieldErrors.genderId &&
                      inline.errorBorder,
                  ]}
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
                label="Caste *"
                isMobile={isMobile}
                error={fieldErrors.caste}
              >
                <TextInput
                  value={caste}
                  onChangeText={value => setCaste(onlyLetters(value))}
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
              error={fieldErrors.status}
              helperText={
                !fieldErrors.status
                  ? `Allowed: ${ALLOWED_STATUS.join(', ')}`
                  : undefined
              }
            >
              <View
                style={[
                  styles.selectContainer,
                  fieldErrors.status && inline.errorBorder,
                ]}
              >
                <Picker
                  selectedValue={status}
                  onValueChange={value =>
                    setStatus(value as StatusValue)
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Select status" value="" />
                  <Picker.Item label="Pending" value="PENDING" />
                  <Picker.Item label="Active" value="ACTIVE" />
                  <Picker.Item label="Withdrawn" value="WITHDRAWN" />
                  <Picker.Item label="Alumni" value="ALUMNI" />
                  <Picker.Item label="Inactive" value="INACTIVE" />
                </Picker>
              </View>
            </Field>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Student Photo
          </Text>

          <Pressable
            onPress={handlePickStudentPhoto}
            style={({ pressed }) => ({
              height: 50,
              borderWidth: 1,
              borderColor: '#CBD5E1',
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: pressed ? '#F8FAFC' : '#FFFFFF',
            })}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#2563EB',
              }}
            >
              {studentPhoto ? 'Change Student Photo' : 'Select Student Photo'}
            </Text>
          </Pressable>

          {studentPhoto?.uri ? (
            <Image
              source={{ uri: studentPhoto.uri }}
              style={{
                width: 150,
                height: 150,
                borderRadius: 12,
                marginTop: 12,
                alignSelf: 'center',
                backgroundColor: '#F1F5F9',
              }}
              resizeMode="cover"
            />
          ) : null}

          <Text style={inline.helperText}>
            Supported: JPG, PNG, WebP
          </Text>
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
                {isEditMode ? 'Update Student' : 'Create Student'}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
      </View>
    </View>
  );
}