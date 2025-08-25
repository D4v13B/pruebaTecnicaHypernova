# 📞 Analizador de Patrones de Llamadas

Este proyecto tiene como objetivo analizar y visualizar los patrones de interacción entre una empresa de gestión de cobros y sus clientes. Utiliza **Graphiti** para modelar y almacenar los datos en un grafo de conocimiento, y parcialmente implementa un servidor MCP para la ingesta de datos. Además, incluye un **frontend** para visualizar las relaciones entre clientes, agentes e interacciones.

---

## 🚀 Funcionalidades Implementadas

1. **Ingesta de Datos**:
   - Procesa un archivo JSON con información de clientes, interacciones y deudas.
   - Modela entidades y relaciones en un grafo utilizando **Graphiti**.
   - Carga los datos en un servidor Neo4j a través de Graphiti.

2. **Servidor MCP (Parcial)**:
   - MCP Server configurado para recibir datos.
   - Actualmente, solo realiza la ingesta de datos; no se implementaron endpoints para consultar información.

3. **Frontend**:
   - Visualización interactiva de las relaciones entre clientes, agentes e interacciones utilizando un grafo.
   - Filtros para explorar diferentes tipos de interacciones.

---

## 🛠️ Requisitos

### Backend
- **Python** 3.10 o superior
- **Neo4j** 5.x (Community Edition)
- **Docker** y **Docker Compose** (opcional para levantar Neo4j y Graphiti)
- Clave de API de OpenAI (para generar embeddings)

### Frontend
- **Node.js** 18.x o superior
- **npm** o **yarn**

---

## ⚙️ Configuración

### Backend

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu_usuario/analizador-patrones-llamadas.git
   cd analizador-patrones-llamadas
   ```

2. **Crear el archivo `.env`**:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Completa el archivo `.env` con los siguientes valores:
   ```bash
   OPENAI_API_KEY=tu_clave_de_openai
   NEO4J_URI=bolt://localhost:7687
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=tu_contraseña
   ```

3. **Instalar dependencias**:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Levantar Neo4j y Graphiti (opcional)**:
   Si deseas usar Docker para Neo4j y Graphiti, ejecuta:
   ```bash
   docker-compose up -d
   ```

5. **Cargar los datos**:
   Ejecuta el script principal para cargar los datos en el grafo:
   ```bash
   python main.py
   ```

---

### Frontend

1. **Ir al directorio del frontend**:
   ```bash
   cd frontend
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. **Abrir la aplicación en el navegador**:
   Ve a [http://localhost:5173](http://localhost:5173) para visualizar el grafo interactivo.

---

## 🏃‍♂️ Ejecución Completa

1. **Levantar el backend**:
   Asegúrate de que el backend esté configurado y que los datos estén cargados en Neo4j.

2. **Levantar el frontend**:
   Sigue los pasos de configuración del frontend y accede a la aplicación en tu navegador.

---

## 🛠️ Limitaciones

- **Servidor MCP**: Solo se implementó la ingesta de datos. No se desarrollaron endpoints para consultar información desde el grafo.
- **Consultas**: No se incluyeron consultas analíticas o endpoints REST para acceder a los datos desde el backend.
- **Visualización**: El frontend utiliza datos mockeados y no está conectado al backend.

---

## 📝 Notas

Este proyecto está incompleto, pero proporciona una base funcional para la ingesta de datos en un grafo de conocimiento y su visualización. Se recomienda continuar con la implementación de consultas y visualizaciones para aprovechar al máximo los datos cargados.