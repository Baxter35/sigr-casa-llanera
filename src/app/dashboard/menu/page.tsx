'use client'

import { useEffect, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pencil, Trash2, Plus } from 'lucide-react'

type Categoria = { id: string; nombre: string }
type Plato = {
  id: string
  nombre: string
  descripcion: string
  precio: number
  disponible: boolean
  categoriaId: string
  categoria: Categoria
}

function formatCOP(v: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
}

const emptyForm = { nombre: '', descripcion: '', precio: '', categoriaId: '', disponible: true }

export default function MenuPage() {
  const [platos, setPlatos] = useState<Plato[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [filtroCategoria, setFiltroCategoria] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [isPending, startTransition] = useTransition()

  async function load() {
    const [pRes, cRes] = await Promise.all([fetch('/api/menu'), fetch('/api/categorias')])
    setPlatos(await pRes.json())
    setCategorias(await cRes.json())
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(p: Plato) {
    setEditingId(p.id)
    setForm({ nombre: p.nombre, descripcion: p.descripcion, precio: String(p.precio), categoriaId: p.categoriaId, disponible: p.disponible })
    setDialogOpen(true)
  }

  async function handleSave() {
    const body = { ...form, precio: parseFloat(form.precio) }
    if (editingId) {
      await fetch(`/api/menu/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    } else {
      await fetch('/api/menu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    setDialogOpen(false)
    startTransition(load)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este plato?')) return
    await fetch(`/api/menu/${id}`, { method: 'DELETE' })
    startTransition(load)
  }

  async function toggleDisponible(p: Plato) {
    await fetch(`/api/menu/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disponible: !p.disponible }),
    })
    startTransition(load)
  }

  const filtered = filtroCategoria === 'all' ? platos : platos.filter((p) => p.categoriaId === filtroCategoria)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Menú Digital</h1>
        <Button onClick={openCreate} className="bg-amber-700 hover:bg-amber-800">
          <Plus className="w-4 h-4 mr-2" /> Nuevo plato
        </Button>
      </div>

      <div className="mb-4 w-56">
        <Select value={filtroCategoria} onValueChange={(v) => v && setFiltroCategoria(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Disponible</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{p.nombre}</p>
                    <p className="text-xs text-gray-500 truncate max-w-xs">{p.descripcion}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{p.categoria.nombre}</Badge>
                </TableCell>
                <TableCell className="font-medium">{formatCOP(p.precio)}</TableCell>
                <TableCell>
                  <button
                    onClick={() => toggleDisponible(p)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${p.disponible ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${p.disponible ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                  </button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-400 py-8">No hay platos</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar plato' : 'Nuevo plato'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Precio (COP)</Label>
                <Input type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
              </div>
              <div>
                <Label>Categoría</Label>
                <Select value={form.categoriaId} onValueChange={(v) => v && setForm({ ...form, categoriaId: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {categorias.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={isPending} className="bg-amber-700 hover:bg-amber-800">
                {isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
