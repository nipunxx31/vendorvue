import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-5xl font-bold text-orange-600 mb-4">vendorvue</h1>
        <p className="text-gray-600 mb-8 text-lg">
          Discover and order from nearby hyperlocal vendors. No queues, no wait times.
        </p>
        <div className="space-y-4">
          <Link
            to="/customer/login"
            className="block w-full bg-orange-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-orange-700 transition-colors shadow-lg"
          >
            Order as Customer
          </Link>
          <Link
            to="/vendor/login"
            className="block w-full bg-white text-orange-600 py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors border-2 border-orange-600 shadow-lg"
          >
            Vendor Login
          </Link>
        </div>
        <p className="mt-8 text-sm text-gray-500">
          Hyperlocal • Zero Commission • 5-Minute Onboarding
        </p>
      </div>
    </div>
  );
}

