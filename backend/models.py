from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class Cliente(BaseModel):
    id: Optional[str] = Field(None, description="ID único del cliente, formato: cliente_XXX")
    nombre: Optional[str] = Field(None, description="Nombre del cliente")
    telefono: Optional[str] = Field(None, description="Teléfono del cliente")
    monto_deuda_inicial: Optional[float] = Field(None, description="Monto inicial de la deuda")
    fecha_prestamo: Optional[datetime] = Field(None, description="Fecha del préstamo")
    tipo_deuda: Optional[str] = Field(
        None,
        description="Tipo de deuda: tarjeta_credito, prestamo_personal, hipoteca, auto",
    )


class Agente(BaseModel):
    id: Optional[str] = Field(None, description="ID del agente")
    nombre: Optional[str] = Field(None, description="Nombre del agente")


class Deuda(BaseModel):
    cliente_id: Optional[str] = Field(None, description="ID del cliente asociado")
    monto_inicial: Optional[float] = Field(None, description="Monto inicial de la deuda")
    tipo: Optional[str] = Field(None, description="Tipo de deuda")
    fecha_inicio: Optional[datetime] = Field(None, description="Fecha de inicio de la deuda")


class Pago(BaseModel):
    id: Optional[str] = Field(None, description="ID del pago")
    cliente_id: Optional[str] = Field(None, description="ID del cliente")
    timestamp: Optional[datetime] = Field(None, description="Fecha y hora del pago")
    monto: Optional[float] = Field(None, description="Monto pagado")
    metodo_pago: Optional[str] = Field(None, description="Método de pago")
    pago_completo: Optional[bool] = Field(None, description="Si el pago fue completo")


class PromesaPago(BaseModel):
    monto_prometido: Optional[float] = Field(None, description="Monto prometido")
    fecha_promesa: Optional[datetime] = Field(None, description="Fecha de la promesa")


class NuevoPlanPago(BaseModel):
    cuotas: Optional[int] = Field(None, description="Número de cuotas")
    monto_mensual: Optional[float] = Field(None, description="Monto mensual")


class Interaccion(BaseModel):
    id: Optional[str] = Field(None, description="ID de la interacción")
    cliente_id: Optional[str] = Field(None, description="ID del cliente")
    timestamp: Optional[datetime] = Field(None, description="Timestamp ISO")
    tipo: Optional[str] = Field(None, description="Tipo de interacción")
    duracion_segundos: Optional[int] = Field(None, description="Duración en segundos")
    agente_id: Optional[str] = Field(None, description="ID del agente")
    resultado: Optional[str] = Field(None, description="Resultado de la interacción")
    sentimiento: Optional[str] = Field(None, description="Sentimiento percibido")
    monto_prometido: Optional[float] = Field(None, description="Monto prometido")
    fecha_promesa: Optional[datetime] = Field(None, description="Fecha de la promesa")
    nuevo_plan_pago: Optional[NuevoPlanPago] = Field(None, description="Nuevo plan de pago")
    monto: Optional[float] = Field(None, description="Monto asociado a la interacción")
    metodo_pago: Optional[str] = Field(None, description="Método de pago")
    pago_completo: Optional[bool] = Field(None, description="Si el pago fue completo")


class DataSetInteracciones(BaseModel):
    clientes: Optional[List[Cliente]] = Field(None, description="Lista de clientes")
    interacciones: Optional[List[Interaccion]] = Field(None, description="Lista de interacciones")


## RELACIONES
class InteractuoCon(BaseModel):
    tipo: Optional[str] = Field(None, description="Tipo de interacción")
    timestamp: Optional[datetime] = Field(None, description="Fecha y hora de la interacción")
    duracion_segundos: Optional[int] = Field(None, description="Duración en segundos")
    resultado: Optional[str] = Field(None, description="Resultado de la interacción")
    sentimiento: Optional[str] = Field(None, description="Sentimiento percibido")


class PromesaPago(BaseModel):
    monto_prometido: Optional[float] = Field(None, description="Monto prometido")
    fecha_promesa: Optional[datetime] = Field(None, description="Fecha de la promesa")


class RealizoPago(BaseModel):
    monto: Optional[float] = Field(None, description="Monto pagado")
    metodo_pago: Optional[str] = Field(None, description="Método de pago")
    timestamp: Optional[datetime] = Field(None, description="Fecha y hora del pago")
    pago_completo: Optional[bool] = Field(None, description="Si el pago fue completo")


class RenegocioPlan(BaseModel):
    cuotas: Optional[int] = Field(None, description="Número de cuotas")
    monto_mensual: Optional[float] = Field(None, description="Monto mensual")


class IncumplioPromesa(BaseModel):
    fecha_vencimiento: Optional[datetime] = Field(
        None, description="Fecha en que se venció la promesa"
    )
