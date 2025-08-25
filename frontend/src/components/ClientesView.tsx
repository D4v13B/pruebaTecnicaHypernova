import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Filter, Eye, Phone, Mail, DollarSign, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

const ClientesView: React.FC = () => {
  const { data } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDeudaType, setFilterDeudaType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'nombre' | 'deuda' | 'fecha'>('nombre');

  const clientesConEstadisticas = useMemo(() => {
    return data.clientes.map(cliente => {
      const interacciones = data.interacciones.filter(int => int.cliente_id === cliente.id);
      const pagos = interacciones.filter(int => int.tipo === 'pago_recibido');
      const totalPagado = pagos.reduce((sum, pago) => sum + (pago.monto || 0), 0);
      const deudaRestante = cliente.monto_deuda_inicial - totalPagado;
      const ultimaInteraccion = interacciones.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];
      
      const promesas = interacciones.filter(int => int.resultado === 'promesa_pago');
      const promesasPendientes = promesas.filter(promesa => {
        const pagosPosteriores = pagos.filter(pago => 
          new Date(pago.timestamp) > new Date(promesa.timestamp)
        );
        return pagosPosteriores.length === 0;
      });

      return {
        ...cliente,
        totalInteracciones: interacciones.length,
        totalPagado,
        deudaRestante,
        porcentajeRecuperado: (totalPagado / cliente.monto_deuda_inicial) * 100,
        ultimaInteraccion,
        promesasPendientes: promesasPendientes.length,
        estado: deudaRestante <= 0 ? 'pagado' : promesasPendientes.length > 0 ? 'promesa_pendiente' : 'activo'
      };
    });
  }, [data]);

  const clientesFiltrados = useMemo(() => {
    let filtered = clientesConEstadisticas.filter(cliente => {
      const matchesSearch = cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cliente.telefono.includes(searchTerm);
      const matchesFilter = filterDeudaType === 'all' || cliente.tipo_deuda === filterDeudaType;
      return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre);
        case 'deuda':
          return b.deudaRestante - a.deudaRestante;
        case 'fecha':
          if (!a.ultimaInteraccion && !b.ultimaInteraccion) return 0;
          if (!a.ultimaInteraccion) return 1;
          if (!b.ultimaInteraccion) return -1;
          return new Date(b.ultimaInteraccion.timestamp).getTime() - 
                 new Date(a.ultimaInteraccion.timestamp).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [clientesConEstadisticas, searchTerm, filterDeudaType, sortBy]);

  const tiposDeuda = [...new Set(data.clientes.map(c => c.tipo_deuda))];

  const getEstadoBadge = (estado: string) => {
    const badges = {
      'pagado': { color: 'bg-green-100 text-green-800', text: 'Pagado' },
      'promesa_pendiente': { color: 'bg-yellow-100 text-yellow-800', text: 'Promesa Pendiente' },
      'activo': { color: 'bg-blue-100 text-blue-800', text: 'Activo' }
    };
    const badge = badges[estado as keyof typeof badges] || badges.activo;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const getTipoDeudaLabel = (tipo: string) => {
    const labels = {
      'tarjeta_credito': 'Tarjeta de Crédito',
      'prestamo_personal': 'Préstamo Personal',
      'hipoteca': 'Hipoteca',
      'auto': 'Préstamo Auto'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
        <p className="text-gray-600">Vista detallada de todos los clientes y su estado de cobranza</p>
      </div>

      {/* Controles de filtrado y búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nombre o teléfono..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={filterDeudaType}
              onChange={(e) => setFilterDeudaType(e.target.value)}
            >
              <option value="all">Todos los tipos</option>
              {tiposDeuda.map(tipo => (
                <option key={tipo} value={tipo}>{getTipoDeudaLabel(tipo)}</option>
              ))}
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'nombre' | 'deuda' | 'fecha')}
            >
              <option value="nombre">Ordenar por nombre</option>
              <option value="deuda">Ordenar por deuda</option>
              <option value="fecha">Ordenar por última actividad</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{clientesFiltrados.length}</div>
          <div className="text-sm text-gray-600">Total clientes</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {clientesFiltrados.filter(c => c.estado === 'pagado').length}
          </div>
          <div className="text-sm text-gray-600">Pagados completo</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">
            {clientesFiltrados.filter(c => c.estado === 'promesa_pendiente').length}
          </div>
          <div className="text-sm text-gray-600">Con promesas pendientes</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            ${clientesFiltrados.reduce((sum, c) => sum + c.deudaRestante, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Deuda total pendiente</div>
        </div>
      </div>

      {/* Tabla de clientes */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Deuda
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deuda/Recuperado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Actividad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{cliente.nombre}</div>
                      <div className="text-sm text-gray-500">{cliente.telefono}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getTipoDeudaLabel(cliente.tipo_deuda)}</div>
                    <div className="text-sm text-gray-500">
                      Desde {format(parseISO(cliente.fecha_prestamo), 'dd MMM yyyy', { locale: es })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getEstadoBadge(cliente.estado)}
                    {cliente.promesasPendientes > 0 && (
                      <div className="flex items-center mt-1 text-xs text-orange-600">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {cliente.promesasPendientes} promesa(s)
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${cliente.deudaRestante.toLocaleString()} restante
                    </div>
                    <div className="text-sm text-gray-500">
                      ${cliente.totalPagado.toLocaleString()} pagado ({cliente.porcentajeRecuperado.toFixed(1)}%)
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-green-600 h-1.5 rounded-full" 
                        style={{ width: `${Math.min(cliente.porcentajeRecuperado, 100)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {cliente.ultimaInteraccion ? (
                      <div>
                        <div className="text-sm text-gray-900">
                          {format(parseISO(cliente.ultimaInteraccion.timestamp), 'dd MMM yyyy', { locale: es })}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {cliente.ultimaInteraccion.tipo.replace('_', ' ')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Sin actividad</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/clientes/${cliente.id}`}
                      className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {clientesFiltrados.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No se encontraron clientes que coincidan con los filtros</div>
        </div>
      )}
    </div>
  );
};

export default ClientesView;