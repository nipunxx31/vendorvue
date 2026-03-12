import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { registerVendor, loginVendor } from '../../utils/api';
import VideoBackground from '../../components/VideoBackground';

export default function VendorLogin() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    name: '',
    category: 'snacks',
    lat: '22.2587',
    lng: '73.3570',
    address: 'Parul University'
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.phone.match(/^[0-9]{10}$/)) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    if (isRegister && !formData.name.trim()) {
      alert('Please enter your business name');
      return;
    }

    setLoading(true);

    try {
      let response;
      if (isRegister) {
        response = await registerVendor({
          phone: formData.phone,
          password: formData.password,
          name: formData.name,
          category: formData.category,
          location: {
            lat: parseFloat(formData.lat),
            lng: parseFloat(formData.lng),
            address: formData.address
          }
        });
      } else {
        response = await loginVendor(formData.phone, formData.password);
      }

      // Store vendor info in localStorage
      const vendor = response.data.vendor;
      localStorage.setItem('vendorUid', vendor.uid);
      localStorage.setItem('vendorId', vendor._id || vendor.uid);
      localStorage.setItem('vendorPhone', vendor.phone);
      localStorage.setItem('isVendor', 'true');

      navigate('/vendor/dashboard');
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <VideoBackground />
      <div className="relative z-10 max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-600 mb-2">vendorvue</h1>
          <p className="text-gray-600">Vendor Portal</p>
        </div>

        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              !isRegister
                ? 'bg-white text-orange-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              isRegister
                ? 'bg-white text-orange-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
              placeholder="10-digit phone number"
              maxLength="10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password * (min 8 characters)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent pr-10"
                placeholder="Enter password"
                minLength="8"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  placeholder="Enter business name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                >
                  <option value="snacks">Snacks</option>
                  <option value="meals">Meals</option>
                  <option value="beverages">Beverages</option>
                  <option value="desserts">Desserts</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p>📍 Default location: Parul University</p>
                <p className="text-xs mt-1">You can update location later from dashboard</p>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-orange-600 hover:underline text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

