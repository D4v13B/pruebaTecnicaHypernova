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

    return {
        "total_clientes": [],
        "total_deudas": [],
        "promesas_cumplidas": [],
        "tasa_recuperacion": [],
    }

@app.get("/cliente/{cliente_id}")
async def cliente_detalle(cliente_id: str):
    
    return {
        "cliente": [],
        "interacciones": [],
        "pagos": [],
        "planes_pago": []
    }

@app.get("/grafo")
async def grafo(filter_tipo: Optional[str] = None):
    return {"nodes": [], "edges": []}
