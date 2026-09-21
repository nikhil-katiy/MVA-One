import { supabase } from '@/lib/supabase';

/* =========================================================
   STUDENT TYPE
========================================================= */

export type Student = {
  id: number;

  mva_id: string;
  family_id: number | null;

  first_name: string;
  middle_name: string | null;
  last_name: string | null;

  date_of_birth: string | null;
  date_of_admission: string | null;

  joining_academic_year: string | null;
  joining_class: string | null;

  class_residential_address: string | null;
  pincode: string | null;
  aadhaar_number: string | null;

  student_type: string;

  previous_school: string | null;
  nationality: string | null;
  staff_child: boolean | null;

  caste_category_id: number;
  caste_category: string | null;
  caste: string | null;

  gender_id: number | null;

  student_image: string | null;

  created_at: string | null;
  updated_at: string | null;

  email: string | null;
  mobile: string | null;
  status: string | null;
};

/* =========================================================
   CREATE STUDENT INPUT

   family_id is OPTIONAL.

   If family_id is not provided:
   1. Search existing students by mobile/email.
   2. If match exists -> use existing family_id.
   3. If no match -> create new family.
========================================================= */

export type CreateStudentInput = {
  mva_id: string;

  family_id?: number | null;

  first_name: string;
  middle_name?: string | null;
  last_name?: string | null;

  date_of_birth?: string | null;
  date_of_admission?: string | null;

  joining_academic_year?: string | null;
  joining_class?: string | null;

  class_residential_address?: string | null;
  pincode?: string | null;
  aadhaar_number?: string | null;

  student_type: string;

  previous_school?: string | null;
  nationality?: string | null;

  staff_child?: boolean | null;

  caste_category_id: number;
  caste?: string | null;

  gender_id?: number | null;

  student_image?: string | null;

  email?: string | null;
  mobile?: string | null;

  status: string;
};

/* =========================================================
   FAMILY TYPE
========================================================= */

export type Family = {
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

  created_at: string | null;
  updated_at: string | null;
};

/* =========================================================
   MASTER DROPDOWN TYPE
========================================================= */

export type MasterOption = {
  id: number;
  code: string;
  name: string;
};

/* =========================================================
   GET ALL STUDENTS
========================================================= */

export async function getStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from('students')
    .select(`
      id,
      mva_id,
      family_id,
      first_name,
      middle_name,
      last_name,
      date_of_birth,
      date_of_admission,
      joining_academic_year,
      joining_class,
      class_residential_address,
      pincode,
      aadhaar_number,
      student_type,
      previous_school,
      nationality,
      staff_child,
      caste_category_id,
      caste_category,
      caste,
      gender_id,
      student_image,
      created_at,
      updated_at,
      email,
      mobile,
      status
    `)
    .order('id', {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Student[];
}

/* =========================================================
   GET STUDENT BY ID
========================================================= */

export async function getStudentById(
  id: number
): Promise<Student> {
  const { data, error } = await supabase
    .from('students')
    .select(`
      id,
      mva_id,
      family_id,
      first_name,
      middle_name,
      last_name,
      date_of_birth,
      date_of_admission,
      joining_academic_year,
      joining_class,
      class_residential_address,
      pincode,
      aadhaar_number,
      student_type,
      previous_school,
      nationality,
      staff_child,
      caste_category_id,
      caste_category,
      caste,
      gender_id,
      student_image,
      created_at,
      updated_at,
      email,
      mobile,
      status
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Student;
}

/* =========================================================
   GET CASTE CATEGORIES
========================================================= */

export async function getCasteCategories(): Promise<MasterOption[]> {
  const { data, error } = await supabase
    .from('caste_categories')
    .select(`
      id,
      category_code,
      category_name
    `)
    .order('id', {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Failed to load caste categories: ${error.message}`
    );
  }

  return (data ?? []).map((item) => ({
    id: Number(item.id),
    code: item.category_code,
    name: item.category_name,
  }));
}

/* =========================================================
   GET GENDERS
========================================================= */

export async function getGenders(): Promise<MasterOption[]> {
  const { data, error } = await supabase
    .from('genders')
    .select(`
      id,
      gender_code,
      gender_name
    `)
    .order('id', {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Failed to load genders: ${error.message}`
    );
  }

  return (data ?? []).map((item) => ({
    id: Number(item.id),
    code: item.gender_code,
    name: item.gender_name,
  }));
}

/* =========================================================
   FIND FAMILY BY STUDENT MOBILE / EMAIL
========================================================= */

async function findExistingFamilyId(
  email?: string | null,
  mobile?: string | null
): Promise<number | null> {
  const cleanEmail =
    email?.trim().toLowerCase() || null;

  const cleanMobile =
    mobile?.trim() || null;

  /*
   * Nothing to search.
   */
  if (!cleanEmail && !cleanMobile) {
    return null;
  }

  /*
   * Search by EMAIL.
   */
  let emailStudent: {
    family_id: number | null;
  } | null = null;

  if (cleanEmail) {
    const { data, error } = await supabase
      .from('students')
      .select('family_id')
      .ilike('email', cleanEmail)
      .not('family_id', 'is', null)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to check student email: ${error.message}`
      );
    }

    emailStudent = data;
  }

  /*
   * Search by MOBILE.
   */
  let mobileStudent: {
    family_id: number | null;
  } | null = null;

  if (cleanMobile) {
    const { data, error } = await supabase
      .from('students')
      .select('family_id')
      .eq('mobile', cleanMobile)
      .not('family_id', 'is', null)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to check student mobile: ${error.message}`
      );
    }

    mobileStudent = data;
  }

  const emailFamilyId =
    emailStudent?.family_id ?? null;

  const mobileFamilyId =
    mobileStudent?.family_id ?? null;

  /*
   * No existing family found.
   */
  if (
    emailFamilyId === null &&
    mobileFamilyId === null
  ) {
    return null;
  }

  /*
   * Email and mobile point to different families.
   *
   * Example:
   *
   * email -> family 1
   * mobile -> family 2
   *
   * We must NOT automatically choose one.
   */
  if (
    emailFamilyId !== null &&
    mobileFamilyId !== null &&
    emailFamilyId !== mobileFamilyId
  ) {
    throw new Error(
      'The entered email and mobile number belong to different families. Please verify the student contact details.'
    );
  }

  /*
   * Either email or mobile found the family.
   */
  return (
    emailFamilyId ??
    mobileFamilyId
  );
}

/* =========================================================
   CREATE NEW FAMILY
========================================================= */

async function createNewFamily(
  studentData: CreateStudentInput
): Promise<number> {
  const firstName =
    studentData.first_name.trim();

  const lastName =
    studentData.last_name?.trim() || '';

  const fullName =
    `${firstName} ${lastName}`.trim();

  /*
   * IMPORTANT:
   *
   * We DO NOT send "id".
   *
   * families.id is an identity column.
   * PostgreSQL generates it automatically.
   */

  const familyPayload = {
    family_name:
      fullName
        ? `${fullName} Family`
        : 'New Family',

    email:
      studentData.email?.trim().toLowerCase() ||
      null,

    address:
      studentData.class_residential_address?.trim() ||
      null,

    pincode:
      studentData.pincode?.trim() ||
      null,
  };

  console.log(
    'CREATE NEW FAMILY PAYLOAD:',
    familyPayload
  );

  const { data, error } = await supabase
    .from('families')
    .insert(familyPayload)
    .select('id')
    .single();

  if (error) {
    console.error(
      'CREATE FAMILY SUPABASE ERROR:',
      error
    );

    throw new Error(
      `Unable to create family: ${error.message}`
    );
  }

  if (!data?.id) {
    throw new Error(
      'Family was created but no Family ID was returned.'
    );
  }

  const familyId = Number(data.id);

  console.log(
    'NEW FAMILY CREATED:',
    familyId
  );

  return familyId;
}

/* =========================================================
   RESOLVE FAMILY ID
========================================================= */

async function resolveFamilyId(
  studentData: CreateStudentInput
): Promise<number> {
  /*
   * If an explicit family_id was provided,
   * verify that it actually exists.
   *
   * This protects against the old error:
   *
   * fk_students_family
   */

  if (
    studentData.family_id !== undefined &&
    studentData.family_id !== null
  ) {
    const providedFamilyId =
      Number(studentData.family_id);

    if (
      !Number.isInteger(
        providedFamilyId
      ) ||
      providedFamilyId <= 0
    ) {
      throw new Error(
        'Invalid Family ID.'
      );
    }

    const { data, error } = await supabase
      .from('families')
      .select('id')
      .eq('id', providedFamilyId)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to verify Family ID: ${error.message}`
      );
    }

    if (!data) {
      throw new Error(
        `Family ID ${providedFamilyId} does not exist.`
      );
    }

    return Number(data.id);
  }

  /*
   * No family_id provided.
   *
   * Now check whether email/mobile
   * belongs to an existing student.
   */

  const existingFamilyId =
    await findExistingFamilyId(
      studentData.email,
      studentData.mobile
    );

  if (existingFamilyId !== null) {
    console.log(
      'EXISTING FAMILY FOUND:',
      existingFamilyId
    );

    return existingFamilyId;
  }

  /*
   * No matching student.
   *
   * Create a completely new family.
   */

  return await createNewFamily(
    studentData
  );
}

