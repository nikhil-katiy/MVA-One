import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {supabase} from '../../lib/supabase';

type Family = {
  id: number;
  family_name: string | null;
  father_name: string | null;
  father_mobile: string | null;
  father_occupation: string | null;
  mother_name: string | null;
  mother_mobile: string | null;
  mother_occupation: string | null;
  guardian_name: string | null;
  guardian_mobile: string | null;
  guardian_relation: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
};

type Student = {
  id: number;
  mvaid: string;
  first_name: string;
  middle_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  section: string | null;
  gender: string | null;
  academic_year: string | null;
  joining_class: string | null;
  email: string | null;
  mobile: string | null;
  family_id: number | null;
  families: Family | null;
};

type StudentListProps = {
  onBack: () => void;
};

const StudentList = ({onBack}: StudentListProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [search, setSearch] = useState('');

  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);

  const getStudents = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      console.log('================================');
      console.log('STUDENT LIST: GET STARTED');
      console.log('================================');

      const {data, error} = await supabase
        .from('students')
        .select(`
          id,
          mvaid,
          first_name,
          middle_name,
          last_name,
          date_of_birth,
          section,
          gender,
          academic_year,
          joining_class,
          email,
          mobile,
          family_id,
          families (
            id,
            family_name,
            father_name,
            father_mobile,
            father_occupation,
            mother_name,
            mother_mobile,
            mother_occupation,
            guardian_name,
            guardian_mobile,
            guardian_relation,
            email,
            address,
            city,
            state,
            pincode
          )
        `)
        .order('id', {ascending: true});

      console.log('STUDENT LIST: RESPONSE');
      console.log('DATA:', data);
      console.log('ERROR:', error);

      if (error) {
        setStudents([]);
        setErrorMessage(error.message);

        Alert.alert(
          'GET Students Failed',
          error.message,
        );

        return;
      }

      setStudents((data as Student[]) || []);

      console.log(
        `STUDENT LIST: ${data?.length || 0} STUDENTS LOADED`,
      );
    } catch (error) {
      console.log(
        'STUDENT LIST: EXCEPTION',
        error,
      );

      setStudents([]);

      setErrorMessage(
        'Unable to connect to Supabase.',
      );

      Alert.alert(
        'Connection Error',
        'Unable to connect to Supabase.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('STUDENT LIST: MOUNTED');
    getStudents();
  }, []);

  const getFullName = (student: Student) => {
    return [
      student.first_name,
      student.middle_name,
      student.last_name,
    ]
      .filter(Boolean)
      .join(' ');
  };

  const filteredStudents = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return students;
    }

    return students.filter(student => {
      const family = student.families;

      return [
        getFullName(student),
        student.mvaid,
        student.email,
        student.mobile,
        student.joining_class,
        student.section,
        family?.father_name,
        family?.mother_name,
        family?.father_mobile,
        family?.mother_mobile,
      ]
        .filter(Boolean)
        .some(item =>
          String(item)
            .toLowerCase()
            .includes(value),
        );
    });
  }, [students, search]);

  const maleCount = filteredStudents.filter(
    student =>
      student.gender?.toLowerCase() === 'male',
  ).length;

  const femaleCount = filteredStudents.filter(
    student =>
      student.gender?.toLowerCase() === 'female',
  ).length;

  const otherCount =
    filteredStudents.length -
    maleCount -
    femaleCount;

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>

        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading students...
        </Text>

      </SafeAreaView>
    );
  }

  if (errorMessage) {
    return (
      <SafeAreaView style={styles.errorContainer}>

        <Text style={styles.errorTitle}>
          Unable to Load Students
        </Text>

        <Text style={styles.errorMessage}>
          {errorMessage}
        </Text>

        <View style={styles.errorButtons}>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={getStudents}
            activeOpacity={0.7}>

            <Text style={styles.retryButtonText}>
              RETRY
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backErrorButton}
            onPress={onBack}
            activeOpacity={0.7}>

            <Text style={styles.backErrorButtonText}>
              BACK
            </Text>

          </TouchableOpacity>

        </View>

      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>


      {/* ================= HEADER ================= */}

      <View style={styles.header}>

        <View style={styles.headerLeft}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}>

            <Text style={styles.backButtonText}>
              ←
            </Text>

          </TouchableOpacity>

          <View>

            <Text style={styles.headerTitle}>
              Manage Students
            </Text>

            <Text style={styles.headerSubtitle}>
              View and manage student records
            </Text>

          </View>

        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={getStudents}
          activeOpacity={0.7}>

          <Text style={styles.refreshText}>
            ↻ Refresh
          </Text>

        </TouchableOpacity>

      </View>

      {/* ================= SEARCH ================= */}

      <View style={styles.searchSection}>

        <View style={styles.searchBox}>

          <Text style={styles.searchLabel}>
            Search Students
          </Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Name / MVAID / Mobile / Email..."
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />

        </View>

        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => setSearch('')}
          activeOpacity={0.7}>

          <Text style={styles.clearText}>
            CLEAR
          </Text>

        </TouchableOpacity>

      </View>

      {/* ================= COUNTS ================= */}

      <View style={styles.countContainer}>

        <View style={styles.countBox}>

          <Text style={styles.countText}>
            TOTAL : {filteredStudents.length}
          </Text>

        </View>

        <View style={styles.countBox}>

          <Text style={styles.countText}>
            MALE : {maleCount}
          </Text>

        </View>

        <View style={styles.countBox}>

          <Text style={styles.countText}>
            FEMALE : {femaleCount}
          </Text>

        </View>

        <View
          style={[
            styles.countBox,
            styles.otherCountBox,
          ]}>

          <Text style={styles.countText}>
            OTHERS : {otherCount}
          </Text>

        </View>

      </View>

      {/* ================= TABLE ================= */}

      <ScrollView
        horizontal
        style={styles.tableScroll}
        showsHorizontalScrollIndicator>

        <View style={styles.table}>

          {/* TABLE HEADER */}

          <View style={styles.tableHeader}>

            <Text
              style={[
                styles.headerCell,
                styles.mvaidCell,
              ]}>
              MVAID
            </Text>

            <Text
              style={[
                styles.headerCell,
                styles.nameCell,
              ]}>
              STUDENT NAME
            </Text>

            <Text
              style={[
                styles.headerCell,
                styles.familyCell,
              ]}>
              FATHER NAME
            </Text>

            <Text
              style={[
                styles.headerCell,
                styles.familyCell,
              ]}>
              MOTHER NAME
            </Text>

            <Text
              style={[
                styles.headerCell,
                styles.mobileCell,
              ]}>
              FATHER MOBILE
            </Text>

            <Text
              style={[
                styles.headerCell,
                styles.mobileCell,
              ]}>
              MOTHER MOBILE
            </Text>

            <Text
              style={[
                styles.headerCell,
                styles.classCell,
              ]}>
              CLASS
            </Text>

            <Text
              style={[
                styles.headerCell,
                styles.sectionCell,
              ]}>
              SECTION
            </Text>

            <Text
              style={[
                styles.headerCell,
                styles.genderCell,
              ]}>
              GENDER
            </Text>

            <Text
              style={[
                styles.headerCell,
                styles.actionCell,
              ]}>
              ACTION
            </Text>

          </View>

          {/* TABLE ROWS */}

          {filteredStudents.length === 0 ? (

            <View style={styles.emptyContainer}>

              <Text style={styles.emptyTitle}>
                No Students Found
              </Text>

              <Text style={styles.emptyText}>
                No student records match your search.
              </Text>

            </View>

          ) : (

            filteredStudents.map(student => (

              <View
                key={student.id}
                style={styles.tableRow}>

                <View
                  style={[
                    styles.cell,
                    styles.mvaidCell,
                  ]}>

                  <Text style={styles.cellText}>
                    {student.mvaid || '-'}
                  </Text>

                </View>

                <View
                  style={[
                    styles.cell,
                    styles.nameCell,
                  ]}>

                  <Text style={styles.studentName}>
                    {getFullName(student)}
                  </Text>

                </View>

                <View
                  style={[
                    styles.cell,
                    styles.familyCell,
                  ]}>

                  <Text style={styles.cellText}>
                    {student.families?.father_name || '-'}
                  </Text>

                </View>

                <View
                  style={[
                    styles.cell,
                    styles.familyCell,
                  ]}>

                  <Text style={styles.cellText}>
                    {student.families?.mother_name || '-'}
                  </Text>

                </View>

                <View
                  style={[
                    styles.cell,
                    styles.mobileCell,
                  ]}>

                  <Text style={styles.cellText}>
                    {student.families?.father_mobile || '-'}
                  </Text>

                </View>

                <View
                  style={[
                    styles.cell,
                    styles.mobileCell,
                  ]}>

                  <Text style={styles.cellText}>
                    {student.families?.mother_mobile || '-'}
                  </Text>

                </View>

                <View
                  style={[
                    styles.cell,
                    styles.classCell,
                  ]}>

                  <Text style={styles.cellText}>
                    {student.joining_class || '-'}
                  </Text>

                </View>

                <View
                  style={[
                    styles.cell,
                    styles.sectionCell,
                  ]}>

                  <Text style={styles.cellText}>
                    {student.section || '-'}
                  </Text>

                </View>

                <View
                  style={[
                    styles.cell,
                    styles.genderCell,
                  ]}>

                  <Text style={styles.cellText}>
                    {student.gender || '-'}
                  </Text>

                </View>

                <View
                  style={[
                    styles.cell,
                    styles.actionCell,
                  ]}>

                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() =>
                      setSelectedStudent(student)
                    }
                    activeOpacity={0.7}>

                    <Text style={styles.viewButtonText}>
                      View Full Details
                    </Text>

                  </TouchableOpacity>

                </View>

              </View>

            ))

          )}

        </View>

      </ScrollView>

      {/* ================= FOOTER ================= */}

      <View style={styles.footer}>

        <Text style={styles.footerText}>
          Showing {filteredStudents.length} of{' '}
          {students.length} students
        </Text>

      </View>

      {/* ================= DETAILS MODAL ================= */}

      <Modal
        visible={selectedStudent !== null}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setSelectedStudent(null)
        }>

        <View style={styles.modalOverlay}>

          <View style={styles.modalContainer}>

            <View style={styles.modalHeader}>

              <View>

                <Text style={styles.modalTitle}>
                  Student Full Details
                </Text>

                {selectedStudent && (
                  <Text style={styles.modalSubtitle}>
                    {getFullName(selectedStudent)}
                  </Text>
                )}

              </View>

              <TouchableOpacity
                onPress={() =>
                  setSelectedStudent(null)
                }
                activeOpacity={0.7}>

                <Text style={styles.closeButton}>
                  ✕
                </Text>

              </TouchableOpacity>

            </View>

            {selectedStudent && (

              <ScrollView>

                <Text style={styles.detailSectionTitle}>
                  Student Information
                </Text>

                <DetailRow
                  label="MVAID"
                  value={selectedStudent.mvaid}
                />

                <DetailRow
                  label="Student Name"
                  value={getFullName(selectedStudent)}
                />

                <DetailRow
                  label="Date of Birth"
                  value={selectedStudent.date_of_birth}
                />

                <DetailRow
                  label="Gender"
                  value={selectedStudent.gender}
                />

                <DetailRow
                  label="Class"
                  value={selectedStudent.joining_class}
                />

                <DetailRow
                  label="Section"
                  value={selectedStudent.section}
                />

                <DetailRow
                  label="Academic Year"
                  value={selectedStudent.academic_year}
                />

                <DetailRow
                  label="Email"
                  value={selectedStudent.email}
                />

                <DetailRow
                  label="Mobile"
                  value={selectedStudent.mobile}
                />

                <Text style={styles.detailSectionTitle}>
                  Family Information
                </Text>

                <DetailRow
                  label="Family Name"
                  value={
                    selectedStudent.families?.family_name
                  }
                />

                <DetailRow
                  label="Father Name"
                  value={
                    selectedStudent.families?.father_name
                  }
                />

                <DetailRow
                  label="Father Mobile"
                  value={
                    selectedStudent.families?.father_mobile
                  }
                />

                <DetailRow
                  label="Father Occupation"
                  value={
                    selectedStudent.families?.father_occupation
                  }
                />

                <DetailRow
                  label="Mother Name"
                  value={
                    selectedStudent.families?.mother_name
                  }
                />

                <DetailRow
                  label="Mother Mobile"
                  value={
                    selectedStudent.families?.mother_mobile
                  }
                />

                <DetailRow
                  label="Mother Occupation"
                  value={
                    selectedStudent.families?.mother_occupation
                  }
                />

                <DetailRow
                  label="Guardian Name"
                  value={
                    selectedStudent.families?.guardian_name
                  }
                />

                <DetailRow
                  label="Guardian Mobile"
                  value={
                    selectedStudent.families?.guardian_mobile
                  }
                />

                <DetailRow
                  label="Guardian Relation"
                  value={
                    selectedStudent.families?.guardian_relation
                  }
                />

                <DetailRow
                  label="Address"
                  value={
                    selectedStudent.families?.address
                  }
                />

                <DetailRow
                  label="City"
                  value={
                    selectedStudent.families?.city
                  }
                />

                <DetailRow
                  label="State"
                  value={
                    selectedStudent.families?.state
                  }
                />

                <DetailRow
                  label="Pincode"
                  value={
                    selectedStudent.families?.pincode
                  }
                />

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() =>
                    setSelectedStudent(null)
                  }
                  activeOpacity={0.7}>

                  <Text style={styles.modalCloseText}>
                    CLOSE
                  </Text>

                </TouchableOpacity>

              </ScrollView>

            )}

          </View>

        </View>

      </Modal>

    </SafeAreaView>
  );
};

