// frontend/src/components/admin/ClientsTable.tsx
import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Client } from "../../api/adminClients.api";

interface ClientsTableProps {
  clients: Client[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nom
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Téléphone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {clients.map((client) => (
            <tr key={client._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {client.firstName} {client.lastName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {client.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {client.phone || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex space-x-3">
                <button
                  onClick={() => onEdit(client._id)}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <Edit className="h-4 w-4 mr-1" /> Éditer
                </button>
                <button
                  onClick={() => onDelete(client._id)}
                  className="text-red-600 hover:text-red-800 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                </button>
              </td>
            </tr>
          ))}
          {clients.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                Aucun client trouvé
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ClientsTable;
