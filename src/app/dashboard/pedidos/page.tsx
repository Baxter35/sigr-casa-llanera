'use client'

import { useEffect, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Mesa = { id: string; numero: number; capacidad: number; estado: string }
type Plato = { id: string; nombre: string; precio: number; categoriaId: string; categoria: { nombre: string } }
type DetallePedido = { id: string; cantidad: number; precioUnitario: number; notas?: string; plato: Plato }
type Pedido = { id: string; estado: string; total: number | null; detalles: DetallePedido[]; createdAt: string }

function formatCOP(v: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
}

const estadoColors: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-700',
  EN_COCINA: 'bg-orange-100 text-orange-700',
  LISTO: 'bg-blue-100 text-blue-700',
  ENTREGADO: 'bg-green-100 text-green-700',
  CANCELADO: 'bg-gray-100 text-gray-500',
}

const mesaColors: Record<string, string> = {
  LIBRE: 'bg-green-50 border-green-200 hover:bg-green-100',
  OCUPADA: 'bg-red-50 border-red-200 hover:bg-red-100',
  RESERVADA: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
}

const nextEstado: Record<string, string> = {
  PENDIENTE: 'EN_COCINA',
  EN_COCINA: 'LISTO',
  LISTO: 'ENTREGADO',
}

export default function PedidosPage() {
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [platos, setPlatos] = useState<Plato[]>([])
  const [pedidoActivo, setPedidoActivo] = useState<Pedido | null>(null)
  const [mesaSelected, setMesaSelected] = useState<Mesa | null>(null)
  const [dialogMode, setDialogMode] = useState<'nuevo' | 'activo' | null>(null)
  const [items, setItems] = useState<{ platoId: string; cantidad: number; notas: string }[]>([])
  const [isPending, startTransition] = useTransition()

  async function load() {
    const [mRes, pRes] = await Promise.all([fetch('/api/mesas'), fetch('/api/menu')])
    setMesas(await mRes.json())
    setPlatos(await pRes.json())
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [])

  async function openMesa(mesa: Mesa) {
    setMesaSelected(mesa)
    if (mesa.estado === 'OCUPADA') {
      const res = await fetch(`/api/pedidos?mesaId=${mesa.id}&activo=true`)
      const data = await res.json()
      setPedidoActivo(data[0] ?? null)
      setDialogMode('activo')
    } else if (mesa.estado === 'LIBRE') {
      setPedidoActivo(null)
      setItems([{ platoId: '', cantidad: 1, notas: '' }])
      setDialogMode('nuevo')
    }
  }

  async function crearPedido() {
    const detalles = items.filter((i) => i.platoId)
    if (detalles.length === 0) return
    await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mesaId: mesaSelected!.id, detalles }),
    })
    setDialogMode(null)
    startTransition(load)
  }

  async function avanzarEstado() {
    if (!pedidoActivo) return
    const next = nextEstado[pedidoActivo.estado]
    if (!next) return
    await fetch(`/api/pedidos/${pedidoActivo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: next }),
    })
    setDialogMode(null)
    startTransition(load)
  }

  async function cancelarPedido() {
    if (!pedidoActivo || !confirm('¿Cancelar este pedido?')) return
    await fetch(`/api/pedidos/${pedidoActivo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'CANCELADO' }),
    })
    setDialogMode(null)
    startTransition(load)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos por Mesa</h1>
        <Button variant="outline" size="sm" onClick={() => startTransition(load)} disabled={isPending}>
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {mesas.map((mesa) => (
          <button
            key={mesa.id}
            onClick={() => openMesa(mesa)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${mesaColors[mesa.estado] ?? 'bg-gray-50 border-gray-200'}`}
          >
            <p className="font-bold text-gray-800 text-lg">Mesa {mesa.numero}</p>
            <p className="text-xs text-gray-500">{mesa.capacidad} personas</p>
            <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${estadoColors[mesa.estado] ?? ''}`}>
              {mesa.estado}
            </span>
          </button>
        ))}
      </div>

      {/* Nuevo pedido */}
      <Dialog open={dialogMode === 'nuevo'} onOpenChange={() => setDialogMode(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo pedido — Mesa {mesaSelected?.numero}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-6">
                  <Label className="text-xs">Plato</Label>
                  <Select value={item.platoId} onValueChange={(v) => v && setItems(items.map((i, ii) => ii === idx ? { ...i, platoId: v } : i))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {platos.filter((p) => p.precio > 0).map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.nombre} — {formatCOP(p.precio)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Cant.</Label>
                  <Input type="number" min={1} value={item.cantidad} className="h-8 text-xs"
                    onChange={(e) => setItems(items.map((i, ii) => ii === idx ? { ...i, cantidad: parseInt(e.target.value) || 1 } : i))} />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">Notas</Label>
                  <Input value={item.notas} className="h-8 text-xs" placeholder="Sin sal..."
                    onChange={(e) => setItems(items.map((i, ii) => ii === idx ? { ...i, notas: e.target.value } : i))} />
                </div>
                <div className="col-span-1">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400"
                    onClick={() => setItems(items.filter((_, ii) => ii !== idx))}>×</Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => setItems([...items, { platoId: '', cantidad: 1, notas: '' }])}>
            + Agregar plato
          </Button>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogMode(null)}>Cancelar</Button>
            <Button onClick={crearPedido} disabled={isPending} className="bg-amber-700 hover:bg-amber-800">
              Crear pedido
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pedido activo */}
      <Dialog open={dialogMode === 'activo'} onOpenChange={() => setDialogMode(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mesa {mesaSelected?.numero} — Pedido activo</DialogTitle>
          </DialogHeader>
          {pedidoActivo ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Estado:</span>
                <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${estadoColors[pedidoActivo.estado] ?? ''}`}>
                  {pedidoActivo.estado}
                </span>
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {pedidoActivo.detalles?.map((d) => (
                  <div key={d.id} className="flex justify-between text-sm">
                    <span>{d.cantidad}× {d.plato?.nombre ?? '—'}{d.notas && <span className="text-gray-400"> ({d.notas})</span>}</span>
                    <span className="font-medium">{formatCOP(d.cantidad * d.precioUnitario)}</span>
                  </div>
                ))}
              </div>
              {pedidoActivo.total != null && (
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total</span>
                  <span>{formatCOP(pedidoActivo.total)}</span>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                {nextEstado[pedidoActivo.estado] && (
                  <Button onClick={avanzarEstado} disabled={isPending} className="flex-1 bg-amber-700 hover:bg-amber-800">
                    → {nextEstado[pedidoActivo.estado]?.replace('_', ' ')}
                  </Button>
                )}
                {pedidoActivo.estado !== 'ENTREGADO' && pedidoActivo.estado !== 'CANCELADO' && (
                  <Button variant="outline" onClick={cancelarPedido} disabled={isPending} className="text-red-500 border-red-200">
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No se encontró pedido activo</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
