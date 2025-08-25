import asyncio
import logging
from pathlib import Path
from GraphittiSetting import GraphittiSetting
from services.data_proceso_lectura import cargar_validar_json

logging.basicConfig(level=logging.INFO)

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "interacciones_clientes.json"

async def main():

    # Cargar y validar JSON
    data = cargar_validar_json(DATA_FILE)

    #Init Graphiti
    client = GraphittiSetting()
    # await client._async_init()
    # Cargar datos en Graphiti
    await client.cargar_datos_triplet_completo(data)
    # print(data)
    # print(DATA_FILE)

    print("Pipeline completado ✅")


if __name__ == "__main__":
    asyncio.run(main())
