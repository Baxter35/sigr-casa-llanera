'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

type Plato = { id: string; nombre: string; precio: number; disponible: boolean }
type Domiciliario = { id: string; nombre: string; telefono: string }
type DetalleDomicilio = { id: string; cantidad: number; precioUnitario: number; notas?: string; plato: Plato }
type Domicilio = {
  id: string
  clienteNombre: string
  clienteTelefono: string
  clienteDireccion: string
  clienteBarrio: string
  notas?: string
  estado: string
  metodoPago: string
  total: number
  createdAt: string
  domiciliario?: Domiciliario
  detalles: DetalleDomicilio[]
}

const estadoColors: Record<string, string> = {
  RECIBIDO: 'bg-gray-100 text-gray-700',
  EN_PREPARACION: 'bg-yellow-100 text-yellow-700',
  EN_CAMINO: 'bg-blue-100 text-blue-700',
  ENTREGADO: 'bg-green-100 text-green-700',
  CANCELADO: 'bg-red-100 text-red-700',
}

const estadoLabels: Record<string, string> = {
  RECIBIDO: 'Recibido',
  EN_PREPARACION: 'En Preparación',
  EN_CAMINO: 'En Camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

const metodoPagoLabels: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  TARJETA: 'Tarjeta',
}

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

const emptyForm = {
  clienteNombre: '', clienteTelefono: '', clienteDireccion: '',
  clienteBarrio: '', notas: '', metodoPago: 'EFECTIVO', domiciliarioId: '',
}
type ItemForm = { platoId: string; cantidad: number; notas: string }

