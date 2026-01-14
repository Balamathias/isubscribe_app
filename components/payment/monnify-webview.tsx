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
import { WebView, WebViewNavigation, WebViewMessageEvent } from 'react-native-webview';
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

  // JavaScript to inject into the WebView to listen for Monnify SDK events
  const injectedJavaScript = `
    (function() {
      // Listen for postMessage events from Monnify iframe
      window.addEventListener('message', function(event) {
        try {
          var data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          if (data && (
            data.type === 'monnify' ||
            data.source === 'monnify' ||
            data.event === 'TRANSACTION_COMPLETED' ||
            data.event === 'PAYMENT_COMPLETED' ||
            data.paymentStatus ||
            data.transactionStatus
          )) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'monnify_event',
              data: data
            }));
          }
        } catch(e) {}
      });

      // Intercept Monnify SDK callbacks if available
      var checkMonnify = setInterval(function() {
        if (window.MonnifySDK) {
          clearInterval(checkMonnify);
          var originalComplete = window.MonnifySDK.onComplete;
          var originalClose = window.MonnifySDK.onClose;

          window.MonnifySDK.onComplete = function(response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'monnify_complete',
              data: response
            }));
            if (originalComplete) originalComplete(response);
          };

          window.MonnifySDK.onClose = function(response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'monnify_close',
              data: response
            }));
            if (originalClose) originalClose(response);
          };
        }
      }, 500);

      // Clear interval after 30 seconds to prevent memory leak
      setTimeout(function() { clearInterval(checkMonnify); }, 30000);

      true;
    })();
  `;

  // Handle messages from WebView (Monnify events)
  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      if (message.type === 'monnify_complete' || message.type === 'monnify_event') {
        const data = message.data;
        const status = data?.status || data?.paymentStatus || data?.transactionStatus;

        // Check for success statuses
        if (status === 'PAID' || status === 'SUCCESS' || status === 'COMPLETED' ||
            status === 'paid' || status === 'success' || status === 'completed') {
          onPaymentComplete('success');
          return;
        }

        // Check for failed statuses
        if (status === 'FAILED' || status === 'failed' || status === 'EXPIRED' || status === 'expired') {
          onPaymentComplete('failed');
          return;
        }
      }

      if (message.type === 'monnify_close') {
        // User closed the Monnify modal - treat as pending and let balance monitor handle
        onPaymentComplete('pending');
      }
    } catch (e) {
      // Silently ignore parsing errors
    }
  }, [onPaymentComplete]);

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
    const urlLower = url.toLowerCase();

    // Success patterns - check various payment gateway success indicators
    if (urlLower.includes('payment-complete') ||
        urlLower.includes('payment-success') ||
        urlLower.includes('status=paid') ||
        urlLower.includes('status=successful') ||
        urlLower.includes('paymentstatus=paid') ||
        urlLower.includes('paymentstatus=success') ||
        urlLower.includes('transaction_status=success') ||
        urlLower.includes('/success')) {
      onPaymentComplete('success');
      return;
    }

    // Failed patterns
    if (urlLower.includes('payment-failed') ||
        urlLower.includes('payment-error') ||
        urlLower.includes('status=failed') ||
        urlLower.includes('paymentstatus=failed') ||
        urlLower.includes('transaction_status=failed') ||
        urlLower.includes('/failed') ||
        urlLower.includes('/error')) {
      onPaymentComplete('failed');
      return;
    }

    // Cancelled patterns
    if (urlLower.includes('payment-cancelled') ||
        urlLower.includes('payment-cancel') ||
        urlLower.includes('status=cancelled') ||
        urlLower.includes('status=canceled') ||
        urlLower.includes('/cancelled') ||
        urlLower.includes('/canceled')) {
      onPaymentComplete('cancelled');
      return;
    }

    // Monnify's redirect URL with transaction references
    // When payment completes, Monnify redirects with these params
    // We treat this as 'pending' to let the balance monitor or polling confirm success
    if (url.includes('transactionReference=') && url.includes('paymentReference=')) {
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
                onMessage={handleMessage}
                injectedJavaScript={injectedJavaScript}
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
