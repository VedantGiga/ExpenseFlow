import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const ApprovalRules = () => {
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    min_amount: '',
    max_amount: '',
    percentage_threshold: '',
    specific_approver_id: '',
    is_hybrid: false,
    steps: []
  });

  useEffect(() => {
    fetchRules();
    fetchUsers();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await api.get('/approval-rules');
      setRules(response.data);
    } catch (error) {
      console.error('Failed to fetch rules:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/approval-rules', formData);
      setFormData({
        name: '',
        min_amount: '',
        max_amount: '',
        percentage_threshold: '',
        specific_approver_id: '',
        is_hybrid: false,
        steps: []
      });
      setShowForm(false);
      fetchRules();
    } catch (error) {
      console.error('Failed to create rule:', error);
    }
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { order: formData.steps.length + 1, approver_id: '', is_manager_step: false }]
    });
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[index][field] = value;
    setFormData({ ...formData, steps: newSteps });
  };

  const removeStep = (index) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({ ...formData, steps: newSteps });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Approval Rules</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Rule
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Create Approval Rule</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Rule Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                step="0.01"
                placeholder="Min Amount"
                value={formData.min_amount}
                onChange={(e) => setFormData({...formData, min_amount: e.target.value})}
                className="border rounded-lg px-3 py-2"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Max Amount"
                value={formData.max_amount}
                onChange={(e) => setFormData({...formData, max_amount: e.target.value})}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Percentage Threshold (e.g., 60)"
                value={formData.percentage_threshold}
                onChange={(e) => setFormData({...formData, percentage_threshold: e.target.value})}
                className="border rounded-lg px-3 py-2"
              />
              <select
                value={formData.specific_approver_id}
                onChange={(e) => setFormData({...formData, specific_approver_id: e.target.value})}
                className="border rounded-lg px-3 py-2"
              >
                <option value="">Specific Approver (Optional)</option>
                {users.filter(u => u.role !== 'employee').map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                ))}
              </select>
            </div>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_hybrid}
                onChange={(e) => setFormData({...formData, is_hybrid: e.target.checked})}
                className="mr-2"
              />
              Hybrid Rule (Percentage OR Specific Approver)
            </label>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Approval Steps</h4>
                <button
                  type="button"
                  onClick={addStep}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Add Step
                </button>
              </div>

              {formData.steps.map((step, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <span className="px-3 py-2 bg-gray-100 rounded">Step {step.order}</span>
                  <select
                    value={step.approver_id}
                    onChange={(e) => updateStep(index, 'approver_id', e.target.value)}
                    className="flex-1 border rounded px-3 py-2"
                  >
                    <option value="">Select Approver</option>
                    {users.filter(u => u.role !== 'employee').map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={step.is_manager_step}
                      onChange={(e) => updateStep(index, 'is_manager_step', e.target.checked)}
                      className="mr-1"
                    />
                    Manager
                  </label>
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Create Rule
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium text-gray-800">Existing Rules</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount Range</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Threshold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specific Approver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{rule.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {rule.min_amount || 0} - {rule.max_amount || '∞'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {rule.percentage_threshold ? `${rule.percentage_threshold}%` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {rule.specific_approver_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {rule.is_hybrid ? 'Hybrid' : rule.percentage_threshold ? 'Percentage' : 'Sequential'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApprovalRules;