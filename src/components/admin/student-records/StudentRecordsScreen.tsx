import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { supabase } from '@/lib/supabase';
import {
  getStudents,
  Student,
} from '@/services/studentService';
import { Picker } from '@react-native-picker/picker';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import AddStudentScreen from './AddStudentScreen';

type Props = {
  onBack?: () => void;
};

/* =========================================================
   HELPERS
========================================================= */

const normalize = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ');

const displayValue = (value: unknown) => {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ''
  ) {
    return '-';
  }

  return String(value);
};

const formatName = (student: Student) => {
  return [
    student.first_name,
    student.middle_name,
    student.last_name,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
};

const formatLabel = (value: unknown) => {
  if (!value) return '-';

  return String(value)
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
};

const getInitials = (student: Student) => {
  const name = formatName(student);

  if (!name) return 'S';

  const parts = name.split(' ').filter(Boolean);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
};

/* =========================================================
   MAIN SCREEN
========================================================= */

export default function StudentRecordsScreen({
  onBack,
}: Props) {
  const { width } = useWindowDimensions();

  /*
   * IMPORTANT:
   * Android mobile only.
   * Tablet remains on desktop/table layout.
   */
  const isAndroidMobile = width < 700;

  const isWeb = Platform.OS === 'web';

  const [students, setStudents] = useState<Student[]>([]);
  const [genders, setGenders] = useState<Array<{ id: number; gender_name: string | null }>>([]);
  const [casteCategories, setCasteCategories] = useState<Array<{ id: number; category_code: string; category_name: string }>>([]);
  const [classes, setClasses] = useState<Array<{ id: number; class_name: string }>>([]);
  const [studentClasses, setStudentClasses] = useState<Array<{ student_id: number; class_id: number; academic_year_id: number }>>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState('');

  const [search, setSearch] =
    useState('');

  const [classFilter, setClassFilter] =
    useState('ALL');

  const [genderFilter, setGenderFilter] =
    useState('ALL');

  const [typeFilter, setTypeFilter] =
    useState('ALL');

  const [statusFilter, setStatusFilter] =
    useState('ALL');

  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);
  const [editingStudent, setEditingStudent] =
    useState<Student | null>(null);

   

  

  /* =======================================================
     LOAD STUDENTS
  ======================================================= */

  const loadStudents = useCallback(
    async () => {
      try {
        setError('');

        const [studentData, genderResult, casteCategoryResult, classResult, classDetailResult] = await Promise.all([
          getStudents(),
          supabase.from('genders').select('id,gender_name').order('id', { ascending: true }),
          supabase.from('caste_categories').select('id,category_code,category_name').order('id', { ascending: true }),
          supabase.from('classes').select('id,class_name').order('id', { ascending: true }),
          supabase.from('student_class_details').select('student_id,class_id,academic_year_id').order('academic_year_id', { ascending: false }),
        ]);

        if (genderResult.error) throw genderResult.error;
        if (casteCategoryResult.error) throw casteCategoryResult.error;
        if (classResult.error) throw classResult.error;
        if (classDetailResult.error) throw classDetailResult.error;

        setStudents(Array.isArray(studentData) ? studentData : []);
        setGenders(genderResult.data ?? []);
        setCasteCategories(casteCategoryResult.data ?? []);
        setClasses(classResult.data ?? []);
        setStudentClasses(classDetailResult.data ?? []);
      } catch (err) {
        console.error(
          'STUDENT RECORDS ERROR:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load student records.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const refreshStudents = () => {
    setRefreshing(true);
    loadStudents();
  };

  /* =======================================================
     MASTER DATA MAPS
  ======================================================= */

  const genderMap = useMemo(() => {
    const map: Record<number, string> = {};
    genders.forEach((row) => {
      map[row.id] = row.gender_name ?? '';
    });
    return map;
  }, [genders]);

  const casteCategoryMap = useMemo(() => {
    const map: Record<number, string> = {};
    casteCategories.forEach((row) => {
      map[row.id] = row.category_name;
    });
    return map;
  }, [casteCategories]);

  const getCasteCategoryName = useCallback((student: Student) => {
    return student.caste_category_id
      ? casteCategoryMap[student.caste_category_id] ?? ''
      : '';
  }, [casteCategoryMap]);

  const classMap = useMemo(() => {
    const map: Record<number, string> = {};
    classes.forEach((row) => {
      map[row.id] = row.class_name;
    });
    return map;
  }, [classes]);

  const studentClassMap = useMemo(() => {
    const map: Record<number, number> = {};
    [...studentClasses]
      .sort((a, b) => b.academic_year_id - a.academic_year_id)
      .forEach((row) => {
        if (map[row.student_id] === undefined) {
          map[row.student_id] = row.class_id;
        }
      });
    return map;
  }, [studentClasses]);

  const getGenderName = useCallback((student: Student) => {
    return student.gender_id ? genderMap[student.gender_id] ?? '' : '';
  }, [genderMap]);

  const getClassName = useCallback((student: Student) => {
    const classId = studentClassMap[student.id];
    return classId !== undefined
      ? classMap[classId] ?? student.joining_class ?? ''
      : student.joining_class ?? '';
  }, [classMap, studentClassMap]);

  const classOptions = useMemo(
    () => ['ALL', ...classes.map((item) => String(item.id))],
    [classes]
  );

  /* =======================================================
     FILTER STUDENTS
  ======================================================= */

  const filteredStudents = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return students.filter(
      (student) => {
        const fullName = formatName(
          student
        ).toLowerCase();

        const matchesSearch =
          !searchValue ||
          fullName.includes(
            searchValue
          ) ||
          String(
            student.mva_id ?? ''
          )
            .toLowerCase()
            .includes(searchValue) ||
          String(
            student.mobile ?? ''
          )
            .toLowerCase()
            .includes(searchValue) ||
          String(
            student.email ?? ''
          )
            .toLowerCase()
            .includes(searchValue);

        const matchesClass =
          classFilter === 'ALL' ||
          String(studentClassMap[student.id] ?? '') === classFilter;

        const matchesGender =
          genderFilter === 'ALL' ||
          normalize(getGenderName(student)) === normalize(genderFilter);

        const matchesType =
          typeFilter === 'ALL' ||
          normalize(
            student.student_type
          ) === normalize(typeFilter);

        const matchesStatus =
          statusFilter === 'ALL' ||
          normalize(
            student.status
          ) === normalize(statusFilter);

        return (
          matchesSearch &&
          matchesClass &&
          matchesGender &&
          matchesType &&
          matchesStatus
        );
      }
    );
  }, [
    students,
    search,
    classFilter,
    genderFilter,
    typeFilter,
    statusFilter,
    getGenderName,
    studentClassMap,
  ]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const activeStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          normalize(
            student.status
          ) === 'active'
      ).length,
    [students]
  );

  const inactiveStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          normalize(
            student.status
          ) === 'inactive'
      ).length,
    [students]
  );

  const boarderStudents = useMemo(
    () =>
      students.filter(
        (student) => {
          const type = normalize(
            student.student_type
          );

          return (
            type === 'boarder' ||
            type === 'day boarder'
          );
        }
      ).length,
    [students]
  );

  const activeFilterCount = [
    classFilter,
    genderFilter,
    typeFilter,
    statusFilter,
  ].filter(
    (value) => value !== 'ALL'
  ).length;

  /* =======================================================
     RESET
  ======================================================= */

  const resetFilters = () => {
    setSearch('');
    setClassFilter('ALL');
    setGenderFilter('ALL');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
  };

  /* =======================================================
     EDIT STUDENT
  ======================================================= */

  if (editingStudent) {
    return (
      <AddStudentScreen
        editStudent={editingStudent}
        onBack={async () => {
          setEditingStudent(null);
          setSelectedStudent(null);
          await refreshStudents();
        }}
      />
    );
  }

  /* =======================================================
     SELECTED STUDENT PROFILE
  ======================================================= */

  if (selectedStudent) {
    return (
      <StudentProfile
        student={selectedStudent}
        genderName={getGenderName(selectedStudent)}
        casteCategoryName={getCasteCategoryName(selectedStudent)}
        className={getClassName(selectedStudent)}
        onBack={() =>
          setSelectedStudent(null)
        }
        onUpdate={(student) => {
          setSelectedStudent(null);
          setEditingStudent(student);
        }}
      />
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <View
      style={[
        styles.container,
        isAndroidMobile &&
          styles.mobileContainer,
      ]}
    >
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <View
        style={[
          styles.pageHeader,
          isAndroidMobile &&
            styles.pageHeaderMobile,
        ]}
      >
        <View
          style={styles.pageHeaderLeft}
        >
          {onBack ? (
            <Pressable
              onPress={onBack}
              style={[
                styles.backButton,
                isAndroidMobile &&
                  styles.backButtonMobile,
              ]}
            >
              <Text
                style={
                  styles.backButtonText
                }
              >
                ‹
              </Text>
            </Pressable>
          ) : null}

          <View
            style={
              styles.pageHeadingText
            }
          >
            <Text
              style={[
                styles.pageTitle,
                isAndroidMobile &&
                  styles.pageTitleMobile,
              ]}
            >
              Student Records
            </Text>

            <Text
              style={[
                styles.pageSubtitle,
                isAndroidMobile &&
                  styles.pageSubtitleMobile,
              ]}
            >
              View and manage all student
              information
            </Text>
          </View>
        </View>

        <Pressable
          onPress={refreshStudents}
          disabled={refreshing}
          style={[
            styles.refreshButton,
            refreshing &&
              styles.refreshButtonDisabled,
            isAndroidMobile &&
              styles.refreshButtonMobile,
          ]}
        >
          <Text
            style={[
              styles.refreshButtonText,
              isAndroidMobile &&
                styles.refreshButtonTextMobile,
            ]}
          >
            {refreshing
              ? 'Refreshing...'
              : '↻  Refresh'}
          </Text>
        </Pressable>
      </View>

      {/* =================================================
          CONTENT SCROLL
      ================================================= */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          isAndroidMobile &&
            styles.contentMobile,
        ]}
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={
              refreshStudents
            }
          />
        }
      >
        {/* ===============================================
            SUMMARY CARDS
        =============================================== */}

        <View
          style={[
            styles.statsGrid,
            isAndroidMobile &&
              styles.statsGridMobile,
          ]}
        >
          <StatCard
            label="Total Students"
            value={students.length}
            description="All registered students"
          />

          <StatCard
            label="Active"
            value={activeStudents}
            description="Currently active"
          />

          <StatCard
            label="Inactive"
            value={inactiveStudents}
            description="Inactive records"
          />

          <StatCard
            label="Boarders"
            value={boarderStudents}
            description="Boarder students"
          />
        </View>

        {/* ===============================================
            SEARCH CARD
        =============================================== */}

        <View
          style={[
            styles.controlCard,
            isAndroidMobile &&
              styles.controlCardMobile,
          ]}
        >
          <View
            style={styles.searchHeader}
          >
            <View>
              <Text
                style={styles.sectionTitle}
              >
                Find a student
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Search by name, MVA ID,
                mobile or email
              </Text>
            </View>

            {search.length > 0 ? (
              <Pressable
                onPress={() =>
                  setSearch('')
                }
                style={
                  styles.clearSearch
                }
              >
                <Text
                  style={
                    styles.clearSearchText
                  }
                >
                  Clear
                </Text>
              </Pressable>
            ) : null}
          </View>

          <View
            style={styles.searchBox}
          >
            <Text
              style={styles.searchIcon}
            >
              ⌕
            </Text>

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search name, MVA ID, mobile or email"
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>
        </View>

        {/* ===============================================
            FILTER CARD
        =============================================== */}

        <View
          style={[
            styles.filterCard,
            isAndroidMobile &&
              styles.filterCardMobile,
          ]}
        >
          <View
            style={styles.filterTop}
          >
            <View>
              <Text
                style={styles.sectionTitle}
              >
                Filters
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Narrow down student records
              </Text>
            </View>

            <View
              style={
                styles.filterStatus
              }
            >
              <Text
                style={
                  styles.filterStatusText
                }
              >
                {activeFilterCount > 0
                  ? `${activeFilterCount} active`
                  : 'All students'}
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            <FilterGroup
              label="Class"
              value={classFilter}
              options={classOptions}
              optionLabels={[
                'All Classes',
                ...classes.map((item) => item.class_name),
              ]}
              onChange={setClassFilter}
            />

            <FilterGroup
              label="Gender"
              value={genderFilter}
              options={['ALL', 'male', 'female', 'others']}
              optionLabels={[
                'All Genders',
                'Male',
                'Female',
                'Others',
              ]}
              onChange={setGenderFilter}
            />

            <FilterGroup
              label="Student Type"
              value={typeFilter}
              options={['ALL', 'DAY_BOARDER', 'HOSTELER']}
              optionLabels={[
                'All Types',
                'Day Boarder',
                'Hosteler',
              ]}
              onChange={setTypeFilter}
            />

            <FilterGroup
              label="Status"
              value={statusFilter}
              options={[
                'ALL',
                'PENDING',
                'ACTIVE',
                'WITHDRAWN',
                'ALUMNI',
                'INACTIVE',
                'UNKNOWN',
              ]}
              optionLabels={[
                'All Status',
                'Pending',
                'Active',
                'Withdrawn',
                'Alumni',
                'Inactive',
                'Unknown',
              ]}
              onChange={setStatusFilter}
            />

            <Pressable
              onPress={resetFilters}
              style={[
                styles.resetButton,
                activeFilterCount === 0 &&
                  styles.resetButtonDisabled,
              ]}
            >
              <Text style={styles.resetButtonText}>
                Reset
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* ===============================================
            DIRECTORY HEADER
        =============================================== */}

        <View
          style={[
            styles.directoryHeader,
            isAndroidMobile &&
              styles.directoryHeaderMobile,
          ]}
        >
          <View>
            <Text
              style={styles.directoryTitle}
            >
              Student Directory
            </Text>

            <Text
              style={
                styles.directorySubtitle
              }
            >
              Showing{' '}
              <Text
                style={
                  styles.directoryStrong
                }
              >
                {filteredStudents.length}
              </Text>{' '}
              of{' '}
              <Text
                style={
                  styles.directoryStrong
                }
              >
                {students.length}
              </Text>{' '}
              students
            </Text>
          </View>

          {activeFilterCount > 0 ||
          search.length > 0 ? (
            <Pressable
              onPress={resetFilters}
              style={
                styles.smallResetButton
              }
            >
              <Text
                style={
                  styles.smallResetText
                }
              >
                Reset all
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/* ===============================================
            ERROR
        =============================================== */}

        {error ? (
          <View
            style={[
              styles.errorCard,
              isAndroidMobile &&
                styles.errorCardMobile,
            ]}
          >
            <View
              style={styles.errorIcon}
            >
              <Text
                style={styles.errorIconText}
              >
                !
              </Text>
            </View>

            <View
              style={styles.errorContent}
            >
              <Text
                style={styles.errorTitle}
              >
                Unable to load students
              </Text>

              <Text
                style={styles.errorText}
              >
                {error}
              </Text>

              <Pressable
                onPress={loadStudents}
                style={styles.retryButton}
              >
                <Text
                  style={
                    styles.retryButtonText
                  }
                >
                  Try Again
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* ===============================================
            LOADING
        =============================================== */}

        {loading ? (
          <View
            style={
              styles.loadingCard
            }
          >
            <ActivityIndicator
              size="large"
              color="#1C3358"
            />

            <Text
              style={
                styles.loadingTitle
              }
            >
              Loading student records
            </Text>

            <Text
              style={
                styles.loadingSubtitle
              }
            >
              Please wait...
            </Text>
          </View>
        ) : null}

        {/* ===============================================
            MOBILE CARDS
        =============================================== */}

        {!loading &&
        !error &&
        isAndroidMobile ? (
          <View
            style={
              styles.mobileList
            }
          >
            {filteredStudents.length ===
            0 ? (
              <EmptyState />
            ) : (
              filteredStudents.map(
                (student, index) => (
                  <MobileStudentCard
                    key={String(
                      student.id
                    )}
                    student={student}
                    index={index}
                    genderName={getGenderName(student)}
                    className={getClassName(student)}
                    onView={() =>
                      setSelectedStudent(
                        student
                      )
                    }
                  />
                )
              )
            )}
          </View>
        ) : null}

        {/* ===============================================
            WEB / TABLET TABLE
        =============================================== */}

        {!loading &&
        !error &&
        !isAndroidMobile ? (
          <StudentTable
            students={
              filteredStudents
            }
            onView={(student) =>
              setSelectedStudent(student)
            }
            genderMap={genderMap}
            classMap={classMap}
            studentClassMap={studentClassMap}
            isWeb={isWeb}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <View
      style={styles.statCard}
    >
      <View
        style={styles.statCardTop}
      >
        <Text
          style={styles.statLabel}
        >
          {label}
        </Text>

        <View
          style={styles.statDot}
        />
      </View>

      <Text
        style={styles.statValue}
      >
        {value}
      </Text>

      <Text
        style={styles.statDescription}
      >
        {description}
      </Text>
    </View>
  );
}

/* =========================================================
   FILTER GROUP
========================================================= */

type FilterProps = {
  label: string;
  value: string;
  options: string[];
  optionLabels?: string[];
  onChange: (value: string) => void;
};

function FilterGroup({
  label,
  value,
  options,
  optionLabels,
  onChange,
}: FilterProps) {
  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>
        {label}
      </Text>

      <View style={styles.filterSelectContainer}>
        <Picker
          selectedValue={value}
          onValueChange={(itemValue) =>
            onChange(String(itemValue))
          }
          style={styles.filterPicker}
        >
          {options.map((option, index) => (
            <Picker.Item
              key={option}
              label={
                optionLabels?.[index] ??
                formatLabel(option)
              }
              value={option}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
}

/* =========================================================
   STUDENT TABLE
========================================================= */

function StudentTable({
  students,
  genderMap,
  classMap,
  studentClassMap,
  onView,
}: {
  students: Student[];
  genderMap: Record<number, string>;
  classMap: Record<number, string>;
  studentClassMap: Record<number, number>;
  onView: (
    student: Student
  ) => void;
  isWeb: boolean;
}) {
  if (students.length === 0) {
    return <EmptyState />;
  }

  const getClassName = (student: Student) => {
    const classId = studentClassMap[student.id];
    return classId !== undefined ? classMap[classId] ?? student.joining_class ?? '' : student.joining_class ?? '';
  };

  const getGenderName = (student: Student) =>
    student.gender_id ? genderMap[student.gender_id] ?? '' : '';

  return (
    <View
      style={styles.tableCard}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          true
        }
      >
        <View
          style={styles.table}
        >
          {/* TABLE HEADER */}

          <View
            style={[
              styles.tableRow,
              styles.tableHeader,
            ]}
          >
            <TableCell
              text="#"
              width={55}
              header
            />

            <TableCell
              text="MVA ID"
              width={135}
              header
            />

            <TableCell
              text="Student"
              width={270}
              header
            />

            <TableCell
              text="Class"
              width={100}
              header
            />

            <TableCell
              text="Gender"
              width={110}
              header
            />

            <TableCell
              text="Student Type"
              width={155}
              header
            />

            <TableCell
              text="Mobile"
              width={150}
              header
            />

            <TableCell
              text="Email"
              width={230}
              header
            />

            <TableCell
              text="Status"
              width={120}
              header
            />

            <TableCell
              text="Action"
              width={105}
              header
            />
          </View>

          {students.map(
            (student, index) => {
              const status =
                normalize(
                  student.status
                );

              return (
                <View
                  key={String(
                    student.id
                  )}
                  style={[
                    styles.tableRow,
                    index % 2 === 1 &&
                      styles.tableAlternateRow,
                  ]}
                >
                  <TableCell
                    text={String(
                      index + 1
                    )}
                    width={55}
                  />

                  <TableCell
                    text={displayValue(
                      student.mva_id
                    )}
                    width={135}
                    bold
                  />

                  <View
                    style={[
                      styles.tableNameCell,
                      {
                        width: 270,
                      },
                    ]}
                  >
                    <View
                      style={
                        styles.tableAvatar
                      }
                    >
                      <Text
                        style={
                          styles.tableAvatarText
                        }
                      >
                        {getInitials(
                          student
                        )}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.tableNameContent
                      }
                    >
                      <Text
                        numberOfLines={1}
                        style={
                          styles.tableStudentName
                        }
                      >
                        {displayValue(
                          formatName(
                            student
                          )
                        )}
                      </Text>

                      <Text
                        numberOfLines={1}
                        style={
                          styles.tableStudentSub
                        }
                      >
                        {displayValue(
                          student.email
                        )}
                      </Text>
                    </View>
                  </View>

                  <TableCell
                    text={displayValue(
                      getClassName(student)
                    )}
                    width={100}
                  />

                  <TableCell
                    text={formatLabel(getGenderName(student))}
                    width={110}
                  />

                  <TableCell
                    text={formatLabel(
                      student.student_type
                    )}
                    width={155}
                  />

                  <TableCell
                    text={displayValue(
                      student.mobile
                    )}
                    width={150}
                  />

                  <TableCell
                    text={displayValue(
                      student.email
                    )}
                    width={230}
                  />

                  <View
                    style={[
                      styles.statusCell,
                      {
                        width: 120,
                      },
                    ]}
                  >
                    <StatusBadge
                      status={
                        status ||
                        'unknown'
                      }
                    />
                  </View>

                  <View
                    style={[
                      styles.actionCell,
                      {
                        width: 105,
                      },
                    ]}
                  >
                    <Pressable
                      onPress={() =>
                        onView(
                          student
                        )
                      }
                      style={
                        styles.viewButton
                      }
                    >
                      <Text
                        style={
                          styles.viewButtonText
                        }
                      >
                        View
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            }
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/* =========================================================
   MOBILE STUDENT CARD
========================================================= */

function MobileStudentCard({
  student,
  index,
  genderName,
  className,
  onView,
}: {
  student: Student;
  index: number;
  genderName: string;
  className: string;
  onView: () => void;
}) {
  const fullName =
    formatName(student);

  const status =
    normalize(
      student.status
    ) || 'unknown';

  return (
    <Pressable
      onPress={onView}
      style={({ pressed }) => [
        styles.mobileStudentCard,
        pressed &&
          styles.mobileStudentCardPressed,
      ]}
    >
      {/* TOP */}

      <View
        style={
          styles.mobileCardTop
        }
      >
        <View
          style={
            styles.mobileIdentity
          }
        >
          <View
            style={
              styles.mobileAvatar
            }
          >
            <Text
              style={
                styles.mobileAvatarText
              }
            >
              {getInitials(
                student
              )}
            </Text>
          </View>

          <View
            style={
              styles.mobileIdentityText
            }
          >
            <Text
              numberOfLines={1}
              style={
                styles.mobileStudentName
              }
            >
              {displayValue(
                fullName
              )}
            </Text>

            <Text
              style={
                styles.mobileMvaId
              }
            >
              {displayValue(
                student.mva_id
              )}
            </Text>
          </View>
        </View>

        <StatusBadge
          status={status}
        />
      </View>

      {/* DETAILS */}

      <View
        style={
          styles.mobileDetailsGrid
        }
      >
        <MobileInfo
          label="Class"
          value={displayValue(
            className
          )}
        />

        <MobileInfo
          label="Gender"
          value={formatLabel(genderName)}
        />

        <MobileInfo
          label="Type"
          value={formatLabel(
            student.student_type
          )}
        />

        <MobileInfo
          label="Mobile"
          value={displayValue(
            student.mobile
          )}
        />

        <MobileInfo
          label="Email"
          value={displayValue(
            student.email
          )}
          full
        />
      </View>

      {/* FOOTER */}

      <View
        style={
          styles.mobileCardFooter
        }
      >
        <Text
          style={
            styles.mobileCardNumber
          }
        >
          Record #{index + 1}
        </Text>

        <Text
          style={
            styles.mobileViewText
          }
        >
          View Details  →
        </Text>
      </View>
    </Pressable>
  );
}

/* =========================================================
   MOBILE INFO
========================================================= */

function MobileInfo({
  label,
  value,
  full = false,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <View
      style={[
        styles.mobileInfo,
        full &&
          styles.mobileInfoFull,
      ]}
    >
      <Text
        style={
          styles.mobileInfoLabel
        }
      >
        {label}
      </Text>

      <Text
        numberOfLines={1}
        style={
          styles.mobileInfoValue
        }
      >
        {value}
      </Text>
    </View>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    normalize(status);

  const isActive =
    normalized === 'active';

  const isInactive =
    normalized === 'inactive';

  return (
    <View
      style={[
        styles.statusBadge,
        isActive &&
          styles.statusBadgeActive,
        isInactive &&
          styles.statusBadgeInactive,
        !isActive &&
          !isInactive &&
          styles.statusBadgeUnknown,
      ]}
    >
      <View
        style={[
          styles.statusDot,
          isActive &&
            styles.statusDotActive,
          isInactive &&
            styles.statusDotInactive,
          !isActive &&
            !isInactive &&
            styles.statusDotUnknown,
        ]}
      />

      <Text
        style={[
          styles.statusBadgeText,
          isActive &&
            styles.statusTextActive,
          isInactive &&
            styles.statusTextInactive,
          !isActive &&
            !isInactive &&
            styles.statusTextUnknown,
        ]}
      >
        {formatLabel(
          status
        )}
      </Text>
    </View>
  );
}

/* =========================================================
   TABLE CELL
========================================================= */

function TableCell({
  text,
  width,
  header = false,
  bold = false,
}: {
  text: string;
  width: number;
  header?: boolean;
  bold?: boolean;
}) {
  return (
    <View
      style={[
        styles.tableCell,
        {
          width,
        },
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.tableCellText,
          header &&
            styles.tableHeaderText,
          bold &&
            styles.tableBoldText,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState() {
  return (
    <View
      style={styles.emptyCard}
    >
      <View
        style={styles.emptyIcon}
      >
        <Text
          style={styles.emptyIconText}
        >
          ?
        </Text>
      </View>

      <Text
        style={styles.emptyTitle}
      >
        No students found
      </Text>

      <Text
        style={styles.emptyText}
      >
        Try changing your search
        or filters.
      </Text>
    </View>
  );
}

/* =========================================================
   STUDENT PROFILE
========================================================= */

type FamilyProfile = {
  id: number;
  family_name: string | null;
  father_name: string | null;
  father_mobile: string | null;
  father_email: string | null;
  father_occupation: string | null;
  mother_name: string | null;
  mother_mobile: string | null;
  mother_email: string | null;
  mother_occupation: string | null;
  guardian_name: string | null;
  guardian_mobile: string | null;
  guardian_email: string | null;
  guardian_relation: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
};

type AcademicProfile = {
  id: number;
  academic_year_id: number;
  class_id: number;
  section_id: number;
  class_teacher_id: number | null;
  roll_number: number | string | null;
  joining_class: boolean | null;
  class_teacher_name: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type RelatedProfile = Record<string, unknown>;

function formatProfileFieldLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function formatProfileFieldValue(value: unknown): string | number | boolean | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number' || typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function DynamicProfileRows({ record }: { record: RelatedProfile | null }) {
  if (!record) {
    return <InfoRow label="Information" value="No record found" />;
  }

  const entries = Object.entries(record);

  if (entries.length === 0) {
    return <InfoRow label="Information" value="No information available" />;
  }

  return (
    <>
      {entries.map(([key, value]) => (
        <InfoRow
          key={key}
          label={formatProfileFieldLabel(key)}
          value={formatProfileFieldValue(value)}
          full={typeof value === 'string' && value.length > 60}
        />
      ))}
    </>
  );
}

function StudentProfile({
  student,
  genderName,
  casteCategoryName,
  className,
  onBack,
  onUpdate,
}: {
  student: Student;
  genderName: string;
  casteCategoryName: string;
  className: string;
  onBack: () => void;
  onUpdate?: (student: Student) => void;
}) {
  const { width } = useWindowDimensions();
  const isAndroidMobile = width < 700;
  const fullName = formatName(student);

  const [photoExpanded, setPhotoExpanded] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [family, setFamily] = useState<FamilyProfile | null>(null);
  const [academic, setAcademic] = useState<AcademicProfile | null>(null);
  const [hostel, setHostel] = useState<RelatedProfile | null>(null);
  const [health, setHealth] = useState<RelatedProfile | null>(null);
  const [bank, setBank] = useState<RelatedProfile | null>(null);
  const [profileDataLoading, setProfileDataLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadStudentPhoto() {
      setPhotoUrl(null);
      if (!student.student_image) {
        setPhotoLoading(false);
        return;
      }
      try {
        setPhotoLoading(true);
        const { data, error } = await supabase.storage
          .from('st_photos')
          .createSignedUrl(student.student_image, 60 * 60);
        if (error) throw error;
        if (!cancelled) setPhotoUrl(data?.signedUrl ?? null);
      } catch (error) {
        console.error('STUDENT PROFILE PHOTO ERROR:', error);
        if (!cancelled) setPhotoUrl(null);
      } finally {
        if (!cancelled) setPhotoLoading(false);
      }
    }
    loadStudentPhoto();
    return () => { cancelled = true; };
  }, [student.student_image]);

  useEffect(() => {
    let cancelled = false;
    async function loadProfileDetails() {
      try {
        setProfileDataLoading(true);

        const familyPromise = student.family_id
          ? supabase.from('families').select(`
              id, family_name,
              father_name, father_mobile, father_email, father_occupation,
              mother_name, mother_mobile, mother_email, mother_occupation,
              guardian_name, guardian_mobile, guardian_email, guardian_relation,
              address, city, state, pincode
            `).eq('id', student.family_id).maybeSingle()
          : Promise.resolve({ data: null, error: null });

        const academicPromise = supabase.from('student_class_details').select(`
          id, academic_year_id, class_id, section_id,
          class_teacher_id, roll_number, joining_class,
          class_teacher_name, created_at, updated_at
        `).eq('student_id', student.id)
          .order('academic_year_id', { ascending: false })
          .limit(1)
          .maybeSingle();

        // These three related tables are intentionally read with select('*') so the
        // profile does not guess column names. Their complete current records are
        // rendered dynamically below.
        const hostelPromise = supabase
          .from('student_hostel_details')
          .select('*')
          .eq('student_id', student.id)
          .order('academic_year_id', { ascending: false })
          .limit(1)
          .maybeSingle();

        const healthPromise = supabase
          .from('student_health')
          .select('*')
          .eq('student_id', student.id)
          .maybeSingle();

        const bankPromise = supabase
          .from('student_bank_details')
          .select('*')
          .eq('student_id', student.id)
          .maybeSingle();

        const [familyResult, academicResult, hostelResult, healthResult, bankResult] =
          await Promise.all([
            familyPromise,
            academicPromise,
            hostelPromise,
            healthPromise,
            bankPromise,
          ]);

        if (familyResult.error) console.error('STUDENT PROFILE FAMILY ERROR:', familyResult.error);
        if (academicResult.error) console.error('STUDENT PROFILE ACADEMIC ERROR:', academicResult.error);
        if (hostelResult.error) console.error('STUDENT PROFILE HOSTEL ERROR:', hostelResult.error);
        if (healthResult.error) console.error('STUDENT PROFILE HEALTH ERROR:', healthResult.error);
        if (bankResult.error) console.error('STUDENT PROFILE BANK ERROR:', bankResult.error);

        if (!cancelled) {
          setFamily((familyResult.data as FamilyProfile | null) ?? null);
          setAcademic((academicResult.data as AcademicProfile | null) ?? null);
          setHostel((hostelResult.data as RelatedProfile | null) ?? null);
          setHealth((healthResult.data as RelatedProfile | null) ?? null);
          setBank((bankResult.data as RelatedProfile | null) ?? null);
        }
      } catch (error) {
        console.error('STUDENT PROFILE DETAILS ERROR:', error);
      } finally {
        if (!cancelled) setProfileDataLoading(false);
      }
    }
    loadProfileDetails();
    return () => { cancelled = true; };
  }, [student.id, student.family_id]);

  return (
    <ScrollView
      style={[styles.profileContainer, isAndroidMobile && styles.profileContainerMobile]}
      contentContainerStyle={styles.profileContent}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={onBack} style={[styles.profileBackButton, isAndroidMobile && styles.profileBackButtonMobile]}>
        <Text style={styles.profileBackText}>‹</Text>
        <Text style={styles.profileBackLabel}>Student Records</Text>
      </Pressable>

      <View style={[styles.profileHero, isAndroidMobile && styles.profileHeroMobile]}>
        <Pressable onPress={() => photoUrl && setPhotoExpanded(prev => !prev)}>
          <View style={[styles.profileAvatar, photoExpanded && styles.profileAvatarExpanded]}>
            {photoLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.profileAvatarImage} resizeMode="cover" />
            ) : (
              <Text style={styles.profileAvatarText}>{getInitials(student)}</Text>
            )}
          </View>
        </Pressable>

        <View style={styles.profileHeroContent}>
          <Text style={[styles.profileName, isAndroidMobile && styles.profileNameMobile]}>
            {displayValue(fullName)}
          </Text>
          <View style={styles.profileMvaRow}>
            <Text style={styles.profileMva}>MVA ID · {displayValue(student.mva_id)}</Text>
            {onUpdate ? (
              <Pressable onPress={() => onUpdate(student)} style={({ pressed }) => [styles.updateProfileButton, pressed && styles.updateProfileButtonPressed]}>
                <Text style={styles.updateProfileButtonText}>Update Profile</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.profileHeroMeta}>
            <StatusBadge status={normalize(student.status) || 'unknown'} />
            <Text style={styles.profileClass}>Class {displayValue(className)}</Text>
          </View>
        </View>
      </View>

      {/* Basic Information = complete students table information */}
      <ProfileSection title="Basic Information" subtitle="Complete student information" defaultOpen collapsible={false}>
        <InfoRow label="MVA ID" value={student.mva_id} />
        <InfoRow label="First Name" value={student.first_name} />
        <InfoRow label="Middle Name" value={student.middle_name} />
        <InfoRow label="Last Name" value={student.last_name} />
        <InfoRow label="Date of Birth" value={student.date_of_birth} />
        <InfoRow label="Gender" value={formatLabel(genderName)} />
        <InfoRow label="Date of Admission" value={student.date_of_admission} />
        <InfoRow label="Joining Academic Year" value={student.joining_academic_year} />
        <InfoRow label="Joining Class" value={student.joining_class || className} />
        <InfoRow label="Student Type" value={formatLabel(student.student_type)} />
        <InfoRow label="Residential Address" value={student.class_residential_address} full />
        <InfoRow label="Pincode" value={student.pincode} />
        <InfoRow label="Aadhaar Number" value={student.aadhaar_number} />
        <InfoRow label="Previous School" value={student.previous_school} />
        <InfoRow label="Nationality" value={student.nationality} />
        <InfoRow label="Staff Child" value={student.staff_child === true ? 'Yes' : student.staff_child === false ? 'No' : null} />
        <InfoRow label="Caste Category" value={casteCategoryName || student.caste_category} />
        <InfoRow label="Caste" value={student.caste} />
        <InfoRow label="Email" value={student.email} />
        <InfoRow label="Mobile" value={student.mobile} />
        <InfoRow label="Status" value={formatLabel(student.status)} />
      </ProfileSection>

      <ProfileSection title="Hostel Information" subtitle={profileDataLoading ? 'Loading hostel details...' : 'Hostel record for the latest academic year'}>
        <DynamicProfileRows record={hostel} />
      </ProfileSection>

      <ProfileSection title="Health Information" subtitle={profileDataLoading ? 'Loading health details...' : 'Student health and emergency information'}>
        <DynamicProfileRows record={health} />
      </ProfileSection>

      <ProfileSection title="Family Information" subtitle={profileDataLoading ? 'Loading family details...' : 'Parent, guardian and family details'}>
        <InfoRow label="Family ID" value={family?.id ?? student.family_id} />
        <InfoRow label="Family Name" value={family?.family_name} />
        <InfoRow label="Father Name" value={family?.father_name} />
        <InfoRow label="Father Mobile" value={family?.father_mobile} />
        <InfoRow label="Father Email" value={family?.father_email} />
        <InfoRow label="Father Occupation" value={family?.father_occupation} />
        <InfoRow label="Mother Name" value={family?.mother_name} />
        <InfoRow label="Mother Mobile" value={family?.mother_mobile} />
        <InfoRow label="Mother Email" value={family?.mother_email} />
        <InfoRow label="Mother Occupation" value={family?.mother_occupation} />
        <InfoRow label="Guardian Name" value={family?.guardian_name} />
        <InfoRow label="Guardian Mobile" value={family?.guardian_mobile} />
        <InfoRow label="Guardian Email" value={family?.guardian_email} />
        <InfoRow label="Guardian Relation" value={family?.guardian_relation} />
        <InfoRow label="Family Address" value={family?.address} full />
        <InfoRow label="Family City" value={family?.city} />
        <InfoRow label="Family State" value={family?.state} />
        <InfoRow label="Family Pincode" value={family?.pincode} />
      </ProfileSection>

      <ProfileSection title="Bank Details" subtitle={profileDataLoading ? 'Loading bank details...' : 'Student bank information'}>
        <DynamicProfileRows record={bank} />
      </ProfileSection>

      <View style={styles.profileBottomSpace} />
    </ScrollView>
  );
}

/* =========================================================
   PROFILE SECTION
========================================================= */

function ProfileSection({
  title,
  subtitle,
  children,
  defaultOpen = false,
  collapsible = true,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={styles.profileSection}>
      {collapsible ? (
        <Pressable onPress={() => setOpen(prev => !prev)} style={({ pressed }) => [styles.profileSectionHeader, pressed && styles.profileSectionHeaderPressed]}>
          <View style={styles.profileSectionHeaderText}>
            <Text style={styles.profileSectionTitle}>{title}</Text>
            <Text style={styles.profileSectionSubtitle}>{subtitle}</Text>
          </View>
          <Text style={styles.profileSectionChevron}>{open ? '⌃' : '⌄'}</Text>
        </Pressable>
      ) : (
        <View style={styles.profileSectionHeader}>
          <View style={styles.profileSectionHeaderText}>
            <Text style={styles.profileSectionTitle}>{title}</Text>
            <Text style={styles.profileSectionSubtitle}>{subtitle}</Text>
          </View>
        </View>
      )}

      {(!collapsible || open) && (
        <View style={styles.infoGrid}>{children}</View>
      )}
    </View>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  label,
  value,
  full = false,
}: {
  label: string;
  value: string | number | boolean | null | undefined;
  full?: boolean;
}) {
  const output = value !== null && value !== undefined && String(value).trim() !== ''
    ? String(value)
    : '-';

  return (
    <View style={[styles.infoRow, full && styles.infoRowFull]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{output}</Text>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles =
  StyleSheet.create({
    /* ===============================================
       MAIN
    =============================================== */

    container: {
      flex: 1,
      backgroundColor: '#F4F7FB',
    },

    mobileContainer: {
      backgroundColor: '#F5F7FA',
    },

    scroll: {
      flex: 1,
    },

    content: {
      padding: 24,
      paddingBottom: 40,
    },

    contentMobile: {
      padding: 14,
      paddingBottom: 30,
    },

    /* ===============================================
       PAGE HEADER
    =============================================== */

    pageHeader: {
      minHeight: 88,
      paddingHorizontal: 26,
      paddingVertical: 16,
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: '#E2E8F0',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    pageHeaderMobile: {
      minHeight: 72,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },

    pageHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      minWidth: 0,
    },

    pageHeadingText: {
      flex: 1,
      minWidth: 0,
    },

    pageTitle: {
      fontSize: 27,
      fontWeight: '900',
      color: '#16233A',
      letterSpacing: -0.5,
    },

    pageTitleMobile: {
      fontSize: 21,
      letterSpacing: -0.2,
    },

    pageSubtitle: {
      marginTop: 4,
      fontSize: 12,
      color: '#718096',
      fontWeight: '500',
    },

    pageSubtitleMobile: {
      fontSize: 10,
      marginTop: 2,
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 11,
      marginRight: 13,
      backgroundColor: '#EEF3F9',
      alignItems: 'center',
      justifyContent: 'center',
    },

    backButtonMobile: {
      width: 38,
      height: 38,
      marginRight: 9,
      borderRadius: 10,
    },

    backButtonText: {
      color: '#1C3358',
      fontSize: 29,
      fontWeight: '500',
      lineHeight: 31,
    },

    refreshButton: {
      minHeight: 42,
      paddingHorizontal: 17,
      borderRadius: 10,
      backgroundColor: '#1C3358',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 12,
    },

    refreshButtonMobile: {
      minHeight: 36,
      paddingHorizontal: 11,
      borderRadius: 9,
      marginLeft: 8,
    },

    refreshButtonDisabled: {
      opacity: 0.65,
    },

    refreshButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '800',
    },

    refreshButtonTextMobile: {
      fontSize: 10,
    },

    /* ===============================================
       STATISTICS
    =============================================== */

    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 14,
      marginBottom: 16,
    },

    statsGridMobile: {
      flexDirection: 'row',
      gap: 9,
      marginBottom: 12,
    },

    statCard: {
      flex: 1,
      minWidth: 170,
      padding: 17,
      borderRadius: 14,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      shadowColor: '#0F172A',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.04,
      shadowRadius: 5,
      elevation: 2,
    },

    statCardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    statLabel: {
      fontSize: 11,
      fontWeight: '800',
      color: '#64748B',
    },

    statDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: '#1C3358',
    },

    statValue: {
      marginTop: 9,
      fontSize: 27,
      fontWeight: '900',
      color: '#172A46',
    },

    statDescription: {
      marginTop: 3,
      fontSize: 10,
      color: '#94A3B8',
    },

    /* ===============================================
       CONTROL CARD
    =============================================== */

    controlCard: {
      padding: 18,
      borderRadius: 14,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      marginBottom: 14,
    },

    controlCardMobile: {
      padding: 14,
      borderRadius: 13,
      marginBottom: 10,
    },

    searchHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 12,
    },

    sectionTitle: {
      fontSize: 14,
      fontWeight: '900',
      color: '#1C3358',
    },

    sectionSubtitle: {
      marginTop: 3,
      fontSize: 10,
      color: '#94A3B8',
    },

    clearSearch: {
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 7,
      backgroundColor: '#F1F5F9',
    },

    clearSearchText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#1C3358',
    },

    searchBox: {
      height: 48,
      borderWidth: 1,
      borderColor: '#D7E0EA',
      borderRadius: 10,
      backgroundColor: '#F8FAFC',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 13,
    },

    searchIcon: {
      fontSize: 24,
      color: '#64748B',
      marginRight: 8,
      lineHeight: 25,
    },

    searchInput: {
      flex: 1,
      height: '100%',
      fontSize: 12,
      color: '#172033',
      paddingVertical: 0,
    },

    /* ===============================================
       FILTERS
    =============================================== */

    filterCard: {
      padding: 18,
      borderRadius: 14,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      marginBottom: 14,
    },

    filterCardMobile: {
      padding: 14,
      borderRadius: 13,
      marginBottom: 10,
    },

    filterTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 15,
    },

    filterStatus: {
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 20,
      backgroundColor: '#F1F5F9',
    },

    filterStatusText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#64748B',
    },

    filtersScroll: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingRight: 5,
      gap: 14,
    },

    filterGroup: {
      width: 200,
    },

    filterLabel: {
      marginBottom: 7,
      fontSize: 9,
      fontWeight: '900',
      color: '#64748B',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    filterSelectContainer: {
      height: 52,
      minHeight: 52,
      borderWidth: 1,
      borderColor: '#D7E0EA',
      borderRadius: 8,
      backgroundColor: '#FFFFFF',
      overflow: 'hidden',
      justifyContent: 'center',
    },

    filterPicker: {
      width: '100%',
      height: 52,
    },

    resetButton: {
      minHeight: 32,
      paddingHorizontal: 13,
      borderRadius: 8,
      backgroundColor: '#FEE2E2',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 2,
    },

    resetButtonDisabled: {
      opacity: 0.45,
    },

    resetButtonText: {
      fontSize: 9,
      fontWeight: '900',
      color: '#B91C1C',
    },

    /* ===============================================
       DIRECTORY
    =============================================== */

    directoryHeader: {
      minHeight: 66,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 13,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    directoryHeaderMobile: {
      minHeight: 59,
      paddingHorizontal: 13,
      paddingVertical: 10,
      borderRadius: 12,
    },

    directoryTitle: {
      fontSize: 13,
      fontWeight: '900',
      color: '#1C3358',
    },

    directorySubtitle: {
      marginTop: 4,
      fontSize: 10,
      color: '#94A3B8',
    },

    directoryStrong: {
      color: '#334155',
      fontWeight: '900',
    },

    smallResetButton: {
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 7,
      backgroundColor: '#EEF3F9',
    },

    smallResetText: {
      color: '#1C3358',
      fontSize: 9,
      fontWeight: '900',
    },

    /* ===============================================
       TABLE
    =============================================== */

    tableCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      overflow: 'hidden',
      marginBottom: 20,
    },

    table: {
      minWidth: 1425,
    },

    tableRow: {
      minHeight: 62,
      flexDirection: 'row',
      alignItems: 'stretch',
      borderBottomWidth: 1,
      borderBottomColor: '#E8EEF5',
    },

    tableHeader: {
      minHeight: 49,
      backgroundColor: '#1C3358',
    },

    tableAlternateRow: {
      backgroundColor: '#FAFCFE',
    },

    tableCell: {
      minHeight: 62,
      paddingHorizontal: 12,
      justifyContent: 'center',
      borderRightWidth: 1,
      borderRightColor: '#E8EEF5',
    },

    tableCellText: {
      fontSize: 11,
      color: '#475569',
      fontWeight: '500',
    },

    tableHeaderText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.2,
    },

    tableBoldText: {
      color: '#1C3358',
      fontWeight: '900',
    },

    tableNameCell: {
      minHeight: 62,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderRightWidth: 1,
      borderRightColor: '#E8EEF5',
    },

    tableAvatar: {
      width: 35,
      height: 35,
      borderRadius: 18,
      backgroundColor: '#E9EFF7',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 9,
    },

    tableAvatarText: {
      color: '#1C3358',
      fontSize: 11,
      fontWeight: '900',
    },

    tableNameContent: {
      flex: 1,
      minWidth: 0,
    },

    tableStudentName: {
      fontSize: 11,
      color: '#1E293B',
      fontWeight: '800',
    },

    tableStudentSub: {
      marginTop: 2,
      fontSize: 9,
      color: '#94A3B8',
    },

    statusCell: {
      minHeight: 62,
      paddingHorizontal: 10,
      justifyContent: 'center',
      borderRightWidth: 1,
      borderRightColor: '#E8EEF5',
    },

    actionCell: {
      minHeight: 62,
      paddingHorizontal: 10,
      justifyContent: 'center',
    },

    viewButton: {
      alignSelf: 'flex-start',
      minHeight: 32,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: '#EAF0F8',
      borderWidth: 1,
      borderColor: '#CBD8E8',
      alignItems: 'center',
      justifyContent: 'center',
    },

    viewButtonText: {
      color: '#1C3358',
      fontSize: 10,
      fontWeight: '900',
    },

    /* ===============================================
       STATUS
    =============================================== */

    statusBadge: {
      alignSelf: 'flex-start',
      minHeight: 27,
      paddingHorizontal: 8,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },

    statusBadgeActive: {
      backgroundColor: '#ECFDF5',
    },

    statusBadgeInactive: {
      backgroundColor: '#FEF2F2',
    },

    statusBadgeUnknown: {
      backgroundColor: '#F1F5F9',
    },

    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 5,
    },

    statusDotActive: {
      backgroundColor: '#16A34A',
    },

    statusDotInactive: {
      backgroundColor: '#DC2626',
    },

    statusDotUnknown: {
      backgroundColor: '#64748B',
    },

    statusBadgeText: {
      fontSize: 9,
      fontWeight: '900',
    },

    statusTextActive: {
      color: '#15803D',
    },

    statusTextInactive: {
      color: '#B91C1C',
    },

    statusTextUnknown: {
      color: '#475569',
    },

    /* ===============================================
       MOBILE LIST
    =============================================== */

    mobileList: {
      gap: 10,
      paddingBottom: 20,
    },

    mobileStudentCard: {
      padding: 14,
      borderRadius: 14,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      shadowColor: '#0F172A',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.04,
      shadowRadius: 5,
      elevation: 2,
    },

    mobileStudentCardPressed: {
      opacity: 0.82,
      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    mobileCardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      paddingBottom: 13,
      borderBottomWidth: 1,
      borderBottomColor: '#EEF2F7',
    },

    mobileIdentity: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      minWidth: 0,
      marginRight: 8,
    },

    mobileAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#1C3358',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },

    mobileAvatarText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '900',
    },

    mobileIdentityText: {
      flex: 1,
      minWidth: 0,
    },

    mobileStudentName: {
      fontSize: 14,
      fontWeight: '900',
      color: '#172A46',
    },

    mobileMvaId: {
      marginTop: 3,
      fontSize: 10,
      fontWeight: '800',
      color: '#64748B',
    },

    mobileDetailsGrid: {
      marginTop: 4,
      flexDirection: 'row',
      flexWrap: 'wrap',
    },

    mobileInfo: {
      width: '50%',
      paddingTop: 11,
      paddingRight: 8,
    },

    mobileInfoFull: {
      width: '100%',
    },

    mobileInfoLabel: {
      fontSize: 9,
      fontWeight: '800',
      color: '#94A3B8',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },

    mobileInfoValue: {
      marginTop: 3,
      fontSize: 11,
      fontWeight: '700',
      color: '#334155',
    },

    mobileCardFooter: {
      marginTop: 13,
      paddingTop: 11,
      borderTopWidth: 1,
      borderTopColor: '#EEF2F7',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    mobileCardNumber: {
      fontSize: 9,
      color: '#94A3B8',
      fontWeight: '700',
    },

    mobileViewText: {
      fontSize: 10,
      color: '#1C3358',
      fontWeight: '900',
    },

    /* ===============================================
       LOADING
    =============================================== */

    loadingCard: {
      minHeight: 260,
      borderRadius: 14,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      alignItems: 'center',
      justifyContent: 'center',
    },

    loadingTitle: {
      marginTop: 13,
      fontSize: 13,
      color: '#334155',
      fontWeight: '800',
    },

    loadingSubtitle: {
      marginTop: 4,
      fontSize: 10,
      color: '#94A3B8',
    },

    /* ===============================================
       ERROR
    =============================================== */

    errorCard: {
      marginBottom: 14,
      padding: 16,
      borderRadius: 13,
      backgroundColor: '#FFF7F7',
      borderWidth: 1,
      borderColor: '#FECACA',
      flexDirection: 'row',
    },

    errorCardMobile: {
      padding: 13,
    },

    errorIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#FEE2E2',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 11,
    },

    errorIconText: {
      color: '#B91C1C',
      fontSize: 15,
      fontWeight: '900',
    },

    errorContent: {
      flex: 1,
    },

    errorTitle: {
      fontSize: 13,
      color: '#991B1B',
      fontWeight: '900',
    },

    errorText: {
      marginTop: 4,
      fontSize: 10,
      lineHeight: 16,
      color: '#B91C1C',
    },

    retryButton: {
      alignSelf: 'flex-start',
      marginTop: 10,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 7,
      backgroundColor: '#991B1B',
    },

    retryButtonText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '900',
    },

    /* ===============================================
       EMPTY
    =============================================== */

    emptyCard: {
      minHeight: 250,
      borderRadius: 14,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 25,
    },

    emptyIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#EEF3F9',
      alignItems: 'center',
      justifyContent: 'center',
    },

    emptyIconText: {
      fontSize: 20,
      color: '#1C3358',
      fontWeight: '900',
    },

    emptyTitle: {
      marginTop: 13,
      fontSize: 15,
      color: '#334155',
      fontWeight: '900',
    },

    emptyText: {
      marginTop: 5,
      fontSize: 11,
      color: '#94A3B8',
      textAlign: 'center',
    },

    /* ===============================================
       PROFILE
    =============================================== */

    profileContainer: {
      flex: 1,
      backgroundColor: '#F4F7FB',
    },

    profileContainerMobile: {
      backgroundColor: '#F5F7FA',
    },

    profileContent: {
      padding: 24,
      paddingBottom: 40,
    },

    profileBackButton: {
      alignSelf: 'flex-start',
      minHeight: 40,
      paddingRight: 13,
      paddingLeft: 4,
      borderRadius: 9,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },

    profileBackButtonMobile: {
      minHeight: 36,
      marginBottom: 10,
    },

    profileBackText: {
      color: '#1C3358',
      fontSize: 27,
      lineHeight: 28,
      fontWeight: '500',
      marginRight: 5,
    },

    profileBackLabel: {
      color: '#1C3358',
      fontSize: 11,
      fontWeight: '900',
    },

    profileHero: {
      padding: 22,
      borderRadius: 16,
      backgroundColor: '#1C3358',
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },

    profileHeroMobile: {
      padding: 16,
      borderRadius: 14,
      marginBottom: 11,
    },

    profileAvatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: '#294565',
      borderWidth: 2,
      borderColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },

    profileAvatarExpanded: {
      width: 180,
      height: 180,
      borderRadius: 90,
    },

    profileAvatarText: {
      color: '#FFFFFF',
      fontSize: 25,
      fontWeight: '900',
    },

    profileAvatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: 90,
    },

    profileHeroContent: {
      flex: 1,
      marginLeft: 15,
    },

    profileName: {
      fontSize: 24,
      color: '#FFFFFF',
      fontWeight: '900',
    },

    profileNameMobile: {
      fontSize: 18,
    },

    profileMva: {
      marginTop: 4,
      color: '#C9D5E6',
      fontSize: 10,
      fontWeight: '700',
    },

    profileMvaRow: {
      marginTop: 4,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 10,
    },

    updateProfileButton: {
      minHeight: 32,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#D7E0EA',
      alignItems: 'center',
      justifyContent: 'center',
    },

    updateProfileButtonPressed: {
      opacity: 0.75,
    },

    updateProfileButtonText: {
      color: '#1C3358',
      fontSize: 10,
      fontWeight: '900',
    },

    profileHeroMeta: {
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
    },

    profileClass: {
      color: '#E2E8F0',
      fontSize: 10,
      fontWeight: '800',
    },

    profileSection: {
      marginBottom: 14,
      padding: 18,
      borderRadius: 14,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },

    profileSectionHeader: {
      minHeight: 48,
      paddingBottom: 13,
      marginBottom: 2,
      borderBottomWidth: 1,
      borderBottomColor: '#EEF2F7',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    profileSectionHeaderPressed: {
      opacity: 0.7,
    },

    profileSectionHeaderText: {
      flex: 1,
      minWidth: 0,
    },

    profileSectionChevron: {
      marginLeft: 12,
      fontSize: 20,
      lineHeight: 20,
      color: '#1C3358',
      fontWeight: '900',
    },

    profileSectionTitle: {
      fontSize: 14,
      color: '#1C3358',
      fontWeight: '900',
    },

    profileSectionSubtitle: {
      marginTop: 3,
      fontSize: 10,
      color: '#94A3B8',
    },

    infoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },

    infoRow: {
      width: '50%',
      paddingTop: 12,
      paddingRight: 18,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#F1F5F9',
    },

    infoRowFull: {
      width: '100%',
    },

    infoLabel: {
      fontSize: 9,
      color: '#94A3B8',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },

    infoValue: {
      marginTop: 4,
      fontSize: 12,
      color: '#334155',
      fontWeight: '700',
      lineHeight: 18,
    },

    profileBottomSpace: {
      height: 20,
    },
  });