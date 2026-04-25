import { Plus, Users, Trash2 } from 'lucide-react';

const TeamsTab = ({
  teams,
  loading,
  onCreateTeam,
  onDeleteTeam,
  onAddMember,
  onRemoveMember,
}) => {
  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading teams...</div>;
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Teams</h2>
        <button
          onClick={onCreateTeam}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
        {teams && teams.length > 0 ? (
          teams.map(team => (
            <div key={team.id} className="bg-white rounded-lg shadow p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{team.description || 'No description'}</p>
                </div>
                <button
                  onClick={() => onDeleteTeam(team.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                  title="Delete team"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-4 flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Users className="w-4 h-4" />
                  <span>{team.members?.length || 0} members</span>
                </div>
                {team.members && team.members.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {team.members.map(member => (
                      <div
                        key={member.id}
                        className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded"
                      >
                        <span className="text-gray-700">{member.user?.name || 'Unknown'}</span>
                        <button
                          onClick={() => onRemoveMember(team.id, member.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Remove member"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => onAddMember(team)}
                className="w-full px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm font-medium"
              >
                Add Member
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p>No teams found. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsTab;
