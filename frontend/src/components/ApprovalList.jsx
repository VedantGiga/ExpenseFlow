import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const ApprovalList = () => {
  const [approvals, setApprovals] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState({});

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const response = await api.get('/approvals');
      setApprovals(response.data);
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
    }
  };

  const handleApproval = async (expenseId, status) => {
    setLoading({ ...loading, [expenseId]: true });
    try {
      await api.post(`/approvals/${expenseId}`, {
        status,
        comments: comments[expenseId] || ''
      });
      setComments({ ...comments, [expenseId]: '' });
      fetchApprovals();
    } catch (error) {
      console.error('Failed to process approval:', error);
    } finally {
      setLoading({ ...loading, [expenseId]: false });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-medium text-gray-800">Pending Approvals</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comments</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {approvals.map((approval) => (
              <tr key={approval.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{approval.employee_name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {approval.company_currency} {approval.company_currency_amount}
                  {approval.original_currency !== approval.company_currency && (
                    <div className="text-xs text-gray-500">
                      ({approval.original_currency} {approval.amount})
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 capitalize">{approval.category}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{approval.expense_date}</td>
                <td className="px-6 py-4">
                  <textarea
                    placeholder="Comments (optional)"
                    value={comments[approval.id] || ''}
                    onChange={(e) => setComments({ ...comments, [approval.id]: e.target.value })}
                    className="w-full text-xs border rounded px-2 py-1"
                    rows="2"
                  />
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button
                    onClick={() => handleApproval(approval.id, 'approved')}
                    disabled={loading[approval.id]}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading[approval.id] ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleApproval(approval.id, 'rejected')}
                    disabled={loading[approval.id]}
                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading[approval.id] ? 'Processing...' : 'Reject'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApprovalList;