import { COLORS } from '@/constants/colors';
import { useGetAccount, useInitiateGuestTransaction, useGuestTransactionStatus, QUERY_KEYS } from '@/services/api-hooks';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ActivityIndicator, Clipboard, Platform, Text, ToastAndroid, TouchableOpacity, View, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { useQueryClient } from '@tanstack/react-query';
import BottomSheet from '../ui/bottom-sheet';
import GenerateAccountForm from './generate-account-form';
import FundingMethodSelector from './funding-method-selector';
import CheckoutFundingView from './checkout-funding-view';
import FundingProcessingView from './funding-processing-view';
import FundingStatusView from './funding-status-view';
import MonnifyWebView, { MonnifyPaymentStatus } from '../payment/monnify-webview';
import { useSession } from '../session-context';

// ==============================================
// Types
// ==============================================

type FundingFlow =
  | 'accounts'           // Show virtual accounts (existing)
  | 'method_select'      // Show funding method options
  | 'checkout_form'      // Amount entry form
  | 'webview'            // Monnify WebView open
  | 'processing'         // Polling for status
  | 'success'            // Funding successful
  | 'failed'             // Funding failed
  | 'generate_account';  // Generate account form

interface FundingState {
  flow: FundingFlow;
  amount: number | null;
  paymentReference: string | null;
  checkoutUrl: string | null;
  error: string | null;
}

const initialState: FundingState = {
  flow: 'accounts',
  amount: null,
  paymentReference: null,
  checkoutUrl: null,
  error: null,
};

// ==============================================
// Credit Card Component (unchanged)
// ==============================================

interface CreditCardProps {
  colors: string[];
  accountNumber: string;
  bankName: string;
  accountName: string;
  onCopy?: () => void;
}

