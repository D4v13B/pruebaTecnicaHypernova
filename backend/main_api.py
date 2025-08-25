from typing import Optional
from fastapi import FastAPI
from GraphittiSetting import GraphittiSetting

app = FastAPI()

client = GraphittiSetting()

@app.get("/test")
async def root():
    res = await client.query()
    return "Hola"

@app.get("/kpis")
async def obtener_kpis():
    # Ejemplos de KPIs
    total_clientes = await client.count_nodes("CLIENTE")
    total_deudas = await client.count_nodes("DEUDA")
    promesas_cumplidas = await client.count_edges(
        "PROMETE", filter={"cumplida": True}
    )
    tasa_recuperacion = await client.calculate_recovery_rate()  # implementa tu lógica

    return {
        "total_clientes": total_clientes,
        "total_deudas": total_deudas,
        "promesas_cumplidas": promesas_cumplidas,
        "tasa_recuperacion": tasa_recuperacion,
    }

@app.get("/cliente/{cliente_id}")
async def cliente_detalle(cliente_id: str):
    cliente = await client.get_node("CLIENTE", cliente_id)
    interacciones = await client.get_edges(cliente_id, "TIENE")
    pagos = await client.get_edges(cliente_id, "PAGA")
    planes = await client.get_edges(cliente_id, "RENUEVA_PLAN")
    
    return {
        "cliente": cliente,
        "interacciones": interacciones,
        "pagos": pagos,
        "planes_pago": planes
    }

@app.get("/grafo")
async def grafo(filter_tipo: Optional[str] = None):
    nodes, edges = await client.get_grafo(filter_tipo=filter_tipo)
    return {"nodes": nodes, "edges": edges}
