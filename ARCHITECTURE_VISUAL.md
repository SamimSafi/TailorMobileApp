# XposeMobileApp - Visual Architecture Guide

---

## 🏗️ Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Screens (5)                                     │  │
│  │  ├─ SearchScreenModern    (Home)                 │  │
│  │  ├─ CustomerDetailsScreen (Profile)              │  │
│  │  ├─ CreateInvoiceScreen   (Forms)                │  │
│  │  ├─ ServerSetupScreen     (Config)               │  │
│  │  └─ SearchScreen          (Legacy)               │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │ Uses
                          ▼
┌─────────────────────────────────────────────────────────┐
│               UI COMPONENTS LAYER                       │
│  ┌────────────────────────────────────────────────┐   │
│  │ Modern UI Library                              │   │
│  │ ├─ ModernButton        ├─ ModernInput         │   │
│  │ ├─ ModernCard          ├─ ModernSearchBar     │   │
│  │ ├─ ModernModal         ├─ ModernBadge         │   │
│  │ ├─ ModernLoading       ├─ ModernEmptyState    │   │
│  │ └─ ModernToast                                │   │
│  └────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────┐   │
│  │ Business Components                            │   │
│  │ ├─ CustomerCard        ├─ AddCustomerModal    │   │
│  │ ├─ QadAndamList        ├─ AddQadAndamModal    │   │
│  │ ├─ InvoiceList         ├─ InvoiceForm         │   │
│  │ ├─ PaymentModal        ├─ BarcodeScanner      │   │
│  │ └─ SendMessageModal                           │   │
│  └────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              STATE MANAGEMENT LAYER                     │
│  ┌──────────────────────────────────────────────┐     │
│  │ Zustand Stores                               │     │
│  │ ├─ customerStore  (Customer data)            │     │
│  │ ├─ searchStore    (Search functionality)     │     │
│  │ └─ invoiceStore   (Invoice management)       │     │
│  └──────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              BUSINESS LOGIC LAYER                       │
│  ┌──────────────────────────────────────────────┐     │
│  │ Services & Utilities                         │     │
│  │ ├─ api.js              ├─ errorHandler.js   │     │
│  │ ├─ smsService.js       ├─ validators.js     │     │
│  │ ├─ storage.js          ├─ formatters.js     │     │
│  │ └─ serverConfigService                      │     │
│  └──────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    API LAYER                           │
│  ┌──────────────────────────────────────────────┐     │
│  │ Axios HTTP Client                            │     │
│  │ ├─ /v1/customers                             │     │
│  │ ├─ /v1/qad-andam                             │     │
│  │ ├─ /v1/messages                              │     │
│  │ └─ Authentication (Bearer Token)             │     │
│  └──────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND SERVER                        │
│  RESTful API (Node.js / Express / etc)                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Screen Navigation Flow

```
                    ┌──────────────────┐
                    │  App Launches    │
                    └────────┬─────────┘
                             │
                    ┌────────▼──────────┐
                    │  Check Setup      │
                    │  Async Storage    │
                    └────────┬──────────┘
                             │
                    ┌────────┴──────────┐
                    │                   │
            ┌───────▼────────┐   ┌──────▼──────────┐
            │ First Run?     │   │ Setup Complete? │
            │ YES            │   │ YES             │
            └────────┬──────┘   └────────┬────────┘
                     │                   │
         ┌───────────▼──────────────────┬┘
         │                              │
    ┌────▼──────────┐           ┌──────▼────────────┐
    │ ServerSetup   │           │ SearchScreenMod   │
    │ Screen        │           │ (HOME)            │
    │               │           │                   │
    │ • URL Input   │           │ • Search bar      │
    │ • URL Valid   │           │ • Customer List   │
    │ • Save Config │           │ • Barcode scan    │
    │ • Init API    │           │ • Add Customer    │
    └────┬──────────┘           └──┬──────────┬─────┘
         │                         │          │
         │ Setup OK               │ Select   │ Add
         │                        │ Customer │ New
         └─────────┬──────────────┘          │
                   │                         │
           ┌───────▼──────────┐              │
           │ SearchScreen OK? │              │
           │ Repeat Search    │              │
           └───────┬──────────┘              │
                   │                         │
       ┌───────────┴─────────────────────┬───┘
       │                                 │
       │              ┌──────────────────▼──┐
       │              │ AddCustomerModal    │
       │              │                     │
       │              │ • Form fields       │
       │              │ • Validation        │
       │              │ • API POST          │
       │              │ • Toast notify      │
       │              └──────────────────┬──┘
       │                                 │
    ┌──▼────────────────────────────────┐
    │ CustomerDetailsScreen              │
    │                                    │
    │ • Customer Info                    │
    │ • QAD Andam List                   │
    │ • Invoice List                     │
    │ • Balance Display                  │
    │                                    │
    │ Actions:                           │
    │ ├─ Add QAD Andam                  │
    │ ├─ Record Payment                 │
    │ ├─ Create Invoice                 │
    │ └─ Back to Search                 │
    └────┬────────────────────────────┬──┘
         │                            │
         │ Create Invoice             │
         │                            │
    ┌────▼──────────────────────────┐│
    │ CreateInvoiceScreen            ││
    │                                ││
    │ • Invoice Form                 ││
    │ • Line Items                   ││
    │ • Auto Calculations            ││
    │ • Submit & Back                ││
    └────────────────────────────────┘│
                                       │
                    ┌──────────────────┘
                    │
              ┌─────▼────────┐
              │ Back to List  │
              └───────────────┘
```