/* =========================================================
   CREATE STUDENT
========================================================= */

export async function createStudent(
  studentData: CreateStudentInput
): Promise<Student> {
  /*
   * -------------------------------------------------------
   * STEP 1
   * Resolve Family ID.
   *
   * Existing family:
   *   reuse family_id
   *
   * New student:
   *   create family
   *
   * Matching mobile/email:
   *   same family_id
   * -------------------------------------------------------
   */

  const resolvedFamilyId =
    await resolveFamilyId(
      studentData
    );

  /*
   * -------------------------------------------------------
   * STEP 2
   * Build student payload.
   * -------------------------------------------------------
   */

  const payload = {
    mva_id:
      studentData.mva_id.trim(),

    family_id:
      resolvedFamilyId,

    first_name:
      studentData.first_name.trim(),

    middle_name:
      studentData.middle_name?.trim() ||
      null,

    last_name:
      studentData.last_name?.trim() ||
      null,

    date_of_birth:
      studentData.date_of_birth ??
      null,

    date_of_admission:
      studentData.date_of_admission ??
      null,

    joining_academic_year:
      studentData.joining_academic_year?.trim() ||
      null,

    joining_class:
      studentData.joining_class?.trim() ||
      null,

    class_residential_address:
      studentData.class_residential_address?.trim() ||
      null,

    pincode:
      studentData.pincode?.trim() ||
      null,

    aadhaar_number:
      studentData.aadhaar_number?.trim() ||
      null,

    student_type:
      studentData.student_type,

    previous_school:
      studentData.previous_school?.trim() ||
      null,

    nationality:
      studentData.nationality?.trim() ||
      null,

    staff_child:
      studentData.staff_child ??
      false,

    caste_category_id:
      studentData.caste_category_id,

    caste:
      studentData.caste?.trim() ||
      null,

    gender_id:
      studentData.gender_id ??
      null,

    student_image:
      studentData.student_image ??
      null,

    email:
      studentData.email?.trim().toLowerCase() ||
      null,

    mobile:
      studentData.mobile?.trim() ||
      null,

    status:
      studentData.status,
  };

  console.log(
    'CREATE STUDENT FAMILY ID:',
    resolvedFamilyId
  );

  console.log(
    'CREATE STUDENT PAYLOAD:',
    payload
  );

  /*
   * -------------------------------------------------------
   * STEP 3
   * Insert student.
   * -------------------------------------------------------
   */

  const { data, error } = await supabase
    .from('students')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    console.error(
      'CREATE STUDENT SUPABASE ERROR:',
      error
    );

    throw new Error(
      error.message
    );
  }

  if (!data) {
    throw new Error(
      'Student could not be created.'
    );
  }

  console.log(
    'STUDENT CREATED:',
    data
  );

  return data as Student;
}