# Parte 5: Diseño Conceptual de Agente de IA

## Arquitectura del Agente

[Base de Datos] <--(Query/SQL Tool)--> [Agente IA (LLM + ReAct Loop)]
                                            |   |
     [Tabla de Auditoría] <--(Log Tool)-----|   |----(API Tool)--> [Google Ads / N8N]

## Razonamiento

Diseñaría el sistema utilizando una arquitectura de agente basada en el patrón **ReAct** (Reasoning and Acting). A diferencia de un script lineal, el agente recibe un objetivo ("optimizar ROAS") y entra en un bucle cognitivo: observa datos, razona qué hacer y ejecuta herramientas (Tool-calling).

**Componentes y Herramientas:**
1. **Cerebro (LLM):** Motor de decisión estructurado.
2. **DB Query Tool:** Herramienta para consultar métricas recientes.
3. **Action Tool:** API externa para pausar campañas o alertar en N8N.
4. **Audit Tool:** Componente crítico para trazabilidad.

**Toma de decisiones:**
El agente se despierta por un CRON job. Utiliza la DB Query Tool para analizar métricas. Si detecta anomalías según su System Prompt, razona la mejor estrategia y decide invocar la Action Tool.

**Auditabilidad:**
Un agente autónomo es un riesgo sin observabilidad. Antes de confirmar cualquier acción, el sistema invoca obligatoriamente la Audit Tool, escribiendo un registro inmutable en una base de datos detallando: Timestamp, ID de Campaña, Acción ejecutada, y el "Razonamiento" exacto que llevó al LLM a tomar esa decisión.