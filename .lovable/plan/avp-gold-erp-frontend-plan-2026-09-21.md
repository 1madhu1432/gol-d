# AVP Gold ERP Frontend Plan

## Goal
Build a production-quality, frontend-only ERP demo for AVP Gold with realistic Indian precious-metals data, complete navigation, reusable workflow patterns, and local in-memory interactions. No backend, real payments, real KYC, bank connectivity, or testing-device integrations will be added.

## Product structure

### Shared application shell
- Collapsible grouped sidebar covering every requested module, active states, badges, collapsed tooltips, mobile drawer, and navigation search.
- Sticky top bar with global record search, branch switcher, date control, notifications, help, and user/role menu.
- Breadcrumbs, consistent page headers, responsive content area, toast notifications, dialogs, drawers, and command search.

### Core page families
Rather than duplicating markup, modules will use reusable enterprise page patterns:
- **Executive dashboards:** Dashboard, branch detail, accounting, profit & margin, analytics, vault, reconciliation.
- **Data workspaces:** Customers, KYC, purchases, bank-pledged transactions, testing, payments, inventory, packets, transfers, branches, employees, approvals, reports, audit logs.
- **Detail workspaces:** Customer, transaction, branch, packet, employee, KYC, and bank transaction detail views with tabs and evidence timelines.
- **Configuration workspaces:** Rates, valuation, charges, commission, roles, and settings.
- **Transaction workflows:** Shared Gold/Silver purchase and bank-pledged stepper architecture with metal-specific labels and calculations.

## Implementation

### 1. Design system and reusable primitives
- Define a restrained ivory/neutral surface system, charcoal typography, muted gold accent, semantic status colors, compact spacing, subtle borders, and soft shadows.
- Use professional typography, squared 6–8px radii, dense readable tables, and minimal motion with reduced-motion support.
- Build shared buttons, badges, metric cards, charts, table toolbar, pagination, filters, dialogs, drawers, tabs, steppers, evidence gallery, calculation breakdowns, empty/loading/error states, and confirmation patterns.

### 2. Mock domain layer
- Create typed mock entities and deterministic generators for 5 branches, 50+ customers, 100+ transactions, banks, employees, inventory, packets, payments, approvals, rates, reconciliation, and audit entries.
- Centralize Indian currency/number/date formatting, statuses, labels, metal calculations, navigation metadata, and search indexing.
- Use React context/local component state for simulated actions; data resets on refresh and is clearly presented as demo state where relevant.

### 3. Navigation and routes
- Create route files for all main modules and separate meaningful detail/new-workflow paths.
- Add route-specific metadata to every content route.
- Preserve fast navigation through shared route-safe links and reusable page shells.

### 4. Executive dashboard
- KPI grid, period/branch/metal/type filters, gold-versus-silver, daily transactions, branch performance, purchase trend, bank-pledged trend, approvals/payments/settlements queues, alerts, and recent transactions.
- Interactive chart tooltips, filter controls, queue actions, and responsive layouts.

### 5. Customer, KYC, branch, and employee operations
- Searchable/sortable/selectable/paginated lists with export interactions and detail drawers.
- Add/edit dialogs with validation and unsaved-change warnings.
- Customer profile tabs, branch metrics/team/targets/limits, employee roles/activity, KYC document previews and decision timeline.
- Permission matrix for all named roles and actions.

### 6. Purchase and bank-pledged workflows
- Reusable Gold/Silver purchase steps: customer, items, weight, purity, valuation, charges, approval, settlement, payment, inventory.
- Reusable pledged-metal steps: customer/bank/loan, bank payment, release, receiving, testing, valuation, charges/commission, settlement, payment, inventory.
- Inline validation, editable line items, calculation summaries, approval states, mock completion actions, and status timelines.
- Correct bank-pledged settlement formula and terminology; never describe it as an auction.

### 7. Testing, valuation, rates, charges, and settlement
- Testing dashboard/detail with media evidence, appraiser controls, retest state, and approval history.
- Gold and Silver rate cards/history/comparison plus add/edit dialogs.
- Valuation workspace with transparent weight, purity, rate, deduction, bank outstanding, and customer-payable calculations.
- Configurable charge/commission rule tables and settlement acknowledgement/payment states.

### 8. Evidence and transaction traceability
- Transaction-linked media grouped by Customer/KYC, Item/Weight/Testing, Bank/Payment/Release, Receiving/Packet/Seal, and Settlement.
- Mock upload/drop/camera actions, preview viewer, zoom, metadata, download, and delete confirmation.
- Transaction timeline connecting requests, approvals, payments, custody, packet movements, and audit activity.

### 9. Inventory, packets, vault, transfers, and finance
- Metal-specific inventory tabs, packet contents and movement history, vault deposits/withdrawals/transfers, and branch transfer lifecycle.
- Customer/bank payments, accounting summaries, reconciliation comparisons, margin analytics, and exception handling.
- All actions simulated in frontend state with explicit status feedback.

### 10. Reports, analytics, notifications, audit, settings
- Report catalog with reusable parameter panel, mock generation, export, and print actions.
- Advanced analytics charts for volume, value, branch, settlement, charges, commission, margin, and inventory trends.
- Notification center with category/status actions, searchable audit table with before/after values, and structured settings tabs.

## Responsive behavior
- Desktop-first fixed workspace with collapsible sidebar and sticky table headers.
- Laptop/tablet density adjustments; sidebar becomes a drawer.
- Mobile forms become single-column; metric grids collapse; large tables scroll horizontally while critical records use compact cards where appropriate.

## Validation
- Verify all main navigation destinations render and have unique metadata.
- Exercise sidebar collapse, mobile drawer, global search, filters, tabs, sorting, pagination, dialogs, steppers, approvals, mock uploads, exports, and toast feedback.
- Test desktop and mobile viewports for clipping, overlap, and table usability.
- Confirm the page has no runtime console errors and no network/backend dependencies.

## Boundaries
- No data persistence beyond current browser memory.
- No authentication, database, server functions, APIs, banking/payment processing, KYC service, messaging, or hardware integrations.
- Charts, payments, KYC decisions, file uploads, downloads, print/export, and workflow transitions are realistic simulations only.
