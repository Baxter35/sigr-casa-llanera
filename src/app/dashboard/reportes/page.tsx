'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DollarSign, ClipboardList, Star, Download, Bike } from 'lucide-react'

type ReporteData = {
  totalVentas: number
  numPedidos: number
  platoMasVendido: string | null
  pedidos: {
    id: string
    mesa: number
    estado: string
    total: number | null
    createdAt: string
  }[]
}

type DomicilioReporte = {
  id: string
  clienteNombre: string
  clienteBarrio: string
  total: number
  estado: string
  createdAt: string
  domiciliario?: { nombre: string }
}

function formatCOP(v: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
}

const estadoColors: Record<string, string> = {
  PENDIENTE: 'text-yellow-700 bg-yellow-50',
  EN_COCINA: 'text-orange-700 bg-orange-50',
  LISTO: 'text-blue-700 bg-blue-50',
  ENTREGADO: 'text-green-700 bg-green-50',
  CANCELADO: 'text-gray-500 bg-gray-50',
}

export default function ReportesPage() {
  const [data, setData] = useState<ReporteData | null>(null)
  const [domicilios, setDomicilios] = useState<DomicilioReporte[]>([])

  useEffect(() => {
    fetch('/api/reportes').then((r) => r.json()).then(setData)
    fetch('/api/domicilios').then((r) => r.json()).then((d: DomicilioReporte[]) =>
      setDomicilios(d.filter((dm) => dm.estado === 'ENTREGADO'))
    )
  }, [])

  function exportCSV() {
    if (!data) return
    const rows = [
      ['Mesa', 'Estado', 'Total', 'Hora'],
      ...data.pedidos.map((p) => [
        `Mesa ${p.mesa}`,
        p.estado,
        String(p.total ?? 0),
        new Date(p.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      ]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalDomicilios = domicilios.length
  const ingresosDomicilios = domicilios.reduce((acc, d) => acc + Number(d.total), 0)

  const stats = [
    { title: 'Ventas del día', value: data ? formatCOP(data.totalVentas) : '—', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Pedidos totales', value: data?.numPedidos.toString() ?? '—', icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Plato más vendido', value: data?.platoMasVendido ?? '—', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reportes del día</h1>
        <Button variant="outline" onClick={exportCSV} disabled={!data}>
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.title} className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-500">{s.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${s.bg}`}>
                    <Icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-gray-900 truncate">{s.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mesa</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Hora</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.pedidos.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">Mesa {p.mesa}</TableCell>
                <TableCell>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${estadoColors[p.estado] ?? ''}`}>{p.estado}</span>
                </TableCell>
                <TableCell>{p.total != null ? formatCOP(p.total) : '—'}</TableCell>
                <TableCell className="text-sm text-gray-500">
                  {new Date(p.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                </TableCell>
              </TableRow>
            ))}
            {(!data || data.pedidos.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-400 py-8">Sin pedidos hoy</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Sección domicilios */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Bike className="w-5 h-5 text-amber-600" /> Domicilios del día
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-500">Domicilios entregados</CardTitle>
                <div className="p-2 rounded-lg bg-amber-50"><Bike className="w-4 h-4 text-amber-600" /></div>
              </div>
            </CardHeader>
            <CardContent><p className="text-xl font-bold text-gray-900">{totalDomicilios}</p></CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-500">Ingresos domicilios</CardTitle>
                <div className="p-2 rounded-lg bg-green-50"><DollarSign className="w-4 h-4 text-green-600" /></div>
              </div>
            </CardHeader>
            <CardContent><p className="text-xl font-bold text-gray-900">{formatCOP(ingresosDomicilios)}</p></CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Barrio</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Domiciliario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domicilios.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.clienteNombre}</TableCell>
                  <TableCell>{d.clienteBarrio}</TableCell>
                  <TableCell>{formatCOP(Number(d.total))}</TableCell>
                  <TableCell className="text-sm text-gray-500">{d.domiciliario?.nombre ?? '—'}</TableCell>
                </TableRow>
              ))}
              {domicilios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-400 py-8">Sin domicilios entregados hoy</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