type DetailRowProps = {
  label: string;
  value: string | null | undefined;
};

const DetailRow = ({
  label,
  value,
}: DetailRowProps) => {
  return (
    <View style={styles.detailRow}>

      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text style={styles.detailValue}>
        {value || '-'}
      </Text>

    </View>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#555',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f5f6fa',
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
  },

  errorMessage: {
    maxWidth: 700,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    color: '#c0392b',
  },

  errorButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },

  retryButton: {
    backgroundColor: '#1683df',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 7,
  },

  retryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },

  backErrorButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 7,
  },

  backErrorButtonText: {
    color: '#fff',
    fontWeight: '700',
  },

  header: {
    minHeight: 76,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  backButtonText: {
    fontSize: 24,
    color: '#222',
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },

  headerSubtitle: {
    fontSize: 12,
    color: '#777',
    marginTop: 3,
  },

  refreshButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },

  refreshText: {
    color: '#fff',
    fontWeight: '600',
  },

  searchSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },

  searchBox: {
    flex: 1,
    maxWidth: 600,
  },

  searchLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginBottom: 7,
  },

  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 7,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    color: '#222',
    fontSize: 14,
  },

  clearButton: {
    height: 44,
    marginLeft: 12,
    paddingHorizontal: 20,
    borderRadius: 7,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },

  clearText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },

  countContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },

  countBox: {
    backgroundColor: '#4f8ed8',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 6,
  },

  otherCountBox: {
    backgroundColor: '#f59e0b',
  },

  countText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },

  tableScroll: {
    flex: 1,
    marginHorizontal: 24,
  },

  table: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bbb',
  },

  tableHeader: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 2,
    borderBottomColor: '#aaa',
  },

  tableRow: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },

  headerCell: {
    paddingHorizontal: 10,
    fontSize: 11,
    fontWeight: '800',
    color: '#111',
  },

  cell: {
    height: '100%',
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },

  mvaidCell: {
    width: 130,
  },

  nameCell: {
    width: 190,
  },

  familyCell: {
    width: 175,
  },

  mobileCell: {
    width: 155,
  },

  classCell: {
    width: 110,
  },

  sectionCell: {
    width: 100,
  },

  genderCell: {
    width: 100,
  },

  actionCell: {
    width: 180,
  },

  cellText: {
    fontSize: 12,
    color: '#333',
  },

  studentName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222',
  },

  viewButton: {
    backgroundColor: '#1683df',
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },

  viewButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },

  emptyContainer: {
    width: 1465,
    minHeight: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  emptyText: {
    marginTop: 6,
    color: '#777',
  },

  footer: {
    minHeight: 55,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },

  footerText: {
    fontSize: 13,
    color: '#555',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },

  modalContainer: {
    width: '80%',
    maxHeight: '88%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },

  modalHeader: {
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },

  modalSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#777',
  },

  closeButton: {
    fontSize: 20,
    color: '#555',
  },

  detailSectionTitle: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 10,
    fontSize: 15,
    fontWeight: '700',
    color: '#1683df',
  },

  detailRow: {
    minHeight: 46,
    flexDirection: 'row',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  detailLabel: {
    width: 190,
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
  },

  detailValue: {
    flex: 1,
    fontSize: 13,
    color: '#222',
  },

  modalCloseButton: {
    margin: 20,
    paddingVertical: 12,
    borderRadius: 7,
    backgroundColor: '#111827',
    alignItems: 'center',
  },

  modalCloseText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default StudentList;