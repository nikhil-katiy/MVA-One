import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },

  scrollContent: {
    padding: 22,
    paddingBottom: 60,
  },

  /* =====================================================
     HEADER
  ===================================================== */

  header: {
    minHeight: 86,

    paddingHorizontal: 20,
    paddingVertical: 16,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#E2E8F0',

    borderRadius: 14,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 18,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',

    flex: 1,
  },

  headerIcon: {
    width: 46,
    height: 46,

    borderRadius: 12,

    backgroundColor: '#EAF0F8',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 13,
  },

  headerIconText: {
    color: '#1C3358',

    fontSize: 25,
    fontWeight: '900',
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: '#172033',

    fontSize: 22,
    fontWeight: '900',
  },

  subtitle: {
    marginTop: 4,

    color: '#64748B',

    fontSize: 13,
    fontWeight: '500',
  },

  backButton: {
    minHeight: 40,

    paddingHorizontal: 15,

    borderRadius: 8,

    backgroundColor: '#1C3358',

    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: 10,
  },

  backText: {
    color: '#FFFFFF',

    fontSize: 13,
    fontWeight: '800',
  },

  /* =====================================================
     SECTION
  ===================================================== */

  section: {
    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#E2E8F0',

    borderRadius: 14,

    padding: 20,

    marginBottom: 18,
  },

  sectionTitle: {
    color: '#1C3358',

    fontSize: 17,
    fontWeight: '900',

    marginBottom: 18,
  },

  /* =====================================================
     GRID
  ===================================================== */

  grid: {
    flexDirection: 'row',

    flexWrap: 'wrap',

    marginHorizontal: -7,
  },

  gridMobile: {
    flexDirection: 'column',

    marginHorizontal: 0,
  },

  /* =====================================================
     FIELD
  ===================================================== */

  field: {
    marginBottom: 16,
  },

  fieldDesktop: {
    width: '50%',

    paddingHorizontal: 7,
  },

  fieldMobile: {
    width: '100%',
  },

  label: {
    color: '#334155',

    fontSize: 12,
    fontWeight: '800',

    marginBottom: 7,
  },

  required: {
    color: '#DC2626',
  },

  /* =====================================================
     INPUT
  ===================================================== */

  input: {
    minHeight: 46,

    borderWidth: 1,
    borderColor: '#CBD5E1',

    borderRadius: 9,

    paddingHorizontal: 13,

    backgroundColor: '#FFFFFF',

    color: '#172033',

    fontSize: 13,
  },

  inputError: {
    borderColor: '#DC2626',
  },

  textArea: {
    minHeight: 105,

    paddingTop: 12,

    textAlignVertical: 'top',
  },

  /* =====================================================
     DROPDOWN
  ===================================================== */

  selectContainer: {
    height: 52,
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  selectError: {
    borderColor: '#DC2626',
  },

  picker: {
    height: 52,
    width: '100%',
  },

  dropdownLoading: {
    height: 46,

    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: '#64748B',

    fontSize: 12,
  },

  /* =====================================================
     STAFF CHILD
  ===================================================== */

  switchRow: {
    minHeight: 64,

    marginTop: 2,

    paddingHorizontal: 14,

    borderRadius: 10,

    backgroundColor: '#F8FAFC',

    borderWidth: 1,
    borderColor: '#E2E8F0',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  switchText: {
    flex: 1,
  },

  switchTitle: {
    color: '#172033',

    fontSize: 14,
    fontWeight: '800',
  },

  switchSubtitle: {
    marginTop: 3,

    color: '#64748B',

    fontSize: 11,
  },

  /* =====================================================
     ERROR
  ===================================================== */

  errorText: {
    marginTop: 5,

    color: '#DC2626',

    fontSize: 11,
    fontWeight: '600',
  },

  formError: {
    marginBottom: 16,

    padding: 12,

    borderWidth: 1,
    borderColor: '#FECACA',

    borderRadius: 9,

    backgroundColor: '#FEF2F2',
  },

  formErrorText: {
    color: '#B91C1C',

    fontSize: 12,
    fontWeight: '700',
  },

  /* =====================================================
     ACTIONS
  ===================================================== */

  actions: {
    flexDirection: 'row',

    justifyContent: 'flex-end',

    alignItems: 'center',

    gap: 12,

    marginTop: 2,
  },

  actionsMobile: {
    flexDirection: 'column-reverse',

    alignItems: 'stretch',
  },

  cancelButton: {
    minHeight: 46,

    paddingHorizontal: 22,

    borderRadius: 9,

    borderWidth: 1,
    borderColor: '#CBD5E1',

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    color: '#334155',

    fontSize: 13,
    fontWeight: '800',
  },

  submitButton: {
    minHeight: 46,

    minWidth: 150,

    paddingHorizontal: 24,

    borderRadius: 9,

    backgroundColor: '#1C3358',

    alignItems: 'center',
    justifyContent: 'center',
  },

  submitText: {
    color: '#FFFFFF',

    fontSize: 13,
    fontWeight: '900',
  },

  submitDisabled: {
    opacity: 0.6,
  },

  buttonPressed: {
    opacity: 0.78,
  },

  buttonDisabled: {
    opacity: 0.55,
  },

  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  logo: {
    width: 180,
    height: 70,
  },
  
  photoPickerButton: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  photoPickerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },

  studentPhotoPreview: {
    width: 140,
    height: 140,
    borderRadius: 10,
    marginTop: 12,
    alignSelf: 'center',
    backgroundColor: '#F1F5F9',
  },

  pickerItem: {
    fontSize: 14,
    color: '#0F172A',
  },

});

export default styles;