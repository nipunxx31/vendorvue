import { useState } from 'react';

export default function RazorpayPayment({ 
  amount, 
  description, 
  onSuccess, 
  onError,
  customerPhone,
  orderId,
  type = 'order' // 'order' or 'wallet'
}) {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay');
      }

      // Note: In production, payment order creation and verification should be handled
      // by a backend/serverless function for security purposes (e.g., Vercel functions)
      
      const razorpayOrderId = `order_${Date.now()}_${orderId}`;
      const key_id = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_key';

      // Razorpay options
      const options = {
        key: key_id,
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'vendorvue',
        description: description || 'Payment for VendorVue',
        order_id: razorpayOrderId,
        prefill: {
          contact: customerPhone,
        },
        handler: async (response) => {
          try {
            // In production, verify the payment signature with backend for security
            onSuccess({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
              customerId: customerPhone,
              timestamp: new Date().toISOString(),
            });
          } catch (error) {
            onError(error.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            onError('Payment cancelled');
          }
        },
        theme: {
          color: '#EA580C' // VendorVue orange color
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      onError(error.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading || !amount || amount <= 0}
      className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <span className="animate-spin">⏳</span>
          Processing...
        </>
      ) : (
        <>
          💳 Pay ₹{amount.toFixed(2)} via Razorpay
        </>
      )}
    </button>
  );
}
