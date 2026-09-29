import { supabase } from '../lib/supabase';

export type DashboardCounts = {
  students: number;
  staff: number;
  families: number;
  teachers: number;
};

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const [
    studentsResult,
    staffResult,
    familiesResult,
    teachersResult,
  ] = await Promise.all([
    // Total students
    supabase
      .from('students')
      .select('id', { count: 'exact', head: true }),

    // Total staff
    supabase
      .from('staff')
      .select('id', { count: 'exact', head: true }),

    // Total families
    supabase
      .from('families')
      .select('id', { count: 'exact', head: true }),

    // Teaching staff only
    supabase
      .from('staff')
      .select('id', { count: 'exact', head: true })
      .eq('staff_type', 'TEACHING'),
  ]);

  if (studentsResult.error) {
    throw new Error(
      `Unable to fetch student count: ${studentsResult.error.message}`,
    );
  }

  if (staffResult.error) {
    throw new Error(
      `Unable to fetch staff count: ${staffResult.error.message}`,
    );
  }

  if (familiesResult.error) {
    throw new Error(
      `Unable to fetch family count: ${familiesResult.error.message}`,
    );
  }

  if (teachersResult.error) {
    throw new Error(
      `Unable to fetch teaching staff count: ${teachersResult.error.message}`,
    );
  }

  return {
    students: studentsResult.count ?? 0,
    staff: staffResult.count ?? 0,
    families: familiesResult.count ?? 0,
    teachers: teachersResult.count ?? 0,
  };
}