# 📞 Analizador de Patrones de Llamadas

## 📌 Contexto del Problema
Una empresa de **gestión de cobros** necesita analizar y visualizar los patrones de interacción con sus clientes.  
El objetivo es construir un sistema que:

- Procese datos históricos de interacciones
- Los almacene en un **grafo de conocimiento** usando **Graphiti**
- Proporcione **visualizaciones útiles** para identificar patrones y optimizar estrategias de cobro

---

## 📂 Datos Proporcionados

Archivo: `interacciones_clientes.json`  
Estructura resumida:

- **metadata**
  - fecha_generacion (ISO)
  - total_clientes
  - total_interacciones
  - periodo
- **clientes**
  - id, nombre, teléfono
  - monto_deuda_inicial, fecha_prestamo, tipo_deuda
- **interacciones**
  - id, cliente_id, timestamp, tipo
  - campos condicionales según tipo (llamadas, promesas, renegociaciones, pagos, etc.)

📊 Dataset: ~50 clientes, 500+ interacciones, distribuidas en 90 días.

---

## 🎯 Entregables

### 1. Sistema de Ingesta y Modelado de Grafo (40%)
- Procesar y validar el JSON
- Modelar entidades y relaciones en el grafo:
  - **Entidades:** clientes, agentes, deudas, pagos
  - **Relaciones:** interacciones, promesas → pagos/incumplimientos
- Cargar datos en **Graphiti** vía API REST
- Documentar las **decisiones de modelado**

**Preguntas clave:**
- ¿Cómo representar la evolución temporal de la deuda?
- ¿Cómo vincular promesas con pagos reales?
- ¿Qué propiedades derivadas se calculan previamente?

---

### 2. API de Consultas (30%)

#### **Opción A (mínimo requerido) – REST API**
Endpoints sugeridos:
- `GET /clientes/{id}/timeline` → historial completo del cliente
- `GET /agentes/{id}/efectividad` → métricas de desempeño
- `GET /analytics/promesas-incumplidas` → clientes con promesas vencidas
- `GET /analytics/mejores-horarios` → horarios de contacto más efectivos

#### **Opción B (bonus) – Integración MCP + LLM**
- Configurar servidor MCP de Graphiti
- Integrar con un LLM para consultas en **lenguaje natural**

---

### 3. Visualización Web (30%)

#### **Vistas requeridas**
1. **Dashboard General**
   - KPIs principales (tasa de recuperación, promesas cumplidas, etc.)
   - Distribución de tipos de deuda
   - Actividad por periodo
2. **Vista Cliente Individual**
   - Timeline interactivo de interacciones
   - Estado actual y evolución de deuda
   - Predicción de comportamiento futuro
3. **Vista de Grafo**
   - Visualización interactiva de entidades y relaciones
   - Filtros por tipo, periodo, resultado

#### **Tecnologías sugeridas**
- **Frontend:** React / Vue / JS
- **Grafos:** D3.js, Cytoscape.js, Vis.js
- **Charts:** Chart.js, Recharts, Plotly

---

## 📊 Criterios de Evaluación

1. **Calidad del Modelado de Datos**
   - Relaciones y propiedades bien representadas
   - Consultas eficientes
   - Uso adecuado de Graphiti

2. **Robustez del Código**
   - Manejo de errores
   - Código limpio
   - Tests (bonus)

3. **Utilidad de Consultas/Análisis**
   - Métricas relevantes para negocio
   - Identificación de patrones no obvios

4. **Experiencia de Usuario**
   - Visualización clara e intuitiva

5. **Documentación**
   - README claro con instalación y uso
   - Decisiones de diseño explicadas
   - Ejemplos de uso

---

## ⭐ Bonus (Opcional)
- Análisis predictivo
- Detección de anomalías
- Optimización de estrategias
- Tests automatizados
- Deployment
- Integración MCP + LLM

---

## 🛠️ Recursos y Referencias

- **Graphiti**
  - [Graphiti Docs](https://docs.zep.dev/graphiti/)
  - API Reference
  - Tutorials
- **MCP**
  - MCP Quickstart
  - MCP Python SDK
- **Visualización de grafos**
  - D3.js
  - Cytoscape.js
  - Neo4j Viz Guide
- **LLM Integrations**
  - OpenAI API
  - Anthropic API
  - Ollama (modelos locales)

---

## ⚙️ Configuración Inicial (Docker Compose)

```yaml
version: '3.8'
services:
  neo4j:
    image: neo4j:5-community
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      NEO4J_AUTH: neo4j/password123
      NEO4J_PLUGINS: '["apoc"]'
    volumes:
      - neo4j_data:/data

  graphiti:
    image: getzep/graphiti:latest
    depends_on:
      - neo4j
    ports:
      - "8000:8000"
    environment:
      - NEO4J_URI=bolt://neo4j:7687
      - NEO4J_USER=neo4j
      - NEO4J_PASSWORD=password123

volumes:
  neo4j_data:
