## Decisiones de Modelado y Consideraciones

### 📌 Evolución temporal de la deuda
- Cada **pago** y **renegociación** se modela como un **episodio** (`nodo: Episodio`).
- Se conecta al **cliente** y a la **deuda** mediante **relaciones temporales**.
- Los **atributos de la deuda** pueden:
  - **Actualizarse** o  
  - **Invalidarse** usando los mecanismos temporales de Graphiti.
- Esto permite realizar **consultas del estado en cualquier punto en el tiempo**  
  👉 _Ver: Temporalidad y episodios._

---****

### 📌 Conexión promesas ↔ pagos
- Las **promesas de pago** se modelan como:
  - **Nodos** o  
  - **Atributos en edges** entre `Cliente` y `Deuda`.
- Se conectan a **pagos reales posteriores** mediante relaciones.  
  Ejemplo:  
  - Edge **`CUMPLE_PROMESA`** entre **Promesa** y **Pago** si el pago ocurre **antes de la fecha_promesa**.  
  👉 _Ver: Relaciones **y** episodios._

---

### 📌 Información derivada útil
- Estado actual de la deuda:
  - Saldo  
  - Última fecha de pago  
  - Número de promesas incumplidas
- Métricas de efectividad de agentes:
  - Número de promesas cumplidas  
  - Pagos recibidos tras contacto
- Historial de interacciones y transiciones de estado:
  - **Promesa → Pago/Incumplimiento**
- KPIs agregados:
  - Por período  
  - Por tipo de deuda