---

## 🎨 Design System Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                 DESIGN SYSTEM                          │
│                 (modernTheme.js)                       │
└──────────────────────┬────────────────────────────────┘
                       │
         ┌─────────────┼──────────────┐
         │             │              │
         ▼             ▼              ▼
    ┌────────┐    ┌────────┐    ┌──────────┐
    │ Colors │    │ Spacing│    │ Typography
    │        │    │        │    │          │
    ├────────┤    ├────────┤    ├──────────┤
    │Primary │    │ xs:4px │    │Display   │
    │ #0066FF│    │ sm:8px │    │36px-700  │
    │        │    │ md:12  │    │          │
    │Secondary   │ lg:16  │    │Headline  │
    │#00BCD4│    │ xl:20  │    │22px-600  │
    │        │    │ xxl:24 │    │          │
    │Success │    │xxxl:32 │    │Body      │
    │#4CAF50│    │        │    │16px-400  │
    │        │    │Radius  │    │          │
    │Warning │    │xs:4px  │    │Label     │
    │#FFA726│    │sm:8px  │    │14px-500  │
    │        │    │md:12   │    │          │
    │Error   │    │lg:16   │    │Shadows   │
    │#F44336│    │xl:20   │    │S/M/L     │
    │        │    │full    │    │          │
    │Neutral │    │        │    │          │
    │etc     │    │        │    │          │
    └────────┘    └────────┘    └──────────┘
         │             │              │
         └─────────────┼──────────────┘
                       │
                       ▼
         ┌─────────────────────────┐
         │  Applied to Components  │
         │                         │
         │  ├─ ModernButton       │
         │  ├─ ModernCard         │
         │  ├─ ModernInput        │
         │  ├─ ModernModal        │
         │  ├─ ModernBadge        │
         │  └─ ... all UI comps   │
         │                         │
         └─────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
┌──────────────────┐
│  User Action     │ (Tap button, type search, etc)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Screen Handler  │ (onClick, onChange, etc)
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│  Zustand Store Action    │ (searchStore.searchCustomer)
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Service Call            │ (api.searchCustomers)
│  (with validation)       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Axios HTTP Request      │
│  ├─ Interceptor: Add Token
│  ├─ Interceptor: Init API
│  └─ Send to Server       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  BACKEND SERVER          │ (RESTful API)
│  ├─ Authentication       │
│  ├─ Business Logic       │
│  └─ Database             │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  API Response            │ ({data: [], success: true})
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Zustand Store Update    │ (setState)
│  searchResults = [...]   │
│  loading = false         │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Component Re-render     │ (via hook)
│  const {results} =       │
│    useSearchStore()      │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Updated UI Display      │ (FlatList renders results)
└──────────────────────────┘
```

---

## 🔐 Authentication Flow

```
┌─────────────────┐
│  App Starts     │
└────────┬────────┘
         │
         ▼
┌────────────────────────┐
│  Check Stored Token    │
│  AsyncStorage.getItem  │
│  ('token')             │
└────────┬───────────────┘
         │
    ┌────┴──────┐
    │            │
 YES│            │NO
    │            │
    ▼            ▼
┌──────────┐ ┌──────────┐
│ Use Token│ │ No Token │
│          │ │ = Public │
│ Add to   │ │          │
│ Bearer   │ │ Request  │
│ Header   │ │ sent     │
└────┬─────┘ │ without  │
     │       │ auth     │
     │       └──┬───────┘
     │          │
     └────┬─────┘
          │
          ▼
┌──────────────────┐
│  API Request     │
│  ├─ URL          │
│  ├─ Params       │
│  ├─ Headers      │
│  │ (Bearer Token)
│  └─ Data         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Server Verifies │
│  Token           │
└────────┬─────────┘
         │
    ┌────┴──────┐
    │            │
  ✓│            │✗
    │            │
    ▼            ▼
┌──────────┐ ┌──────────┐
│ Proceed  │ │ 401      │
│ Request  │ │ Unauth   │
│          │ │ Reject   │
└──────────┘ └──────────┘
```

---

## 💾 Local Storage Structure

```
AsyncStorage
│
├─ SERVER_SETUP_COMPLETE
│  └─ "true" / "false"
│
├─ SERVER_URL
│  └─ "http://server.com:3000"
│
├─ token
│  └─ "eyJhbGciOiJIUzI1NiIs..."
│
├─ SEARCH_HISTORY
│  └─ [{id, term, timestamp}, ...]
│
├─ CUSTOMER_CACHE
│  └─ {customerId: customerData}
│
└─ USER_PREFERENCES
   ├─ theme
   ├─ language
   └─ notifications
```

---

## 🧪 Component Composition Example

### SearchScreenModern Composition:

```
SearchScreenModern
│
├─ SafeAreaView (wrapper)
│  │
│  ├─ View (header)
│  │  ├─ ModernSearchBar
│  │  │  └─ ModernInput
│  │  │
│  │  └─ View (buttons row)
│  │     ├─ ModernButton (Scan)
│  │     └─ ModernButton (Add)
│  │
│  ├─ FlatList (main content)
│  │  └─ CustomerCard (per item)
│  │     ├─ ModernCard
│  │     │  ├─ Text (name)
│  │     │  ├─ Text (phone)
│  │     │  ├─ ModernBadge (balance)
│  │     │  └─ ModernButton (message)
│  │     │     └─ SendMessageModal
│  │     │        └─ ModernModal
│  │     │           ├─ ModernInput
│  │     │           └─ ModernButton
│  │     │
│  │     └─ Touch handlers
│  │
│  ├─ ModernEmptyState (no results)
│  │  └─ ModernLoading (loading state)
│  │
│  └─ Modal Portals
│     ├─ BarcodeScanner
│     ├─ AddCustomerModal
│     └─ SendMessageModal
│
└─ useFocusEffect (lifecycle)
   └─ searchStore.clearSearch()
```

---

## 📈 State Management Flow

```
Screen Component
       │
       ├─ useSearchStore()
       │  ├─ searchTerm
       │  ├─ searchResults
       │  └─ setSearchTerm()
       │
       ├─ useCustomerStore()
       │  ├─ selectedCustomer
       │  ├─ qadAndams
       │  ├─ invoices
       │  └─ selectCustomer()
       │
       └─ useInvoiceStore()
          ├─ invoices
          ├─ selectedInvoice
          └─ createInvoice()

When user action → Store updates → Component re-renders
```

---

## 🚀 Performance Optimizations

```
┌──────────────────────────────────────┐
│  Performance Optimization Layers     │
└──────────────────────────────────────┘

1. Bundle Size
   ├─ Hermes Engine (15MB saved)
   ├─ ProGuard Obfuscation (12MB saved)
   ├─ No native-base (-15MB)
   └─ Metro minification (10MB saved)

2. Rendering
   ├─ FlatList with keyExtractor
   ├─ Memoization of components
   ├─ useFocusEffect for data refresh
   └─ useCallback for event handlers

3. Storage
   ├─ AsyncStorage for settings
   ├─ Cache customer data
   └─ Local search history

4. API
   ├─ Request deduplication
   ├─ Error handling with retry
   ├─ Token management
   └─ Pagination support
```

---

## 📚 File Dependencies

```
SearchScreenModern.js
├─ CustomerDetailsScreen.js
│  ├─ useCustomerStore
│  ├─ PaymentModal
│  ├─ QadAndamList
│  ├─ InvoiceList
│  └─ api.js (recordPayment)
│
├─ CreateInvoiceScreen.js
│  ├─ useInvoiceStore
│  ├─ InvoiceForm
│  └─ api.js (createInvoice)
│
├─ ModernSearchBar
│  └─ ModernInput
│
├─ CustomerCard
│  ├─ ModernCard
│  ├─ ModernBadge
│  └─ ModernButton
│
├─ BarcodeScanner
│  └─ expo-camera
│
└─ AddCustomerModal
   ├─ ModernModal
   ├─ ModernInput
   ├─ ModernButton
   └─ api.js (createCustomer)
```

This completes the comprehensive visual architecture guide!