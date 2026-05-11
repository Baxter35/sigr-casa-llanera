'use client'

import { useEffect, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Receipt } from 'lucide-react'

type DetallePedido = { id: string; cantidad: number; precioUnitario: number; plato: { nombre: string } }
type Pedido = { id: string; createdAt: string; total: number | null; mesa: { numero: number }; detalles: DetallePedido[] }

function formatCOP(v: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
}

export default function FacturacionPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [selected, setSelected] = useState<Pedido | null>(null)
  const [metodoPago, setMetodoPago] = useState('EFECTIVO')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [cierreOpen, setCierreOpen] = useState(false)
  const [resumenCierre, setResumenCierre] = useState<{ efectivo: number; tarjeta: number; total: number } | null>(null)
  const [isPending, startTransition] = useTransition()

  async function load() {
    const res = await fetch('/api/facturacion')
    setPedidos(await res.json())
  }

  useEffect(() => { load() }, [])

  function openPedido(p: Pedido) {
    setSelected(p)
    setMetodoPago('EFECTIVO')
    setDialogOpen(true)
  }

  async function registrarPago() {
    if (!selected) return
    await fetch('/api/facturacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pedidoId: selected.id, metodoPago }),
    })
    setDialogOpen(false)
    startTransition(load)
  }

  async function cerrarCaja() {
    const res = await fetch('/api/facturacion/cierre', { method: 'POST' })
    const data = await res.json()
    setResumenCierre(data)
    setCierreOpen(true)
    startTransition(load)
  }

  const totalPendiente = pedidos.reduce((s, p) => s + Number(p.total ?? 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Facturación</h1>
        <Button onClick={cerrarCaja} variant="outline" className="border-amber-300 text-amber-800">
          Cerrar caja del turno
        </Button>
      </div>

      <Card className="mb-4 border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-500 font-normal">Total pendiente de cobro</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-gray-900">{formatCOP(totalPendiente)}</p>
        </CardContent>
      </Card>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mesa</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidos.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">Mesa {p.mesa.numero}</TableCell>
                <TableCell className="text-sm text-gray-500">
                  {new Date(p.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                </TableCell>
                <TableCell className="font-bold">{formatCOP(Number(p.total ?? 0))}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" onClick={() => openPedido(p)} className="bg-amber-700 hover:bg-amber-800 h-7 text-xs">
                    <Receipt className="w-3 h-3 mr-1" /> Cobrar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {pedidos.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-400 py-8">No hay pedidos pendientes de cobro</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cobrar — Mesa {selected?.mesa.numero}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="space-y-2 max-h-48 overflow-y-auto text-sm">
                {selected.detalles.map((d) => (
                  <div key={d.id} className="flex justify-between">
                    <span>{d.cantidad}× {d.plato.nombre}</span>
                    <span>{formatCOP(d.cantidad * d.precioUnitario)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold border-t pt-2 text-base">
                <span>Total</span>
                <span>{formatCOP(Number(selected.total ?? 0))}</span>
              </div>
              <div>
                <Label>Método de pago</Label>
                <Select value={metodoPago} onValueChange={(v) => v && setMetodoPago(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                    <SelectItem value="TARJETA">Tarjeta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button onClick={registrarPago} disabled={isPending} className="flex-1 bg-amber-700 hover:bg-amber-800">
                  Registrar pago
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={cierreOpen} onOpenChange={setCierreOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Resumen de cierre de caja</DialogTitle>
          </DialogHeader>
          {resumenCierre && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Efectivo</span>
                <span className="font-medium">{formatCOP(resumenCierre.efectivo)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tarjeta</span>
                <span className="font-medium">{formatCOP(resumenCierre.tarjeta)}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total del turno</span>
                <span>{formatCOP(resumenCierre.total)}</span>
              </div>
              <Button onClick={() => setCierreOpen(false)} className="w-full bg-amber-700 hover:bg-amber-800">Cerrar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
