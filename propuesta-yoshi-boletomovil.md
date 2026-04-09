# Propuesta: Implementación de Yoshi en Boletomóvil

## 1. Contexto y Objetivo

**Yoshi** es el sistema POS que opera en los venues de eventos, gestionando la venta de alimentos y bebidas con soporte completo de concesiones, productos, promos, descuentos, códigos promocionales, tokens, cocina, runners y delivery a asiento.

**Boletomóvil** es la plataforma (web + app) de compra de boletos para eventos deportivos, conciertos y teatro. Actualmente el usuario ya tiene un flujo completo: buscar evento, seleccionar asientos, pagar y recibir su boleto digital.

**Objetivo**: Que los usuarios de Boletomóvil puedan comprar alimentos y bebidas desde la app, tanto como pre-orden antes del evento como durante el evento estando en el venue. Los alimentos se recogen en la concesión o se solicitan a su asiento.

---

## 2. Modelo Elegido: Marketplace + Paso en Checkout

Se implementa un **modelo híbrido** que combina dos puntos de entrada:

1. **Nueva tab "Alimentos"** en la app: sección independiente y completa tipo marketplace donde el usuario explora concesiones, productos y promos.
2. **Paso adicional en el checkout de boletos**: al comprar un boleto, se le ofrece agregar alimentos como paso extra antes del pago (estilo Cinépolis).

**Principio clave**: La comanda en cocina **NO se genera al momento de la compra**. Se genera únicamente cuando:
- El usuario **escanea su QR** en persona en la concesión, o
- El usuario **solicita delivery a su asiento** desde la app.

Esto evita desperdicio de comida preparada con anticipación y le da control al usuario sobre cuándo recibir sus alimentos.

---

## 3. Arquitectura de Navegación

### Barra de navegación principal (app)

```
┌─────────────────────────────────────────┐
│                                         │
│          [Contenido principal]          │
│                                         │
│─────────────────────────────────────────│
│   🏠        🎫        🍔        👤     │
│  Inicio   Eventos  Alimentos   Perfil  │
│                   (NUEVA TAB)           │
└─────────────────────────────────────────┘
```

### Punto de entrada 1: Tab "Alimentos"
- Acceso directo desde la barra de navegación principal.
- Muestra los eventos próximos del usuario con boleto activo.
- Permite explorar el marketplace de concesiones de cada evento.

### Punto de entrada 2: Checkout de boletos
- Después de seleccionar asientos y antes de pagar, se muestra un paso opcional para agregar alimentos.
- El usuario puede omitirlo completamente.

---

## 4. Flujo 1: Compra de Alimentos desde el Checkout de Boletos

### Descripción

Al comprar un boleto, después de seleccionar asientos, se le presenta al usuario un paso adicional: "Agrega alimentos a tu orden". Este paso es **completamente opcional** y puede saltarse.

### Pantallas

#### Pantalla 4.1: Paso "Agregar Alimentos" (en checkout de boleto)

```
┌─────────────────────────────────────────┐
│  ←  Reservación                         │
│─────────────────────────────────────────│
│                                         │
│  🎫 Asientos seleccionados: 2          │
│  Sec 101 · Fila A · Asientos 5, 6     │
│                                         │
│─────────────────────────────────────────│
│  ¿Quieres agregar alimentos?           │
│  Ordena ahora y recógelos el día       │
│  del evento.                            │
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ │
│  │  TODOS  │ │ COMIDA  │ │ BEBIDAS  │ │
│  └─────────┘ └─────────┘ └──────────┘ │
│                                         │
│  ── Hot Dogs El Principe ──             │
│  ┌─────────────────────────────────┐   │
│  │  Hot Dog Clásico         $85   │   │
│  │  [ - ]  1  [ + ]               │   │
│  │                                 │   │
│  │  Hot Dog Especial        $120  │   │
│  │  Agregar ▶                      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ── Cervecería Central ──              │
│  ┌─────────────────────────────────┐   │
│  │  Cerveza Nacional         $95  │   │
│  │  Agregar ▶                      │   │
│  │                                 │   │
│  │  Cerveza Importada       $130  │   │
│  │  Agregar ▶                      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🏷️ ¿Tienes un código promo?     │   │
│  │ [  Ingresa tu código       ]    │   │
│  │        [ Aplicar ]              │   │
│  └─────────────────────────────────┘   │
│                                         │
│─────────────────────────────────────────│
│  Boletos:            $1,200.00         │
│  Alimentos:          $  180.00         │
│  Promo -20%:         -$  36.00         │
│  Cargo por servicio: $   85.00         │
│─────────────────────────────────────────│
│  Total:              $1,429.00         │
│                                         │
│  [ Continuar sin alimentos ]           │
│  [ ████ Continuar al pago ████ ]       │
└─────────────────────────────────────────┘
```

#### Pantalla 4.2: Detalle de Producto (modal)

```
┌─────────────────────────────────────────┐
│  ← Volver                               │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       [Imagen del producto]     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Hot Dog Especial                      │
│  Concesión: Hot Dogs El Principe        │
│  $120.00                               │
│                                         │
│  ── Personaliza tu orden ──            │
│                                         │
│  Salsa:                                │
│  ○ Sin salsa  ● Ketchup               │
│  ○ Mostaza   ○ Ambas                   │
│                                         │
│  Extras:                               │
│  ☐ Queso extra (+$25)                  │
│  ☑ Jalapeños (+$15)                    │
│  ☐ Tocino (+$30)                       │
│                                         │
│  Cantidad:  [ - ]  2  [ + ]           │
│                                         │
│  ── Promo disponible ──               │
│  🏷️ 2x1 en hot dogs (se aplica       │
│  automáticamente)                       │
│                                         │
│─────────────────────────────────────────│
│  Total: $270.00  →  $135.00            │
│  [ ████ Agregar al carrito ████ ]      │
└─────────────────────────────────────────┘
```

#### Pantalla 4.3: Confirmación post-pago (incluye boleto + alimentos)

```
┌─────────────────────────────────────────┐
│           ✓ Compra exitosa             │
│                                         │
│  ── Tu boleto ──                       │
│  Evento: Chivas vs América            │
│  Fecha: 15 Abril 2026, 20:00          │
│  Sec 101 · Fila A · Asientos 5, 6    │
│  [||||||||| CÓDIGO QR BOLETO |||||||||] │
│                                         │
│  ── Tu orden de alimentos ──          │
│  Orden #ORD-4821                      │
│  Estado: Pagada - Pendiente de canje  │
│                                         │
│  2x Hot Dog Especial (c/ jalapeños)   │
│  1x Cerveza Nacional                   │
│                                         │
│  [|||||||| QR DE ALIMENTOS |||||||||||] │
│                                         │
│  💡 Muestra este QR en la concesión   │
│  para recoger tu orden, o solicita     │
│  delivery a tu asiento desde la app.   │
│                                         │
│  [ Agregar a Apple Wallet ]            │
│  [ Ver mis boletos y órdenes ]         │
└─────────────────────────────────────────┘
```

### Flujo lógico

```
Usuario compra boleto
  └─▶ Selecciona asientos
      └─▶ PASO NUEVO: "Agregar alimentos"
          ├─▶ Explora catálogo de concesiones del venue
          ├─▶ Agrega productos al carrito (con addons/personalización)
          ├─▶ Aplica código promo Yoshi (opcional)
          └─▶ Continúa al pago (o salta este paso)
              └─▶ Paga TODO junto: boletos + alimentos
                  └─▶ Recibe:
                      ├─ QR del boleto (para entrar al evento)
                      └─ QR de alimentos (para canjear en concesión)
```

**Nota**: La comanda NO se genera en este momento. El QR de alimentos es un "voucher pagado" que el usuario canjea cuando quiera.

---

## 5. Flujo 2: Compra desde la Tab "Alimentos"

### Descripción

La tab "Alimentos" es un marketplace independiente accesible desde la barra de navegación principal. El boleto activo del usuario es la "llave" que desbloquea el marketplace del venue. Funciona tanto para pre-orden (antes del evento) como para ordenar durante el evento.

### Pantallas

#### Pantalla 5.1: Tab "Alimentos" - Sin eventos próximos

```
┌─────────────────────────────────────────┐
│  Alimentos y Bebidas                    │
│─────────────────────────────────────────│
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │   🎫 No tienes eventos         │   │
│  │      próximos                   │   │
│  │                                 │   │
│  │   Compra tu boleto para         │   │
│  │   desbloquear el menú del      │   │
│  │   venue.                        │   │
│  │                                 │   │
│  │   [ Ver eventos disponibles ]   │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ── Descubre lo que hay ──            │
│  🍕 Los más vendidos en Akron          │
│  🍺 Lo nuevo en Estadio Caliente      │
│  🌮 Menú del próximo Chivas           │
│  (Vista informativa, no comprable)     │
│                                         │
└─────────────────────────────────────────┘
```

#### Pantalla 5.2: Tab "Alimentos" - Con eventos próximos

```
┌─────────────────────────────────────────┐
│  Alimentos y Bebidas                    │
│─────────────────────────────────────────│
│                                         │
│  ── Tus eventos ──                     │
│  ┌─────────────────────────────────┐   │
│  │ 🎫 Chivas vs América           │   │
│  │    15 Abr · Akron Stadium      │   │
│  │    Sec 101, Fila A, 5-6        │   │
│  │    [ Ordenar para este evento ▶]│   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🎫 Metallica en Foro Sol       │   │
│  │    22 Abr · Foro Sol           │   │
│  │    Zona A, General             │   │
│  │    [ Ordenar para este evento ▶]│   │
│  └─────────────────────────────────┘   │
│                                         │
│  ── Tus órdenes activas ──            │
│  📦 Orden #ORD-4821· Pagada         │
│     Chivas vs América                  │
│     2 productos pendientes de canje   │
│     [ Ver detalle ▶ ]                  │
│                                         │
└─────────────────────────────────────────┘
```

#### Pantalla 5.3: Marketplace del Evento

