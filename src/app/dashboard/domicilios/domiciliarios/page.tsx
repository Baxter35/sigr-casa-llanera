'use client'

import { useEffect, useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

type Domiciliario = { id: string; nombre: string; telefono: string; activo: boolean }

export default function DomiciliariosPage() {
  const [domiciliarios, setDomiciliarios] = useState<Domiciliario[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [isPending, startTransition] = useTransition()

  async function cargar() {
    const res = await fetch('/api/domiciliarios')
    if (res.ok) setDomiciliarios(await res.json())
  }

  useEffect(() => { cargar() }, [])

  function handleCrear(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await fetch('/api/domiciliarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, telefono }),
      })
      if (res.ok) {
        toast.success('Domiciliario creado')
        setNombre(''); setTelefono(''); setDialogOpen(false); cargar()
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Error al crear')
      }
    })
  }

  async function toggleActivo(id: string) {
    const res = await fetch(`/api/domiciliarios/${id}`, { method: 'PUT' })
    if (res.ok) { toast.success('Estado actualizado'); cargar() }
    else toast.error('Error al actualizar')
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-amber-900">Domiciliarios</h1>
        <Button onClick={() => setDialogOpen(true)} className="bg-amber-700 hover:bg-amber-800 text-white">
          Nuevo Domiciliario
        </Button>
      </div>

      <Card className="border-amber-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-amber-900 text-base">Equipo de domicilios</CardTitle>
        </CardHeader>
        <CardContent>
          {domiciliarios.length === 0 && (
            <p className="text-center py-8 text-amber-400">Sin domiciliarios registrados</p>
          )}
          <div className="divide-y divide-amber-100">
            {domiciliarios.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-800">{d.nombre}</p>
                  <a href={`tel:${d.telefono}`} className="text-sm text-amber-600 hover:underline">{d.telefono}</a>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={d.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                    {d.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => toggleActivo(d.id)}
                    className="text-xs border-amber-200 text-amber-700 hover:bg-amber-50">
                    {d.activo ? 'Desactivar' : 'Activar'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nuevo Domiciliario</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCrear} className="space-y-4">
            <div className="space-y-1">
              <Label>Nombre</Label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required className="border-amber-200" />
            </div>
            <div className="space-y-1">
              <Label>Teléfono</Label>
              <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} required className="border-amber-200" />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isPending} className="flex-1 bg-amber-700 hover:bg-amber-800 text-white">
                {isPending ? 'Creando...' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
