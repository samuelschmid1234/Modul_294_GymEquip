# GymEquip Frontend (Modul 294)

Angular-Frontend zur Verwaltung von Fitnessstudio-Inventar (Maschinen, Zubehör-Sets,
Kategorien). Bindet das im Modul 295 erstellte Spring-Boot-Backend an und nutzt Keycloak
für Authentifizierung & Autorisierung.

## Voraussetzungen

| Komponente | Erwartete Konfiguration |
|---|---|
| **Backend** | Läuft auf `http://localhost:9090` (Spring Boot) |
| **PostgreSQL** | DB `gymEquip`, User `postgres`, Passwort `1234` (siehe Backend-Doku) |
| **Keycloak** | Läuft auf `http://localhost:8080`, Realm `GymEquip`, Client `GymEquip` |
| **Node.js** | ≥ 20 |

### Keycloak-Setup

* Realm: `GymEquip`
* Client: `GymEquip` (Public Client mit Standard Flow, gültige Redirect-URIs `http://localhost:4200/*`, Web-Origins `http://localhost:4200`)
* Rollen: `admin`, `update`, `read`
* Test-User: `admin`, `user`, `user_readonly` (alle mit Passwort `1234`)

### Rollen-Berechtigungen im Frontend

| Aktion | read | update | admin |
|---|---|---|---|
| Listen anzeigen | ✓ | ✓ | ✓ |
| Anlegen / Bearbeiten | – | ✓ | ✓ |
| Löschen | – | – | ✓ |

## Netzwerk-Ports

* Frontend: `4200` (Default Angular Dev Server)
* Backend: `9090`
* Keycloak: `8080`

Wird einer dieser Ports geändert, müssen die entsprechenden Werte in
[src/environments/environment.ts](src/environments/environment.ts) bzw.
[src/environments/environment.development.ts](src/environments/environment.development.ts)
sowie die CORS-/Redirect-Einstellungen in Backend und Keycloak angepasst werden.

## Installation

```bash
npm install
```

## Development-Server starten

```bash
npm start
```

Anschliessend `http://localhost:4200` im Browser öffnen. Es erfolgt automatisch ein
Redirect zur Keycloak-Login-Seite.

## Build

```bash
npm run build
```

Output landet unter `dist/gymEquip`.

## Unit-Tests (Vitest)

```bash
npm test
```

Enthaltene Tests:

* `src/app/service/machine.service.spec.ts` – alle CRUD-Methoden des wichtigsten Services.
* `src/app/pages/machines/machines.spec.ts` – alle Methoden der wichtigsten Komponente.
* Smoke-Tests für `App`, `Dashboard`, `AccessorySets`, `Categorys`.

## Projektstruktur

```
src/app/
  app.*                  Root-Komponente, Routing, App-Config
  components/            Sub-Komponenten (Sidebar, TopBar, FormModals, AccessoryItemCard)
  directives/            HasRoleDirective (rollenbasierte UI-Sichtbarkeit)
  guard/                 AuthGuard (geschützte Routes)
  models/                Domain-Modelle (Machine, AccessorySet, Category, …)
  pages/                 Dashboard, Machines, AccessorySets, Categorys
  service/               REST-Services + AuthService (Keycloak-Wrapper)
```

## Erwartete REST-Endpoints

Die Services rufen folgende Endpunkte im Backend (Basis-URL `http://localhost:9090`) auf:

| Methode | Pfad | Verwendet von |
|---|---|---|
| GET/POST/PUT/DELETE | `/api/machines[/{id}]` | `MachineService` |
| GET/POST/PUT/DELETE | `/api/accessory-sets[/{id}]` | `AccessorySetService` |
| GET/POST/PUT/DELETE | `/api/categories[/{id}]` | `CategoryService` |
| GET/POST/PUT/DELETE | `/api/accessory-types[/{id}]` | `AccessoryTypeService` |

Falls Ihre Spring-Boot-Controller andere Pfade verwenden, kann die `baseUrl` in den
jeweiligen Service-Dateien unter `src/app/service/` angepasst werden.
