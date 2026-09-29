import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';

import { supabase } from '../../lib/supabase';
import { getCurrentUser } from '../../services/authService';

type Props = {
  studentId: number;
  onBack: () => void;
};

type Student = {
  id: number;
  mva_id: string;
  family_id: number | null;
  first_name: string;
  middle_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  gender_id: number | null;
  date_of_admission: string | null;
  joining_academic_year: string | null;
  joining_class: string | null;
  class_residential_address: string | null;
  pincode: string | null;
  student_type: string;
  previous_school: string | null;
  nationality: string | null;
  staff_child: boolean | null;
  caste_category_id: number | null;
  caste: string | null;
  student_image: string | null;
  email: string | null;
  mobile: string | null;
  status: string | null;
};

type Family = Record<string, any>;
type Related = Record<string, any>;

const value = (v: any) => {
  if (v === null || v === undefined || v === '') return 'Not available';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  return String(v);
};

const dateValue = (v: string | null) => {
  if (!v) return 'Not available';
  const d = new Date(`${v}T00:00:00`);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString();
};

const nameOf = (s: Student) =>
  [s.first_name, s.middle_name, s.last_name]
    .filter(Boolean)
    .join(' ');

const initials = (s: Student) => {
  const p = nameOf(s).trim().split(/\s+/).filter(Boolean);
  return p.length === 1
    ? p[0][0].toUpperCase()
    : `${p[0][0]}${p[p.length - 1][0]}`.toUpperCase();
};

function Row({ label, value: v }: { label: string; value: any }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value(v)}</Text>
    </View>
  );
}

