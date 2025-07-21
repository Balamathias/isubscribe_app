import StarryBackground from '@/components/starry-background';
import Header from '@/components/transactions/header';
import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import Animated, {
  FadeIn,
  Layout,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'account' | 'payments' | 'technical';
}

const faqData: FAQ[] = [
  {
    id: '1',
    question: 'How do I create an account?',
    answer: 'To create an account, download the isubscribe app and tap "Sign Up". Enter your phone number, email, and create a secure password. You\'ll receive a verification code via SMS to confirm your account.',
    category: 'account'
  },
  {
    id: '2',
    question: 'How do I fund my wallet?',
    answer: 'You can fund your wallet through bank transfer to your virtual account, debit card payments, or USSD transfer. All funding methods are secure and processed instantly.',
    category: 'payments'
  },
  {
    id: '3',
    question: 'What services can I buy on isubscribe?',
    answer: 'isubscribe offers data bundles, airtime, electricity bills, cable TV subscriptions, education pins (JAMB, WAEC), and more. We support all major networks and service providers in Nigeria.',
    category: 'general'
  },
  {
    id: '4',
    question: 'How do I buy data bundles?',
    answer: 'Go to the Data section, select your network, choose from Super, Best, or Regular plans, enter the recipient\'s phone number, select your preferred bundle, and confirm payment.',
    category: 'general'
  },
  {
    id: '5',
    question: 'Why was my transaction declined?',
    answer: 'Transactions can be declined due to insufficient funds, network issues, or incorrect details. Check your wallet balance and ensure all information is correct before retrying.',
    category: 'technical'
  },
  {
    id: '6',
    question: 'How long does it take for services to be delivered?',
    answer: 'Most services are delivered instantly. Data and airtime are credited within seconds, while utility bills may take 1-5 minutes depending on the provider.',
    category: 'general'
  },
  {
    id: '7',
    question: 'Can I get a refund for failed transactions?',
    answer: 'Yes, failed transactions are automatically refunded to your wallet within 24 hours. If you don\'t receive your refund, contact our support team.',
    category: 'payments'
  },
  {
    id: '8',
    question: 'How do I verify my electricity meter?',
    answer: 'Enter your meter number and select your electricity provider. Click "Verify" to confirm the meter details. You\'ll see the customer name and address if verification is successful.',
    category: 'general'
  },
  {
    id: '9',
    question: 'What is the difference between Super, Best, and Regular data plans?',
    answer: 'Super plans offer the best value with bonus data, Best plans provide good value for money, and Regular plans are standard packages. All plans work on the same network quality.',
    category: 'general'
  },
  {
    id: '10',
    question: 'How secure is my personal information?',
    answer: 'We use bank-level encryption to protect your data. Your personal information is never shared with third parties without your consent, and all payments are processed securely.',
    category: 'account'
  },
  {
    id: '11',
    question: 'Can I use biometric authentication?',
    answer: 'Yes, you can enable fingerprint or face ID in the settings for quick and secure access to your account and transaction confirmations.',
    category: 'account'
  },
  {
    id: '12',
    question: 'What should I do if I forgot my PIN?',
    answer: 'You can reset your PIN by going to Settings > Security > Reset PIN. You\'ll need to verify your identity through SMS or email verification.',
    category: 'technical'
  }
];

const categories = [
  { id: 'all', name: 'All', icon: 'apps-outline' },
  { id: 'general', name: 'General', icon: 'help-circle-outline' },
  { id: 'account', name: 'Account', icon: 'person-outline' },
  { id: 'payments', name: 'Payments', icon: 'card-outline' },
  { id: 'technical', name: 'Technical', icon: 'settings-outline' },
];

