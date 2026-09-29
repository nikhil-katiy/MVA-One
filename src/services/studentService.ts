import { supabase } from '@/lib/supabase';
import { File } from 'expo-file-system';

export async function uploadStudentPhoto(
  studentId: number,
  fileUri: string,
  mimeType?: string | null
): Promise<string> {
  try {
    const file = new File(fileUri);

    if (!file.exists) {
      throw new Error(
        'Selected student photo file does not exist on the device.'
      );
    }

    const contentType =
      mimeType || 'image/jpeg';

    const extension =
      contentType === 'image/png'
        ? 'png'
        : contentType === 'image/webp'
          ? 'webp'
          : 'jpg';

    const filePath =
      `students/${studentId}/profile.${extension}`;

    const arrayBuffer =
      await file.arrayBuffer();

    const {
      error: uploadError,
    } = await supabase.storage
      .from('st_photos')
      .upload(
        filePath,
        arrayBuffer,
        {
          contentType,
          upsert: true,
        }
      );

    if (uploadError) {
      throw new Error(
        `Student photo upload failed: ${uploadError.message}`
      );
    }

    const {
      error: updateError,
    } = await supabase
      .from('students')
      .update({
        student_image: filePath,
      })
      .eq('id', studentId);

    if (updateError) {
      await supabase.storage
        .from('st_photos')
        .remove([filePath]);

      throw new Error(
        `Photo path could not be saved: ${updateError.message}`
      );
    }

    return filePath;

  } catch (error) {
    console.error(
      'UPLOAD STUDENT PHOTO ERROR:',
      error
    );

    throw error instanceof Error
      ? error
      : new Error(
          'Unable to read selected student photo.'
        );
  }
}

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

   Student contacts:
   - student_email
   - student_mobile

   Family contacts:
   - father_email / father_mobile
   - mother_email / mother_mobile
   - guardian_email / guardian_mobile

   Family matching uses ANY of these 8 contact values.
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

  /* Student contact */
  student_email?: string | null;
  student_mobile?: string | null;

  /* Family contact */
  father_name?: string | null;
  father_mobile?: string | null;
  father_email?: string | null;
  father_occupation?: string | null;

  mother_name?: string | null;
  mother_mobile?: string | null;
  mother_email?: string | null;
  mother_occupation?: string | null;

  guardian_name?: string | null;
  guardian_mobile?: string | null;
  guardian_email?: string | null;
  guardian_relation?: string | null;

  /* Family address */
  family_address?: string | null;
  family_city?: string | null;
  family_state?: string | null;
  family_pincode?: string | null;

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

  /* Kept temporarily for backward compatibility with the old DB column. */
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
   GET STUDENT EDIT DATA
========================================================= */

export async function getStudentEditData(id: number): Promise<{
  student: Student;
  family: Family | null;
}> {
  const student = await getStudentById(id);

  if (!student.family_id) {
    return { student, family: null };
  }

  const { data: family, error } = await supabase
    .from('families')
    .select(`
      id,
      family_name,
      father_name,
      father_mobile,
      father_email,
      father_occupation,
      mother_name,
      mother_mobile,
      mother_email,
      mother_occupation,
      guardian_name,
      guardian_mobile,
      guardian_email,
      guardian_relation,
      email,
      address,
      city,
      state,
      pincode,
      created_at,
      updated_at
    `)
    .eq('id', student.family_id)
    .single();

  if (error) {
    throw new Error(`Failed to load family information: ${error.message}`);
  }

  return {
    student,
    family: dataOrNull(family),
  };
}

function dataOrNull<T>(value: T | null): T | null {
  return value ?? null;
}

/* =========================================================
   UPDATE STUDENT
========================================================= */

