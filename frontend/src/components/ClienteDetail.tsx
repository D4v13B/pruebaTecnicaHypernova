import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Line } from 'react-chartjs-2';
import {
  ArrowLeft, Phone, Mail, MessageSquare, DollarSign, Calendar, 
  TrendingUp, AlertCircle, CheckCircle, XCircle, Clock, User
} from 'lucide-react';

const ClienteDetail: React.FC = () => {
  const { clienteId } = useParams<{ clienteId: string }>();
  const { data } = useData();

  const cliente = useMemo(() => {
    return data.clientes.find(c => c.id === clienteId);
  }, [data.clientes, clienteId]);

  const interacciones = useMemo(() => {
    if (!cliente) return [];
    return data.interacciones
      .filter(int => int.cliente_id === cliente.id)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [data.interacciones, cliente]);

  const estadisticas = useMemo(() => {
    if (!cliente) return null;

    const pagos = interacciones.filter(int => int.tipo === 'pago_recibido');
    const totalPagado = pagos.reduce((sum, pago) => sum + (pago.monto || 0), 0);
    const deudaRestante = cliente.monto_deuda_inicial - totalPagado;
    
    const llamadas = interacciones.filter(int => 
      int.tipo === 'llamada_saliente' || int.tipo === 'llamada_entrante'
    );
    const llamadasExitosas = llamadas.filter(int => int.resultado !== 'sin_respuesta');
    
    const promesas = interacciones.filter(int => int.resultado === 'promesa_pago');
    const promesasCumplidas = promesas.filter(promesa => {
      const pagosPosteriores = pagos.filter(pago => 
        new Date(pago.timestamp) > new Date(promesa.timestamp)
      );
      return pagosPosteriores.length > 0;
    });

    return {
      totalPagado,
      deudaRestante,
      porcentajeRecuperado: (totalPagado / cliente.monto_deuda_inicial) * 100,
      totalInteracciones: interacciones.length,
      totalLlamadas: llamadas.length,
      tasaContacto: llamadas.length > 0 ? (llamadasExitosas.length / llamadas.length) * 100 : 0,
      totalPromesas: promesas.length,
      promesasCumplidas: promesasCumplidas.length,
      tasaCumplimientoPromesas: promesas.length > 0 ? (promesasCumplidas.length / promesas.length) * 100 : 0
    };
  }, [cliente, interacciones]);

  const evolucionDeuda = useMemo(() => {
    if (!cliente) return { labels: [], datasets: [] };

    let saldoActual = cliente.monto_deuda_inicial;
    const puntos = [{
      fecha: cliente.fecha_prestamo,
      saldo: saldoActual
    }];

    interacciones.forEach(interaccion => {
      if (interaccion.tipo === 'pago_recibido' && interaccion.monto) {
        saldoActual -= interaccion.monto;
        puntos.push({
          fecha: interaccion.timestamp,
          saldo: Math.max(0, saldoActual)
        });
      }
    });

    return {
      labels: puntos.map(p => format(parseISO(p.fecha), 'dd MMM', { locale: es })),
      datasets: [{
        label: 'Evolución de Deuda',
        data: puntos.map(p => p.saldo),
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3B82F6',
        borderWidth: 2,
        tension: 0.1
      }]
    };
  }, [cliente, interacciones]);

  if (!cliente) {
    return (
      <div className="px-4 py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Cliente no encontrado</h2>
          <Link to="/clientes" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a clientes
          </Link>
        </div>
      </div>
    );
  }

  const getInteractionIcon = (tipo: string) => {
    const icons = {
      'llamada_saliente': <Phone className="w-4 h-4 text-blue-600" />,
      'llamada_entrante': <Phone className="w-4 h-4 text-green-600" />,
      'email': <Mail className="w-4 h-4 text-purple-600" />,
      'sms': <MessageSquare className="w-4 h-4 text-yellow-600" />,
      'pago_recibido': <DollarSign className="w-4 h-4 text-green-600" />
    };
    return icons[tipo as keyof typeof icons] || <Clock className="w-4 h-4 text-gray-600" />;
  };

  const getResultadoIcon = (resultado?: string) => {
    if (!resultado) return null;
    
    const icons = {
      'promesa_pago': <Calendar className="w-4 h-4 text-blue-600" />,
      'pago_inmediato': <CheckCircle className="w-4 h-4 text-green-600" />,
      'sin_respuesta': <XCircle className="w-4 h-4 text-gray-400" />,
      'renegociacion': <TrendingUp className="w-4 h-4 text-purple-600" />,
      'disputa': <AlertCircle className="w-4 h-4 text-red-600" />,
      'se_niega_pagar': <XCircle className="w-4 h-4 text-red-600" />
    };
    return icons[resultado as keyof typeof icons];
  };

  const getSentimientoColor = (sentimiento?: string) => {
    const colors = {
      'cooperativo': 'text-green-600',
      'neutral': 'text-gray-600',
      'frustrado': 'text-yellow-600',
      'hostil': 'text-red-600'
    };
    return colors[sentimiento as keyof typeof colors] || 'text-gray-400';
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-4">
          <Link 
            to="/clientes" 
            className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{cliente.nombre}</h1>
            <p className="text-gray-600">{cliente.telefono}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Cliente desde</div>
          <div className="text-lg font-semibold">
            {format(parseISO(cliente.fecha_prestamo), 'dd MMMM yyyy', { locale: es })}
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Deuda Restante</p>
              <p className="text-2xl font-bold text-gray-900">
                ${estadisticas?.deudaRestante.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-red-500" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            de ${cliente.monto_deuda_inicial.toLocaleString()} inicial
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">% Recuperado</p>
              <p className="text-2xl font-bold text-green-600">
                {estadisticas?.porcentajeRecuperado.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            ${estadisticas?.totalPagado.toLocaleString()} pagado
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasa de Contacto</p>
              <p className="text-2xl font-bold text-blue-600">
                {estadisticas?.tasaContacto.toFixed(1)}%
              </p>
            </div>
            <Phone className="w-8 h-8 text-blue-500" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {estadisticas?.totalLlamadas} llamadas realizadas
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Promesas Cumplidas</p>
              <p className="text-2xl font-bold text-purple-600">
                {estadisticas?.tasaCumplimientoPromesas.toFixed(1)}%
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-500" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {estadisticas?.promesasCumplidas} de {estadisticas?.totalPromesas} promesas
          </div>
        </div>
      </div>

      {/* Evolución de la deuda */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Evolución de la Deuda</h3>
        <div className="h-64">
          <Line 
            data={evolucionDeuda}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return '$' + Number(value).toLocaleString();
                    }
                  }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Timeline de interacciones */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Timeline de Interacciones</h3>
        
        <div className="space-y-6">
          {interacciones.map((interaccion, index) => (
            <div key={interaccion.id} className="relative flex items-start space-x-4">
              {/* Línea vertical del timeline */}
              {index !== interacciones.length - 1 && (
                <div className="absolute left-4 top-8 w-0.5 h-16 bg-gray-200"></div>
              )}
              
              {/* Icono */}
              <div className="relative flex-shrink-0 w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                {getInteractionIcon(interaccion.tipo)}
              </div>
              
              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-sm font-medium text-gray-900 capitalize">
                      {interaccion.tipo.replace('_', ' ')}
                    </h4>
                    {interaccion.resultado && (
                      <div className="flex items-center space-x-1">
                        {getResultadoIcon(interaccion.resultado)}
                        <span className="text-sm text-gray-600 capitalize">
                          {interaccion.resultado.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                    {interaccion.sentimiento && interaccion.sentimiento !== 'n/a' && (
                      <span className={`text-sm capitalize ${getSentimientoColor(interaccion.sentimiento)}`}>
                        {interaccion.sentimiento}
                      </span>
                    )}
                  </div>
                  <time className="text-sm text-gray-500">
                    {format(parseISO(interaccion.timestamp), 'dd MMM yyyy, HH:mm', { locale: es })}
                  </time>
                </div>
                
                {/* Detalles adicionales */}
                <div className="mt-2 space-y-1">
                  {interaccion.duracion_segundos && (
                    <p className="text-sm text-gray-600">
                      Duración: {Math.floor(interaccion.duracion_segundos / 60)}m {interaccion.duracion_segundos % 60}s
                    </p>
                  )}
                  
                  {interaccion.monto && (
                    <p className="text-sm text-green-600 font-medium">
                      Pago recibido: ${interaccion.monto.toLocaleString()}
                      {interaccion.metodo_pago && ` (${interaccion.metodo_pago})`}
                    </p>
                  )}
                  
                  {interaccion.monto_prometido && (
                    <p className="text-sm text-blue-600">
                      Promesa de pago: ${interaccion.monto_prometido.toLocaleString()}
                      {interaccion.fecha_promesa && 
                        ` para el ${format(parseISO(interaccion.fecha_promesa), 'dd MMM yyyy', { locale: es })}`
                      }
                    </p>
                  )}
                  
                  {interaccion.nuevo_plan_pago && (
                    <p className="text-sm text-purple-600">
                      Nuevo plan: {interaccion.nuevo_plan_pago.cuotas} cuotas de ${interaccion.nuevo_plan_pago.monto_mensual.toLocaleString()}
                    </p>
                  )}
                  
                  {interaccion.agente_id && (
                    <p className="text-sm text-gray-500">
                      Agente: {interaccion.agente_id}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {interacciones.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay interacciones registradas para este cliente
          </div>
        )}
      </div>
    </div>
  );
};

export default ClienteDetail;