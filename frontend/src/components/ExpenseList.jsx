const ExpenseList = ({ expenses = [] }) => {

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-medium text-gray-800">My Expenses</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {expense.original_currency} {expense.amount}
                  {expense.company_currency && expense.original_currency !== expense.company_currency && (
                    <div className="text-xs text-gray-500">
                      ≈ {expense.company_currency} {expense.company_currency_amount}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 capitalize">{expense.category}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{expense.expense_date}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    expense.status === 'approved' ? 'bg-green-100 text-green-800' :
                    expense.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {expense.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseList;