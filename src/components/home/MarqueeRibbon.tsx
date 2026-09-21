// import React from 'react';
// import {
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
// } from 'react-native';

// const items = Array.from(
//   { length: 8 },
//   () => 'MACRO VISION ACADEMY'
// );

// export default function MarqueeRibbon() {
//   return (
//     <View style={styles.wrapper}>
//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.track}
//       >
//         {items.map((item, index) => (
//           <View
//             key={`${item}-${index}`}
//             style={styles.item}
//           >
//             <Text style={styles.text}>
//               {item}
//             </Text>

//             <Text style={styles.separator}>
//               •
//             </Text>
//           </View>
//         ))}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: {
//     width: '100%',
//     backgroundColor: '#1C3358',
//     overflow: 'hidden',
//   },

//   track: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   item: {
//     height: 42,
//     paddingHorizontal: 18,

//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   text: {
//     color: '#FFFFFF',
//     fontSize: 13,
//     fontWeight: '700',
//     letterSpacing: 1,
//   },

//   separator: {
//     marginLeft: 18,
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '700',
//   },
// });