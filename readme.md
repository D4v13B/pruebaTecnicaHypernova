# 📞 Analizador de Patrones de Llamadas

Este proyecto tiene como objetivo analizar y visualizar los patrones de interacción entre una empresa de gestión de cobros y sus clientes. Utiliza **Graphiti** para modelar y almacenar los datos en un grafo de conocimiento, y parcialmente implementa un servidor MCP para la ingesta de datos. Sin embargo, el sistema aún no retorna datos desde el servidor MCP.

---

## 🚀 Funcionalidades Implementadas

1. **Ingesta de Datos**:
   - Procesa un archivo JSON con información de clientes, interacciones y deudas.
   - Modela entidades y relaciones en un grafo utilizando **Graphiti**.
   - Carga los datos en un servidor Neo4j a través de Graphiti.

2. **Servidor MCP (Parcial)**:
   - MCP Server configurado para recibir datos.
   - Actualmente, solo realiza la ingesta de datos; no se implementaron endpoints para consultar información.

---

## 🛠️ Requisitos

- **Python** 3.10 o superior
- **Neo4j** 5.x (Community Edition)
- **Docker** y **Docker Compose** (opcional para levantar Neo4j y Graphiti)
- Clave de API de OpenAI (para generar embeddings)

---

## ⚙️ Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu_usuario/analizador-patrones-llamadas.git
   cd analizador-patrones-llamadas

2. **Crer el archivo .env**
   ```bash
   cp backend/.env.example backend/.env

    - Completa el achivo 
    ```bash
    OPENAI_API_KEY=tu_clave_de_openai
    NEO4J_URI=bolt://localhost:7687
    NEO4J_USERNAME=neo4j
    NEO4J_PASSWORD=tu_contraseña

3. **Instalar dependencias**
   
   ```bash
    cd backend
    python -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt

4. **Levantar Neo4j y Graphiti (opcional): Si deseas usar Docker para Neo4j y Graphiti, ejecuta:**
   ```bash
   docker-compose up -d

#### 🏃‍♂️ Ejecución
1. Cargar los datos: Ejecuta el script principal para cargar los datos en el grafo:
    ```bash
    python main.py

Esto procesará el archivo JSON y cargará las entidades y relaciones en el servidor Neo4j a través de Graphiti.

2. Servidor MCP (Parcial): El servidor MCP está configurado para recibir datos, pero actualmente no tiene endpoints funcionales para consultar información.

#### 🛠️ Limitaciones
- Servidor MCP: Solo se implementó la ingesta de datos. No se desarrollaron endpoints para consultar información desde el grafo.
- Visualización: No se implementaron vistas web ni dashboards.
- Consultas: No se incluyeron consultas analíticas o endpoints REST para acceder a los datos.

#### 📝 Notas
Este proyecto está incompleto, pero proporciona una base funcional para la ingesta de datos en un grafo de conocimiento. Se recomienda continuar con la implementación de consultas y visualizaciones para aprovechar al máximo los datos cargados.