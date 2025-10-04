import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const Approvals = () => {
  const [approvals, setApprovals] = useState([]);
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

  const handleApproval = async (id, status) => {
    setLoading({ ...loading, [id]: true });
    try {
      await api.post(`/approvals/${id}`, { status });
      // Refresh the approvals list
      await fetchApprovals();
    } catch (error) {
      console.error('Failed to process approval:', error);
    } finally {
      setLoading({ ...loading, [id]: false });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Manager's View
          </h1>
        </div>

        {/* Approvals Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-xl font-medium text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
              Approvals to review
            </h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Approval Subject
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Request Owner
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Request Status
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {/* Data Row */}
                {approvals.map((approval) => (
                  <tr key={approval.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900">
                      {approval.description || 'Expense Request'}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900">
                      {approval.employee_name}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900">
                      {approval.category}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        approval.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : approval.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{(approval.company_currency_amount || approval.amount)?.toLocaleString()} {approval.company_currency || approval.original_currency}</div>
                        <div className="text-gray-500 text-xs">
                          (original: {approval.amount} {approval.original_currency})
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm space-x-3">
                      <button
                        onClick={() => handleApproval(approval.id, 'approved')}
                        disabled={loading[approval.id]}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleApproval(approval.id, 'rejected')}
                        disabled={loading[approval.id]}
                        className="inline-flex items-center px-4 py-2 border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                      >
                        ❌ Reject
                      </button>
                    </td>
                  </tr>
                ))}
                
                {approvals.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-8 py-12 text-center text-gray-500">
                      No pending approvals
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Approvals;