# Changelog

## [1.0.0] - 2026-05-10

### Added
- Módulo de autenticación JWT con roles ADMIN, MESERO, CAJERO, CLIENTE
- Módulo de menú digital con CRUD completo de platos y categorías llaneras
- Módulo de pedidos con estados: PENDIENTE → EN_COCINA → LISTO → ENTREGADO
- Módulo de reservas por fecha, hora y número de mesa
- Módulo de facturación con registro de pago y cierre de caja por turno
- Módulo de reportes de ventas diarias con exportación CSV
- Seed inicial: 12 platos típicos llaneros, 8 mesas, 5 categorías, 3 usuarios
- Integración Neon (PostgreSQL) con Prisma ORM 7.x
- proxy.ts para protección de rutas (Next.js 16)