// Memoized FAQ Item Component
const FAQItem = React.memo(({ item, index, isExpanded, onToggle }: { 
  item: FAQ; 
  index: number; 
  isExpanded: boolean;
  onToggle: (id: string) => void;
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];

  // Create shared values only once per component
  const rotateZ = useSharedValue(isExpanded ? 180 : 0);
  const height = useSharedValue(isExpanded ? 1 : 0);

  // Only update animations when isExpanded changes
  React.useEffect(() => {
    rotateZ.value = withSpring(isExpanded ? 180 : 0, {
      damping: 15,
      stiffness: 100,
    });
    height.value = withTiming(isExpanded ? 1 : 0, { 
      duration: 300 
    });
  }, [isExpanded]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotateZ.value}deg` }],
  }), []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: height.value,
    transform: [{ scaleY: height.value }],
  }), []);

  const handlePress = useCallback(() => {
    onToggle(item.id);
  }, [item.id, onToggle]);

  return (
    <Animated.View
      entering={FadeIn.delay(index * 50)} // Reduced delay for faster appearance
      layout={Layout.springify()}
      className="mb-3"
    >
      <TouchableOpacity
        onPress={handlePress}
        className="bg-transparent rounded-xl p-4 shadow-none border border-border"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-foreground font-semibold text-base">
              {item.question}
            </Text>
          </View>
          <Animated.View style={iconStyle}>
            <Ionicons
              name="chevron-down"
              size={20}
              color={colors.mutedForeground}
            />
          </Animated.View>
        </View>

        {isExpanded && (
          <Animated.View
            style={contentStyle}
            className="mt-3 pt-3 border-t border-border"
          >
            <Text className="text-muted-foreground text-sm leading-6">
              {item.answer}
            </Text>
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

// Memoized Category Item Component
const CategoryItem = React.memo(({ category, isSelected, onSelect }: { 
  category: typeof categories[0]; 
  isSelected: boolean;
  onSelect: (id: string) => void;
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];

  const scale = useSharedValue(isSelected ? 1.05 : 1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }), []);

  React.useEffect(() => {
    scale.value = withSpring(isSelected ? 1.05 : 1, {
      damping: 15,
      stiffness: 100,
    });
  }, [isSelected]);

  const handlePress = useCallback(() => {
    onSelect(category.id);
  }, [category.id, onSelect]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Animated.View
        style={animatedStyle}
        className={`px-4 py-2 rounded-full mr-3 flex-row items-center ${
          isSelected ? 'bg-primary' : 'bg-secondary'
        }`}
      >
        <Ionicons
          name={category.icon as any}
          size={16}
          color={isSelected ? '#FFFFFF' : colors.mutedForeground}
          style={{ marginRight: 6 }}
        />
        <Text
          className={`font-medium text-sm ${
            isSelected ? 'text-white' : 'text-muted-foreground'
          }`}
        >
          {category.name}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
});

// Memoized Empty State Component
const EmptyState = React.memo(() => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];

  return (
    <Animated.View
      entering={FadeIn.delay(300)}
      className="items-center justify-center py-12"
    >
      <View className="w-20 h-20 rounded-full bg-muted items-center justify-center mb-4">
        <Ionicons name="search-outline" size={40} color={colors.mutedForeground} />
      </View>
      <Text className="text-foreground text-lg font-semibold mb-2">
        No FAQs Found
      </Text>
      <Text className="text-muted-foreground text-center px-8">
        Try adjusting your search or category filter
      </Text>
    </Animated.View>
  );
});

const FAQScreen = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredFAQs = useMemo(() => {
    return faqData.filter(faq => {
      const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleHelpPress = useCallback(() => {
    router.push('/help');
  }, []);

  const renderFAQItem = useCallback(({ item, index }: { item: FAQ; index: number }) => (
    <FAQItem 
      item={item} 
      index={index} 
      isExpanded={expandedItems.has(item.id)}
      onToggle={toggleExpand}
    />
  ), [expandedItems, toggleExpand]);

  const renderCategoryItem = useCallback(({ item }: { item: typeof categories[0] }) => (
    <CategoryItem 
      category={item} 
      isSelected={selectedCategory === item.id}
      onSelect={handleCategorySelect}
    />
  ), [selectedCategory, handleCategorySelect]);

  const keyExtractor = useCallback((item: FAQ) => item.id, []);
  const categoryKeyExtractor = useCallback((item: typeof categories[0]) => item.id, []);

  return (
    <SafeAreaView className={`flex-1 bg-background ${theme}`} edges={['bottom']}>
      <StarryBackground intensity='high'>
        <Header title={'Frequently Asked Questions'} />

        <View className="flex-1 p-4">
          <Animated.View
            entering={FadeIn.delay(200)}
            className="bg-secondary rounded-xl p-1.5 px-4 flex-row items-center mb-4"
          >
            <Ionicons name="search" size={20} color={colors.mutedForeground} />
            <TextInput
              placeholder="Search frequently asked questions..."
              placeholderTextColor={colors.mutedForeground}
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-foreground text-base"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </Animated.View>

          <Animated.View entering={FadeIn.delay(300)} className="mb-4">
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={categoryKeyExtractor}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 16 }}
              removeClippedSubviews={false}
              initialNumToRender={categories.length}
            />
          </Animated.View>

          <Animated.View entering={FadeIn.delay(400)} className="mb-4">
            <Text className="text-muted-foreground text-sm">
              {filteredFAQs.length} {filteredFAQs.length === 1 ? 'question' : 'questions'} found
            </Text>
          </Animated.View>

          <FlatList
            data={filteredFAQs}
            renderItem={renderFAQItem}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={EmptyState}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 20,
            }}
            removeClippedSubviews={false}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={10}
            getItemLayout={undefined}
            keyboardShouldPersistTaps="handled"
          />
        </View>

        <Animated.View
          entering={SlideInDown.delay(500)}
          className="absolute bottom-6 right-6"
        >
          <TouchableOpacity
            onPress={handleHelpPress}
            className="bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg"
            style={{
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Ionicons name="chatbubble-ellipses" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </StarryBackground>
    </SafeAreaView>
  );
};

export default FAQScreen;
