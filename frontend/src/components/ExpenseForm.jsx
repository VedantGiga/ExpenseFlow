import { useState } from 'react';

const ExpenseForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    date: '',
    description: '',
    receipt: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ amount: '', category: '', date: '', description: '', receipt: null });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-medium text-gray-800">Add Expense</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          placeholder="Amount"
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: e.target.value})}
          className="border rounded-lg px-3 py-2"
          required
        />
        <select
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          className="border rounded-lg px-3 py-2"
          required
        >
          <option value="">Category</option>
          <option value="travel">Travel</option>
          <option value="meals">Meals</option>
          <option value="office">Office</option>
        </select>
      </div>

      <input
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({...formData, date: e.target.value})}
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
        onChange={(e) => setFormData({...formData, receipt: e.target.files[0]})}
        className="w-full border rounded-lg px-3 py-2"
      />

      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
        Submit Expense
      </button>
    </form>
  );
};

export default ExpenseForm;