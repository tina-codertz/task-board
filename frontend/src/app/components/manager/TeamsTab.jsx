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
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-gray-600 mt-2">Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Teams</h2>
        <button
          onClick={onCreateTeam}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm hover:shadow"
        >
          <Plus className="w-4 h-4" />
          Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams && teams.length > 0 ? (
          teams.map(team => (
            <div key={team.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition border border-gray-200 p-6 flex flex-col h-96">
              {/* Header */}
              <div className="flex justify-between items-start mb-4 flex-shrink-0">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{team.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{team.description || 'No description'}</p>
                </div>
                <button
                  onClick={() => onDeleteTeam(team.id)}
                  className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition flex-shrink-0 ml-2"
                  title="Delete team"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Members Section - Fixed Height */}
              <div className="mb-4 flex-1 flex flex-col min-h-0">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 flex-shrink-0">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{team.members?.length || 0} members</span>
                </div>
                <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-3 border border-gray-100">
                  {team.members && team.members.length > 0 ? (
                    <div className="space-y-2">
                      {team.members.map(member => (
                        <div
                          key={member.userId}
                          className="flex justify-between items-center text-sm bg-white p-2 rounded border border-gray-200 hover:border-gray-300"
                        >
                          <span className="text-gray-700 font-medium truncate">{member.user?.name || 'Unknown'}</span>
                          <button
                            onClick={() => onRemoveMember(team.id, member.userId)}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition flex-shrink-0 ml-2"
                            title="Remove member"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-gray-500">
                      No members yet
                    </div>
                  )}
                </div>
              </div>

              {/* Add Member Button - Fixed at bottom */}
              <button
                onClick={() => onAddMember(team)}
                className="w-full px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm font-medium flex items-center justify-center gap-2 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add Member
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No teams found</p>
            <p className="text-gray-500 text-sm mt-1">Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsTab;