export async function updateStudent(
  studentId: number,
  studentData: CreateStudentInput
): Promise<Student> {
  const studentPayload = {
    mva_id: studentData.mva_id.trim(),
    family_id: studentData.family_id ?? null,
    first_name: studentData.first_name.trim(),
    middle_name: studentData.middle_name?.trim() || null,
    last_name: studentData.last_name?.trim() || null,
    date_of_birth: studentData.date_of_birth ?? null,
    date_of_admission: studentData.date_of_admission ?? null,
    joining_academic_year: studentData.joining_academic_year?.trim() || null,
    joining_class: studentData.joining_class?.trim() || null,
    class_residential_address: studentData.class_residential_address?.trim() || null,
    pincode: studentData.pincode?.trim() || null,
    aadhaar_number: studentData.aadhaar_number?.trim() || null,
    student_type: studentData.student_type,
    previous_school: studentData.previous_school?.trim() || null,
    nationality: studentData.nationality?.trim() || null,
    staff_child: studentData.staff_child ?? false,
    caste_category_id: studentData.caste_category_id,
    caste: studentData.caste?.trim() || null,
    gender_id: studentData.gender_id ?? null,
    email: normalizeEmail(studentData.student_email),
    mobile: normalizeMobile(studentData.student_mobile),
    status: studentData.status,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('students')
    .update(studentPayload)
    .eq('id', studentId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Student update failed: ${error.message}`);
  }

  if (!data) {
    throw new Error('Student update returned no data.');
  }

  if (studentData.family_id) {
    const familyPayload = {
      father_name: studentData.father_name?.trim() || null,
      father_mobile: normalizeMobile(studentData.father_mobile),
      father_email: normalizeEmail(studentData.father_email),
      father_occupation: studentData.father_occupation?.trim() || null,
      mother_name: studentData.mother_name?.trim() || null,
      mother_mobile: normalizeMobile(studentData.mother_mobile),
      mother_email: normalizeEmail(studentData.mother_email),
      mother_occupation: studentData.mother_occupation?.trim() || null,
      guardian_name: studentData.guardian_name?.trim() || null,
      guardian_mobile: normalizeMobile(studentData.guardian_mobile),
      guardian_email: normalizeEmail(studentData.guardian_email),
      guardian_relation: studentData.guardian_relation?.trim() || null,
      address: studentData.family_address?.trim() || null,
      city: studentData.family_city?.trim() || null,
      state: studentData.family_state?.trim() || null,
      pincode: studentData.family_pincode?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error: familyError } = await supabase
      .from('families')
      .update(familyPayload)
      .eq('id', studentData.family_id);

    if (familyError) {
      throw new Error(`Family update failed: ${familyError.message}`);
    }
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
// ======================================
// class picker
// ======================================
export type ClassOption = {
  id: number;
  class_name: string;
};

export async function getClasses(): Promise<ClassOption[]> {
  const { data, error } = await supabase
    .from('classes')
    .select('id,class_name')
    .order('id', { ascending: true });

  if (error) {
    throw new Error(
      `Failed to load classes: ${error.message}`
    );
  }

  return (data ?? []).map((item) => ({
    id: Number(item.id),
    class_name: item.class_name,
  }));
}

/* =========================================================
   CONTACT NORMALIZATION
========================================================= */

function normalizeEmail(value?: string | null): string | null {
  const normalized = value?.trim().toLowerCase() || '';
  return normalized || null;
}

function normalizeMobile(value?: string | null): string | null {
  const normalized = value?.trim().replace(/[^0-9+]/g, '') || '';
  return normalized || null;
}

/* =========================================================
   FIND FAMILY IDS FROM A SINGLE CONTACT

   IMPORTANT FAMILY RULE:
   - Student email/mobile are personal student contacts.
   - They may still identify a family when the same value is
     already stored in a father/mother/guardian contact.
   - They must NOT identify a family through another student's
     personal email/mobile.

   Therefore every one of the 8 input contacts is checked only
   against family-level parent/guardian contact columns.
========================================================= */

async function findFamilyIdsForContact(
  kind: 'email' | 'mobile',
  value: string
): Promise<number[]> {
  const familyIds = new Set<number>();

  const columns =
    kind === 'email'
      ? (['father_email', 'mother_email', 'guardian_email'] as const)
      : (['father_mobile', 'mother_mobile', 'guardian_mobile'] as const);

  const results = await Promise.all(
    columns.map((column) =>
      kind === 'email'
        ? supabase
            .from('families')
            .select('id')
            .ilike(column, value)
        : supabase
            .from('families')
            .select('id')
            .eq(column, value)
    )
  );

  results.forEach(({ data, error }, index) => {
    if (error) {
      throw new Error(
        `Failed to check family ${columns[index]}: ${error.message}`
      );
    }

    for (const row of data ?? []) {
      if (row.id !== null && row.id !== undefined) {
        familyIds.add(Number(row.id));
      }
    }
  });

  return [...familyIds];
}

/* =========================================================
   FIND EXISTING FAMILY

   Any of these 8 contacts can identify an existing family:
   - Student email
   - Student mobile
   - Father email/mobile
   - Mother email/mobile
   - Guardian email/mobile

   Student email/mobile are matched against family-level
   parent/guardian contacts only (never another student's
   personal contact).

   Rules:
   - No match -> null
   - One family -> return complete family + match sources
   - Multiple families -> conflict; never choose automatically
========================================================= */

export type FamilyMatchSource =
  | 'student_email'
  | 'student_mobile'
  | 'father_email'
  | 'father_mobile'
  | 'mother_email'
  | 'mother_mobile'
  | 'guardian_email'
  | 'guardian_mobile';

export type ExistingFamilyMatch = {
  family: Family;
  matchedBy: FamilyMatchSource[];
};

export type FamilyMatchInput = Pick<
  CreateStudentInput,
  | 'student_email'
  | 'student_mobile'
  | 'father_email'
  | 'father_mobile'
  | 'mother_email'
  | 'mother_mobile'
  | 'guardian_email'
  | 'guardian_mobile'
>;

type FamilyContact = {
  label: string;
  source: FamilyMatchSource;
  kind: 'email' | 'mobile';
  value: string | null;
};

function getFamilyContacts(
  studentData: FamilyMatchInput
): FamilyContact[] {
  return [
    {
      label: 'Student email',
      source: 'student_email',
      kind: 'email',
      value: normalizeEmail(studentData.student_email),
    },
    {
      label: 'Student mobile',
      source: 'student_mobile',
      kind: 'mobile',
      value: normalizeMobile(studentData.student_mobile),
    },
    {
      label: 'Father email',
      source: 'father_email',
      kind: 'email',
      value: normalizeEmail(studentData.father_email),
    },
    {
      label: 'Father mobile',
      source: 'father_mobile',
      kind: 'mobile',
      value: normalizeMobile(studentData.father_mobile),
    },
    {
      label: 'Mother email',
      source: 'mother_email',
      kind: 'email',
      value: normalizeEmail(studentData.mother_email),
    },
    {
      label: 'Mother mobile',
      source: 'mother_mobile',
      kind: 'mobile',
      value: normalizeMobile(studentData.mother_mobile),
    },
    {
      label: 'Guardian email',
      source: 'guardian_email',
      kind: 'email',
      value: normalizeEmail(studentData.guardian_email),
    },
    {
      label: 'Guardian mobile',
      source: 'guardian_mobile',
      kind: 'mobile',
      value: normalizeMobile(studentData.guardian_mobile),
    },
  ];
}

export async function findExistingFamily(
  studentData: FamilyMatchInput
): Promise<ExistingFamilyMatch | null> {
  const contacts = getFamilyContacts(studentData);
  const providedContacts = contacts.filter(
    (contact) => contact.value !== null
  );

  if (providedContacts.length === 0) {
    return null;
  }

  const allFamilyIds = new Set<number>();
  const contactMatches: Array<{
    contact: FamilyContact;
    familyIds: number[];
  }> = [];

  const results = await Promise.all(
    providedContacts.map(async (contact) => ({
      contact,
      familyIds: await findFamilyIdsForContact(
        contact.kind,
        contact.value as string
      ),
    }))
  );

  results.forEach(({ contact, familyIds }) => {
    if (familyIds.length > 0) {
      contactMatches.push({ contact, familyIds });
    }

    familyIds.forEach((id) => allFamilyIds.add(id));
  });

  if (allFamilyIds.size === 0) {
    return null;
  }

  if (allFamilyIds.size > 1) {
    const details = contactMatches
      .map(
        ({ contact, familyIds }) =>
          `${contact.label}: Family ${familyIds.join(', Family ')}`
      )
      .join('; ');

    throw new Error(
      `FAMILY_MATCH_CONFLICT: The entered contact details match different families. ${details}. Please verify the contact details. The entered information may belong to another family.`
    );
  }

  const familyId = [...allFamilyIds][0];

  const { data: family, error } = await supabase
    .from('families')
    .select(`
      id,
      family_name,
      father_name,
      father_mobile,
      father_email,
      father_occupation,
      mother_name,
      mother_mobile,
      mother_email,
      mother_occupation,
      guardian_name,
      guardian_mobile,
      guardian_email,
      guardian_relation,
      email,
      address,
      city,
      state,
      pincode,
      created_at,
      updated_at
    `)
    .eq('id', familyId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load existing family ${familyId}: ${error.message}`
    );
  }

  if (!family) {
    throw new Error(
      `Existing Family ID ${familyId} was found, but its family record could not be loaded.`
    );
  }

  const matchedBy = contactMatches
    .filter(({ familyIds }) => familyIds.includes(familyId))
    .map(({ contact }) => contact.source);

  return {
    family: family as Family,
    matchedBy,
  };
}

