import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    companyName: ''
  });
  const [error, setError] = useState('');
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name,currencies')
      .then(res => res.json())
      .then(data => {
        const countryList = data
          .map(country => ({
            name: country.name.common,
            currency: Object.keys(country.currencies || {})[0] || 'N/A'
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(countryList);
        setLoading(false);
      })
      .catch(() => {
        setCountries([{ name: 'Error loading countries', currency: '' }]);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await api.post('/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        country: formData.country,
        companyName: formData.companyName
      });

      localStorage.setItem('token', response.data.token);
      login(response.data.user.role);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Signup</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full border rounded-lg px-3 py-2"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full border rounded-lg px-3 py-2"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full border rounded-lg px-3 py-2"
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            className="w-full border rounded-lg px-3 py-2"
            required
          />

          <input
            type="text"
            placeholder="Company Name (Optional)"
            value={formData.companyName}
            onChange={(e) => setFormData({...formData, companyName: e.target.value})}
            className="w-full border rounded-lg px-3 py-2"
          />

          <select
            value={formData.country}
            onChange={(e) => setFormData({...formData, country: e.target.value})}
            className="w-full border rounded-lg px-3 py-2"
            required
            disabled={loading}
          >
            <option value="">{loading ? 'Loading countries...' : 'Select Country'}</option>
            {countries.map(country => (
              <option key={country.name} value={country.name}>
                {country.name} ({country.currency})
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Create Admin Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSignup;