'use client'

import { useEffect, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus } from 'lucide-react'

type Mesa = { id: string; numero: number; capacidad: number }
type Reserva = {
  id: string
  fecha: string
  numPersonas: number
  estado: string
  notas: string | null
  usuario: { name: string; email: string }
  mesa: { numero: number }
}

const estadoBadge: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-700',
  CONFIRMADA: 'bg-green-100 text-green-700',
  CANCELADA: 'bg-gray-100 text-gray-500',
}

const emptyForm = { mesaId: '', fecha: '', hora: '12:00', numPersonas: '2', notas: '' }

export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [isPending, startTransition] = useTransition()

  async function load() {
    const today = new Date().toISOString().split('T')[0]
    const [rRes, mRes] = await Promise.all([
      fetch(`/api/reservas?fecha=${today}`),
      fetch('/api/mesas'),
    ])
    setReservas(await rRes.json())
    setMesas(await mRes.json())
  }

  useEffect(() => { load() }, [])

  async function handleCreate() {
    const fechaISO = new Date(`${form.fecha}T${form.hora}:00`).toISOString()
    await fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mesaId: form.mesaId, fecha: fechaISO, numPersonas: parseInt(form.numPersonas), notas: form.notas }),
    })
    setDialogOpen(false)
    setForm(emptyForm)
    startTransition(load)
  }

  async function cambiarEstado(id: string, estado: string) {
    await fetch(`/api/reservas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    })
    startTransition(load)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
        <Button onClick={() => setDialogOpen(true)} className="bg-amber-700 hover:bg-amber-800">
          <Plus className="w-4 h-4 mr-2" /> Nueva reserva
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mesa</TableHead>
              <TableHead>Fecha / Hora</TableHead>
              <TableHead>Personas</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Notas</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservas.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">Mesa {r.mesa.numero}</TableCell>
                <TableCell className="text-sm">
                  {new Date(r.fecha).toLocaleDateString('es-CO')} {new Date(r.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                </TableCell>
                <TableCell>{r.numPersonas}</TableCell>
                <TableCell>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${estadoBadge[r.estado] ?? ''}`}>{r.estado}</span>
                </TableCell>
                <TableCell className="text-sm text-gray-500">{r.notas ?? '—'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {r.estado === 'PENDIENTE' && (
                      <Button size="sm" variant="outline" className="text-green-600 border-green-200 h-7 text-xs"
                        onClick={() => cambiarEstado(r.id, 'CONFIRMADA')}>Confirmar</Button>
                    )}
                    {r.estado !== 'CANCELADA' && (
                      <Button size="sm" variant="outline" className="text-red-500 border-red-200 h-7 text-xs"
                        onClick={() => cambiarEstado(r.id, 'CANCELADA')}>Cancelar</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {reservas.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-400 py-8">No hay reservas para hoy</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva reserva</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Mesa</Label>
              <Select value={form.mesaId} onValueChange={(v) => v && setForm({ ...form, mesaId: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar mesa" /></SelectTrigger>
                <SelectContent>
                  {mesas.map((m) => <SelectItem key={m.id} value={m.id}>Mesa {m.numero} ({m.capacidad} pers.)</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Fecha</Label>
                <Input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
              </div>
              <div>
                <Label>Hora</Label>
                <Input type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Número de personas</Label>
              <Input type="number" min={1} value={form.numPersonas}
                onChange={(e) => setForm({ ...form, numPersonas: e.target.value })} />
            </div>
            <div>
              <Label>Notas (opcional)</Label>
              <Input value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} placeholder="Cumpleaños, alergia..." />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={isPending || !form.mesaId || !form.fecha} className="bg-amber-700 hover:bg-amber-800">
                Crear reserva
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
