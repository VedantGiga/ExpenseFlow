import { useState } from 'react';
import { submitExpense } from '../utils/api';

const ExpenseForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    expense_date: '',
    description: '',
    original_currency: 'USD',
    receipt: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await submitExpense(formData);
      setFormData({ amount: '', category: '', expense_date: '', description: '', original_currency: 'USD', receipt: null });
      onSubmit();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-medium text-gray-800">Add Expense</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: e.target.value})}
          className="border rounded-lg px-3 py-2"
          required
        />
        <select
          value={formData.original_currency}
          onChange={(e) => setFormData({...formData, original_currency: e.target.value})}
          className="border rounded-lg px-3 py-2"
        >
          {currencies.map(currency => (
            <option key={currency} value={currency}>{currency}</option>
          ))}
        </select>
      </div>

      <select
        value={formData.category}
        onChange={(e) => setFormData({...formData, category: e.target.value})}
        className="w-full border rounded-lg px-3 py-2"
        required
      >
        <option value="">Select Category</option>
        <option value="travel">Travel</option>
        <option value="meals">Meals</option>
        <option value="office">Office Supplies</option>
        <option value="accommodation">Accommodation</option>
        <option value="transport">Transport</option>
        <option value="other">Other</option>
      </select>

      <input
        type="date"
        value={formData.expense_date}
        onChange={(e) => setFormData({...formData, expense_date: e.target.value})}
        className="w-full border rounded-lg px-3 py-2"
        required
      />

      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        className="w-full border rounded-lg px-3 py-2"
        rows="3"
      />

      <input
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => setFormData({...formData, receipt: e.target.files[0]})}
        className="w-full border rounded-lg px-3 py-2"
      />

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Expense'}
      </button>
    </form>
  );
};

export default ExpenseForm;