import { useState, useEffect } from 'react';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import { getExpenses } from '../utils/api';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await getExpenses();
      setExpenses(response.data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  };

  const handleSubmitExpense = () => {
    fetchExpenses(); // Refresh list after submission
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Expenses</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseForm onSubmit={handleSubmitExpense} />
        <div>
          <ExpenseList expenses={expenses} />
        </div>
      </div>
    </div>
  );
};

export default Expenses;