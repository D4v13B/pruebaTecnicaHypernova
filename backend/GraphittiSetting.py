from datetime import datetime
import json
from graphiti_core import Graphiti

# from graphiti.graphiti_core.nodes import EpisodeType
# from graphiti.graphiti_core.utils.bulk_utils import RawEpisode
from graphiti_core.nodes import EntityNode
from graphiti_core.edges import EntityEdge
import uuid

from models import (
    Agente,
    Cliente,
    DataSetInteracciones,
    IncumplioPromesa,
    Interaccion,
    InteractuoCon,
    NuevoPlanPago,
    PromesaPago,
    RealizoPago,
    RenegocioPlan,
)
from config import NEO4J_PASSWORD, NEO4J_URI, NEO4J_USERNAME


class GraphittiSetting:
    def __init__(self):
        self.graphiti = Graphiti(
            uri=NEO4J_URI,
            user=NEO4J_USERNAME,
            password=NEO4J_PASSWORD,
        )

    async def cargar_datos(self, data: DataSetInteracciones, auto_extract=True):
        if not self.graphiti:
            raise RuntimeError("Graphiti no está inicializado")

        entity_types = {
            "Cliente": Cliente,
            "Interaccion": Interaccion,
            "Agente": Agente,
            "NuevoPlanPago": NuevoPlanPago,
            "PromesaPago": PromesaPago,
        }
        edge_types = {
            "InteractuoCon": InteractuoCon,
            "PromesaPago": PromesaPago,
            "RealizoPago": RealizoPago,
            "RenegocioPlan": RenegocioPlan,
            "IncumplioPromesa": IncumplioPromesa,
        }

        edge_type_map = {
            ("Agente", "Cliente"): ["InteractuoCon"],
            ("Cliente", "PromesaPago"): ["PromesaPago"],
            ("Cliente", "Pago"): ["RealizoPago"],
            ("Cliente", "Deuda"): ["RenegocioPlan"],
            ("PromesaPago", "Pago"): [
                "IncumplioPromesa"
            ],  # Si el pago no se realizó a tiempo
        }

        episodio_completo = {
            "clientes": [c.model_dump() for c in data.clientes],
            "interacciones": [i.model_dump() for i in data.interacciones],
        }

        # Si auto_extract=False, Graphiti no llama al LLM y solo crea el episodio
        await self.graphiti.add_episode(
            name="Dataset completo",
            episode_body=json.dumps(episodio_completo, default=str),
            source_description="Carga completa de clientes, interacciones y metadatos",
            reference_time=datetime.now(),
            entity_types=entity_types,
            edge_types=edge_types,
            edge_type_map=edge_type_map,
        )

        # bulk_episodes = [
        #     RawEpisode(
        #         name=f"Cliente - {cliente.id}",
        #         content=json.dumps(cliente.model_dump(), default=str),
        #         source=EpisodeType.json,
        #         source_description="Información del cliente",
        #         reference_time=datetime.now(),
        #     )
        #     for cliente in data.clientes
        # ] + [
        #     RawEpisode(
        #         name=f"Interacción - {interaccion.id}",
        #         content=json.dumps(interaccion.model_dump(), default=str),
        #         source=EpisodeType.json,
        #         source_description="Información de la interacción",
        #         reference_time=datetime.now(),
        #     )
        #     for interaccion in data.interacciones
        # ]

        # # Cargar episodios en Graphiti
        # await self.graphiti.add_episode_bulk(
        #     bulk_episodes,
        #     entity_types=entity_types,
        #     edge_types=edge_types,
        #     edge_type_map=edge_type_map,
        # )

        print("✅ Datos cargados en Graphiti en un solo request")

    async def cargar_datos_triplet(self, data: DataSetInteracciones):
        if not self.graphiti:
            raise RuntimeError("Graphiti no está inicializado")

        # Ejemplo: agregar una relación "InteractuoCon" entre cada cliente y cada agente de una interacción
        for interaccion in data.interacciones:

            # Crear nodos
            cliente = next(
                (c for c in data.clientes if c.id == interaccion.cliente_id), None
            )
            if not cliente:
                continue  # O maneja el error

            cliente_node = EntityNode(
                uuid=str(uuid.uuid4()), name=cliente.nombre, group_id=""
            )

            if not interaccion.agente_id:
                continue  # o asignar un valor por defecto como "Desconocido"

            agente_node = EntityNode(
                uuid=str(uuid.uuid4()), name=interaccion.agente_id, group_id=""
            )

            # Crear arista
            edge = EntityEdge(
                name="INTERACTUOCON",
                group_id="",
                source_node_uuid=agente_node.uuid,
                target_node_uuid=cliente_node.uuid,
                created_at=datetime.now(),
                fact=f"{agente_node.name} interactuó con {cliente_node.name}",
            )
            # Agregar el triplete al grafo
            await self.graphiti.add_triplet(agente_node, edge, cliente_node)

    async def cargar_datos_triplet_completo(self, data: DataSetInteracciones):
        if not self.graphiti:
            raise RuntimeError("Graphiti no está inicializado")
        
        namespace = "carga_2.0"

        clientes_nodos = {}
        agentes_nodos = {}
        deudas_nodos = {}

        for cliente in data.clientes:
            try:
                # Nodo Cliente
                cliente_node = EntityNode(
                    labels=["CLIENTE"],
                    name=f"{cliente.nombre}",
                    uuid=str(uuid.uuid4()),
                    group_id=namespace,
                    attributes={
                        "telefono": cliente.telefono,
                        "monto_deuda_inicial": cliente.monto_deuda_inicial,
                        "fecha_prestamo": cliente.fecha_prestamo.isoformat(),
                        "tipo_deuda": cliente.tipo_deuda,
                    },
                    created_at=datetime.now(),
                )
                clientes_nodos[cliente.id] = cliente_node

                # await self.graphiti.add_triplet(
                #     cliente_node, None, None
                # )  # Triplet mínimo

                # Nodo Deuda
                deuda_node = EntityNode(
                    labels=["DEUDA"],
                    uuid=str(uuid.uuid4()),
                    name=f"Deuda_{cliente.nombre}",
                    group_id=namespace,
                    attributes={
                        "monto_inicial": cliente.monto_deuda_inicial,
                        "monto_actual": cliente.monto_deuda_inicial,
                        "tipo": cliente.tipo_deuda,
                        "fecha_inicio": cliente.fecha_prestamo.isoformat(),
                    },
                    created_at=datetime.now(),
                )
                deudas_nodos[cliente.id] = deuda_node
                # await self.graphiti.add_triplet(deuda_node, None, None)

                # Relación Cliente → Deuda
                edge_posee = EntityEdge(
                    name="POSEE",
                    group_id=namespace,
                    source_node_uuid=cliente_node.uuid,
                    target_node_uuid=deuda_node.uuid,
                    created_at=datetime.now(),
                    fact=f"{cliente_node.name} posee la deuda {deuda_node.name}",
                )
                await self.graphiti.add_triplet(cliente_node, edge_posee, deuda_node)

            except Exception as e:
                print(f"[ERROR] Cliente {cliente.id}: {e}")
                continue

        for interaccion in data.interacciones:
            try:
                cliente_node = clientes_nodos.get(interaccion.cliente_id)
                if not cliente_node:
                    print(f"[WARN] Cliente {interaccion.cliente_id} no encontrado")
                    continue

                # Nodo Interacción
                interaccion_node = EntityNode(
                    labels=["INTERACCION"],
                    uuid=str(uuid.uuid4()),
                    name=f"Interaccion_{interaccion.id}",
                    group_id=namespace,
                    attributes={
                        "tipo": interaccion.tipo,
                        "timestamp": interaccion.timestamp.isoformat(),
                        "resultado": getattr(interaccion, "resultado", None),
                        "sentimiento": getattr(interaccion, "sentimiento", None),
                        "duracion_segundos": getattr(
                            interaccion, "duracion_segundos", None
                        ),
                    },
                    created_at=datetime.now().isoformat(),
                )
                # await self.graphiti.add_triplet(interaccion_node, None, None)

                # Relación Cliente → Interacción
                edge_tiene = EntityEdge(
                    name="TIENE",
                    group_id="INTERACTUO_CON",
                    source_node_uuid=cliente_node.uuid,
                    target_node_uuid=interaccion_node.uuid,
                    created_at=datetime.now(),
                    fact=f"{cliente_node.name} tiene la interacción {interaccion_node.name}",
                )
                await self.graphiti.add_triplet(
                    cliente_node, edge_tiene, interaccion_node
                )

                # Nodo Agente + relación REALIZA
                agente_id = getattr(interaccion, "agente_id", None)
                if agente_id:
                    agente_node = agentes_nodos.get(agente_id)
                    if not agente_node:
                        agente_node = EntityNode(
                            labels=["AGENTE"],
                            uuid=str(uuid.uuid4()),
                            name=agente_id,
                            group_id=namespace,
                            created_at=datetime.now().isoformat(),
                        )
                        agentes_nodos[agente_id] = agente_node
                        # await self.graphiti.add_triplet(agente_node, None, None)

                    edge_realiza = EntityEdge(
                        name="REALIZA",
                        group_id=namespace,
                        source_node_uuid=agente_node.uuid,
                        target_node_uuid=interaccion_node.uuid,
                        created_at=datetime.now(),
                        fact=f"{agente_node.name} realizó la interacción {interaccion_node.name}",
                    )
                    await self.graphiti.add_triplet(
                        agente_node, edge_realiza, interaccion_node
                    )

                # Nodo Pago (si aplica)
                if interaccion.tipo == "pago_recibido" or getattr(
                    interaccion, "monto_prometido", None
                ):
                    pago_node = EntityNode(
                        labels=["PAGO"],
                        uuid=str(uuid.uuid4()),
                        name=f"Pago_{interaccion.id}",
                        group_id=namespace,
                        attributes={
                            "monto": getattr(
                                interaccion,
                                "monto",
                                getattr(interaccion, "monto_prometido", None),
                            ),
                            "metodo_pago": getattr(interaccion, "metodo_pago", None),
                            "pago_completo": getattr(
                                interaccion, "pago_completo", None
                            ),
                            "fecha_promesa": getattr(
                                interaccion, "fecha_promesa", None
                            ),
                        },
                        created_at=datetime.now().now(),
                    )
                    # await self.graphiti.add_triplet(pago_node, None, None)

                    # Relación Promesa o Pago
                    edge_pago = EntityEdge(
                        name=(
                            "PROMETE"
                            if getattr(interaccion, "monto_prometido", None)
                            else "PAGA"
                        ),
                        group_id=namespace,
                        source_node_uuid=interaccion_node.uuid,
                        target_node_uuid=pago_node.uuid,
                        created_at=datetime.now(),
                        fact=f"{interaccion_node.name} vincula al pago {pago_node.name}",
                    )
                    await self.graphiti.add_triplet(
                        interaccion_node, edge_pago, pago_node
                    )

                    # Relación Cliente → Pago
                    edge_cliente_pago = EntityEdge(
                        group_id=namespace,
                        source_node_uuid=cliente_node.uuid,
                        target_node_uuid=pago_node.uuid,
                        created_at=datetime.now(),
                        name="PAGA",
                        fact=f"{cliente_node.name} realizó el pago {pago_node.name}",
                    )
                    await self.graphiti.add_triplet(
                        cliente_node, edge_cliente_pago, pago_node
                    )

                # Nodo PlanPago (si hay renegociación)
                if getattr(interaccion, "nuevo_plan_pago", None):
                    plan = interaccion.nuevo_plan_pago
                    plan_node = EntityNode(
                        labels=["PLAN_PAGO"],
                        uuid=str(uuid.uuid4()),
                        name=f"PlanPago_{interaccion.id}",
                        group_id=namespace,
                        attributes={
                            "cuotas": plan.cuotas,
                            "monto_mensual": plan.monto_mensual,
                            "fecha_inicio": interaccion.timestamp,
                        },
                        created_at=datetime.now().isoformat(),
                    )
                    # await self.graphiti.add_triplet(plan_node, None, None)

                    edge_plan = EntityEdge(
                        name="RENUEVA_PLAN",
                        group_id=namespace,
                        source_node_uuid=interaccion_node.uuid,
                        target_node_uuid=plan_node.uuid,
                        created_at=datetime.now(),
                        fact=f"{interaccion_node.name} creó el plan {plan_node.name}",
                    )
                    await self.graphiti.add_triplet(
                        interaccion_node, edge_plan, plan_node
                    )

            except Exception as e:
                print(f"[ERROR] Interacción {interaccion.id}: {e}")
            if not self.graphiti:
                raise RuntimeError("Graphiti no está inicializado")

    async def query(self):
        # result = await self.graphiti.search("MATCH (c:CLIENTE) RETURN count(c) AS total_clientes")
        result = await self.graphiti.search("""
MATCH (c:CLIENTE {nombre: "Cliente 13"})-[:RELATIONS_TO]->(d:DEUDA)
RETURN sum(d.monto) AS total_deuda
""")
        print("\n".join([edge.fact for edge in result]))
        return result
    
    def print_facts(edges):
        print("\n".join([edge.fact for edge in edges]))