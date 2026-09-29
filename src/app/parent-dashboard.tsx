import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import ParentStudentProfile from '../components/parent/ParentStudentProfile';

import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View
} from 'react-native';

import {
    getCurrentUser,
    logoutUser,
} from '../services/authService';

import { supabase } from '../lib/supabase';

type Child = {
  id: number;
  mva_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string | null;
  student_type: string;
  student_image: string | null;
  status: string | null;
  class_id: number | null;
  section_id: number | null;
  roll_number: number | null;
};

type Family = {
  id: number;
  family_name: string | null;
  father_name: string | null;
  mother_name: string | null;
  guardian_name: string | null;
};

type ClassRow = {
  id: number;
  class_name: string;
};

type SectionRow = {
  id: number;
  section_name: string;
};

export default function ParentDashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1100;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [family, setFamily] =
    useState<Family | null>(null);

  const [children, setChildren] =
    useState<Child[]>([]);

  const [classes, setClasses] =
    useState<ClassRow[]>([]);

  const [sections, setSections] =
    useState<SectionRow[]>([]);

  const [parentName, setParentName] =
    useState('Parent');

  const [error, setError] =
    useState<string | null>(null);

  const [selectedChildId, setSelectedChildId] =
    useState<number | null>(null);  

  const loadDashboard = useCallback(
    async () => {
      try {
        setError(null);

        const currentUser =
          await getCurrentUser();

        if (!currentUser) {
          router.replace('/portal-login');
          return;
        }

        /*
         * Parent account should have FAMILY/PARENT role.
         */
        if (
          currentUser.role !== 'FAMILY' &&
          currentUser.role !== 'PARENT'
        ) {
          if (currentUser.role === 'ADMIN') {
            router.replace('/admin-dashboard');
            return;
          }

          router.replace('/portal-login');
          return;
        }

        const familyId =
          currentUser.profile.family_id;

        if (!familyId) {
          throw new Error(
            'Your account is not linked to a family.',
          );
        }

        /*
         * Load family information.
         *
         * RLS restricts this query to the
         * authenticated user's own family.
         */
        const familyResult =
          await supabase
            .from('families')
            .select(
              `
                id,
                family_name,
                father_name,
                mother_name,
                guardian_name
              `,
            )
            .eq('id', familyId)
            .maybeSingle();

        if (familyResult.error) {
          throw new Error(
            `Unable to load family information: ${familyResult.error.message}`,
          );
        }

        setFamily(familyResult.data);

        /*
         * Determine display name.
         */
        const displayParentName =
          familyResult.data?.father_name ||
          familyResult.data?.mother_name ||
          familyResult.data?.guardian_name ||
          familyResult.data?.family_name ||
          'Parent';

        setParentName(displayParentName);

        /*
         * Load children.
         *
         * RLS makes sure only students belonging
         * to this family are returned.
         */
        const studentsResult =
          await supabase
            .from('students')
            .select(
              `
                id,
                mva_id,
                first_name,
                middle_name,
                last_name,
                student_type,
                student_image,
                status
              `,
            )
            .eq('family_id', familyId)
            .order('first_name', {
              ascending: true,
            });

        if (studentsResult.error) {
          throw new Error(
            `Unable to load children: ${studentsResult.error.message}`,
          );
        }

        const studentRows =
          studentsResult.data ?? [];

        console.log('========== PARENT STUDENT DEBUG ==========');
        console.log('FAMILY ID:', familyId);
        console.log('STUDENT QUERY DATA:', studentsResult.data);
        console.log('STUDENT QUERY ERROR:', studentsResult.error);
        console.log('STUDENT COUNT:', studentRows.length);
        console.log('==========================================');  

        /*
         * Load current/latest class detail
         * for every child.
         */
        const studentIds =
          studentRows.map(student => student.id);

        let classDetails: Array<{
          student_id: number;
          class_id: number;
          section_id: number;
          roll_number: number | null;
        }> = [];

        if (studentIds.length > 0) {
          const classDetailsResult =
            await supabase
              .from('student_class_details')
              .select(
                `
                  student_id,
                  class_id,
                  section_id,
                  roll_number,
                  academic_year_id
                `,
              )
              .in(
                'student_id',
                studentIds,
              )
              .order(
                'academic_year_id',
                {
                  ascending: false,
                },
              );

          if (classDetailsResult.error) {
            throw new Error(
              `Unable to load class details: ${classDetailsResult.error.message}`,
            );
          }

          /*
           * Keep latest class detail for
           * each student.
           */
          const latestMap =
            new Map<
              number,
              {
                student_id: number;
                class_id: number;
                section_id: number;
                roll_number: number | null;
              }
            >();

          for (
            const detail of
              classDetailsResult.data ?? []
          ) {
            if (
              !latestMap.has(
                detail.student_id,
              )
            ) {
              latestMap.set(
                detail.student_id,
                {
                  student_id:
                    detail.student_id,
                  class_id:
                    detail.class_id,
                  section_id:
                    detail.section_id,
                  roll_number:
                    detail.roll_number,
                },
              );
            }
          }

          classDetails =
            Array.from(
              latestMap.values(),
            );
        }

        /*
         * Load class names.
         */
        const classIds = [
          ...new Set(
            classDetails.map(
              detail => detail.class_id,
            ),
          ),
        ];

        if (classIds.length > 0) {
          const classesResult =
            await supabase
              .from('classes')
              .select(
                'id, class_name',
              )
              .in('id', classIds);

          if (classesResult.error) {
            throw new Error(
              `Unable to load classes: ${classesResult.error.message}`,
            );
          }

          setClasses(
            classesResult.data ?? [],
          );
        } else {
          setClasses([]);
        }

        /*
         * Load section names.
         */
        const sectionIds = [
          ...new Set(
            classDetails.map(
              detail => detail.section_id,
            ),
          ),
        ];

        if (sectionIds.length > 0) {
          const sectionsResult =
            await supabase
              .from('sections')
              .select(
                'id, section_name',
              )
              .in(
                'id',
                sectionIds,
              );

          if (sectionsResult.error) {
            throw new Error(
              `Unable to load sections: ${sectionsResult.error.message}`,
            );
          }

          setSections(
            sectionsResult.data ?? [],
          );
        } else {
          setSections([]);
        }

        /*
         * Merge student + class information.
         */
        const mergedChildren: Child[] =
          studentRows.map(student => {
            const detail =
              classDetails.find(
                item =>
                  item.student_id ===
                  student.id,
              );

            return {
              ...student,
              class_id:
                detail?.class_id ?? null,
              section_id:
                detail?.section_id ?? null,
              roll_number:
                detail?.roll_number ?? null,
            };
          });

        setChildren(mergedChildren);
      } catch (err) {
        console.error(
          'PARENT DASHBOARD ERROR:',
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load parent dashboard.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router],
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const handleLogout = async () => {
    try {
      await logoutUser();

      router.replace('/portal-login');
    } catch (err) {
      Alert.alert(
        'Logout Failed',
        err instanceof Error
          ? err.message
          : 'Unable to logout.',
      );
    }
  };

  const getClassName = (
    classId: number | null,
  ) => {
    if (!classId) {
      return 'Class not assigned';
    }

    const row = classes.find(
      item => item.id === classId,
    );

    return row?.class_name ??
      'Class not assigned';
  };

  const getSectionName = (
    sectionId: number | null,
  ) => {
    if (!sectionId) {
      return '';
    }

    const row = sections.find(
      item => item.id === sectionId,
    );

    return row?.section_name ?? '';
  };

  const getStudentName = (
    child: Child,
  ) => {
    return [
      child.first_name,
      child.middle_name,
      child.last_name,
    ]
      .filter(Boolean)
      .join(' ');
  };

    if (selectedChildId !== null) {
    return (
        <ParentStudentProfile
        studentId={selectedChildId}
        onBack={() => setSelectedChildId(null)}
        />
    );
    }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading parent dashboard...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ================= HEADER ================= */}

      <View
        style={[
          styles.header,
          isMobile && styles.mobileHeader,
        ]}>
        <View>
          <Text style={styles.brand}>
            MVA-ONE
          </Text>

          <Text style={styles.portalText}>
            PARENT PORTAL
          </Text>
        </View>

        <View style={styles.headerRight}>
          {!isMobile && (
            <View
              style={styles.parentInfo}>
              <Text
                style={styles.parentName}>
                {parentName}
              </Text>

              <Text
                style={styles.parentRole}>
                Parent
              </Text>
            </View>
          )}

          <Pressable
            onPress={handleLogout}
            style={styles.logoutButton}>
            <Text
              style={styles.logoutButtonText}>
              Logout
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ================= CONTENT ================= */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          isMobile && styles.mobileContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }>

        {/* ================= WELCOME ================= */}

        <View style={styles.welcomeCard}>
          <View>
            <Text
              style={styles.welcomeTitle}>
              Welcome, {parentName}
            </Text>

            <Text
              style={styles.welcomeSubtitle}>
              Manage and view your children's
              academy information.
            </Text>
          </View>
        </View>

        {/* ================= ERROR ================= */}

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>
              Unable to load dashboard
            </Text>

            <Text style={styles.errorText}>
              {error}
            </Text>

            <Pressable
              onPress={handleRefresh}
              style={styles.retryButton}>
              <Text
                style={styles.retryButtonText}>
                Retry
              </Text>
            </Pressable>
          </View>
        )}

        {/* ================= FAMILY ================= */}

        {family && (
          <View style={styles.familyCard}>
            <Text
              style={styles.sectionTitle}>
              Family Information
            </Text>

            <View style={styles.familyGrid}>
              <View style={styles.familyItem}>
                <Text
                  style={styles.itemLabel}>
                  Family
                </Text>

                <Text
                  style={styles.itemValue}>
                  {family.family_name ||
                    'Family'}
                </Text>
              </View>

              {family.father_name && (
                <View
                  style={styles.familyItem}>
                  <Text
                    style={styles.itemLabel}>
                    Father
                  </Text>

                  <Text
                    style={styles.itemValue}>
                    {family.father_name}
                  </Text>
                </View>
              )}

              {family.mother_name && (
                <View
                  style={styles.familyItem}>
                  <Text
                    style={styles.itemLabel}>
                    Mother
                  </Text>

                  <Text
                    style={styles.itemValue}>
                    {family.mother_name}
                  </Text>
                </View>
              )}

              {family.guardian_name && (
                <View
                  style={styles.familyItem}>
                  <Text
                    style={styles.itemLabel}>
                    Guardian
                  </Text>

                  <Text
                    style={styles.itemValue}>
                    {family.guardian_name}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ================= CHILDREN ================= */}

        <View style={styles.childrenHeader}>
          <View>
            <Text
              style={styles.sectionTitle}>
              My Children
            </Text>

            <Text
              style={styles.childrenCount}>
              {children.length}{' '}
              {children.length === 1
                ? 'child'
                : 'children'}
            </Text>
          </View>
        </View>

        {children.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text
              style={styles.emptyTitle}>
              No children found
            </Text>

            <Text
              style={styles.emptyText}>
              No student is currently linked
              to your family account.
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.childrenGrid,
              isMobile &&
                styles.mobileChildrenGrid,
            ]}>

            {children.map(child => {
              const className =
                getClassName(
                  child.class_id,
                );

              const sectionName =
                getSectionName(
                  child.section_id,
                );

              return (
                <View
                  key={child.id}
                  style={[
                    styles.childCard,
                    !isMobile &&
                      isTablet &&
                      styles.tabletChildCard,
                  ]}>

                  {/* PHOTO */}

                  <View
                    style={styles.photoContainer}>
                    {child.student_image ? (
                      <Image
                        source={{
                          uri: child.student_image,
                        }}
                        style={styles.studentImage}
                      />
                    ) : (
                      <View
                        style={
                          styles.photoPlaceholder
                        }>
                        <Text
                          style={
                            styles.photoPlaceholderText
                          }>
                          {child.first_name
                            .charAt(0)
                            .toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* DETAILS */}

                  <View
                    style={styles.childDetails}>
                    <Text
                      style={styles.childName}>
                      {getStudentName(
                        child,
                      )}
                    </Text>

                    <Text
                      style={styles.mvaId}>
                      {child.mva_id}
                    </Text>

                    <View
                      style={
                        styles.classRow
                      }>
                      <Text
                        style={
                          styles.classText
                        }>
                        {className}
                      </Text>

                      {sectionName ? (
                        <Text
                          style={
                            styles.sectionText
                          }>
                          • {sectionName}
                        </Text>
                      ) : null}
                    </View>

                    {child.roll_number !==
                      null && (
                      <Text
                        style={
                          styles.rollText
                        }>
                        Roll No.{' '}
                        {child.roll_number}
                      </Text>
                    )}

                    <Text
                      style={
                        styles.studentType
                      }>
                      {child.student_type}
                    </Text>

                    {child.status && (
                      <Text
                        style={
                          styles.statusText
                        }>
                        Status: {child.status}
                      </Text>
                    )}
                  </View>

                  {/* ACTION */}

                  <Pressable
                    onPress={() => setSelectedChildId(child.id)}
                    style={styles.viewButton}
                    >
                    <Text style={styles.viewButtonText}>
                        View Profile
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        {/* ================= MODULES ================= */}

        <Text
          style={[
            styles.sectionTitle,
            styles.modulesTitle,
          ]}>
          Parent Services
        </Text>

        <View
          style={[
            styles.modulesGrid,
            isMobile &&
              styles.mobileModulesGrid,
          ]}>

          <ModuleCard
            title="Attendance"
            description="View your child's attendance."
            icon="✓"
            onPress={() =>
              Alert.alert(
                'Coming Soon',
                'Attendance module will be connected here.',
              )
            }
          />

          <ModuleCard
            title="Homework"
            description="View homework and assignments."
            icon="📝"
            onPress={() =>
              Alert.alert(
                'Coming Soon',
                'Homework module will be connected here.',
              )
            }
          />

          <ModuleCard
            title="Results"
            description="View examination results."
            icon="📊"
            onPress={() =>
              Alert.alert(
                'Coming Soon',
                'Results module will be connected here.',
              )
            }
          />

          <ModuleCard
            title="Notifications"
            description="View academy notifications."
            icon="🔔"
            onPress={() =>
              Alert.alert(
                'Coming Soon',
                'Notifications module will be connected here.',
              )
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}

/* =========================================================
   MODULE CARD
========================================================= */

type ModuleCardProps = {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
};

function ModuleCard({
  title,
  description,
  icon,
  onPress,
}: ModuleCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.moduleCard}>

      <View style={styles.moduleIcon}>
        <Text
          style={styles.moduleIconText}>
          {icon}
        </Text>
      </View>

      <Text style={styles.moduleTitle}>
        {title}
      </Text>

      <Text
        style={styles.moduleDescription}>
        {description}
      </Text>
    </Pressable>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },

  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },

  header: {
    minHeight: 76,
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  mobileHeader: {
    paddingHorizontal: 16,
  },

  brand: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
  },

  portalText: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 1,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },

  parentInfo: {
    alignItems: 'flex-end',
  },

  parentName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  parentRole: {
    marginTop: 2,
    fontSize: 11,
    color: '#6B7280',
  },

  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },

  logoutButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },

  scrollView: {
    flex: 1,
  },

  content: {
    width: '100%',
    maxWidth: 1300,
    alignSelf: 'center',
    padding: 28,
    paddingBottom: 50,
  },

  mobileContent: {
    padding: 16,
  },

  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },

  welcomeSubtitle: {
    marginTop: 7,
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
  },

  errorCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
  },

  errorTitle: {
    color: '#991B1B',
    fontSize: 15,
    fontWeight: '700',
  },

  errorText: {
    marginTop: 5,
    color: '#7F1D1D',
    fontSize: 13,
  },

  retryButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 7,
    backgroundColor: '#991B1B',
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  familyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 22,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
  },

  familyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 18,
  },

  familyItem: {
    width: '25%',
    minWidth: 180,
    marginBottom: 12,
  },

  itemLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },

  itemValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },

  childrenHeader: {
    marginBottom: 14,
  },

  childrenCount: {
    marginTop: 4,
    color: '#6B7280',
    fontSize: 13,
  },

  childrenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },

  mobileChildrenGrid: {
    flexDirection: 'column',
  },

  childCard: {
    width: 390,
    maxWidth: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  tabletChildCard: {
    width: '48%',
  },

  photoContainer: {
    marginBottom: 15,
  },

  studentImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },

  photoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoPlaceholderText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2563EB',
  },

  childDetails: {
    flex: 1,
  },

  childName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },

  mvaId: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
  },

  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  classText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },

  sectionText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#6B7280',
  },

  rollText: {
    marginTop: 5,
    color: '#6B7280',
    fontSize: 12,
  },

  studentType: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '700',
  },

  statusText: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 11,
  },

  viewButton: {
    marginTop: 18,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
  },

  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },

  emptyText: {
    marginTop: 6,
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
  },

  modulesTitle: {
    marginTop: 32,
    marginBottom: 14,
  },

  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },

  mobileModulesGrid: {
    flexDirection: 'column',
  },

  moduleCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  moduleIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  moduleIconText: {
    fontSize: 19,
  },

  moduleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },

  moduleDescription: {
    marginTop: 5,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
});