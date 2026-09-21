// import React from 'react';
// import {
//   Platform,
//   StyleSheet,
//   Text,
//   useWindowDimensions,
//   View,
// } from 'react-native';

// const accessItems = [
//   'Student Management',
//   'Teacher Management',
//   'Staff Management',
//   'Family Management',
//   'Academic Operations',
//   'Hostel Management',
//   'Bookings & Services',
//   'Requests & Permissions',
//   'Gate Pass & Security',
//   'Notifications',
//   'Reports',
//   'User & Role Management',
// ];

// export default function AdminInfoPanel() {
//   const { width } = useWindowDimensions();

//   const isMobile = width < 700;
//   const isTablet = width >= 700 && width < 1100;
//   const isAndroid = Platform.OS === 'android';

//   return (
//     <View
//       style={[
//         styles.panel,
//         isTablet && styles.panelTablet,
//         isMobile && styles.panelMobile,
//         isAndroid && styles.panelAndroid,
//       ]}
//     >
//       <View style={styles.panelContent}>
//         <Text
//           style={[
//             styles.eyebrow,
//             isTablet && styles.eyebrowTablet,
//             isMobile && styles.eyebrowMobile,
//           ]}
//         >
//           MVA-ONE
//         </Text>

//         <Text
//           style={[
//             styles.title,
//             isTablet && styles.titleTablet,
//             isMobile && styles.titleMobile,
//           ]}
//         >
//           Administration
//           {'\n'}
//           Portal
//         </Text>

//         <Text
//           style={[
//             styles.description,
//             isTablet &&
//               styles.descriptionTablet,
//             isMobile &&
//               styles.descriptionMobile,
//           ]}
//         >
//           Manage Macro Vision Academy
//           student and campus operations
//           from one secure platform.
//         </Text>

//         <View
//           style={[
//             styles.divider,
//             isMobile && styles.dividerMobile,
//           ]}
//         />

//         <Text
//           style={[
//             styles.accessTitle,
//             isTablet &&
//               styles.accessTitleTablet,
//           ]}
//         >
//           Administrative Access
//         </Text>

//         <View
//           style={[
//             styles.accessList,
//             isTablet &&
//               styles.accessListTablet,
//             isMobile &&
//               styles.accessListMobile,
//             isAndroid && styles.accessListAndroid,
//           ]}
//         >
//           {accessItems.map((item) => (
//             <View
//               key={item}
//               style={styles.accessItem}
//             >
//               <View style={styles.accessDot} />

//               <Text
//                 style={[
//                   styles.accessText,
//                   isTablet &&
//                     styles.accessTextTablet,
//                   isMobile &&
//                     styles.accessTextMobile,
//                 ]}
//               >
//                 {item}
//               </Text>
//             </View>
//           ))}
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   panel: {
//     flex: 1,

//     minWidth: 0,

//     backgroundColor: '#1C3358',

//     paddingHorizontal: 42,
//     paddingVertical: 38,

//     justifyContent: 'center',
//   },

//   panelTablet: {
//     paddingHorizontal: 28,
//     paddingVertical: 26,
//   },

//   panelMobile: {
//     flex: 0,

//     paddingHorizontal: 22,
//     paddingVertical: 28,

//     justifyContent: 'flex-start',
//   },

//   panelAndroid: {
//     paddingHorizontal: 18,
//     paddingVertical: 20,
//   },

//   panelContent: {
//     width: '100%',
//   },

//   eyebrow: {
//     fontSize: 12,
//     fontWeight: '800',

//     letterSpacing: 1.8,

//     color: '#D9922B',
//   },

//   eyebrowTablet: {
//     fontSize: 10,
//   },

//   eyebrowMobile: {
//     fontSize: 10,
//   },

//   title: {
//     marginTop: 11,

//     fontSize: 38,
//     lineHeight: 43,

//     fontWeight: '900',

//     color: '#FFFFFF',
//   },

//   titleTablet: {
//     fontSize: 30,
//     lineHeight: 35,
//   },

//   titleMobile: {
//     fontSize: 29,
//     lineHeight: 35,
//   },

//   description: {
//     marginTop: 14,

//     fontSize: 14,
//     lineHeight: 22,

//     color: 'rgba(255,255,255,0.72)',
//   },

//   descriptionTablet: {
//     fontSize: 13,
//     lineHeight: 20,
//   },

//   descriptionMobile: {
//     fontSize: 14,
//     lineHeight: 22,
//   },

//   divider: {
//     width: 44,
//     height: 3,

//     marginTop: 22,
//     marginBottom: 18,

//     backgroundColor: '#D9922B',

//     borderRadius: 2,
//   },

//   dividerMobile: {
//     marginTop: 20,
//     marginBottom: 16,
//   },

//   accessTitle: {
//     fontSize: 13,
//     fontWeight: '800',

//     color: '#FFFFFF',

//     marginBottom: 11,
//   },

//   accessTitleTablet: {
//     fontSize: 12,
//   },

//   accessList: {
//     gap: 7,
//   },

//   accessListTablet: {
//     gap: 6,
//   },

//   accessListMobile: {
//     gap: 7,
//   },

//   accessListAndroid: {
//     gap: 5,
//   },

//   accessItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   accessDot: {
//     width: 6,
//     height: 6,

//     borderRadius: 3,

//     backgroundColor: '#D9922B',

//     marginRight: 9,
//   },

//   accessText: {
//     flexShrink: 1,

//     fontSize: 12,

//     color: 'rgba(255,255,255,0.76)',

//     fontWeight: '500',
//   },

//   accessTextTablet: {
//     fontSize: 11,
//   },

//   accessTextMobile: {
//     fontSize: 12,
//   },
// });