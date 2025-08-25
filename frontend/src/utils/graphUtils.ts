export interface Nodo {
  id: string;
  name: string;
  tipo: 'cliente' | 'agente';
  group: number;
}

export interface Enlace {
  source: string;
  target: string;
  tipo: string;
}

export interface Grafo {
  nodes: Nodo[];
  links: Enlace[];
}