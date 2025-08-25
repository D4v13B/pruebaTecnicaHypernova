export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  monto_deuda_inicial: number;
  fecha_prestamo: string;
  tipo_deuda: 'tarjeta_credito' | 'prestamo_personal' | 'hipoteca' | 'auto';
}

export interface Interaccion {
  id: string;
  cliente_id: string;
  timestamp: string;
  tipo: 'llamada_saliente' | 'llamada_entrante' | 'email' | 'sms' | 'pago_recibido';
  duracion_segundos?: number;
  agente_id?: string;
  resultado?: 'promesa_pago' | 'sin_respuesta' | 'renegociacion' | 'disputa' | 'pago_inmediato' | 'se_niega_pagar';
  sentimiento?: 'cooperativo' | 'neutral' | 'frustrado' | 'hostil' | 'n/a';
  monto_prometido?: number;
  fecha_promesa?: string;
  nuevo_plan_pago?: {
    cuotas: number;
    monto_mensual: number;
  };
  monto?: number;
  metodo_pago?: 'transferencia' | 'tarjeta' | 'efectivo';
  pago_completo?: boolean;
}

export interface DataModel {
  metadata: {
    fecha_generacion: string;
    total_clientes: number;
    total_interacciones: number;
    periodo: string;
  };
  clientes: Cliente[];
  interacciones: Interaccion[];
}

export const mockData: DataModel = {
  metadata: {
    fecha_generacion: "2024-03-15T10:30:00Z",
    total_clientes: 50,
    total_interacciones: 250,
    periodo: "2024-Q1"
  },
  clientes: [
    {
      id: "cliente_001",
      nombre: "María González",
      telefono: "+54-11-1234-5678",
      monto_deuda_inicial: 25000,
      fecha_prestamo: "2023-06-15",
      tipo_deuda: "tarjeta_credito"
    },
    {
      id: "cliente_002",
      nombre: "Carlos Rodríguez",
      telefono: "+54-11-2345-6789",
      monto_deuda_inicial: 180000,
      fecha_prestamo: "2023-01-20",
      tipo_deuda: "hipoteca"
    },
    {
      id: "cliente_003",
      nombre: "Ana Martínez",
      telefono: "+54-11-3456-7890",
      monto_deuda_inicial: 45000,
      fecha_prestamo: "2023-08-10",
      tipo_deuda: "prestamo_personal"
    },
    {
      id: "cliente_004",
      nombre: "José López",
      telefono: "+54-11-4567-8901",
      monto_deuda_inicial: 65000,
      fecha_prestamo: "2023-03-25",
      tipo_deuda: "auto"
    },
    {
      id: "cliente_005",
      nombre: "Laura Fernández",
      telefono: "+54-11-5678-9012",
      monto_deuda_inicial: 32000,
      fecha_prestamo: "2023-09-12",
      tipo_deuda: "tarjeta_credito"
    }
  ],
  interacciones: [
    {
      id: "int_001",
      cliente_id: "cliente_001",
      timestamp: "2024-03-01T09:15:00Z",
      tipo: "llamada_saliente",
      duracion_segundos: 420,
      agente_id: "agente_001",
      resultado: "promesa_pago",
      sentimiento: "cooperativo",
      monto_prometido: 5000,
      fecha_promesa: "2024-03-15"
    },
    {
      id: "int_002",
      cliente_id: "cliente_001",
      timestamp: "2024-03-15T14:30:00Z",
      tipo: "pago_recibido",
      monto: 5000,
      metodo_pago: "transferencia",
      pago_completo: false
    },
    {
      id: "int_003",
      cliente_id: "cliente_002",
      timestamp: "2024-03-02T10:45:00Z",
      tipo: "llamada_saliente",
      duracion_segundos: 180,
      agente_id: "agente_002",
      resultado: "sin_respuesta",
      sentimiento: "n/a"
    },
    {
      id: "int_004",
      cliente_id: "cliente_002",
      timestamp: "2024-03-05T16:20:00Z",
      tipo: "email",
      agente_id: "agente_002"
    },
    {
      id: "int_005",
      cliente_id: "cliente_003",
      timestamp: "2024-03-03T11:30:00Z",
      tipo: "llamada_entrante",
      duracion_segundos: 300,
      agente_id: "agente_001",
      resultado: "renegociacion",
      sentimiento: "neutral",
      nuevo_plan_pago: {
        cuotas: 12,
        monto_mensual: 4500
      }
    },
    {
      id: "int_006",
      cliente_id: "cliente_004",
      timestamp: "2024-03-04T13:45:00Z",
      tipo: "sms",
      agente_id: "agente_003"
    },
    {
      id: "int_007",
      cliente_id: "cliente_004",
      timestamp: "2024-03-06T15:10:00Z",
      tipo: "llamada_saliente",
      duracion_segundos: 600,
      agente_id: "agente_003",
      resultado: "disputa",
      sentimiento: "frustrado"
    },
    {
      id: "int_008",
      cliente_id: "cliente_005",
      timestamp: "2024-03-07T12:20:00Z",
      tipo: "llamada_saliente",
      duracion_segundos: 240,
      agente_id: "agente_001",
      resultado: "pago_inmediato",
      sentimiento: "cooperativo"
    },
    {
      id: "int_009",
      cliente_id: "cliente_005",
      timestamp: "2024-03-07T14:00:00Z",
      tipo: "pago_recibido",
      monto: 32000,
      metodo_pago: "tarjeta",
      pago_completo: true
    }
  ]
};