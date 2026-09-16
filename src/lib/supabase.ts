import 'react-native-url-polyfill/auto';
import {createClient} from '@supabase/supabase-js';

const supabaseUrl = 'https://akoqipzcjvpjjagkvovh.supabase.co';
const supabasePublishableKey = 'sb_publishable_Q3LIlm8c5xVRER-Huc_OAQ_se9YR8bK';

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
);
