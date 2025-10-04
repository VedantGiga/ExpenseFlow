import { useState } from 'react';

const AdminApprovalView = () => {
  const [formData, setFormData] = useState({
    user: 'marc',
    description: 'Approval rule for miscellaneous expenses',
    manager: 'sarah',
    isManagerApprover: false,
    approversSequence: false,
    minApprovalPercentage: ''
  });

  const [approvers, setApprovers] = useState([
    { name: 'John', required: false },
    { name: 'Mitchell', required: false },
    { name: 'Andreas', required: false }
  ]);

  const updateApprover = (index, field, value) => {
    const newApprovers = [...approvers];
    newApprovers[index][field] = value;
    setApprovers(newApprovers);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">Admin View (Approval Rules)</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Section - User and Rules Details */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-6">User and Rules Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">User</label>
                <input
                  type="text"
                  value={formData.user}
                  onChange={(e) => setFormData({...formData, user: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                  placeholder="marc"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description about rules</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Manager</label>
                <input
                  type="text"
                  value={formData.manager}
                  onChange={(e) => setFormData({...formData, manager: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                  placeholder="sarah"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Dynamic dropdown. Initially the manager of the record should be set, admin can change manager for approval if required.
                </p>
              </div>
            </div>
          </div>

          {/* Right Section - Approvers */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-6">Approvers</h2>
            
            <div className="space-y-6">
              <div>
                <label className="flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.isManagerApprover}
                    onChange={(e) => setFormData({...formData, isManagerApprover: e.target.checked})}
                    className="mr-2 rounded bg-gray-700 border-gray-600"
                  />
                  Is manager an approver?
                </label>
              </div>

              <div>
                <div className="border border-gray-600 rounded-lg overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <div className="grid grid-cols-2 gap-4">
                      <span className="text-sm font-medium text-gray-300">Name</span>
                      <span className="text-sm font-medium text-gray-300">Required</span>
                    </div>
                  </div>
                  {approvers.map((approver, index) => (
                    <div key={index} className="px-4 py-3 border-b border-gray-600 last:border-b-0">
                      <div className="grid grid-cols-2 gap-4 items-center">
                        <span className="text-white">{approver.name}</span>
                        <input
                          type="checkbox"
                          checked={approver.required}
                          onChange={(e) => updateApprover(index, 'required', e.target.checked)}
                          className="rounded bg-gray-700 border-gray-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  If this field is ticked, then approval of this approver is mandatory in any approval chain.
                </p>
              </div>

              {/* Approvers Sequence Section */}
              <div className="border-t border-gray-600 pt-6">
                <div className="mb-4">
                  <label className="flex items-center text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.approversSequence}
                      onChange={(e) => setFormData({...formData, approversSequence: e.target.checked})}
                      className="mr-2 rounded bg-gray-700 border-gray-600"
                    />
                    Approvers Sequence
                  </label>
                </div>
                
                <div className="text-xs text-gray-400 space-y-2">
                  <p>If this field is ticked true then the above-mentioned sequence of approvers matters (first John, then Mitchell, then Andreas).</p>
                  <p>If the required approver rejects, the expense request is auto-rejected.</p>
                  <p>If not required, the request goes to all approvers at the same time.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mt-8">
          <div className="flex items-center gap-4">
            <label className="text-gray-300 font-medium">Minimum Approval percentage:</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={formData.minApprovalPercentage}
                onChange={(e) => setFormData({...formData, minApprovalPercentage: e.target.value})}
                className="w-20 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="60"
                min="0"
                max="100"
              />
              <span className="text-gray-300">%</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <button className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            Cancel
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save Rule
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminApprovalView;