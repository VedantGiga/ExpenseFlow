const ApprovalList = () => {
  const mockApprovals = [
    { id: 1, employee: 'John Doe', amount: 150, category: 'travel', date: '2024-01-15' },
    { id: 2, employee: 'Jane Smith', amount: 75, category: 'meals', date: '2024-01-14' },
  ];

  const handleApprove = (id) => {
    console.log('Approved:', id);
  };

  const handleReject = (id) => {
    console.log('Rejected:', id);
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockApprovals.map((approval) => (
              <tr key={approval.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{approval.employee}</td>
                <td className="px-6 py-4 text-sm text-gray-900">${approval.amount}</td>
                <td className="px-6 py-4 text-sm text-gray-900 capitalize">{approval.category}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{approval.date}</td>
                <td className="px-6 py-4 space-x-2">
                  <button
                    onClick={() => handleApprove(approval.id)}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(approval.id)}
                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                  >
                    Reject
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