// import BottomSheet from '@/components/ui/bottom-sheet';
// import { COLORS } from '@/constants/colors';
// import { useTheme } from '@/contexts/theme-context';
// import { Ionicons } from '@expo/vector-icons';
// import React from 'react';
// import { Text, TouchableOpacity, View } from 'react-native';
// import Animated, { FadeInDown } from 'react-native-reanimated';

// interface ThemeSelectionModalProps {
//   isVisible: boolean;
//   onClose: () => void;
// }

// type ThemeOption = {
//   mode: 'auto' | 'light' | 'dark';
//   title: string;
//   description: string;
//   icon: string;
// };

// const ThemeSelectionModal: React.FC<ThemeSelectionModalProps> = ({ isVisible, onClose }) => {
//   const { themeMode, currentTheme, setThemeMode } = useTheme();
//   const colors = COLORS[currentTheme];

//   const themeOptions: ThemeOption[] = [
//     {
//       mode: 'auto',
//       title: 'Auto',
//       description: 'Follow system setting',
//       icon: 'phone-portrait-outline'
//     },
//     {
//       mode: 'light',
//       title: 'Light Mode',
//       description: 'Always use light theme',
//       icon: 'sunny-outline'
//     },
//     {
//       mode: 'dark',
//       title: 'Dark Mode',
//       description: 'Always use dark theme',
//       icon: 'moon-outline'
//     }
//   ];

//   const handleThemeSelect = (mode: 'auto' | 'light' | 'dark') => {
//     // setThemeMode(mode);
//     onClose();
//   };

//   return (
//     <BottomSheet isVisible={isVisible} onClose={onClose} title="Choose Theme">
//       <View className="pb-6">
//         <Text className="text-muted-foreground text-sm mb-6 px-2">
//           Select your preferred theme appearance for the app
//         </Text>
        
//         <View className="gap-y-4">
//           {themeOptions.map((option, index) => (
//             <Animated.View
//               key={option.mode}
//               entering={FadeInDown.delay(index * 100)}
//             >
//               <TouchableOpacity
//                 onPress={() => handleThemeSelect(option.mode)}
//                 className={`flex-row items-center p-4 rounded-xl border ${
//                   themeMode === option.mode 
//                     ? 'border-primary bg-primary/5' 
//                     : 'border-border bg-card'
//                 }`}
//               >
//                 <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
//                   themeMode === option.mode 
//                     ? 'bg-primary/10' 
//                     : 'bg-secondary'
//                 }`}>
//                   <Ionicons 
//                     name={option.icon as any} 
//                     size={24} 
//                     color={themeMode === option.mode ? colors.primary : colors.mutedForeground} 
//                   />
//                 </View>
                
//                 <View className="flex-1">
//                   <Text className={`font-semibold text-base ${
//                     themeMode === option.mode ? 'text-primary' : 'text-foreground'
//                   }`}>
//                     {option.title}
//                   </Text>
//                   <Text className="text-muted-foreground text-sm">
//                     {option.description}
//                   </Text>
//                 </View>

//                 {themeMode === option.mode && (
//                   <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
//                     <Ionicons name="checkmark" size={16} color="white" />
//                   </View>
//                 )}
//               </TouchableOpacity>
//             </Animated.View>
//           ))}
//         </View>

//         <View className="mt-6 p-4 bg-secondary rounded-xl">
//           <View className="flex-row items-center mb-2">
//             <Ionicons name="information-circle-outline" size={16} color={colors.mutedForeground} />
//             <Text className="text-muted-foreground font-medium text-sm ml-2">Current Theme</Text>
//           </View>
//           <Text className="text-foreground text-sm">
//             Currently using <Text className="font-semibold capitalize">{currentTheme}</Text> theme
//             {themeMode === 'auto' && ' (following system setting)'}
//           </Text>
//         </View>
//       </View>
//     </BottomSheet>
//   );
// };

// export default ThemeSelectionModal;
