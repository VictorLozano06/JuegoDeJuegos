# Ecosistema de Datos Desacoplados y Modding del Simulador

Este directorio contiene las definiciones de datos declarativos (JSON) que alimentan el motor de simulación de **Dev Empire 3D**.
El simulador implementa un diseño completamente desacoplado (*Data-Driven Architecture*), permitiendo a los creadores de mods añadir consolas, marcas reales, streamers y crisis contextuales sin tocar el código fuente del simulador.

---

## 1. Esquemas de Datos

### Plataformas (`platforms.json`)
Define las consolas y plataformas donde se desarrollan y publican videojuegos.
```json
{
  "id": "snes",
  "name": "Super 16-Bit",
  "devCost": 22000,
  "marketShare": 0.65,
  "eraUnlocked": 2,
  "audience": "Everyone",
  "icon": "[[DE_ICON_001]]",
  "audienceFit": {
    "Everyone": 1.20,
    "Young": 1.15,
    "Mature": 0.90
  }
}
```

### Streamers y Creadores (`streamers.json`)
Perfiles de influencers para campañas de marketing mediante envío de claves.
```json
{
  "id": "pixelnora",
  "name": "PixelNora",
  "platform": "StreamBox",
  "audience": "small",
  "followers": 18000,
  "genres": ["Simulation", "Casual"],
  "fee": 450
}
```

### Crisis y Eventos Dinámicos (`events.json`)
Eventos contextuales disparados por condiciones de mercado o fechas históricas.
```json
{
  "id": "chip_shortage",
  "type": "platform_supply_shock",
  "title": "Crisis de Fabricación: Escasez de Chips",
  "retroHeadline": "CRISIS DE SUMINISTRO: COLAPSO EN LA PRODUCCIÓN DE MICROCHIPS",
  "modernHeadline": "BREAKING: GLOBAL SILICON SHORTAGE HITS HARDWARE MANUFACTURING",
  "category": "market_crisis",
  "minYear": 1982,
  "maxYear": 9999,
  "weight": 1.2,
  "trigger": { "kind": "random_industry_event" },
  "description": "Una disrupción imprevista reduce las ventas entre 30% y 50%...",
  "choices": [
    {
      "id": "wait_supply",
      "label": "Esperar a que se recupere la cadena logística",
      "description": "Sin coste; mantiene la caída de ventas.",
      "cost": 0,
      "risks": ["Ventas reducidas 30%-50%"]
    },
    {
      "id": "reserve_stock",
      "label": "Pagar reserva anticipada de inventario",
      "description": "Asegura componentes y amortigua el impacto a solo -10% durante 4 semanas.",
      "costFraction": 0.08,
      "minCost": 12000
    }
  ]
}
```

---

## 2. Paquetes de Modding de la Comunidad (`*.json`)
Los modders pueden crear un único archivo JSON que agrupa plataformas, streamers y eventos:
- Ver ejemplo en `mod_sample_real_brands.json`.
- Cargar mediante `game.loadModPackage(json)` o desde la pestaña **"Mods del Simulador"** en el panel de Workshop de la interfaz de usuario.