export default function DomiciliosPage() {
  const [platos, setPlatos] = useState<Plato[]>([])
  const [domiciliarios, setDomiciliarios] = useState<Domiciliario[]>([])
  const [domicilios, setDomicilios] = useState<Domicilio[]>([])
  const [form, setForm] = useState(emptyForm)
  const [items, setItems] = useState<ItemForm[]>([])
  const [itemActual, setItemActual] = useState<ItemForm>({ platoId: '', cantidad: 1, notas: '' })
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Domicilio | null>(null)
  const [asignando, setAsignando] = useState<string>('')
  const [domIdAsignar, setDomIdAsignar] = useState<string>('')
  const [isPending, startTransition] = useTransition()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalForm = items.reduce((acc, i) => {
    const p = platos.find((pl) => pl.id === i.platoId)
    return acc + (p ? Number(p.precio) * i.cantidad : 0)
  }, 0)

  async function cargarDomicilios() {
    const res = await fetch('/api/domicilios')
    if (res.ok) setDomicilios(await res.json())
  }

  useEffect(() => {
    fetch('/api/menu').then((r) => r.json()).then((d) => setPlatos(d.filter((p: Plato) => p.disponible)))
    fetch('/api/domiciliarios').then((r) => r.json()).then(setDomiciliarios)
    cargarDomicilios()
    intervalRef.current = setInterval(cargarDomicilios, 20000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  function agregarItem() {
    if (!itemActual.platoId || itemActual.cantidad < 1) return
    setItems([...items, itemActual])
    setItemActual({ platoId: '', cantidad: 1, notas: '' })
  }

  function eliminarItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) { toast.error('Agrega al menos un plato'); return }
    startTransition(async () => {
      const res = await fetch('/api/domicilios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, domiciliarioId: form.domiciliarioId || undefined, detalles: items }),
      })
      if (res.ok) {
        toast.success('Domicilio registrado')
        setForm(emptyForm)
        setItems([])
        cargarDomicilios()
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Error al registrar')
      }
    })
  }

  async function avanzarEstado(domicilio: Domicilio, nuevoEstado: string, domiciliarioId?: string) {
    const body: Record<string, string> = { estado: nuevoEstado }
    if (domiciliarioId) body.domiciliarioId = domiciliarioId
    const res = await fetch(`/api/domicilios/${domicilio.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) { toast.success('Estado actualizado'); cargarDomicilios() }
    else toast.error('Error al actualizar')
  }

  const hoy = new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-amber-900 mb-6">Domicilios</h1>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Columna izquierda — Formulario */}
        <div className="lg:col-span-2">
          <Card className="border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-amber-900 text-lg">Nuevo Domicilio</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-sm text-amber-900">Nombre del cliente *</Label>
                  <Input value={form.clienteNombre} onChange={(e) => setForm({ ...form, clienteNombre: e.target.value })} required className="border-amber-200" />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-amber-900">Teléfono *</Label>
                  <Input value={form.clienteTelefono} onChange={(e) => setForm({ ...form, clienteTelefono: e.target.value })} required className="border-amber-200" />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-amber-900">Dirección *</Label>
                  <Input value={form.clienteDireccion} onChange={(e) => setForm({ ...form, clienteDireccion: e.target.value })} required className="border-amber-200" />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-amber-900">Barrio *</Label>
                  <Input value={form.clienteBarrio} onChange={(e) => setForm({ ...form, clienteBarrio: e.target.value })} required className="border-amber-200" />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-amber-900">Domiciliario</Label>
                  <Select value={form.domiciliarioId} onValueChange={(v) => v && setForm({ ...form, domiciliarioId: v })}>
                    <SelectTrigger className="border-amber-200"><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                    <SelectContent>
                      {domiciliarios.map((d) => <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-amber-900">Método de pago</Label>
                  <Select value={form.metodoPago} onValueChange={(v) => v && setForm({ ...form, metodoPago: v })}>
                    <SelectTrigger className="border-amber-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                      <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                      <SelectItem value="TARJETA">Tarjeta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-amber-900">Notas</Label>
                  <Textarea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} className="border-amber-200 text-sm" rows={2} />
                </div>

                {/* Agregar platos */}
                <div className="border border-amber-200 rounded-lg p-3 space-y-2 bg-amber-50/50">
                  <p className="text-sm font-medium text-amber-900">Platos</p>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Select value={itemActual.platoId} onValueChange={(v) => v && setItemActual({ ...itemActual, platoId: v })}>
                        <SelectTrigger className="h-8 text-xs border-amber-200"><SelectValue placeholder="Seleccionar plato" /></SelectTrigger>
                        <SelectContent>
                          {platos.map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre} — {formatCOP(Number(p.precio))}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input type="number" min={1} value={itemActual.cantidad} onChange={(e) => setItemActual({ ...itemActual, cantidad: Number(e.target.value) })} className="w-16 h-8 text-xs border-amber-200 text-center" />
                    <Button type="button" onClick={agregarItem} size="sm" className="h-8 bg-amber-700 hover:bg-amber-800 text-xs px-2">+</Button>
                  </div>
                  {items.length > 0 && (
                    <div className="space-y-1 mt-1">
                      {items.map((item, idx) => {
                        const plato = platos.find((p) => p.id === item.platoId)
                        return (
                          <div key={idx} className="flex justify-between items-center text-xs bg-white rounded px-2 py-1 border border-amber-100">
                            <span>{item.cantidad}× {plato?.nombre}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-amber-700">{formatCOP(Number(plato?.precio ?? 0) * item.cantidad)}</span>
                              <button type="button" onClick={() => eliminarItem(idx)} className="text-red-400 hover:text-red-600">×</button>
                            </div>
                          </div>
                        )
                      })}
                      <div className="flex justify-between text-sm font-bold border-t border-amber-200 pt-1 mt-1">
                        <span>Total</span><span className="text-amber-800">{formatCOP(totalForm)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={isPending} className="w-full bg-amber-700 hover:bg-amber-800 text-white">
                  {isPending ? 'Registrando...' : 'Registrar Domicilio'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha — Lista */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-amber-900">Pedidos de Hoy</h2>
              <p className="text-xs text-amber-600 capitalize">{hoy}</p>
            </div>
            <Badge className="bg-amber-100 text-amber-800 border-amber-300">{domicilios.length} pedidos</Badge>
          </div>

          {domicilios.length === 0 && (
            <div className="text-center py-12 text-amber-400">Sin domicilios hoy</div>
          )}

          {domicilios.map((d) => (
            <Card key={d.id} className="border-amber-200">
              <CardContent className="pt-4 pb-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <a href={`tel:${d.clienteTelefono}`} className="font-semibold text-amber-900 hover:underline">{d.clienteNombre}</a>
                    <span className="text-amber-500 text-sm ml-2">
                      <a href={`tel:${d.clienteTelefono}`}>{d.clienteTelefono}</a>
                    </span>
                    <p className="text-xs text-gray-500">{d.clienteDireccion} · {d.clienteBarrio}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={`${estadoColors[d.estado]} text-xs`}>{estadoLabels[d.estado]}</Badge>
                    <p className="text-xs text-gray-400 mt-1">{formatHora(d.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm mb-3">
                  <div className="flex items-center gap-2">
                    {d.domiciliario
                      ? <span className="text-gray-600 text-xs">🛵 {d.domiciliario.nombre}</span>
                      : <Badge className="bg-orange-100 text-orange-700 text-xs">Sin asignar</Badge>}
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-amber-800">{formatCOP(Number(d.total))}</span>
                    <span className="text-xs text-gray-400 ml-1">· {metodoPagoLabels[d.metodoPago]}</span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" className="text-xs h-7 border-amber-200 text-amber-700"
                    onClick={() => { setSelected(d); setDetailOpen(true) }}>Ver detalle</Button>

                  {d.estado === 'RECIBIDO' && (
                    <Button size="sm" className="text-xs h-7 bg-yellow-500 hover:bg-yellow-600 text-white"
                      onClick={() => avanzarEstado(d, 'EN_PREPARACION')}>En Preparación</Button>
                  )}
                  {d.estado === 'EN_PREPARACION' && (
                    <>
                      {!d.domiciliario && (
                        <div className="flex gap-1 items-center">
                          <Select value={asignando === d.id ? domIdAsignar : ''} onValueChange={(v) => { if (v) { setAsignando(d.id); setDomIdAsignar(v) } }}>
                            <SelectTrigger className="h-7 text-xs w-36 border-amber-200"><SelectValue placeholder="Asignar domiciliario" /></SelectTrigger>
                            <SelectContent>
                              {domiciliarios.map((dm) => <SelectItem key={dm.id} value={dm.id}>{dm.nombre}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <Button size="sm" className="text-xs h-7 bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => avanzarEstado(d, 'EN_CAMINO', asignando === d.id ? domIdAsignar : undefined)}>
                        En Camino
                      </Button>
                    </>
                  )}
                  {d.estado === 'EN_CAMINO' && (
                    <Button size="sm" className="text-xs h-7 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => avanzarEstado(d, 'ENTREGADO')}>Entregado</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Dialog detalle */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Detalle del pedido</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold">{selected.clienteNombre}</p>
                <p className="text-gray-500">{selected.clienteDireccion} · {selected.clienteBarrio}</p>
                {selected.notas && <p className="text-gray-400 italic text-xs mt-1">"{selected.notas}"</p>}
              </div>
              <div className="space-y-1 border-t pt-2">
                {selected.detalles.map((det) => (
                  <div key={det.id} className="flex justify-between">
                    <span>{det.cantidad}× {det.plato.nombre}</span>
                    <span className="text-amber-700">{formatCOP(det.cantidad * Number(det.precioUnitario))}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total</span>
                <span>{formatCOP(Number(selected.total))}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
