import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  Smartphone,
  Ticket,
  UtensilsCrossed,
  ShoppingCart,
  QrCode,
  Bike,
  Store,
  Bell,
  CheckCircle2,
  Clock3,
  Search,
  Percent,
  CreditCard,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const flowCatalog = [
  {
    id: "checkout",
    title: "Flujo 1 · Agregar alimentos en checkout",
    subtitle: "Venta conjunta de boletos + alimentos antes del pago",
    icon: ShoppingCart,
    accent: "from-orange-500 to-red-500",
    summary:
      "El usuario compra boletos, agrega alimentos como paso opcional y recibe QR de canje al finalizar.",
    screens: [
      {
        id: "checkout-step",
        label: "Paso opcional en checkout",
        title: "Agregar alimentos",
        body: (
          <div className="space-y-3">
            <InfoRow label="Asientos" value="Sec 101 · Fila A · 5 y 6" />
            <SectionTag>¿Quieres agregar alimentos?</SectionTag>
            <PillRow items={["Todos", "Comida", "Bebidas"]} active="Todos" />
            <ProductBlock
              vendor="Hot Dogs El Príncipe"
              items={[
                ["Hot Dog Clásico", "$85"],
                ["Hot Dog Especial", "$120"],
              ]}
            />
            <ProductBlock
              vendor="Cervecería Central"
              items={[
                ["Cerveza Nacional", "$95"],
                ["Cerveza Importada", "$130"],
              ]}
            />
            <PromoBox />
            <PriceResume
              rows={[
                ["Boletos", "$1,200"],
                ["Alimentos", "$180"],
                ["Promo", "-$36"],
                ["Servicio", "$85"],
              ]}
              total="$1,429"
            />
          </div>
        ),
      },
      {
        id: "product-detail",
        label: "Detalle / personalización",
        title: "Hot Dog Especial",
        body: (
          <div className="space-y-3">
            <MockImage label="Imagen del producto" />
            <InfoRow label="Concesión" value="Hot Dogs El Príncipe" />
            <InfoRow label="Precio base" value="$120" />
            <SectionTag>Personaliza tu orden</SectionTag>
            <ChoiceGroup
              title="Salsa"
              values={["Sin salsa", "Ketchup", "Mostaza", "Ambas"]}
              selected="Ketchup"
            />
            <CheckList
              title="Extras"
              items={[
                ["Queso extra (+$25)", false],
                ["Jalapeños (+$15)", true],
                ["Tocino (+$30)", false],
              ]}
            />
            <QtySelector value="2" />
            <PromoInline text="2x1 en hot dogs (aplica automáticamente)" />
            <ActionFooter primary="Agregar al carrito" secondary="Total: $270 → $135" />
          </div>
        ),
      },
      {
        id: "confirmation",
        label: "Confirmación",
        title: "Compra exitosa",
        body: (
          <div className="space-y-3">
            <SuccessBanner title="Boleto + alimentos confirmados" />
            <TicketCard />
            <OrderCard />
            <QrBlock label="QR de alimentos" />
            <SmallNote text="La comanda no se genera todavía. El QR funciona como voucher pagado hasta que el usuario canjea o solicita delivery." />
          </div>
        ),
      },
    ],
  },
  {
    id: "marketplace",
    title: "Flujo 2 · Tab Alimentos / Marketplace",
    subtitle: "Exploración por evento con concesiones, promos y carrito propio",
    icon: UtensilsCrossed,
    accent: "from-emerald-500 to-teal-500",
    summary:
      "El boleto desbloquea el marketplace del venue para preordenar o comprar durante el evento.",
    screens: [
      {
        id: "events",
        label: "Eventos con acceso",
        title: "Alimentos y bebidas",
        body: (
          <div className="space-y-3">
            <SectionTag>Tus eventos</SectionTag>
            <EventAccessCard title="Chivas vs América" detail="15 Abr · Akron Stadium" seat="Sec 101 · Fila A · 5-6" />
            <EventAccessCard title="Metallica en Foro Sol" detail="22 Abr · Foro Sol" seat="Zona A · General" />
            <SectionTag>Tus órdenes activas</SectionTag>
            <MiniStatusCard title="Orden #YOS-4821" subtitle="Pagada · 2 productos pendientes" />
          </div>
        ),
      },
      {
        id: "market",
        label: "Marketplace del evento",
        title: "Chivas vs América",
        body: (
          <div className="space-y-3">
            <SearchBar />
            <PillRow items={["Comida", "Bebidas", "Snacks", "Promos"]} active="Comida" />
            <PromoCard title="2x1 en cervezas nacionales" caption="Solo este partido" />
            <PromoCard title="Combo Chiva: Hot dog + refresco $99" caption="Promoción destacada" />
            <SectionTag>Concesiones</SectionTag>
            <ConcessionGrid />
            <SectionTag>Más vendidos</SectionTag>
            <BestSellerRow />
            <StickyCart label="Carrito (3 items) · $280" />
          </div>
        ),
      },
      {
        id: "cart",
        label: "Carrito y pago",
        title: "Tu orden",
        body: (
          <div className="space-y-3">
            <InfoRow label="Evento" value="Chivas vs América" />
            <InfoRow label="Tu asiento" value="Sec 101 · Fila A · 5-6" />
            <LineItem title="2x Hot Dog Especial" subtitle="ketchup, jalapeños" value="$240" />
            <LineItem title="1x Cerveza Nacional" subtitle="1 unidad" value="$95" />
            <PromoBox />
            <TokenBox />
            <PriceResume
              rows={[
                ["Subtotal", "$335"],
                ["Promo 2x1", "-$120"],
                ["Tokens (10)", "-$240"],
              ]}
              total="$0.00"
            />
            <PaymentCard />
          </div>
        ),
      },
    ],
  },
  {
    id: "pickup",
    title: "Flujo 3 · QR y canje en concesión",
    subtitle: "El vendedor escanea y genera comanda solo para lo que se canjea",
    icon: QrCode,
    accent: "from-violet-500 to-fuchsia-500",
    summary:
      "El QR representa una orden pagada; la cocina entra en juego cuando se canjean productos concretos.",
    screens: [
      {
        id: "my-order",
        label: "Orden pagada",
        title: "Mis órdenes",
        body: (
          <div className="space-y-3">
            <MiniStatusCard title="Orden #YOS-4821" subtitle="Pagada · Pendiente de canje" />
            <LineItem title="2x Hot Dog Especial" subtitle="pendiente" value="" />
            <LineItem title="1x Cerveza Nacional" subtitle="pendiente" value="" />
            <QrBlock label="Mostrar QR para recoger" />
            <Button className="w-full rounded-2xl">Que me traigan a mi asiento</Button>
          </div>
        ),
      },
      {
        id: "seller-scan",
        label: "Vista del vendedor",
        title: "Terminal Yoshi · Escaneo QR",
        body: (
          <div className="space-y-3">
            <InfoRow label="Orden" value="#YOS-4821" />
            <InfoRow label="Cliente" value="Juan Pérez" />
            <InfoRow label="Evento" value="Chivas vs América" />
            <CheckList
              title="Selecciona qué preparar"
              items={[
                ["2x Hot Dog Especial", true],
                ["1x Cerveza Nacional", false],
              ]}
            />
            <Button className="w-full rounded-2xl">Canjear seleccionados</Button>
            <SmallNote text="Solo los productos seleccionados generan comanda en cocina." />
          </div>
        ),
      },
      {
        id: "partial",
        label: "Canje parcial",
        title: "Productos restantes",
        body: (
          <div className="space-y-3">
            <StatusPill status="success" text="2x Hot Dog Especial · entregado" />
            <StatusPill status="pending" text="1x Cerveza Nacional · pendiente" />
            <Button className="w-full rounded-2xl">Canjear seleccionados</Button>
            <StateRail />
          </div>
        ),
      },
    ],
  },
  {
    id: "delivery",
    title: "Flujo 4 · Delivery a asiento",
    subtitle: "Selección por viaje, cargo configurable y tracking en tiempo real",
    icon: Bike,
    accent: "from-sky-500 to-blue-600",
    summary:
      "El usuario pide entrega al asiento, se cobra el viaje y el runner confirma la entrega con código.",
    screens: [
      {
        id: "select-delivery",
        label: "Seleccionar productos",
        title: "Solicitar delivery",
        body: (
          <div className="space-y-3">
            <CheckList
              title="Qué quieres que te traigan"
              items={[
                ["2x Hot Dog Especial", true],
                ["1x Cerveza Nacional", false],
              ]}
            />
            <InfoRow label="Entrega a" value="Sec 101 · Fila A · 5-6" />
            <InfoRow label="Tiempo estimado" value="~10 min" />
            <PriceResume rows={[["Cargo delivery", "$30"]]} total="$30" />
            <PaymentCard cash />
            <Button className="w-full rounded-2xl">Confirmar delivery</Button>
            <SmallNote text="Máximo 5 productos por viaje y 4 viajes por orden." />
          </div>
        ),
      },
      {
        id: "tracking",
        label: "Tracking en tiempo real",
        title: "Orden #YOS-4821",
        body: (
          <div className="space-y-3">
            <TrackingStep label="Solicitud recibida" done />
            <TrackingStep label="En preparación" done />
            <TrackingStep label="En camino a tu asiento" active />
            <TrackingStep label="Entregada" />
            <DeliveryCode />
            <MiniStatusCard title="Pendiente" subtitle="1x Cerveza Nacional · puede pedirse después" />
          </div>
        ),
      },
      {
        id: "runner",
        label: "Vista runner",
        title: "Runner · Delivery #D-1042",
        body: (
          <div className="space-y-3">
            <InfoRow label="Orden" value="#YOS-4821" />
            <InfoRow label="Entrega a" value="Sec 101 · Fila A · 5-6" />
            <InfoRow label="Código" value="4821" />
            <CashCharge />
            <div className="grid grid-cols-2 gap-2">
              <Button className="rounded-2xl">Entregado y cobrado</Button>
              <Button variant="outline" className="rounded-2xl">No encontrado</Button>
            </div>
          </div>
        ),
      },
    ],
  },
];

export default function YoshiBoletomovilPrototype() {
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [screenIndex, setScreenIndex] = useState(0);

  const activeFlow = useMemo(
    () => flowCatalog.find((flow) => flow.id === selectedFlow) || null,
    [selectedFlow]
  );

  const activeScreen = activeFlow?.screens?.[screenIndex] || null;

  const openFlow = (flowId) => {
    setSelectedFlow(flowId);
    setScreenIndex(0);
  };

  const goBack = () => {
    if (activeFlow) {
      setSelectedFlow(null);
      setScreenIndex(0);
    }
  };

  const nextScreen = () => {
    if (!activeFlow) return;
    setScreenIndex((prev) => Math.min(prev + 1, activeFlow.screens.length - 1));
  };

  const prevScreen = () => {
    if (!activeFlow) return;
    setScreenIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <div className="mb-8 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <Badge className="mb-3 rounded-full bg-white/10 px-4 py-1 text-white hover:bg-white/10">
              Prototipo front · Demo interactiva
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Yoshi × Boletomóvil
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
              Una demo visual para presentar los principales recorridos del usuario: agregar alimentos en checkout,
              usar la nueva tab de marketplace, canjear con QR y pedir delivery al asiento.
            </p>
          </div>
          <Card className="border-white/10 bg-white/5 text-white shadow-2xl shadow-black/30 backdrop-blur">
            <CardContent className="p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <Metric label="Flujos principales" value="4" />
                <Metric label="Pantallas simuladas" value="12" />
                <Metric label="Modo" value="Solo front" />
                <Metric label="Objetivo" value="Presentación" />
              </div>
            </CardContent>
          </Card>
        </div>

        <AnimatePresence mode="wait">
          {!activeFlow ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {flowCatalog.map((flow, index) => {
                  const Icon = flow.icon;
                  return (
                    <motion.button
                      key={flow.id}
                      onClick={() => openFlow(flow.id)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06 }}
                      className="text-left"
                    >
                      <Card className="group h-full overflow-hidden rounded-[28px] border-white/10 bg-slate-900/70 text-white shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-white/20 hover:bg-slate-900">
                        <div className={`h-2 w-full bg-gradient-to-r ${flow.accent}`} />
                        <CardHeader className="pb-2">
                          <div className="mb-4 flex items-center justify-between">
                            <div className={`rounded-2xl bg-gradient-to-br ${flow.accent} p-3 shadow-lg`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <Smartphone className="h-5 w-5 text-slate-500 transition group-hover:text-white" />
                          </div>
                          <CardTitle className="text-lg leading-tight">{flow.title}</CardTitle>
                          <p className="text-sm text-slate-400">{flow.subtitle}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <PhonePreview accent={flow.accent} flow={flow} />
                          <p className="text-sm text-slate-300">{flow.summary}</p>
                          <div className="flex items-center justify-between text-sm text-slate-400">
                            <span>{flow.screens.length} pantallas</span>
                            <span className="inline-flex items-center gap-1 font-medium text-white">
                              Ver demo <ChevronRight className="h-4 w-4" />
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.button>
                  );
                })}
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
                <Card className="rounded-[28px] border-white/10 bg-white/5 text-white">
                  <CardHeader>
                    <CardTitle>Cómo usar esta demo</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 text-sm text-slate-300 md:grid-cols-2">
                    <GuideRow icon={Ticket} title="Checkout" text="Muestra la venta conjunta antes del pago." />
                    <GuideRow icon={UtensilsCrossed} title="Marketplace" text="Explica la tab Alimentos por evento." />
                    <GuideRow icon={QrCode} title="QR / Canje" text="Aterriza el modelo de voucher y canje parcial." />
                    <GuideRow icon={Bike} title="Delivery" text="Resume logística, cargo y tracking del runner." />
                  </CardContent>
                </Card>

                <Card className="rounded-[28px] border-white/10 bg-white/5 text-white">
                  <CardHeader>
                    <CardTitle>Mensajes clave</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-300">
                    <Bullet>La comanda no se genera al pagar; se genera al canjear o pedir delivery.</Bullet>
                    <Bullet>Un boleto activo desbloquea el marketplace del venue.</Bullet>
                    <Bullet>Un solo QR puede manejar una orden multi-producto y canje parcial.</Bullet>
                    <Bullet>El delivery se gestiona por viaje con tracking y validaciones visibles.</Bullet>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeFlow.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="grid gap-6 xl:grid-cols-[340px_1fr]"
            >
              <Card className="rounded-[28px] border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Button variant="ghost" onClick={goBack} className="-ml-3 mb-2 rounded-2xl text-slate-300 hover:text-white">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a flujos
                      </Button>
                      <CardTitle className="text-2xl">{activeFlow.title}</CardTitle>
                      <p className="mt-2 text-sm text-slate-400">{activeFlow.subtitle}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                    <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
                      <span>Progreso</span>
                      <span>
                        {screenIndex + 1}/{activeFlow.screens.length}
                      </span>
                    </div>
                    <Progress value={((screenIndex + 1) / activeFlow.screens.length) * 100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    {activeFlow.screens.map((screen, idx) => (
                      <button
                        key={screen.id}
                        onClick={() => setScreenIndex(idx)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          idx === screenIndex
                            ? "border-white/20 bg-white/10"
                            : "border-white/10 bg-white/0 hover:bg-white/5"
                        }`}
                      >
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Pantalla {idx + 1}</div>
                        <div className="mt-1 font-medium text-white">{screen.label}</div>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={prevScreen} className="rounded-2xl border-white/15 bg-transparent text-white hover:bg-white/5">
                      Anterior
                    </Button>
                    <Button onClick={nextScreen} className="rounded-2xl">
                      Siguiente
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 xl:grid-cols-[minmax(320px,420px)_1fr]">
                <div className="mx-auto w-full max-w-[420px]">
                  <PhoneFrame title={activeScreen?.title}>{activeScreen?.body}</PhoneFrame>
                </div>

                <div className="space-y-5">
                  <Card className="rounded-[28px] border-white/10 bg-white/5 text-white">
                    <CardHeader>
                      <CardTitle>{activeScreen?.label}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-slate-300">
                      <p>
                        Esta vista simula cómo se vería la interacción dentro de la app o del ecosistema operativo
                        relacionado al flujo seleccionado.
                      </p>
                      <NarrativeBlock flowId={activeFlow.id} screenId={activeScreen?.id} />
                    </CardContent>
                  </Card>

                  <Card className="rounded-[28px] border-white/10 bg-white/5 text-white">
                    <CardHeader>
                      <CardTitle>Reglas que conviene remarcar en la presentación</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-2">
                      <Rule title="Voucher vs comanda" text="El pago crea una orden pendiente; la cocina solo trabaja sobre canje o delivery." />
                      <Rule title="Canje parcial" text="El QR permanece activo mientras existan productos pendientes." />
                      <Rule title="Delivery por viaje" text="Cada solicitud puede tener límite de productos y un cargo independiente." />
                      <Rule title="Tokens y promos" text="El usuario puede ver el impacto del beneficio directamente en el carrito." />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function NarrativeBlock({ flowId, screenId }) {
  const map = {
    checkout: {
      "checkout-step": "Presenta el cross-sell de alimentos como un paso opcional dentro del checkout del boleto, sin romper el flujo principal.",
      "product-detail": "Profundiza en la personalización del producto: addons, salsas, promociones automáticas y cantidad.",
      confirmation: "Cierra con la idea clave de doble resultado: ticket digital + voucher QR de alimentos.",
    },
    marketplace: {
      events: "Muestra que la tab Alimentos vive como una sección independiente y se desbloquea con eventos activos del usuario.",
      market: "Explica la navegación por concesiones, promos y productos destacados dentro del venue específico.",
      cart: "Enfatiza cómo promociones y tokens impactan el total antes de pagar.",
    },
    pickup: {
      "my-order": "Aterriza el punto de partida del usuario: una orden pagada, visible y lista para recogerse o enviarse.",
      "seller-scan": "Modela el momento operativo en la terminal Yoshi, donde el vendedor decide qué productos canjear.",
      partial: "Refuerza el beneficio del canje parcial y la persistencia del QR para productos restantes.",
    },
    delivery: {
      "select-delivery": "Explica la selección por viaje, el cargo configurable y el método de pago del delivery.",
      tracking: "Hace visible el seguimiento paso a paso para dar confianza al usuario durante la espera.",
      runner: "Incluye la perspectiva operativa del runner para cerrar el ciclo completo del servicio a asiento.",
    },
  };

  return <p>{map?.[flowId]?.[screenId] || "Vista explicativa del flujo."}</p>;
}

function PhonePreview({ flow, accent }) {
  return (
    <div className="mx-auto w-[180px] rounded-[32px] border border-white/10 bg-slate-950 p-2 shadow-2xl shadow-black/30">
      <div className="mb-2 mx-auto h-1.5 w-16 rounded-full bg-white/10" />
      <div className="overflow-hidden rounded-[24px] border border-white/5 bg-slate-900">
        <div className={`h-16 bg-gradient-to-br ${accent} p-3`}>
          <div className="text-xs font-semibold text-white/90">{flow.title.split("·")[0]}</div>
          <div className="mt-2 h-2 w-24 rounded-full bg-white/30" />
        </div>
        <div className="space-y-2 p-3">
          {flow.screens.slice(0, 3).map((screen) => (
            <div key={screen.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-2">
              <div className="h-2 w-20 rounded-full bg-white/20" />
              <div className="mt-2 h-8 rounded-xl bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PhoneFrame({ title, children }) {
  return (
    <div className="rounded-[40px] border border-white/10 bg-slate-950 p-3 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]">
      <div className="mx-auto mb-3 h-1.5 w-20 rounded-full bg-white/10" />
      <div className="min-h-[760px] overflow-hidden rounded-[32px] border border-white/10 bg-slate-50 text-slate-950">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Mockup</div>
              <div className="font-semibold">{title}</div>
            </div>
          </div>
        </div>
        <div className="space-y-3 p-4">{children}</div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-100 px-3 py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function SectionTag({ children }) {
  return <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{children}</div>;
}

function PillRow({ items, active }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            item === active ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"
          }`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function ProductBlock({ vendor, items }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
        <Store className="h-4 w-4" /> {vendor}
      </div>
      <div className="space-y-2">
        {items.map(([name, price]) => (
          <div key={name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm">
            <div>
              <div className="font-medium">{name}</div>
              <div className="text-slate-400">Agregar o personalizar</div>
            </div>
            <div className="font-semibold">{price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PromoBox() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-amber-50 p-3">
      <div className="mb-2 flex items-center gap-2 font-medium text-amber-900">
        <Percent className="h-4 w-4" /> ¿Tienes un código promo?
      </div>
      <div className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-400">Ingresa tu código</div>
    </div>
  );
}

function PriceResume({ rows, total }) {
  return (
    <div className="rounded-3xl bg-slate-950 p-4 text-white">
      <div className="space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between text-slate-300">
            <span>{label}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 font-semibold">
        <span>Total</span>
        <span>{total}</span>
      </div>
    </div>
  );
}

function MockImage({ label }) {
  return (
    <div className="flex h-32 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-100 to-red-100 text-sm text-slate-500">
      {label}
    </div>
  );
}

function ChoiceGroup({ title, values, selected }) {
  return (
    <div className="rounded-3xl bg-slate-100 p-3">
      <div className="mb-2 text-sm font-medium">{title}</div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {values.map((value) => (
          <div
            key={value}
            className={`rounded-2xl border px-3 py-2 ${
              value === selected ? "border-slate-900 bg-white text-slate-950" : "border-transparent bg-white/70 text-slate-600"
            }`}
          >
            {value}
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckList({ title, items }) {
  return (
    <div className="rounded-3xl bg-slate-100 p-3">
      <div className="mb-2 text-sm font-medium">{title}</div>
      <div className="space-y-2 text-sm">
        {items.map(([label, checked]) => (
          <div key={label} className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2">
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-md border text-[10px] ${
                checked ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-transparent"
              }`}
            >
              ✓
            </div>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QtySelector({ value }) {
  return (
    <div className="flex items-center justify-between rounded-3xl bg-slate-100 p-3 text-sm">
      <span className="font-medium">Cantidad</span>
      <div className="flex items-center gap-3 rounded-full bg-white px-3 py-1.5">
        <span>-</span>
        <span className="font-semibold">{value}</span>
        <span>+</span>
      </div>
    </div>
  );
}

function PromoInline({ text }) {
  return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
      🏷️ {text}
    </div>
  );
}

function ActionFooter({ primary, secondary }) {
  return (
    <div className="rounded-3xl bg-slate-950 p-4 text-white">
      <div className="mb-3 text-sm text-slate-300">{secondary}</div>
      <Button className="w-full rounded-2xl bg-white text-slate-950 hover:bg-slate-200">{primary}</Button>
    </div>
  );
}

function SuccessBanner({ title }) {
  return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
      <div className="flex items-center gap-2 font-semibold">
        <CheckCircle2 className="h-5 w-5" /> {title}
      </div>
    </div>
  );
}

function TicketCard() {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-2 flex items-center gap-2 font-semibold">
        <Ticket className="h-4 w-4" /> Tu boleto
      </div>
      <div className="space-y-1 text-sm text-slate-600">
        <div>Chivas vs América</div>
        <div>15 Abril 2026 · 20:00</div>
        <div>Sec 101 · Fila A · 5-6</div>
      </div>
      <QrBlock compact label="QR boleto" />
    </div>
  );
}

function OrderCard() {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-2 flex items-center gap-2 font-semibold">
        <UtensilsCrossed className="h-4 w-4" /> Tu orden de alimentos
      </div>
      <div className="space-y-1 text-sm text-slate-600">
        <div>Orden #YOS-4821</div>
        <div>Estado: Pagada · Pendiente de canje</div>
        <div>2x Hot Dog Especial</div>
        <div>1x Cerveza Nacional</div>
      </div>
    </div>
  );
}

function QrBlock({ label, compact = false }) {
  return (
    <div className={`mt-3 rounded-3xl border border-dashed border-slate-300 bg-slate-50 ${compact ? "p-3" : "p-4"}`}>
      <div className="mb-2 text-center text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
      <div className="mx-auto grid w-fit grid-cols-6 gap-1">
        {Array.from({ length: 36 }).map((_, i) => (
          <div key={i} className={`h-3 w-3 rounded-sm ${i % 2 === 0 || i % 5 === 0 ? "bg-slate-900" : "bg-white ring-1 ring-slate-200"}`} />
        ))}
      </div>
    </div>
  );
}

function SmallNote({ text }) {
  return <div className="rounded-2xl bg-sky-50 px-3 py-2 text-sm text-sky-900">💡 {text}</div>;
}

function EventAccessCard({ title, detail, seat }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-slate-500">{detail}</div>
      <div className="mt-1 text-sm text-slate-500">{seat}</div>
      <Button className="mt-3 w-full rounded-2xl">Ordenar para este evento</Button>
    </div>
  );
}

function MiniStatusCard({ title, subtitle }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-slate-500">{subtitle}</div>
    </div>
  );
}

function SearchBar() {
  return (
    <div className="flex items-center gap-2 rounded-3xl bg-slate-100 px-3 py-3 text-sm text-slate-400">
      <Search className="h-4 w-4" /> Buscar producto...
    </div>
  );
}

function PromoCard({ title, caption }) {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-amber-100 to-orange-100 p-4">
      <div className="font-semibold text-slate-900">{title}</div>
      <div className="text-sm text-slate-600">{caption}</div>
    </div>
  );
}

function ConcessionGrid() {
  const items = [
    ["Hot Dogs", "~5 min"],
    ["Pizza", "~12 min"],
    ["Cervecería", "~3 min"],
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map(([title, time]) => (
        <div key={title} className="rounded-3xl bg-white p-3 text-center shadow-sm ring-1 ring-slate-200">
          <div className="mb-2 text-2xl">🍔</div>
          <div className="text-xs font-medium">{title}</div>
          <div className="text-[11px] text-slate-400">{time}</div>
        </div>
      ))}
    </div>
  );
}

function BestSellerRow() {
  const items = [
    ["Hot Dog", "$85"],
    ["Cerveza", "$95"],
    ["Nachos", "$120"],
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map(([title, price]) => (
        <div key={title} className="rounded-3xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
          <div className="mb-2 h-16 rounded-2xl bg-slate-100" />
          <div className="text-xs font-medium">{title}</div>
          <div className="text-xs text-slate-500">{price}</div>
        </div>
      ))}
    </div>
  );
}

function StickyCart({ label }) {
  return <div className="rounded-3xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white">🛒 {label}</div>;
}

function LineItem({ title, subtitle, value }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-slate-500">{subtitle}</div>
        </div>
        <div className="font-semibold">{value}</div>
      </div>
    </div>
  );
}

function TokenBox() {
  return (
    <div className="rounded-3xl border border-violet-200 bg-violet-50 p-3">
      <div className="mb-2 font-medium text-violet-950">🎟️ ¿Tienes tokens?</div>
      <div className="space-y-2 text-sm text-violet-900">
        <div className="rounded-2xl bg-white px-3 py-2">Saldo disponible: 15 tokens</div>
        <div className="rounded-2xl bg-white px-3 py-2">Hot Dog Especial = 5 tokens</div>
        <div className="rounded-2xl bg-white px-3 py-2">☑ Usar 10 tokens</div>
      </div>
    </div>
  );
}

function PaymentCard({ cash = false }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-2 flex items-center gap-2 font-medium">
        <CreditCard className="h-4 w-4" /> Método de pago
      </div>
      <div className="text-sm text-slate-600">{cash ? "● Visa ****6411 · ○ Efectivo al runner" : "Visa ****6411"}</div>
      <Button className="mt-3 w-full rounded-2xl">Continuar</Button>
    </div>
  );
}

function StatusPill({ status, text }) {
  const styles = {
    success: "bg-emerald-50 text-emerald-900 border-emerald-200",
    pending: "bg-amber-50 text-amber-900 border-amber-200",
  };
  return <div className={`rounded-2xl border px-3 py-2 text-sm ${styles[status]}`}>{text}</div>;
}

function StateRail() {
  const states = ["Pendiente", "Canjeado", "En preparación", "Entregado"];
  return (
    <div className="rounded-3xl bg-slate-100 p-4">
      <div className="mb-3 text-sm font-medium">Estados del producto</div>
      <div className="space-y-2">
        {states.map((state, idx) => (
          <div key={state} className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${idx < 2 ? "bg-slate-950" : "bg-slate-300"}`} />
            <div className="text-sm text-slate-700">{state}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrackingStep({ label, done = false, active = false }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full ${
          done ? "bg-emerald-100 text-emerald-700" : active ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-400"
        }`}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : active ? <Clock3 className="h-4 w-4" /> : "•"}
      </div>
      <div className="text-sm font-medium text-slate-700">{label}</div>
    </div>
  );
}

function DeliveryCode() {
  return (
    <div className="rounded-3xl border border-sky-200 bg-sky-50 p-4 text-center">
      <div className="mb-1 text-sm text-sky-800">Código de entrega</div>
      <div className="text-3xl font-bold tracking-[0.4em] text-sky-950">4821</div>
    </div>
  );
}

function CashCharge() {
  return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="text-sm font-semibold text-emerald-900">💵 Cobrar en efectivo: $30.00</div>
      <div className="text-sm text-emerald-700">Cargo por delivery</div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

function GuideRow({ icon: Icon, title, text }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="rounded-2xl bg-white/10 p-2">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="font-medium text-white">{title}</div>
        <div className="text-slate-400">{text}</div>
      </div>
    </div>
  );
}

function Bullet({ children }) {
  return <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">• {children}</div>;
}

function Rule({ title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="font-medium text-white">{title}</div>
      <div className="mt-1 text-sm text-slate-400">{text}</div>
    </div>
  );
}