export const CreditCard: React.FC<CreditCardProps> = ({
  colors,
  accountNumber,
  bankName,
  accountName,
  onCopy
}) => {
  return (
    <LinearGradient
      colors={colors as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="rounded-2xl p-5 w-full md:w-1/2 min-h-[180px] overflow-hidden"
    >
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center flex-1 mr-2">
          <Ionicons name="card-outline" size={24} color="#fff" />
          <Text className="text-white font-semibold text-lg ml-2 flex-wrap">isubscribe Virtual</Text>
        </View>
        <View className="flex-row">
          <View className="w-4 h-4 rounded-full bg-white/30 mr-1" />
          <View className="w-4 h-4 rounded-full bg-white/30" />
        </View>
      </View>
      <Text className="text-white/80 text-xs mb-1">ACCOUNT NUMBER</Text>
      <View className="flex-row justify-between items-center">
        <Text className="text-white font-bold text-2xl flex-1 mr-2 flex-wrap">{accountNumber}</Text>
        <TouchableOpacity onPress={onCopy} className="bg-white rounded-full p-3">
          <Ionicons name="copy-outline" size={20} color="#7B2FF2" />
        </TouchableOpacity>
      </View>
      <View className="flex-row justify-between items-start mt-4">
        <View className="flex-1 mr-2">
          <Text className="text-white/80 text-xs mb-1">BANK NAME</Text>
          <Text className="text-white font-semibold flex-wrap text-sm sm:text-base">{bankName}</Text>
        </View>
        <View className="items-end flex-1">
          <Text className="text-white/80 text-xs mb-1">ACCOUNT NAME</Text>
          <Text className="text-white font-semibold text-sm sm:text-base text-right flex-wrap">{accountName}</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

// ==============================================
// Main Component
// ==============================================

interface FundWalletBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

const FundWalletBottomSheet: React.FC<FundWalletBottomSheetProps> = ({ isVisible, onClose }) => {
  const queryClient = useQueryClient();
  const { profile, refetchBalance, walletBalance } = useSession();

  // Account data
  const { data: accountData, isPending: isLoadingAccount, refetch: refetchAccount } = useGetAccount();
  const account = accountData?.data || null;
  const hasPalmPayAccount = !!account?.palmpay_account_number;
  const hasReservedAccount = !!account?.account_number;
  const hasAnyAccount = hasPalmPayAccount || hasReservedAccount;

  // Funding state
  const [state, setState] = useState<FundingState>(initialState);
  const { flow, amount, paymentReference, checkoutUrl, error } = state;

  // Track wallet balance to detect successful payment
  const previousBalanceRef = useRef<number | null>(null);

  // API hooks
  const { mutateAsync: initiateCheckout, isPending: isInitiating } = useInitiateGuestTransaction();

  // Poll for transaction status
  const { data: txStatusData } = useGuestTransactionStatus(paymentReference, {
    enabled: flow === 'processing' && !!paymentReference,
  });

  // ==============================================
  // Effects
  // ==============================================

  // Reset state when sheet opens/closes
  useEffect(() => {
    if (isVisible) {
      // Always reset to initial state when opening
      setState(initialState);
      refetchAccount();
    }
    // Note: We don't reset on close since handleDone already does that
    // and resetting on close can cause flickering
  }, [isVisible, refetchAccount]);

  // Set initial flow after account data loads
  useEffect(() => {
    if (isVisible && !isLoadingAccount) {
      if (hasAnyAccount) {
        setState(prev => ({ ...prev, flow: 'accounts' }));
      } else {
        setState(prev => ({ ...prev, flow: 'method_select' }));
      }
    }
  }, [isVisible, isLoadingAccount, hasAnyAccount]);

  // Handle transaction status updates from polling
  useEffect(() => {
    if (txStatusData?.data && flow === 'processing') {
      const txStatus = txStatusData.data.fulfillment_status;

      if (txStatus === 'success') {
        setState(prev => ({ ...prev, flow: 'success', error: null }));
        // Refresh balance
        refetchBalance?.();
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getWalletBalance] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getLatestTransactions] });
        Toast.show({ type: 'success', text1: 'Wallet funded successfully!' });
      } else if (txStatus === 'failed') {
        setState(prev => ({
          ...prev,
          flow: 'failed',
          error: txStatusData.data?.fulfillment_error || 'Transaction failed',
        }));
      }
    }
  }, [txStatusData, flow, refetchBalance, queryClient]);

  // Monitor wallet balance changes while WebView is open
  // This is the PRIMARY detection method for successful payments
  // since wallet balance updates in real-time via Supabase subscription
  useEffect(() => {
    if (flow === 'webview' && walletBalance?.balance !== undefined) {
      const currentBalance = walletBalance.balance;
      const previousBalance = previousBalanceRef.current;

      // If balance increased while WebView is open, payment was successful
      if (previousBalance !== null && currentBalance > previousBalance) {
        // Payment successful - close immediately
        Toast.show({ type: 'success', text1: 'Payment successful!' });
        refetchBalance?.();
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getWalletBalance] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getLatestTransactions] });
        // Reset state and close
        setState(initialState);
        onClose();
      }
    }
  }, [flow, walletBalance?.balance, refetchBalance, queryClient, onClose]);

  // ==============================================
  // Handlers
  // ==============================================

  const handleCopy = useCallback(async (text: string) => {
    try {
      await Clipboard.setString(text);

      if (Platform.OS === 'android') {
        ToastAndroid.show('Account number copied to clipboard', ToastAndroid.SHORT);
      } else {
        Toast.show({
          type: 'success',
          text1: 'Account Number copied successfully.'
        });
      }
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  }, []);

  // Transition to checkout form
  const handleSelectCheckout = useCallback(() => {
    setState(prev => ({ ...prev, flow: 'checkout_form' }));
  }, []);

  // Transition to generate account form
  const handleSelectCreateAccount = useCallback(() => {
    setState(prev => ({ ...prev, flow: 'generate_account' }));
  }, []);

  // Handle done (close sheet) - defined early so other handlers can use it
  const handleDone = useCallback(() => {
    setState(initialState);
    onClose();
  }, [onClose]);

  // Handle checkout form submission
  const handleProceedWithAmount = useCallback(async (fundAmount: number) => {
    try {
      const response = await initiateCheckout({
        channel: 'wallet_fund',
        amount: fundAmount,
        guest_email: profile?.email || undefined,
        mobile: true, // Request checkout URL for WebView
      });

      if (response.error || !response.data) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Failed to initiate funding',
        });
        return;
      }

      const { payment_reference, checkout_url } = response.data;

      // Ensure we have a checkout URL for the WebView
      if (!checkout_url) {
        Toast.show({
          type: 'error',
          text1: 'Payment Error',
          text2: 'Unable to initialize payment gateway. Please try again.',
        });
        return;
      }

      // Store current balance before opening WebView to detect changes
      previousBalanceRef.current = walletBalance?.balance ?? null;

      setState(prev => ({
        ...prev,
        flow: 'webview',
        amount: fundAmount,
        paymentReference: payment_reference,
        checkoutUrl: checkout_url, // Already validated above
        error: null,
      } as FundingState));
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err?.message || 'An error occurred',
      });
    }
  }, [initiateCheckout, profile?.email, walletBalance?.balance]);

  // Handle Monnify payment completion
  const handlePaymentComplete = useCallback((status: MonnifyPaymentStatus) => {
    if (status === 'success') {
      // Payment successful - close modal immediately
      // Wallet balance updates in real-time via Supabase subscription
      Toast.show({ type: 'success', text1: 'Payment successful!' });
      refetchBalance?.();
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getWalletBalance] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getLatestTransactions] });
      handleDone();
    } else if (status === 'pending') {
      // Payment pending - start polling to confirm
      setState(prev => ({ ...prev, flow: 'processing' }));
    } else if (status === 'cancelled') {
      // User cancelled - go back to form
      setState(prev => ({
        ...prev,
        flow: 'checkout_form',
        paymentReference: null,
        checkoutUrl: null,
      }));
    } else {
      // Failed
      setState(prev => ({
        ...prev,
        flow: 'failed',
        error: 'Payment was not completed',
      }));
    }
  }, [refetchBalance, queryClient, handleDone]);

  // Handle WebView close (user manually closes)
  const handleWebViewClose = useCallback(() => {
    // If payment reference exists, check status via polling
    if (paymentReference) {
      setState(prev => ({ ...prev, flow: 'processing' }));
    } else {
      setState(prev => ({
        ...prev,
        flow: 'checkout_form',
        checkoutUrl: null,
      }));
    }
  }, [paymentReference]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (flow === 'checkout_form') {
      setState(prev => ({
        ...prev,
        flow: hasAnyAccount ? 'accounts' : 'method_select',
        amount: null,
        error: null,
      }));
    } else if (flow === 'generate_account') {
      setState(prev => ({
        ...prev,
        flow: hasAnyAccount ? 'accounts' : 'method_select',
      }));
    }
  }, [flow, hasAnyAccount]);

  // Handle retry after failure
  const handleRetry = useCallback(() => {
    setState(prev => ({
      ...prev,
      flow: 'checkout_form',
      paymentReference: null,
      checkoutUrl: null,
      error: null,
    }));
  }, []);

  // Handle generate account success
  const handleGenerateAccountSuccess = useCallback(() => {
    refetchAccount();
    setState(prev => ({ ...prev, flow: 'accounts' }));
  }, [refetchAccount]);

  // ==============================================
  // Render Helpers
  // ==============================================

  // Render accounts view with "Fund Now" button
  const renderAccountsView = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="space-y-4">
        {/* Account Cards */}
        <View className="flex-col md:flex-row justify-center items-center gap-4">
          {hasReservedAccount && (
            <CreditCard
              colors={['#6017b9', '#af5eed']}
              accountNumber={account?.account_number || ''}
              bankName="Moniepoint"
              accountName={"iSubscribe Network Technology.-" + account?.account_name}
              onCopy={() => handleCopy(account?.account_number || '')}
            />
          )}

          {hasPalmPayAccount && (
            <CreditCard
              colors={['#a13ae1', '#740faa']}
              accountNumber={account?.palmpay_account_number || '**********'}
              bankName={'Palmpay'}
              accountName={account?.palmpay_account_name || '****** ******'}
              onCopy={() => handleCopy(account?.palmpay_account_number || '**********')}
            />
          )}
        </View>

        {/* Fund Now Button */}
        <TouchableOpacity
          onPress={handleSelectCheckout}
          activeOpacity={0.8}
          className="mt-4 overflow-hidden rounded-2xl"
        >
          <LinearGradient
            colors={['#740faa', '#a13ae1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-4 flex-row items-center justify-center"
          >
            <Ionicons name="flash" size={20} color="#fff" />
            <Text className="text-white font-semibold text-base ml-2">
              Fund Now (Card/Bank/USSD)
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Generate Account Option (if only PalmPay exists) */}
        {!hasReservedAccount && hasPalmPayAccount && (
          <View className="mt-2 p-4 bg-muted/10 rounded-xl">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-3">
                <Text className="text-foreground font-medium mb-1">
                  Need an Alternative?
                </Text>
                <Text className="text-muted-foreground text-sm">
                  Generate a reserved account for bank transfers
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleSelectCreateAccount}
                className="bg-primary rounded-lg px-4 py-2"
              >
                <Text className="text-white font-medium text-sm">Generate</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );

  // ==============================================
  // Render
  // ==============================================

  // Get title based on flow
  const getTitle = () => {
    switch (flow) {
      case 'checkout_form':
        return 'Fund Wallet';
      case 'processing':
        return 'Processing';
      case 'success':
        return 'Success';
      case 'failed':
        return 'Failed';
      case 'generate_account':
        return 'Create Account';
      default:
        return 'Fund Your Wallet';
    }
  };

  return (
    <View>
      <BottomSheet
        isVisible={isVisible && flow !== 'webview'}
        onClose={handleDone}
        title={getTitle()}
      >
        {/* Loading State */}
        {isLoadingAccount && (
          <View className="items-center justify-center py-8">
            <ActivityIndicator color={COLORS.light.primary} />
          </View>
        )}

        {/* Accounts View */}
        {!isLoadingAccount && flow === 'accounts' && renderAccountsView()}

        {/* Method Selector (for users without accounts) */}
        {!isLoadingAccount && flow === 'method_select' && (
          <FundingMethodSelector
            onSelectCheckout={handleSelectCheckout}
            onSelectCreateAccount={handleSelectCreateAccount}
          />
        )}

        {/* Checkout Form */}
        {flow === 'checkout_form' && (
          <CheckoutFundingView
            onBack={handleBack}
            onProceed={handleProceedWithAmount}
            isLoading={isInitiating}
          />
        )}

        {/* Processing View */}
        {flow === 'processing' && amount && (
          <FundingProcessingView amount={amount} />
        )}

        {/* Success/Failed View */}
        {(flow === 'success' || flow === 'failed') && amount && (
          <FundingStatusView
            status={flow}
            amount={amount}
            error={error || undefined}
            onDone={handleDone}
            onRetry={flow === 'failed' ? handleRetry : undefined}
          />
        )}

        {/* Generate Account Form */}
        {flow === 'generate_account' && (
          <GenerateAccountForm
            isVisible={true}
            onClose={handleBack}
            onSuccess={handleGenerateAccountSuccess}
            isInline={true}
          />
        )}
      </BottomSheet>

      {/* Monnify WebView (full screen) */}
      {flow === 'webview' && checkoutUrl && paymentReference && (
        <MonnifyWebView
          isVisible={true}
          checkoutUrl={checkoutUrl}
          paymentReference={paymentReference}
          onPaymentComplete={handlePaymentComplete}
          onClose={handleWebViewClose}
        />
      )}
    </View>
  );
};

export default FundWalletBottomSheet;
