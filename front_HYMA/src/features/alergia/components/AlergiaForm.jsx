import { useState, useEffect } from 'react';

export const AlergiaForm = ({ onSubmit, alergiaEditar, onCancel }) => {
  const [nombre, setNombre] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (alergiaEditar) {
      setNombre(alergiaEditar.nombre);
    } else {
      setNombre('');
    }
    setErrorMessage('');
  }, [alergiaEditar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorMessage('El nombre es obligatorio');
      return;
    }

    const res = await onSubmit({ nombre });
    if (res.success) {
      setNombre('');
      setErrorMessage('');
    } else {
      setErrorMessage(res.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-white mb-4">
      <h3 className="text-lg font-bold mb-3">
        {alergiaEditar ? 'Editar Alergia' : 'Nueva Alergia'}
      </h3>
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Nombre de la alergia</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Penicilina, Polen..."
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {alergiaEditar ? 'Actualizar' : 'Guardar'}
        </button>
        {alergiaEditar && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};