function DynamicRows({ record }: { record: Related | null }) {
  if (!record) {
    return <Text style={styles.empty}>No information available.</Text>;
  }

  const entries = Object.entries(record).filter(
    ([, v]) => v !== null && v !== undefined && v !== '',
  );

  if (!entries.length) {
    return <Text style={styles.empty}>No information available.</Text>;
  }

  return (
    <View style={styles.grid}>
      {entries.map(([key, v]) => (
        <Row
          key={key}
          label={key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          value={typeof v === 'object' ? JSON.stringify(v) : v}
        />
      ))}
    </View>
  );
}

function Section({
  title,
  children,
  openByDefault = false,
}: {
  title: string;
  children: React.ReactNode;
  openByDefault?: boolean;
}) {
  const [open, setOpen] = useState(openByDefault);

  return (
    <View style={styles.section}>
      <Pressable
        onPress={() => setOpen(v => !v)}
        style={styles.sectionHeader}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.plus}>{open ? '−' : '+'}</Text>
      </Pressable>
      {open && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
}

export default function ParentStudentProfile({
  studentId,
  onBack,
}: Props) {
  const { width } = useWindowDimensions();
  const mobile = width < 700;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [student, setStudent] = useState<Student | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [hostel, setHostel] = useState<Related | null>(null);
  const [health, setHealth] = useState<Related | null>(null);
  const [bank, setBank] = useState<Related | null>(null);
  const [gender, setGender] = useState('');
  const [casteCategory, setCasteCategory] = useState('');
  const [className, setClassName] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [classDetail, setClassDetail] = useState<Related | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError('');

        const current = await getCurrentUser();

        if (
          !current ||
          (current.role !== 'PARENT' && current.role !== 'FAMILY')
        ) {
          throw new Error('Parent session is not available.');
        }

        const familyId = current.profile.family_id;

        if (!familyId) {
          throw new Error('Your account is not linked to a family.');
        }

        // Both id and family_id are required. RLS also enforces family access.
        const studentResult = await supabase
          .from('students')
          .select(`
            id, mva_id, family_id, first_name, middle_name, last_name,
            date_of_birth, gender_id, date_of_admission,
            joining_academic_year, joining_class,
            class_residential_address, pincode, student_type,
            previous_school, nationality, staff_child,
            caste_category_id, caste, student_image, email, mobile, status
          `)
          .eq('id', studentId)
          .eq('family_id', familyId)
          .maybeSingle();

        if (studentResult.error) {
          throw new Error(
            `Unable to load student profile: ${studentResult.error.message}`,
          );
        }

        if (!studentResult.data) {
          throw new Error(
            'This student is not linked to your family account.',
          );
        }

        const s = studentResult.data as Student;

        const [
          familyResult,
          genderResult,
          casteResult,
          classResult,
          hostelResult,
          healthResult,
          bankResult,
        ] = await Promise.all([
          supabase.from('families').select(`
            id, family_name,
            father_name, father_mobile, father_email, father_occupation,
            mother_name, mother_mobile, mother_email, mother_occupation,
            guardian_name, guardian_mobile, guardian_email, guardian_relation,
            address, city, state, pincode
          `).eq('id', familyId).maybeSingle(),

          s.gender_id
            ? supabase.from('genders').select('id, gender_name')
                .eq('id', s.gender_id).maybeSingle()
            : Promise.resolve({ data: null, error: null }),

          s.caste_category_id
            ? supabase.from('caste_categories').select('id, category_name')
                .eq('id', s.caste_category_id).maybeSingle()
            : Promise.resolve({ data: null, error: null }),

          supabase.from('student_class_details').select(`
            id, academic_year_id, class_id, section_id,
            class_teacher_id, roll_number, joining_class, class_teacher_name
          `).eq('student_id', studentId)
            .order('academic_year_id', { ascending: false })
            .limit(1).maybeSingle(),

          supabase.from('student_hostel_details').select('*')
            .eq('student_id', studentId)
            .order('academic_year_id', { ascending: false })
            .limit(1).maybeSingle(),

          supabase.from('student_health').select('*')
            .eq('student_id', studentId).maybeSingle(),

          supabase.from('student_bank_details').select('*')
            .eq('student_id', studentId).maybeSingle(),
        ]);

        const detail = classResult.data as Related | null;

        let classNameValue = '';
        let sectionNameValue = '';

        if (detail) {
          const [c, sec] = await Promise.all([
            supabase.from('classes').select('class_name')
              .eq('id', detail.class_id).maybeSingle(),
            supabase.from('sections').select('section_name')
              .eq('id', detail.section_id).maybeSingle(),
          ]);
          classNameValue = c.data?.class_name ?? '';
          sectionNameValue = sec.data?.section_name ?? '';
        }

        let signedPhoto: string | null = null;
        if (s.student_image) {
          const result = await supabase.storage
            .from('st_photos')
            .createSignedUrl(s.student_image, 60 * 60);
          signedPhoto = result.data?.signedUrl ?? null;
        }

        if (!cancelled) {
          setStudent(s);
          setFamily(familyResult.data);
          setGender(genderResult.data?.gender_name ?? '');
          setCasteCategory(casteResult.data?.category_name ?? '');
          setClassDetail(detail);
          setClassName(classNameValue);
          setSectionName(sectionNameValue);
          setHostel(hostelResult.data);
          setHealth(healthResult.data);
          setBank(bankResult.data);
          setPhotoUrl(signedPhoto);
        }
      } catch (e) {
        console.error('PARENT STUDENT PROFILE ERROR:', e);
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Unable to load profile.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading student profile...</Text>
      </View>
    );
  }

  if (error || !student) {
    return (
      <View style={styles.center}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Unable to open profile</Text>
          <Text style={styles.errorText}>
            {error || 'Student profile not found.'}
          </Text>
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back to Parent Portal</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          mobile && styles.mobileContent,
        ]}
      >
        <Pressable onPress={onBack} style={styles.backLink}>
          <Text style={styles.backLinkText}>‹ Back to Parent Portal</Text>
        </Pressable>

        <View style={[styles.hero, mobile && styles.heroMobile]}>
          <View style={styles.avatar}>
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials(student)}</Text>
            )}
          </View>

          <View style={styles.heroInfo}>
            <Text style={styles.name}>{nameOf(student)}</Text>
            <Text style={styles.mva}>MVA ID · {student.mva_id}</Text>
            <View style={styles.badges}>
              <Text style={styles.badge}>{student.student_type}</Text>
              {student.status ? (
                <Text style={styles.status}>{student.status}</Text>
              ) : null}
            </View>
          </View>
        </View>

        <Section title="Basic Information" openByDefault>
          <View style={styles.grid}>
            <Row label="MVA ID" value={student.mva_id} />
            <Row label="First Name" value={student.first_name} />
            <Row label="Middle Name" value={student.middle_name} />
            <Row label="Last Name" value={student.last_name} />
            <Row label="Date of Birth" value={dateValue(student.date_of_birth)} />
            <Row label="Gender" value={gender} />
            <Row label="Date of Admission" value={dateValue(student.date_of_admission)} />
            <Row label="Joining Academic Year" value={student.joining_academic_year} />
            <Row label="Joining Class" value={student.joining_class} />
            <Row label="Student Type" value={student.student_type} />
            <Row label="Residential Address" value={student.class_residential_address} />
            <Row label="Pincode" value={student.pincode} />
            <Row label="Previous School" value={student.previous_school} />
            <Row label="Nationality" value={student.nationality} />
            <Row label="Staff Child" value={student.staff_child} />
            <Row label="Caste Category" value={casteCategory} />
            <Row label="Caste" value={student.caste} />
            <Row label="Email" value={student.email} />
            <Row label="Mobile" value={student.mobile} />
            <Row label="Status" value={student.status} />
          </View>

          <View style={styles.subBlock}>
            <Text style={styles.subTitle}>Current Class Details</Text>
            <View style={styles.grid}>
              <Row label="Class" value={className} />
              <Row label="Section" value={sectionName} />
              <Row label="Roll Number" value={classDetail?.roll_number} />
              <Row label="Class Teacher" value={classDetail?.class_teacher_name} />
            </View>
          </View>
        </Section>

        <Section title="Hostel Information">
          <DynamicRows record={hostel} />
        </Section>

        <Section title="Health Information">
          <DynamicRows record={health} />
        </Section>

        <Section title="Family Information">
          {family ? (
            <View style={styles.grid}>
              <Row label="Family" value={family.family_name} />
              <Row label="Father" value={family.father_name} />
              <Row label="Father Mobile" value={family.father_mobile} />
              <Row label="Father Email" value={family.father_email} />
              <Row label="Father Occupation" value={family.father_occupation} />
              <Row label="Mother" value={family.mother_name} />
              <Row label="Mother Mobile" value={family.mother_mobile} />
              <Row label="Mother Email" value={family.mother_email} />
              <Row label="Mother Occupation" value={family.mother_occupation} />
              <Row label="Guardian" value={family.guardian_name} />
              <Row label="Guardian Mobile" value={family.guardian_mobile} />
              <Row label="Guardian Email" value={family.guardian_email} />
              <Row label="Guardian Relation" value={family.guardian_relation} />
              <Row label="Family Address" value={family.address} />
              <Row label="City" value={family.city} />
              <Row label="State" value={family.state} />
              <Row label="Family Pincode" value={family.pincode} />
            </View>
          ) : (
            <Text style={styles.empty}>No family information available.</Text>
          )}
        </Section>

        <Section title="Bank Details">
          <DynamicRows record={bank} />
        </Section>

        <View style={styles.readOnly}>
          <Text style={styles.readOnlyTitle}>Read-only profile</Text>
          <Text style={styles.readOnlyText}>
            Student information can only be changed by authorized academy staff.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 20, backgroundColor: '#F3F4F6',
  },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 14 },
  content: {
    width: '100%', maxWidth: 1300, alignSelf: 'center',
    padding: 28, paddingBottom: 60,
  },
  mobileContent: { padding: 16 },
  backLink: { alignSelf: 'flex-start', marginBottom: 16 },
  backLinkText: { color: '#2563EB', fontSize: 14, fontWeight: '700' },
  hero: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: '#E5E7EB',
    flexDirection: 'row', alignItems: 'center', marginBottom: 20,
  },
  heroMobile: { padding: 18 },
  avatar: {
    width: 92, height: 92, borderRadius: 46,
    backgroundColor: '#DBEAFE', alignItems: 'center',
    justifyContent: 'center', overflow: 'hidden', marginRight: 20,
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { color: '#2563EB', fontSize: 30, fontWeight: '900' },
  heroInfo: { flex: 1 },
  name: { fontSize: 28, fontWeight: '900', color: '#111827' },
  mva: { marginTop: 6, color: '#6B7280', fontSize: 13 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  badge: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 7,
    backgroundColor: '#EFF6FF', color: '#1D4ED8',
    fontSize: 11, fontWeight: '800',
  },
  status: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 7,
    backgroundColor: '#F3F4F6', color: '#374151',
    fontSize: 11, fontWeight: '800',
  },
  section: {
    backgroundColor: '#FFF', borderRadius: 14,
    borderWidth: 1, borderColor: '#E5E7EB',
    marginBottom: 16, overflow: 'hidden',
  },
  sectionHeader: {
    minHeight: 64, paddingHorizontal: 20, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  plus: { fontSize: 25, color: '#2563EB' },
  sectionBody: {
    borderTopWidth: 1, borderTopColor: '#F1F5F9', padding: 20,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  row: { width: '31%', minWidth: 220, marginBottom: 4 },
  label: { fontSize: 11, color: '#6B7280', marginBottom: 5 },
  value: { fontSize: 14, lineHeight: 20, color: '#111827', fontWeight: '600' },
  subBlock: {
    marginTop: 22, paddingTop: 20,
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  subTitle: {
    fontSize: 15, fontWeight: '800',
    color: '#374151', marginBottom: 16,
  },
  empty: { color: '#6B7280', fontSize: 13, lineHeight: 20 },
  errorCard: {
    width: '100%', maxWidth: 560, backgroundColor: '#FFF',
    borderRadius: 14, padding: 24,
    borderWidth: 1, borderColor: '#FECACA',
  },
  errorTitle: { fontSize: 18, fontWeight: '800', color: '#991B1B' },
  errorText: { marginTop: 8, color: '#7F1D1D', fontSize: 14, lineHeight: 21 },
  backButton: {
    alignSelf: 'flex-start', marginTop: 18,
    paddingHorizontal: 15, paddingVertical: 10,
    borderRadius: 8, backgroundColor: '#2563EB',
  },
  backButtonText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  readOnly: {
    backgroundColor: '#EFF6FF', borderRadius: 12,
    borderWidth: 1, borderColor: '#BFDBFE',
    padding: 16, marginTop: 4,
  },
  readOnlyTitle: { color: '#1E3A8A', fontSize: 13, fontWeight: '800' },
  readOnlyText: {
    marginTop: 5, color: '#475569',
    fontSize: 12, lineHeight: 18,
  },
});