async function findExistingFamilyId(
  studentData: CreateStudentInput
): Promise<number | null> {
  const match = await findExistingFamily(studentData);
  return match?.family.id ?? null;
}

/* =========================================================
   CREATE NEW FAMILY

   IMPORTANT:
   Student email/mobile/address are NOT copied into family.
   Family receives only family-level contact/address fields.
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

  const familyPayload = {
    family_name:
      fullName
        ? `${fullName} Family`
        : 'New Family',

    // Father
    father_name:
      studentData.father_name?.trim() || null,

    father_mobile:
      studentData.father_mobile?.trim() || null,

    father_email:
      studentData.father_email
        ?.trim()
        .toLowerCase() || null,

    father_occupation:
      studentData.father_occupation?.trim() || null,

    // Mother
    mother_name:
      studentData.mother_name?.trim() || null,

    mother_mobile:
      studentData.mother_mobile?.trim() || null,

    mother_email:
      studentData.mother_email
        ?.trim()
        .toLowerCase() || null,

    mother_occupation:
      studentData.mother_occupation?.trim() || null,

    // Guardian
    guardian_name:
      studentData.guardian_name?.trim() || null,

    guardian_mobile:
      studentData.guardian_mobile?.trim() || null,

    guardian_email:
      studentData.guardian_email
        ?.trim()
        .toLowerCase() || null,

    guardian_relation:
      studentData.guardian_relation?.trim() || null,

    // Family address
    address:
      studentData.family_address?.trim() || null,

    city:
      studentData.family_city?.trim() || null,

    state:
      studentData.family_state?.trim() || null,

    pincode:
      studentData.family_pincode?.trim() || null,

    // IMPORTANT:
    // Do NOT send families.email here.
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
  if (
    studentData.family_id !== undefined &&
    studentData.family_id !== null
  ) {
    const providedFamilyId = Number(studentData.family_id);

    if (
      !Number.isInteger(providedFamilyId) ||
      providedFamilyId <= 0
    ) {
      throw new Error('Invalid Family ID.');
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

  const existingFamilyId = await findExistingFamilyId(studentData);

  if (existingFamilyId !== null) {
    console.log('EXISTING FAMILY FOUND:', existingFamilyId);
    return existingFamilyId;
  }

  return createNewFamily(studentData);
}

/* =========================================================
   CREATE STUDENT
========================================================= */

export async function createStudent(
  studentData: CreateStudentInput
): Promise<Student> {
  const resolvedFamilyId = await resolveFamilyId(studentData);

  const payload = {
    mva_id: studentData.mva_id.trim(),
    family_id: resolvedFamilyId,

    first_name: studentData.first_name.trim(),
    middle_name: studentData.middle_name?.trim() || null,
    last_name: studentData.last_name?.trim() || null,

    date_of_birth: studentData.date_of_birth ?? null,
    date_of_admission: studentData.date_of_admission ?? null,

    joining_academic_year:
      studentData.joining_academic_year?.trim() || null,
    joining_class: studentData.joining_class?.trim() || null,

    class_residential_address:
      studentData.class_residential_address?.trim() || null,
    pincode: studentData.pincode?.trim() || null,

    aadhaar_number:
      studentData.aadhaar_number?.trim() || null,

    student_type: studentData.student_type,

    previous_school:
      studentData.previous_school?.trim() || null,
    nationality: studentData.nationality?.trim() || null,
    staff_child: studentData.staff_child ?? false,

    caste_category_id: studentData.caste_category_id,
    caste: studentData.caste?.trim() || null,
    gender_id: studentData.gender_id ?? null,
    student_image: studentData.student_image ?? null,

    /* Only student contact goes into students. */
    email: normalizeEmail(studentData.student_email),
    mobile: normalizeMobile(studentData.student_mobile),

    status: studentData.status,
  };

  console.log('CREATE STUDENT FAMILY ID:', resolvedFamilyId);
  console.log('CREATE STUDENT PAYLOAD:', payload);

  const { data, error } = await supabase
    .from('students')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    console.error('CREATE STUDENT SUPABASE ERROR:', error);
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Student could not be created.');
  }

  console.log('STUDENT CREATED:', data);
  return data as Student;
}
