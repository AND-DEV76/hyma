export const AlergiaList = ({ alergias, onEdit, onDelete }) => {
  if (alergias.length === 0) {
    return <p className="text-gray-500 text-center py-4">No hay alergias registradas.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-200">
            <th className="p-3">ID</th>
            <th className="p-3">Nombre</th>
            <th className="p-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {alergias.map((alergia) => (
            <tr key={alergia.idAlergia} className="border-b border-gray-200 hover:bg-gray-5%;">
              <td className="p-3">{alergia.idAlergia}</td>
              <td className="p-3 font-medium">{alergia.nombre}</td>
              <td className="p-3 text-right space-x-2">
                <button
                  onClick={() => onEdit(alergia)}
                  className="bg-amber-500 text-white px-3 py-1 rounded text-sm hover:bg-amber-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(alergia.idAlergia)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};