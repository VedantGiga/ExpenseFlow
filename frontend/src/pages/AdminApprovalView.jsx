import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { sendPasswordEmail } from '../services/emailService';

const AdminApprovalView = () => {
  const [activeTab, setActiveTab] = useState('approval-rules');
  const [formData, setFormData] = useState({
    user: '',
    description: 'Approval rule for miscellaneous expenses',
    manager: '',
    isManagerApprover: false,
    approversSequence: false,
    minApprovalPercentage: ''
  });

  const [approvers, setApprovers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // User Management State
  const [users, setUsers] = useState([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'employee',
    manager_id: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      const usersData = response.data;
      setAllUsers(usersData);
      setUsers(usersData);
      
      // Set managers (manager and admin roles)
      const managerList = usersData.filter(user => user.role === 'manager' || user.role === 'admin');
      setManagers(managerList);
      
      // Set approvers (all users who can approve - managers and admins)
      const approverList = usersData
        .filter(user => user.role === 'manager' || user.role === 'admin')
        .map(user => ({ id: user.id, name: user.name, required: false }));
      setApprovers(approverList);
      
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleUserChange = (userName) => {
    setFormData(prev => ({ ...prev, user: userName }));
    
    // Find selected user and set their manager
    const user = allUsers.find(u => u.name === userName);
    if (user) {
      setSelectedUser(user);
      setFormData(prev => ({ 
        ...prev, 
        manager: user.manager_name || '' 
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const ruleData = {
        ...formData,
        approvers: approvers.filter(a => a.required),
        allApprovers: approvers
      };
      
      console.log('Saving approval rule:', ruleData);
      alert('Approval rule saved successfully!');
    } catch (error) {
      console.error('Failed to save rule:', error);
      alert('Failed to save rule');
    } finally {
      setLoading(false);
    }
  };

  // User Management Functions
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', userFormData);
      setUserFormData({ name: '', email: '', role: 'employee', manager_id: '' });
      setShowUserForm(false);
      fetchUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const updateUserRole = async (userId, role, manager_id) => {
    try {
      console.log('Updating user:', { userId, role, manager_id });
      const response = await api.put(`/users/${userId}`, { role, manager_id });
      console.log('Update response:', response.data);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user: ' + (error.response?.data?.error || error.message));
    }
  };

  const sendPassword = async (userId, userEmail) => {
    try {
      const response = await api.post(`/users/${userId}/send-password`);
      const userName = users.find(u => u.id === userId)?.name || 'User';
      
      // Send email using EmailJS service
      const emailResult = await sendPasswordEmail(userEmail, userName, response.data.password);
      
      if (emailResult.success) {
        alert(`Password has been sent to ${userEmail}. The user can now login and change their password.`);
      } else {
        alert(`Password generated but email failed to send. Please check EmailJS configuration.`);
      }
    } catch (error) {
      console.error('Failed to send password:', error);
      alert('Failed to send password');
    }
  };

  const updateApprover = (index, field, value) => {
    const newApprovers = [...approvers];
    newApprovers[index][field] = value;
    setApprovers(newApprovers);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Panel</h1>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('approval-rules')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'approval-rules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Approval Rules
            </button>
            <button
              onClick={() => setActiveTab('user-management')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'user-management'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Management
            </button>
          </nav>
        </div>
        
        {/* Approval Rules Tab */}
        {activeTab === 'approval-rules' && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Section - User and Rules Details */}
              <div className="bg-white rounded-lg p-6 border border-gray-300 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">User and Rules Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
                    <select
                      value={formData.user}
                      onChange={(e) => handleUserChange(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                    >
                      <option value="">Select User</option>
                      {allUsers.map(user => (
                        <option key={user.id} value={user.name}>
                          {user.name} ({user.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description about rules</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Manager</label>
                    <select
                      value={formData.manager}
                      onChange={(e) => setFormData({...formData, manager: e.target.value})}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                    >
                      <option value="">Select Manager</option>
                      {managers.map(manager => (
                        <option key={manager.id} value={manager.name}>
                          {manager.name} ({manager.role})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-600 mt-2">
                      Dynamic dropdown. Initially the manager of the record should be set, admin can change manager for approval if required.
                    </p>
                    {selectedUser && (
                      <p className="text-xs text-blue-600 mt-1">
                        Current user's manager: {selectedUser.manager_name || 'None assigned'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Section - Approvers */}
              <div className="bg-white rounded-lg p-6 border border-gray-300 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Approvers</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center text-gray-700">
                      <input
                        type="checkbox"
                        checked={formData.isManagerApprover}
                        onChange={(e) => setFormData({...formData, isManagerApprover: e.target.checked})}
                        className="mr-2 rounded bg-white border-gray-300"
                      />
                      Is manager an approver?
                    </label>
                    <p className="text-xs text-blue-600 mt-2">
                      If checked, approval requests will go to the manager first before other approvers.
                    </p>
                  </div>

                  <div>
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                        <div className="grid grid-cols-2 gap-4">
                          <span className="text-sm font-medium text-gray-700">Name</span>
                          <span className="text-sm font-medium text-gray-700">Required</span>
                        </div>
                      </div>
                      {approvers.map((approver, index) => (
                        <div key={approver.id} className="px-4 py-3 border-b border-gray-300 last:border-b-0">
                          <div className="grid grid-cols-2 gap-4 items-center">
                            <span className="text-gray-900">{approver.name}</span>
                            <input
                              type="checkbox"
                              checked={approver.required}
                              onChange={(e) => updateApprover(index, 'required', e.target.checked)}
                              className="rounded bg-white border-gray-300"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      If this field is ticked, then approval of this approver is mandatory in any approval chain.
                    </p>
                  </div>

                  {/* Approvers Sequence Section */}
                  <div className="border-t border-gray-300 pt-6">
                    <div className="mb-4">
                      <label className="flex items-center text-gray-700">
                        <input
                          type="checkbox"
                          checked={formData.approversSequence}
                          onChange={(e) => setFormData({...formData, approversSequence: e.target.checked})}
                          className="mr-2 rounded bg-white border-gray-300"
                        />
                        Approvers Sequence
                      </label>
                    </div>
                    
                    <div className="text-xs text-gray-600 space-y-2">
                      <p>If this field is ticked true then the above-mentioned sequence of approvers matters.</p>
                      <p>If the required approver rejects, the expense request is auto-rejected.</p>
                      <p>If not required, the request goes to all approvers at the same time.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="bg-white rounded-lg p-6 border border-gray-300 shadow-sm mt-8">
              <div className="flex items-center gap-4">
                <label className="text-gray-700 font-medium">Minimum Approval percentage:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.minApprovalPercentage}
                    onChange={(e) => setFormData({...formData, minApprovalPercentage: e.target.value})}
                    className="w-20 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                    placeholder="60"
                    min="0"
                    max="100"
                  />
                  <span className="text-gray-700">%</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-8">
              <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Rule'}
              </button>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'user-management' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
              <button
                onClick={() => setShowUserForm(!showUserForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add User
              </button>
            </div>

            {showUserForm && (
              <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm">
                <h3 className="text-lg font-medium mb-4">Create New User</h3>
                <form onSubmit={handleCreateUser} className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={userFormData.name}
                    onChange={(e) => setUserFormData({...userFormData, name: e.target.value})}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />

                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({...userFormData, role: e.target.value})}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                  </select>
                  {userFormData.role === 'employee' && (
                    <select
                      value={userFormData.manager_id}
                      onChange={(e) => setUserFormData({...userFormData, manager_id: e.target.value})}
                      className="border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="">No Manager</option>
                      {managers.map(manager => (
                        <option key={manager.id} value={manager.id}>{manager.name}</option>
                      ))}
                    </select>
                  )}
                  <div className="col-span-2 flex gap-2">
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                      Create User
                    </button>
                    <button type="button" onClick={() => setShowUserForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
              <div className="p-6 border-b border-gray-300">
                <h3 className="text-lg font-medium text-gray-900">Company Users</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Send Password</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                        <td className="px-6 py-4">
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value, user.manager_id)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="employee">Employee</option>
                            <option value="manager">Manager</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={user.manager_id || ''}
                            onChange={(e) => updateUserRole(user.id, user.role, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="">No Manager</option>
                            {managers.filter(m => m.id !== user.id).map(manager => (
                              <option key={manager.id} value={manager.id}>{manager.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => sendPassword(user.id, user.email)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Send Password
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApprovalView;