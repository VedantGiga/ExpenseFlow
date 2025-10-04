import { useState } from 'react';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);

  const handleSubmitExpense = (expenseData) => {
    const newExpense = {
      id: Date.now(),
      ...expenseData,
      status: 'pending'
    };
    setExpenses([...expenses, newExpense]);
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