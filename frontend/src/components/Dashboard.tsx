import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { format, parseISO, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Users, DollarSign, Clock, CheckCircle, AlertTriangle, Phone } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard: React.FC = () => {
  const { data } = useData();

  const kpis = useMemo(() => {
    const totalDeuda = data.clientes.reduce((sum, cliente) => sum + cliente.monto_deuda_inicial, 0);
    const pagosRecibidos = data.interacciones
      .filter(int => int.tipo === 'pago_recibido')
      .reduce((sum, int) => sum + (int.monto || 0), 0);
    
    const promesasPago = data.interacciones.filter(int => int.resultado === 'promesa_pago');
    const pagosRealizados = data.interacciones.filter(int => int.tipo === 'pago_recibido');
    const tasaRecuperacion = totalDeuda > 0 ? (pagosRecibidos / totalDeuda) * 100 : 0;
    const tasaCumplimientoPromesas = promesasPago.length > 0 ? (pagosRealizados.length / promesasPago.length) * 100 : 0;

    const llamadasTotales = data.interacciones.filter(int => 
      int.tipo === 'llamada_saliente' || int.tipo === 'llamada_entrante'
    ).length;

    const contactosExitosos = data.interacciones.filter(int => 
      (int.tipo === 'llamada_saliente' || int.tipo === 'llamada_entrante') && 
      int.resultado !== 'sin_respuesta'
    ).length;

    const tasaContacto = llamadasTotales > 0 ? (contactosExitosos / llamadasTotales) * 100 : 0;

    return {
      totalDeuda,
      pagosRecibidos,
      tasaRecuperacion,
      tasaCumplimientoPromesas,
      tasaContacto,
      totalClientes: data.clientes.length,
      totalInteracciones: data.interacciones.length
    };
  }, [data]);

  const tiposDeudaData = useMemo(() => {
    const tipos = data.clientes.reduce((acc, cliente) => {
      acc[cliente.tipo_deuda] = (acc[cliente.tipo_deuda] || 0) + cliente.monto_deuda_inicial;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(tipos).map(tipo => {
        const labels = {
          'tarjeta_credito': 'Tarjeta de Crédito',
          'prestamo_personal': 'Préstamo Personal',
          'hipoteca': 'Hipoteca',
          'auto': 'Préstamo Auto'
        };
        return labels[tipo as keyof typeof labels] || tipo;
      }),
      datasets: [{
        data: Object.values(tipos),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }, [data]);

  const actividadMensualData = useMemo(() => {
    const now = new Date();
    const startDate = subMonths(startOfMonth(now), 5);
    const months = eachMonthOfInterval({ start: startDate, end: now });
    
    const actividadPorMes = months.map(month => {
      const monthStr = format(month, 'yyyy-MM');
      const interacciones = data.interacciones.filter(int => 
        format(parseISO(int.timestamp), 'yyyy-MM') === monthStr
      );
      
      return {
        mes: format(month, 'MMM yyyy', { locale: es }),
        llamadas: interacciones.filter(int => 
          int.tipo === 'llamada_saliente' || int.tipo === 'llamada_entrante'
        ).length,
        emails: interacciones.filter(int => int.tipo === 'email').length,
        pagos: interacciones.filter(int => int.tipo === 'pago_recibido').length,
        total: interacciones.length
      };
    });

    return {
      labels: actividadPorMes.map(m => m.mes),
      datasets: [
        {
          label: 'Llamadas',
          data: actividadPorMes.map(m => m.llamadas),
          backgroundColor: '#3B82F6',
          borderColor: '#1D4ED8',
          borderWidth: 1
        },
        {
          label: 'Emails',
          data: actividadPorMes.map(m => m.emails),
          backgroundColor: '#10B981',
          borderColor: '#047857',
          borderWidth: 1
        },
        {
          label: 'Pagos',
          data: actividadPorMes.map(m => m.pagos),
          backgroundColor: '#F59E0B',
          borderColor: '#D97706',
          borderWidth: 1
        }
      ]
    };
  }, [data]);

  const sentimientoData = useMemo(() => {
    const sentimientos = data.interacciones
      .filter(int => int.sentimiento && int.sentimiento !== 'n/a')
      .reduce((acc, int) => {
        acc[int.sentimiento!] = (acc[int.sentimiento!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      labels: Object.keys(sentimientos).map(s => {
        const labels = {
          'cooperativo': 'Cooperativo',
          'neutral': 'Neutral',
          'frustrado': 'Frustrado',
          'hostil': 'Hostil'
        };
        return labels[s as keyof typeof labels] || s;
      }),
      datasets: [{
        data: Object.values(sentimientos),
        backgroundColor: [
          '#10B981', // cooperativo - verde
          '#6B7280', // neutral - gris
          '#F59E0B', // frustrado - amarillo
          '#EF4444'  // hostil - rojo
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }, [data]);

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard General</h1>
        <p className="text-gray-600">Resumen ejecutivo de la gestión de cobranza</p>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasa de Recuperación</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.tasaRecuperacion.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              ${kpis.pagosRecibidos.toLocaleString()} de ${kpis.totalDeuda.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cumplimiento Promesas</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.tasaCumplimientoPromesas.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasa de Contacto</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.tasaContacto.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Phone className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.totalClientes}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              {kpis.totalInteracciones} interacciones
            </span>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución de tipos de deuda */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución por Tipo de Deuda</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut 
              data={tiposDeudaData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const value = context.parsed;
                        return `${context.label}: $${value.toLocaleString()}`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Sentimiento de clientes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sentimiento en Interacciones</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut 
              data={sentimientoData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Actividad por período */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad por Mes</h3>
        <div className="h-80">
          <Bar 
            data={actividadMensualData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: false,
                },
              },
              scales: {
                x: {
                  stacked: true,
                },
                y: {
                  stacked: true,
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;