```
┌─────────────────────────────────────────┐
│  ← Chivas vs América                   │
│    15 Abr · Akron Stadium              │
│─────────────────────────────────────────│
│  🔍 Buscar producto...                 │
│                                         │
│  [Comida] [Bebidas] [Snacks] [Promos]  │
│                                         │
│  ── 🔥 Promos del evento ──           │
│  ┌─────────────────────────────────┐   │
│  │ 🏷️ 2x1 en cervezas nacionales │   │
│  │    Solo este partido            │   │
│  │    [ Ver productos ▶ ]          │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 🏷️ Combo Chiva: Hot dog +     │   │
│  │    refresco $99                 │   │
│  │    [ Agregar ▶ ]                │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ── Concesiones ──                     │
│  ┌────────┐ ┌────────┐ ┌────────┐    │
│  │ 🌭     │ │ 🍕     │ │ 🍺    │    │
│  │Hot Dogs│ │Pizza  │ │Cerve- │    │
│  │El Prin │ │Planet │ │cería  │    │
│  │~5 min  │ │~12 min│ │~3 min │    │
│  └────────┘ └────────┘ └────────┘    │
│                                         │
│  ── Más vendidos ──                    │
│  ┌────────┐ ┌────────┐ ┌────────┐    │
│  │[imagen]│ │[imagen]│ │[imagen]│    │
│  │HotDog  │ │Cerveza │ │Nachos  │    │
│  │$85     │ │$95     │ │$120    │    │
│  │[Agre+] │ │[Agre+] │ │[Agre+] │    │
│  └────────┘ └────────┘ └────────┘    │
│                                         │
│─────────────────────────────────────────│
│  🛒 Carrito (3 items) · $280    [ ▶ ] │
└─────────────────────────────────────────┘
```

#### Pantalla 5.4: Detalle de Concesión

```
┌─────────────────────────────────────────┐
│  ← Hot Dogs El Principe                 │
│    Tiempo promedio: ~5 min             │
│    📍 Nivel 1, Sección 100-110        │
│─────────────────────────────────────────│
│                                         │
│  [TODO] [COMBOS] [HOT DOGS] [EXTRAS]  │
│                                         │
│  ── Combos ──                          │
│  ┌─────────────────────────────────┐   │
│  │ [img] Combo Clásico      $150  │   │
│  │       Hot dog + refresco +     │   │
│  │       papas                     │   │
│  │                    [ Agregar ]  │   │
│  ├─────────────────────────────────┤   │
│  │ [img] Combo Doble        $220  │   │
│  │       2 Hot dogs + 2 refrescos │   │
│  │       🏷️ Promo: ahorra $40    │   │
│  │                    [ Agregar ]  │   │
│  ├─────────────────────────────────┤   │
│  │ [img] Hot Dog Especial   $120  │   │
│  │       Con todo                  │   │
│  │                    [ Agregar ]  │   │
│  └─────────────────────────────────┘   │
│                                         │
│─────────────────────────────────────────│
│  🛒 Carrito (3 items) · $280    [ ▶ ] │
└─────────────────────────────────────────┘
```

#### Pantalla 5.5: Carrito y Checkout de Alimentos

```
┌─────────────────────────────────────────┐
│  ← Tu Orden                            │
│─────────────────────────────────────────│
│                                         │
│  Evento: Chivas vs América             │
│  Tu asiento: Sec 101, Fila A, 5-6     │
│                                         │
│  ── Productos ──                       │
│  ┌─────────────────────────────────┐   │
│  │ 2x Hot Dog Especial            │   │
│  │    c/ ketchup, jalapeños       │   │
│  │    $240.00        [ - ] 2 [ + ]│   │
│  ├─────────────────────────────────┤   │
│  │ 1x Cerveza Nacional            │   │
│  │    $95.00         [ - ] 1 [ + ]│   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🏷️ Código promo                │   │
│  │ [  Ingresa tu código       ]    │   │
│  │           [ Aplicar ]           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🎟️ ¿Tienes tokens?            │   │
│  │ [  Ingresa código de tokens ]   │   │
│  │           [ Canjear ]           │   │
│  │                                 │   │
│  │ Saldo disponible: 15 tokens    │   │
│  │ Hot Dog Especial = 5 tokens    │   │
│  │ ☑ Usar 10 tokens (2 hot dogs) │   │
│  └─────────────────────────────────┘   │
│                                         │
│─────────────────────────────────────────│
│  Subtotal:         $335.00             │
│  Promo 2x1:       -$120.00            │
│  Tokens (10):      -$240.00            │
│  Cargo servicio:   $  0.00             │
│  Total a pagar:    $ -25.00            │
│  (Saldo tokens restante: 5)           │
│                                         │
│  💳 Visa ****6411                      │
│     [ Cambiar método de pago ]         │
│                                         │
│  [ ████ Pagar $-25.00 ████ ]          │
│   (o $0.00 si tokens cubren todo)      │
└─────────────────────────────────────────┘
```

**Nota**: Si los tokens cubren el total, el pago es $0 y no se necesita método de pago.

#### Pantalla 5.6: Confirmación y QR

```
┌─────────────────────────────────────────┐
│           ✓ Orden confirmada           │
│                                         │
│  Orden #ORD-4821                      │
│                                         │
│  2x Hot Dog Especial                   │
│  1x Cerveza Nacional                   │
│                                         │
│  [|||||||| QR DE ALIMENTOS |||||||||||] │
│                                         │
│  Muestra este QR en la concesión       │
│  para recoger tu orden, o solicita     │
│  delivery desde "Mis Órdenes".         │
│                                         │
│  [ Ver estado de mi orden ]            │
│  [ Ordenar más ]                       │
│  [ Volver al inicio ]                  │
└─────────────────────────────────────────┘
```

### Flujo lógico

```
PRE-ORDEN (antes del evento):
Usuario abre app
  └─▶ Tab "Alimentos"
      └─▶ Ve eventos con boleto activo
          └─▶ Selecciona evento
              └─▶ Marketplace: explora concesiones y promos
                  ├─▶ Agrega productos al carrito
                  ├─▶ Personaliza (addons del producto)
                  ├─▶ Aplica código promo (opcional)
                  ├─▶ Aplica tokens (opcional)
                  └─▶ Paga (independiente del boleto)
                      └─▶ Recibe QR de alimentos

DURANTE EL EVENTO:
Usuario en el venue
  └─▶ Tab "Alimentos" (o push: "¿Tienes hambre?")
      └─▶ Mismo marketplace con disponibilidad en tiempo real
          └─▶ Mismo flujo de compra
              └─▶ Recibe QR para canjear inmediatamente
```

---

## 6. Sistema QR y Canje en Concesión

### 6.1 Generación del QR

- Al completar la compra de alimentos (desde checkout de boleto o desde tab Alimentos), se genera **un QR único por orden**.
- El QR contiene un identificador de la orden (uuid) que al escanearse consulta los productos asociados.
- El QR se muestra en la app del usuario en la sección "Mis Órdenes" y también en la confirmación de compra.

### 6.2 Escaneo en Concesión

El usuario llega a la concesión y muestra su QR. El vendedor de la concesión lo escanea con la terminal Yoshi.

#### Pantalla 6.2a: Vista del vendedor al escanear QR (Terminal Yoshi)

```
┌─────────────────────────────────────────┐
│  Orden #ORD-4821                      │
│  Cliente: Juan Pérez                   │
│  Evento: Chivas vs América            │
│─────────────────────────────────────────│
│                                         │
│  Productos de esta orden:              │
│                                         │
│  ☐ 2x Hot Dog Especial                │
│       c/ ketchup, jalapeños            │
│  ☐ 1x Cerveza Nacional                │
│                                         │
│  ── Selecciona qué preparar ──        │
│  (El cliente puede canjear parcial)    │
│                                         │
│  ☑ 2x Hot Dog Especial                │
│  ☐ 1x Cerveza Nacional                │
│                                         │
│  [ ████ Canjear seleccionados ████ ]  │
│                                         │
│  Productos canjeados previamente:      │
│  (ninguno)                             │
└─────────────────────────────────────────┘
```

### 6.3 Canje Parcial

**El vendedor puede elegir qué productos preparar** en ese momento. Esto permite que el usuario canjee parte de su orden ahora y regrese por el resto más tarde (o lo pida a su asiento).

**Flujo de canje parcial**:
1. Vendedor escanea QR.
2. Ve la lista completa de productos de la orden.
3. Selecciona los productos que el cliente quiere canjear ahora.
4. Presiona "Canjear seleccionados".
5. **Se genera la comanda en cocina SOLO para los productos seleccionados.**
6. Los productos canjeados cambian de estado.
7. Si el usuario regresa con el mismo QR, el vendedor ve los productos restantes.

#### Pantalla 6.3a: Vista del vendedor - canje parcial ya realizado

```
┌─────────────────────────────────────────┐
│  Orden #ORD-4821                      │
│  Cliente: Juan Pérez                   │
│─────────────────────────────────────────│
│                                         │
│  Productos ya canjeados:               │
│  ✅ 2x Hot Dog Especial (entregado)   │
│                                         │
│  Productos pendientes:                 │
│  ☐ 1x Cerveza Nacional                │
│                                         │
│  ☑ 1x Cerveza Nacional                │
│                                         │
│  [ ████ Canjear seleccionados ████ ]  │
└─────────────────────────────────────────┘
```

### 6.4 Estados de los Productos

Cada producto de una orden pasa por estos estados:

```
┌───────────┐     ┌───────────┐     ┌───────────────┐     ┌───────────┐
│ PENDIENTE │────▶│ CANJEADO  │────▶│EN PREPARACIÓN │────▶│ ENTREGADO │
│           │     │(comanda   │     │  (en cocina)  │     │           │
│           │     │ generada) │     │               │     │           │
└───────────┘     └───────────┘     └───────────────┘     └───────────┘
     │                                                          │
     │                                                          │
     ▼                                                          ▼
 [CANCELADO]                                               [CONSUMIDO]
 (reembolso)                                          (entrega confirmada
                                                       por usuario o runner)
```

| Estado | Descripción | Quién lo cambia |
|--------|-------------|-----------------|
| **Pendiente** | Producto pagado, esperando que el usuario canjee | Sistema (al comprar) |
| **Canjeado** | QR escaneado o delivery solicitado; comanda generada en cocina | Vendedor/Sistema |
| **En Preparación** | La cocina está preparando el producto | Cocina (terminal) |
| **Entregado** | El producto fue entregado al usuario (en stand o por runner) | Vendedor o Runner |
| **Consumido** | Confirmación final. En delivery, el usuario confirma recepción | Usuario (app) o auto |
| **Cancelado** | Producto cancelado antes de canjear; se reembolsa | Usuario (app) o admin |

---

## 7. Delivery a Asiento

### Descripción

Desde la app, el usuario puede solicitar que le **traigan sus alimentos a su asiento** en lugar de ir a recogerlos. Al solicitar delivery desde BM, se cobra un **cargo fijo por viaje** configurable por concesión (ver sección 7.6). El delivery solicitado desde la terminal Yoshi en el venue no tiene cargo extra y se mantiene sin cambios. Al solicitar delivery, la comanda se genera en cocina en ese momento.

### Pantalla 7.1: Vista "Mis Órdenes" con opción de delivery

```
┌─────────────────────────────────────────┐
│  ← Mis Órdenes                          │
│─────────────────────────────────────────│
│                                         │
│  ── Orden #ORD-4821──                 │
│  Chivas vs América · 15 Abr           │
│  Estado: Pagada                        │
│                                         │
│  Productos:                            │
│  ⬜ 2x Hot Dog Especial   (pendiente) │
│  ⬜ 1x Cerveza Nacional   (pendiente) │
│                                         │
│  [QR] Mostrar QR para recoger         │
│                                         │
│  ── o ──                               │
│                                         │
│  [ 🏃 Que me traigan a mi asiento ]   │
│                                         │
│  Sec 101, Fila A, Asientos 5-6        │
│                                         │
└─────────────────────────────────────────┘
```

### Pantalla 7.2: Selección de productos para delivery

Al presionar "Que me traigan a mi asiento", el usuario **elige qué productos** quiere que le traigan (máximo 5 productos por viaje). Puede ser toda la orden o solo algunos:

```
┌─────────────────────────────────────────┐
│  ← Solicitar Delivery                   │
│─────────────────────────────────────────│
│                                         │
│  Selecciona qué quieres que te         │
│  traigan a tu asiento:                 │
│  (máximo 5 productos por viaje)        │
│                                         │
│  ☑ 2x Hot Dog Especial                │
│  ☐ 1x Cerveza Nacional                │
│                                         │
│  Entrega a:                            │
│  Sec 101 · Fila A · Asientos 5, 6    │
│  [ ✏️ Cambiar ubicación ]              │
│                                         │
│  Tiempo estimado: ~10 min             │
│                                         │
│─────────────────────────────────────────│
│  Cargo por delivery:     $30.00        │
│                                         │
│  Método de pago:                       │
│  ● 💳 Visa ****6411                   │
│  ○ 💵 Efectivo (pago al runner)       │
│     [ Cambiar método de pago ]         │
│                                         │
│  [ ████ Confirmar delivery ████ ]     │
│                                         │
│  💡 Los productos no seleccionados    │
│  puedes recogerlos después con tu QR  │
│  o pedir otro delivery.               │
│                                         │
│  Viajes usados: 1 de 4               │
└─────────────────────────────────────────┘
```

### Pantalla 7.3: Tracking en tiempo real

```
┌─────────────────────────────────────────┐
│  ← Orden #ORD-4821                    │
│─────────────────────────────────────────│
│                                         │
│  ── Delivery en curso ──              │
│  ✅ Solicitud recibida                 │
│  ✅ En preparación                     │
│  ⏳ En camino a tu asiento             │
│  ○  Entregada                          │
│                                         │
│  Productos en delivery:               │
│  🌭 2x Hot Dog Especial               │
│                                         │
│  Entrega a: Sec 101, Fila A, 5-6     │
│  Tiempo estimado: ~6 min              │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Un runner va en camino 🏃      │   │
│  │ Código de entrega:              │   │
│  │       [ 4 8 2 1 ]              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ── Productos pendientes ──           │
│  🍺 1x Cerveza Nacional (pendiente)   │
│     [ Pedir delivery ] [ Recoger QR ] │
│                                         │
└─────────────────────────────────────────┘
```

### Pantalla 7.4: Confirmación de entrega

```
┌─────────────────────────────────────────┐
│  ← Orden #ORD-4821                    │
│─────────────────────────────────────────│
│                                         │
│  ── Delivery completado ──            │
│  ✅ 2x Hot Dog Especial - Entregado   │
│                                         │
│  ¿Recibiste tu orden completa?        │
│  [ ✓ Sí, todo bien ]                  │
│  [ ✗ Hay un problema ]                │
│                                         │
│  ── Resumen de la orden ──            │
│  ✅ 2x Hot Dog Especial  (consumido)  │
│  ⬜ 1x Cerveza Nacional  (pendiente)  │
│                                         │
│  [ Pedir delivery de lo pendiente ]   │
│  [ Mostrar QR para recoger ]          │
│                                         │
│  [ 🛒 Ordenar más ]                   │
└─────────────────────────────────────────┘
```

### Flujo operativo del runner

```
1. Usuario solicita delivery desde la app
   └─▶ BM envía solicitud a Yoshi API

2. Yoshi crea la comanda (Order) para los productos seleccionados
   └─▶ Aparece en el monitor de cocina de la concesión

3. Cocina prepara los productos
   └─▶ Marca como "listo" en la terminal

4. Runner disponible toma la orden
   └─▶ Ve en su terminal:
       - Número de orden
       - Productos a entregar
       - Ubicación: Sec 101, Fila A, Asientos 5-6
       - Código de confirmación: 4821

5. Runner se dirige al asiento del usuario

6. Runner entrega y solicita el código de confirmación
   └─▶ Marca como "entregado" en la terminal

7. El usuario recibe push notification: "Tu orden fue entregada"
   └─▶ Confirma recepción en la app (o se auto-confirma tras 5 min)

8. Los productos entregados cambian a estado "consumido"
```

### 7.6 Cargo por Delivery desde BM

#### Reglas generales

| Concepto | Valor |
|----------|-------|
| **Tipo de cargo** | Monto fijo por viaje |
| **Configurable por** | Concesión |
| **Máximo de viajes por orden** | 4 |
| **Máximo de productos por viaje** | 5 |
| **Aplica a** | Delivery solicitado desde la app BM únicamente |
| **No aplica a** | Delivery generado desde la terminal Yoshi en el venue |
| **Métodos de pago del cargo** | Tarjeta (cobro al momento) o efectivo (pago al runner) |

#### Configuración por concesión

Cada concesión define su cargo de delivery de forma independiente. Ejemplo:

| Concesión | Cargo por viaje |
|-----------|----------------|
| Hot Dogs El Principe | $30.00 |
| Cervecería Central | $20.00 |
| Pizza Planet | $35.00 |

Si una orden tiene productos de **múltiples concesiones**, se cobra el cargo de la concesión correspondiente a los productos del viaje. Si un mismo viaje incluye productos de distintas concesiones, se cobra el cargo más alto entre las concesiones involucradas.

#### Pago del cargo

**Con tarjeta:**
- Se cobra al momento de confirmar el delivery.
- Usa la tarjeta que el usuario tenga guardada en BM.
- El cargo se registra como una transacción independiente de la orden de alimentos.

**En efectivo:**
- El usuario selecciona "Efectivo" como método de pago del cargo.
- El runner cobra el monto en efectivo al momento de la entrega.
- En la terminal del runner se muestra que debe cobrar el cargo en efectivo.
- El runner confirma el cobro en la terminal al entregar.

#### Pantalla del runner con cargo en efectivo

```
┌─────────────────────────────────────────┐
│  Delivery #D-1042                       │
│  Orden #ORD-4821                      │
│─────────────────────────────────────────│
│                                         │
│  Productos a entregar:                 │
│  🌭 2x Hot Dog Especial               │
│                                         │
│  Entrega a:                            │
│  Sec 101 · Fila A · Asientos 5, 6    │
│  Código de confirmación: 4821          │
│                                         │
│─────────────────────────────────────────│
│  💵 COBRAR EN EFECTIVO: $30.00        │
│     Cargo por delivery                 │
│─────────────────────────────────────────│
│                                         │
│  [ Entregado y cobrado ]              │
│  [ No encontrado ]                     │
└─────────────────────────────────────────┘
```

#### Límites y validaciones

- **Máximo 4 viajes por orden**: Al llegar al límite, el botón de delivery se deshabilita y se muestra: "Ya alcanzaste el máximo de deliveries para esta orden. Puedes recoger los productos restantes en la concesión con tu QR."
- **Máximo 5 productos por viaje**: Si el usuario intenta seleccionar más de 5 productos, se muestra: "Máximo 5 productos por viaje. Puedes solicitar otro delivery para los productos restantes."
- **Concesión sin cargo configurado**: Si una concesión no tiene cargo de delivery configurado, no se ofrece la opción de delivery desde BM para productos de esa concesión.

#### Viajes restantes visibles en la app

```
┌─────────────────────────────────────────┐
│  ── Orden #ORD-4821──                 │
│                                         │
│  Viajes de delivery: 2 de 4 usados    │
│  ████████░░░░░░░░                      │
│                                         │
│  Productos pendientes:                 │
│  ⬜ 1x Cerveza Nacional               │
│  ⬜ 1x Nachos                          │
│                                         │
│  [ 🏃 Pedir delivery (viaje 3 de 4) ] │
│  [ QR Recoger en concesión ]           │
└─────────────────────────────────────────┘
```

#### Casuísticas del cargo

| Caso | Comportamiento |
|------|---------------|
| Runner no encuentra al usuario | El cargo **no se devuelve** si el usuario no estaba en su asiento. Se reintenta la entrega según el flujo estándar (sección 7). |
| Usuario cancela delivery antes de que cocina inicie | Se **reembolsa** el cargo (tarjeta) o no se cobra (efectivo). El viaje **no cuenta** para el límite. |
| Usuario cancela delivery cuando ya está en preparación | El cargo **no se devuelve**. El viaje **sí cuenta** para el límite. Los productos regresan a estado "pendiente". |
| Pago en efectivo y runner no logra cobrar | Runner marca "no cobrado". Se bloquean futuros deliveries en efectivo para esa orden. El usuario puede reintentar con tarjeta. |

---

## 8. Promociones y Códigos Promo

### 8.1 Cómo aplica un código promo en BM

1. En el carrito de alimentos (ya sea en checkout de boleto o en tab Alimentos), hay un campo "¿Tienes un código promo?".
2. El usuario ingresa el código.
3. BM **valida el código en tiempo real** contra Yoshi API (`POST /promotions/validate`).
4. Si es válido, Yoshi responde con:
   - El descuento aplicable (porcentaje o monto fijo)
   - Los productos a los que aplica
   - Las condiciones (cantidad mínima, límite de usos, etc.)
5. BM aplica el descuento en el carrito visualmente.
6. Al completar la compra, BM registra el uso del código en Yoshi (`PromotionCodeUsage`).

---

## 9. Tokens

### 9.1 Qué son y cómo funcionan

Los tokens de Yoshi son un **sistema de saldo/crédito**:

- Un **TokenCode** es un código (como una tarjeta de regalo) que tiene un saldo de tokens asignado.
- Cada **TokenType** define una categoría de token (ej: "Tokens Chivas", "Tokens Premium").
- Los **TokenAllowances** definen cuántos tokens tiene un código y para qué eventos son válidos.
- Cada **producto** puede tener un valor en tokens (`ProductTokenRules`): ej. "Hot Dog Especial = 5 tokens".
- Cuando se canjean tokens, se registra en **TokenRedemptions**.

**Ejemplo concreto**:
- Un sponsor regala códigos de tokens a fans: código `CHIVAS2026` con 20 tokens.
- Hot Dog = 5 tokens, Cerveza = 8 tokens, Nachos = 4 tokens.
- El fan puede usar sus 20 tokens para "pagar" combinaciones de productos.

### 9.2 Cómo se canjean desde BM

1. En el carrito de alimentos, hay una sección "¿Tienes tokens?".
2. El usuario ingresa su código de tokens.
3. BM valida contra Yoshi API:
   - Si el código existe y está activo
   - Cuántos tokens tiene disponibles
   - Para qué evento(s) es válido
   - Qué productos puede comprar con tokens
4. Se muestra al usuario:
   - Saldo disponible en tokens
   - Valor en tokens de cada producto en el carrito
   - Opción de seleccionar qué productos pagar con tokens

### 9.3 Flujo de pago con tokens (parcial o total)

**Pago total con tokens** (los tokens cubren toda la orden):
```
Carrito:
  2x Hot Dog Especial (5 tokens c/u) = 10 tokens
  1x Cerveza Nacional (8 tokens)     =  8 tokens
  Total: 18 tokens

Saldo disponible: 20 tokens
→ Se pagan los 18 tokens, no se necesita método de pago.
→ Saldo restante: 2 tokens.
```

**Pago parcial con tokens** (tokens no cubren todo):
```
Carrito:
  2x Hot Dog Especial = 10 tokens
  1x Cerveza Nacional =  8 tokens
  1x Nachos           =  4 tokens
  Total: 22 tokens

Saldo disponible: 15 tokens
→ El usuario elige qué pagar con tokens:
  ☑ 2x Hot Dog Especial (10 tokens)
  ☑ 1x Nachos (4 tokens)
  ☐ 1x Cerveza Nacional ($95 pesos)
→ Se usan 14 tokens.
→ La cerveza se paga con dinero: $95.
→ Saldo restante: 1 token.
```

**Pago mixto**:
- Los productos pagados con tokens y los pagados con dinero se tratan igual operativamente.
- Ambos generan el mismo QR y la misma experiencia de canje/delivery.
- La diferencia es solo en cómo se registra el pago en Yoshi (TokenRedemption vs SalePayment).

---

## 10. Flujo Operativo Completo (Backend / Venue)

### Diagrama de interacción entre sistemas

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   APP        │         │  YOSHI API   │         │   TERMINAL   │
│  BOLETOMÓVIL │         │  (Backend)   │         │  CONCESIÓN   │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │  1. GET catálogo       │                        │
       │──────────────────────▶│                        │
       │  (productos, promos,  │                        │
       │   concesiones del     │                        │
       │   evento)             │                        │
       │◀──────────────────────│                        │
       │                        │                        │
       │  2. POST validar promo │                        │
       │──────────────────────▶│                        │
       │  (código promo)       │                        │
       │◀──────────────────────│                        │
       │  (descuento aplicable)│                        │
       │                        │                        │
       │  3. POST validar tokens│                        │
       │──────────────────────▶│                        │
       │  (código tokens)      │                        │
       │◀──────────────────────│                        │
       │  (saldo, productos    │                        │
       │   canjeables)         │                        │
       │                        │                        │
       │  4. Pago procesado     │                        │
       │  (procesador BM)      │                        │
       │                        │                        │
       │  5. POST crear orden   │                        │
       │──────────────────────▶│                        │
       │  (productos, promos,  │                        │
       │   tokens, pago ref)   │                        │
       │◀──────────────────────│                        │
       │  (orden uuid + QR id) │                        │
       │                        │                        │
       │  [La orden queda en   │                        │
       │   estado PENDIENTE.   │                        │
       │   NO se crea comanda] │                        │
       │                        │                        │
   ════╪════════════════════════╪════════════════════════╪════
   DÍA DEL EVENTO              │                        │
   ════╪════════════════════════╪════════════════════════╪════
       │                        │                        │
  OPCIÓN A: CANJE EN CONCESIÓN │                        │
       │                        │    Escanea QR          │
       │                        │◀───────────────────────│
       │                        │    (orden uuid)        │
       │                        │                        │
       │                        │    Respuesta:          │
       │                        │───────────────────────▶│
       │                        │    productos de la     │
       │                        │    orden con estados   │
       │                        │                        │
       │                        │    Vendedor selecciona │
       │                        │    qué preparar        │
       │                        │                        │
       │                        │    POST canjear        │
       │                        │◀───────────────────────│
       │                        │    (productos          │
       │                        │     seleccionados)     │
       │                        │                        │
       │                        │    GENERA COMANDA      │
       │                        │    en cocina           │
       │                        │───────────────────────▶│
       │                        │                        │
       │  Push: "Tu orden se   │                        │
       │  está preparando"     │                        │
       │◀──────────────────────│                        │
       │                        │                        │
  OPCIÓN B: DELIVERY A ASIENTO │                        │
       │                        │                        │
       │  POST solicitar        │                        │
       │  delivery              │                        │
       │──────────────────────▶│                        │
       │  (productos a traer,  │                        │
       │   ubicación asiento)  │                        │
       │                        │                        │
       │                        │    GENERA COMANDA      │
       │                        │    en cocina           │
       │                        │───────────────────────▶│
       │                        │                        │
       │                        │    Cocina prepara      │
       │                        │    Runner toma orden   │
       │                        │    Runner entrega      │
       │                        │                        │
       │  Push: "Tu orden fue  │    POST marcar         │
       │  entregada"           │◀───────────────────────│
       │◀──────────────────────│    entregado           │
       │                        │                        │
