import React, { useState, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useThemedColors } from '@/hooks/useThemedColors';

export type MonnifyPaymentStatus = 'success' | 'failed' | 'cancelled' | 'pending';

interface MonnifyWebViewProps {
  isVisible: boolean;
  checkoutUrl: string;
  paymentReference: string;
  onPaymentComplete: (status: MonnifyPaymentStatus) => void;
  onClose: () => void;
}

/**
 * Full-screen WebView modal for Monnify checkout
 * Detects payment completion via URL changes
 */
const MonnifyWebView: React.FC<MonnifyWebViewProps> = ({
  isVisible,
  checkoutUrl,
  paymentReference,
  onPaymentComplete,
  onClose,
}) => {
  const { colors } = useThemedColors();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  // Reset state when modal opens
  React.useEffect(() => {
    if (isVisible) {
      setIsLoading(true);
      setError(null);
    }
  }, [isVisible]);

  // Detect payment completion from URL changes
  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    const { url } = navState;

    // Monnify redirects to these URLs after payment
    // Success: Contains transactionReference and paymentReference in query params
    // Also check for common success patterns

    if (url.includes('payment-complete') || url.includes('payment-success')) {
      // Payment completed successfully
      onPaymentComplete('success');
      return;
    }

    if (url.includes('payment-failed') || url.includes('payment-error')) {
      // Payment failed
      onPaymentComplete('failed');
      return;
    }

    if (url.includes('payment-cancelled') || url.includes('payment-cancel')) {
      // User cancelled
      onPaymentComplete('cancelled');
      return;
    }

    // Check for Monnify's redirect URL patterns
    // When payment is complete, Monnify redirects with transactionReference param
    if (url.includes('transactionReference=') && url.includes('paymentReference=')) {
      // Payment was made - status depends on the page content
      // For now, treat as success and let polling confirm
      onPaymentComplete('pending');
      return;
    }
  }, [onPaymentComplete]);

  // Handle WebView errors
  const handleError = useCallback(() => {
    setError('Failed to load payment page. Please check your internet connection and try again.');
    setIsLoading(false);
  }, []);

  // Handle user closing the modal
  const handleClose = useCallback(() => {
    // User manually closed - treat as cancelled
    onClose();
  }, [onClose]);

  // Retry loading the page
  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    webViewRef.current?.reload();
  }, []);

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="card-outline" size={24} color={colors.primary} />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 18,
                fontWeight: '600',
                color: colors.foreground,
              }}
            >
              Complete Payment
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.muted + '30',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="close" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* WebView or Error State */}
        <View style={{ flex: 1 }}>
          {error ? (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
              }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: '#EF444420',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <Ionicons name="warning-outline" size={40} color="#EF4444" />
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: colors.foreground,
                  textAlign: 'center',
                  marginBottom: 8,
                }}
              >
                Connection Error
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.mutedForeground,
                  textAlign: 'center',
                  marginBottom: 24,
                }}
              >
                {error}
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={handleClose}
                  style={{
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ color: colors.foreground, fontWeight: '500' }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleRetry}
                  style={{
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: colors.primary,
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '500' }}>
                    Try Again
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <WebView
                ref={webViewRef}
                source={{ uri: checkoutUrl }}
                onNavigationStateChange={handleNavigationStateChange}
                onLoadStart={() => setIsLoading(true)}
                onLoadEnd={() => setIsLoading(false)}
                onError={handleError}
                onHttpError={handleError}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                style={{ flex: 1, backgroundColor: colors.background }}
                // Allow all URLs to load within the WebView
                originWhitelist={['*']}
                // Handle SSL errors gracefully in production
                onShouldStartLoadWithRequest={(request) => {
                  // Allow all requests - Monnify handles redirects internally
                  return true;
                }}
              />

              {/* Loading Overlay */}
              {isLoading && (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: colors.background,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text
                    style={{
                      marginTop: 16,
                      fontSize: 14,
                      color: colors.mutedForeground,
                    }}
                  >
                    Loading payment page...
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Security Notice */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
            backgroundColor: colors.muted + '20',
          }}
        >
          <Ionicons name="lock-closed" size={14} color={colors.mutedForeground} />
          <Text
            style={{
              marginLeft: 6,
              fontSize: 12,
              color: colors.mutedForeground,
            }}
          >
            Secured by Monnify
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default MonnifyWebView;
