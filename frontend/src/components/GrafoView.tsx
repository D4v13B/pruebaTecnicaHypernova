import React, { useMemo, useState } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import { useData } from '../contexts/DataContext';
import { Enlace, Grafo, Nodo } from '../utils/graphUtils';

const GrafoView: React.FC = () => {
  const { data } = useData();
  const [filtroTipo, setFiltroTipo] = useState<string>('all');
  const [filtroResultado, setFiltroResultado] = useState<string>('all');

  const grafo: Grafo = useMemo(() => {
    const nodes: Nodo[] = [];
    const links: Enlace[] = [];
    const nodeIds = new Set<string>();

    // Crear nodos de clientes
    data.clientes.forEach(cliente => {
      nodes.push({
        id: cliente.id,
        name: cliente.nombre,
        tipo: 'cliente',
        group: 1,
      });
      nodeIds.add(cliente.id);
    });

    // Crear nodos de agentes
    const agentes = new Set<string>();
    data.interacciones.forEach(interaccion => {
      if (interaccion.agente_id) {
        agentes.add(interaccion.agente_id);
      }
    });

    agentes.forEach(agenteId => {
      nodes.push({
        id: agenteId,
        name: `Agente ${agenteId.replace('agente_', '')}`,
        tipo: 'agente',
        group: 2,
      });
      nodeIds.add(agenteId);
    });

    // Crear enlaces basados en interacciones
    data.interacciones.forEach(interaccion => {
      if (interaccion.agente_id) {
        links.push({
          source: interaccion.cliente_id,
          target: interaccion.agente_id,
          tipo: interaccion.tipo,
        });
      }
    });

    return { nodes, links };
  }, [data]);

  const grafoFiltrado = useMemo(() => {
    let filteredLinks = grafo.links;

    if (filtroTipo !== 'all') {
      filteredLinks = filteredLinks.filter(link => link.tipo === filtroTipo);
    }

    if (filtroResultado !== 'all') {
      filteredLinks = filteredLinks.filter(link => link.source === filtroResultado);
    }

    const filteredNodeIds = new Set<string>();
    filteredLinks.forEach(link => {
      filteredNodeIds.add(link.source);
      filteredNodeIds.add(link.target);
    });

    const filteredNodes = grafo.nodes.filter(node => filteredNodeIds.has(node.id));

    return { nodes: filteredNodes, links: filteredLinks };
  }, [grafo, filtroTipo, filtroResultado]);

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Vista de Grafo de Relaciones</h1>
        <p className="text-gray-600">Explora las conexiones entre clientes, agentes e interacciones</p>
      </div>

      {/* Controles de filtro */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Interacción
            </label>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="all">Todos los tipos</option>
              {['llamada_saliente', 'llamada_entrante', 'email', 'sms', 'pago_recibido'].map(tipo => (
                <option key={tipo} value={tipo}>
                  {tipo.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Visualización del grafo */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Mapa de Relaciones</h3>
        <ForceGraph2D
          graphData={grafoFiltrado}
          nodeLabel={(node: Nodo) => `${node.name} (${node.tipo})`}
          nodeAutoColorBy="tipo"
          linkDirectionalArrowLength={6}
          linkDirectionalArrowRelPos={1}
          linkLabel={(link: Enlace) => link.tipo.replace('_', ' ')}
        />
      </div>
    </div>
  );
};

export default GrafoView;