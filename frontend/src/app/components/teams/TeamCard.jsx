import { Users, UserPlus, Trash2, X } from 'lucide-react';

const TeamCard = ({ team, onDeleteTeam, onAddMember, onRemoveMember }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
        <p className="text-sm text-gray-500 mt-1">Owner: {team.owner?.name}</p>
      </div>
      <button onClick={() => onDeleteTeam(team.id)} className="text-red-600 hover:text-red-800">
        <Trash2 className="w-5 h-5" />
      </button>
    </div>

    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <Users className="w-4 h-4" />
          <span>Members ({team.members?.length || 0})</span>
        </div>
        <button
          onClick={() => onAddMember(team)}
          className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
        >
          <UserPlus className="w-3 h-3" />
          Add
        </button>
      </div>

      {team.members?.length > 0 ? (
        <div className="space-y-2">
          {team.members.map(member => (
            <div
              key={member.id}
              className="flex justify-between items-center bg-white p-2 rounded border border-gray-200"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{member.user.name}</p>
                <p className="text-xs text-gray-500">{member.user.email}</p>
              </div>
              <button
                onClick={() => onRemoveMember(team.id, member.userId)}
                className="text-red-600 hover:text-red-800 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-2">No members yet</p>
      )}
    </div>

    <p className="text-xs text-gray-500 mt-3">
      Created {new Date(team.createdAt).toLocaleDateString()}
    </p>
  </div>
);

export default TeamCard;