```

### Resumen paso a paso

**COMPRA (en BM)**:
1. BM consulta catálogo de Yoshi para el evento (productos, concesiones, promos)
2. Usuario arma su carrito
3. Si aplica código promo → BM valida contra Yoshi en tiempo real
4. Si usa tokens → BM valida saldo y productos canjeables
5. BM procesa el pago (procesador de pagos de BM)
6. BM notifica a Yoshi: "orden pagada" con detalle de productos, promos, tokens
7. Yoshi crea Sale con status `pre_order`, registra SaleProducts, promos/tokens
8. Se genera QR vinculado a la orden
9. **NO se genera comanda en cocina**

**CANJE EN CONCESIÓN (día del evento)**:
1. Usuario muestra QR en la concesión
2. Vendedor escanea → Yoshi muestra productos de la orden
3. Vendedor selecciona qué preparar (canje parcial)
4. Yoshi genera comanda (Order) solo para los productos seleccionados
5. Cocina prepara → vendedor entrega
6. Productos entregados cambian a "consumido"
7. Si quedan productos pendientes, el QR sigue activo

**DELIVERY A ASIENTO (día del evento)**:
1. Usuario abre app → "Mis Órdenes" → selecciona productos para delivery
2. BM envía solicitud a Yoshi con productos y ubicación
3. Yoshi genera comanda para los productos seleccionados
4. Cocina prepara → runner toma la orden
5. Runner entrega en el asiento, confirma con código
6. Productos entregados cambian a "consumido"
7. Usuario confirma recepción en la app

---

## 11. Casuísticas

### Caso 1: Usuario compra alimentos pero el evento se cancela
- **Impacto**: Tanto el boleto como la orden de alimentos deben cancelarse.
- **Solución**: Si los alimentos se compraron en el checkout del boleto (mismo pago), se reembolsa todo junto. Si fue pago separado (desde tab Alimentos), se reembolsa independientemente. Yoshi marca la Sale como `cancelled`.

### Caso 2: Usuario quiere cancelar su orden de alimentos
- **Condición**: Solo se puede cancelar si **ningún producto ha sido canjeado**. Si todos están en estado "pendiente", se permite cancelación total con reembolso.
- **Parcial**: Si algunos productos ya se canjearon/consumieron, solo se pueden cancelar los que estén en "pendiente".
- **Token**: Si se pagó con tokens, los tokens se devuelven al saldo del código.

### Caso 3: Concesión no tiene stock al momento de canjear
- **En canje presencial**: El vendedor al escanear el QR puede indicar que un producto no está disponible. Se ofrece reemplazo o reembolso del item.
- **En delivery**: Si la cocina detecta falta de stock, Yoshi notifica a BM → push al usuario con opciones: reemplazo, reembolso parcial, o esperar.

### Caso 4: Usuario compra de múltiples concesiones en una sola orden
- El carrito acepta productos de diferentes concesiones.
- Internamente, Yoshi crea una Sale pero genera **comandas separadas por concesión** al canjear.
- **QR único**: Un solo QR muestra todos los productos. El vendedor de cada concesión solo ve y puede canjear los productos de SU concesión.
- **Ejemplo**: El usuario va a "Hot Dogs El Principe" y canjea los hot dogs. Luego va a "Cervecería Central" con el mismo QR y canjea las cervezas.

### Caso 5: El QR caduca
- **Política**: El QR es válido solo para la fecha del evento + un margen de tolerancia (ej. hasta 2 horas después de que termine).
- **Después del evento**: Productos no canjeados se reembolsan automáticamente (configurable por venue).
- **Alternativa**: El venue puede configurar que los productos no canjeados NO se reembolsen (como una política de "no show").

### Caso 6: Usuario transfiere su boleto a otra persona
- **Opción A**: La orden de alimentos se transfiere junto con el boleto. El nuevo dueño puede canjear el QR.
- **Opción B**: La orden de alimentos se cancela y reembolsa al comprador original. El nuevo dueño puede hacer su propia orden.
- **Decisión**: Configurable, pero se recomienda Opción B por simplicidad.

### Caso 7: Runner no encuentra al usuario en su asiento
- Runner marca "No encontrado" en la terminal.
- Push al usuario: "El runner no te encontró en tu asiento".
- Opciones: (1) Reintentar delivery en 5 min, (2) Cambiar ubicación, (3) Cambiar a recoger en stand.
- Después de 2 intentos fallidos, la orden queda disponible para pickup en el stand de la concesión.

### Caso 8: Usuario quiere modificar productos de su orden
- **Si el producto está "pendiente"**: Se puede cancelar el producto individual y hacer una nueva orden con el producto deseado.
- **Si el producto está "canjeado" o posterior**: No se puede modificar, ya está en cocina o entregado.

### Caso 9: Conexión a internet intermitente durante el evento
- **Compra ya realizada**: La orden ya está registrada en Yoshi. El QR funciona porque la terminal lo lee y consulta a Yoshi (la terminal tiene conexión).
- **Delivery solicitado**: Si se pierde conexión antes de confirmar, se guarda localmente y se reintenta al recuperar conexión.
- **Carrito en progreso**: Se guarda localmente y se puede completar al recuperar conexión.

### Caso 10: Promo con límite de usos agotado
- Al agregar un código promo, si el límite de usos ya se alcanzó, se muestra: "Este código ya no está disponible".
- Si una promo auto_apply alcanza su límite global (`usage_limit`), deja de aplicarse automáticamente.

### Caso 11: Usuario quiere pagar mitad tokens y mitad dinero
- Soportado: el usuario selecciona qué productos pagar con tokens y cuáles con dinero.
- Los productos pagados con tokens se registran como TokenRedemptions.
- Los productos pagados con dinero se registran como SalePayments normales.
- Todos van en la misma orden y el mismo QR.
