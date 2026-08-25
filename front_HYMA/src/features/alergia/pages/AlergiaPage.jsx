import { useState } from 'react';
import { useAlergias } from '../hooks/useAlergias';
import { AlergiaForm } from '../components/AlergiaForm';
import { AlergiaList } from '../components/AlergiaList';

export const AlergiaPage = () => {
  const { alergias, loading, error, agregarAlergia, editarAlergia, borrarAlergia } = useAlergias();
  const [alergiaEditar, setAlergiaEditar] = useState(null);

  const handleFormSubmit = async (data) => {
    if (alergiaEditar) {
      const res = await editarAlergia(alergiaEditar.idAlergia, data);
      if (res.success) setAlergiaEditar(null);
      return res;
    } else {
      return await agregarAlergia(data);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Gestión de Alergias</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <AlergiaForm
        onSubmit={handleFormSubmit}
        alergiaEditar={alergiaEditar}
        onCancel={() => setAlergiaEditar(null)}
      />

      {loading ? (
        <p className="text-center py-4">Cargando alergias...</p>
      ) : (
        <AlergiaList
          alergias={alergias}
          onEdit={(alergia) => setAlergiaEditar(alergia)}
          onDelete={(id) => {
            if (window.confirm('¿Seguro que deseas eliminar esta alergia?')) {
              borrarAlergia(id);
            }
          }}
        />
      )}
    </div>
  );
};