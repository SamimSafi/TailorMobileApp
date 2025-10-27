# XposeMobileApp - Project Structure & Architecture

**App Type:** React Native Tailor Management System  
**Framework:** Expo 54 | React 19 | React Native 0.81.4  
**UI System:** Custom Modern Design (Material Design 3)  
**State Management:** Zustand  

---

## 📁 Project Directory Structure

```
XposeMobileApps/
├── src/
│   ├── screens/                          # Screen components (5 total)
│   │   ├── SearchScreenModern.js         # Main search/customer list (ACTIVE)
│   │   ├── SearchScreen.js               # Legacy search screen
│   │   ├── CustomerDetailsScreen.js      # Customer detail view
│   │   ├── CreateInvoiceScreen.js        # Invoice creation
│   │   └── ServerSetupScreen.js          # Initial server configuration
│   │
│   ├── components/
│   │   ├── ui/                           # Reusable Modern UI Components
│   │   │   ├── ModernButton.js           # Primary, Secondary buttons
│   │   │   ├── ModernCard.js             # Card layout component
│   │   │   ├── ModernInput.js            # Text input field
│   │   │   ├── ModernSearchBar.js        # Search bar component
│   │   │   ├── ModernModal.js            # Modal dialog component
│   │   │   ├── ModernBadge.js            # Status badges
│   │   │   ├── ModernLoading.js          # Loading spinner
│   │   │   ├── ModernEmptyState.js       # Empty state placeholder
│   │   │   ├── ModernToast.js            # Toast notifications
│   │   │   └── index.js                  # Export all UI components
│   │   │
│   │   ├── CustomerCard.js               # Customer list item component
│   │   ├── SearchBar.js                  # Custom search bar
│   │   ├── AddCustomerModal.js           # Modal to add new customer
│   │   ├── AddQadAndamModal.js           # Modal to add QAD Andam
│   │   ├── InvoiceForm.js                # Invoice form component
│   │   ├── InvoiceList.js                # Invoice list display
│   │   ├── PaymentModal.js               # Payment recording modal
│   │   ├── QadAndamList.js               # QAD Andam list display
│   │   ├── BarcodeScanner.js             # Barcode scanner integration
│   │   ├── SendMessageModal.js           # SMS sending modal
│   │   └── SmsExample.js                 # SMS example component
│   │
│   ├── theme/                            # Design System
│   │   ├── modernTheme.js                # Material Design 3 theme config
│   │   ├── colors.js                     # Color palette
│   │   └── spacing.js                    # Spacing scale
│   │
│   ├── store/                            # Zustand state management
│   │   ├── customerStore.js              # Customer data & actions
│   │   ├── searchStore.js                # Search functionality
│   │   └── invoiceStore.js               # Invoice data & actions
│   │
│   ├── services/                         # API & external services
│   │   ├── api.js                        # Axios API client
│   │   ├── errorHandler.js               # Error handling utility
│   │   ├── smsService.js                 # SMS sending service
│   │   ├── nativeSmsService.js           # Native SMS service
│   │   └── serverConfigService.js        # Server configuration
│   │
│   ├── utils/                            # Utility functions
│   │   ├── formatters.js                 # Date, number formatting
│   │   ├── validators.js                 # Form validation
│   │   ├── imageHelper.js                # Image processing
│   │   ├── storage.js                    # LocalStorage management
│   │   └── toastManager.js               # Toast notifications
│   │
│   ├── constants/
│   │   └── messageTemplates.js           # SMS message templates
│   │
│   ├── i18n/                             # Internationalization
│   │   └── (i18n configuration)
│   │
│   ├── navigation/
│   │   └── RootNavigator.js              # Stack navigation setup
│   │
│   └── App.js                            # App entry point
│
├── app/                                  # Expo Router (new Expo structure)
│   ├── _layout.tsx
│   ├── modal.tsx
│   └── (tabs)/
│
├── package.json                          # Dependencies
├── app.json                              # Expo configuration
├── metro.config.js                       # Bundle optimization config
├── eslint.config.js                      # Linting rules
├── tsconfig.json                         # TypeScript config
├── android/                              # Android native code
└── assets/                               # Images & icons
```

---

## 🎨 Screens Overview

### 1. **ServerSetupScreen** (First-Time Setup)
- **Purpose:** Initial server configuration
- **Role:** Shown before app is fully initialized
- **Key Features:**
  - Server URL input
  - Connection testing
  - Save configuration to AsyncStorage
  - Triggers API client initialization
- **Styling:** Modern UI with ModernInput, ModernButton
- **Navigation:** Gate (shows before other screens)

### 2. **SearchScreenModern** (Main Screen - ACTIVE)
- **Purpose:** Customer search and listing
- **Role:** Primary user interface
- **Key Features:**
  - Search bar with real-time filtering
  - Customer list with cards
  - Barcode scanner integration
  - Add new customer modal
  - Send SMS modal
  - Pull-to-refresh
  - Empty state handling
- **Components Used:**
  - ModernSearchBar
  - ModernButton (Add customer, Scan)
  - CustomerCard (list item)
  - AddCustomerModal
  - SendMessageModal
  - BarcodeScanner
- **Navigation:** Jump to CustomerDetailsScreen
- **State Management:** 
  - useSearchStore (search term, results)
  - useCustomerStore (selected customer)

### 3. **SearchScreen** (Legacy)
- **Purpose:** Alternative search interface
- **Status:** Legacy version (SearchScreenModern is preferred)
- **Similar to:** SearchScreenModern but older styling

### 4. **CustomerDetailsScreen** (Customer Profile)
- **Purpose:** View detailed customer information
- **Role:** Secondary screen after selecting customer
- **Key Features:**
  - Customer profile info
  - QAD Andam list (tailored items)
  - Invoice history
  - Payment recording
  - Customer balance display
  - Actions: Create invoice, Add QAD Andam, Record payment
- **Components Used:**
  - QadAndamList
  - InvoiceList
  - PaymentModal
  - AddQadAndamModal
  - ModernCard, ModernButton, ModernBadge
- **Navigation:** 
  - Back to SearchScreenModern
  - Forward to CreateInvoiceScreen
- **State Management:**
  - useCustomerStore (customer data, qadAndams, invoices, balance)

### 5. **CreateInvoiceScreen** (Invoice Creation)
- **Purpose:** Create invoice for QAD Andam
- **Role:** Tertiary screen for invoice generation
- **Key Features:**
  - Invoice form
  - Auto-populated with customer & QAD Andam data
  - Amount calculations
  - Invoice submission
  - Validation
- **Components Used:**
  - InvoiceForm
  - ModernButton, ModernCard
- **Navigation:** Back to CustomerDetailsScreen
- **State Management:**
  - useInvoiceStore (invoice data)
  - useCustomerStore (context)

---

## 🎨 Styling & Design System

### **Design Framework: Material Design 3**
- Modern, clean, professional appearance
- Consistent spacing, typography, colors
- Elevation/shadow system for depth
- Accessible contrast ratios

### **Color Palette** (`modernTheme.js`)

```javascript
Primary:        #0066FF (Modern Blue)
Primary Light:  #E3F2FD
Primary Dark:   #0052CC

Secondary:      #00BCD4 (Teal)
Secondary Light: #E0F7FA
Secondary Dark: #00ACC1

Success:        #4CAF50 (Green)
Warning:        #FFA726 (Orange)
Error:          #F44336 (Red)
Info:           #2196F3 (Light Blue)

Background:     #F8F9FA (Light Gray)
Surface:        #FFFFFF (White)
Text:           #1A1A1A (Dark)
Text Secondary: #666666 (Gray)
```

### **Typography System**

| Style | Size | Weight | Use Case |
|-------|------|--------|----------|
| **Display** | 24-36px | 700 | Headlines |
| **Headline** | 18-22px | 600-700 | Section titles |
| **Title** | 16-18px | 600 | Card titles |
| **Body** | 12-16px | 400 | Main text |
| **Label** | 11-14px | 500 | Labels, buttons |

### **Spacing Scale**
```
xs: 4px    - Tight spacing
sm: 8px    - Small gaps
md: 12px   - Medium gaps
lg: 16px   - Large gaps
xl: 20px   - Extra large
xxl: 24px  - 2XL
xxxl: 32px - 3XL
```

### **Border Radius**
```
none: 0px
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 20px
full: 9999px (circles)
```

### **Shadow System (Elevation)**
| Level | Shadow |
|-------|--------|
| Small | Subtle, elevation 2 |
| Medium | Moderate, elevation 4 |
| Large | Prominent, elevation 8 |

---

## 🧩 UI Components Library

### **Modern UI Components** (`src/components/ui/`)

#### **ModernButton.js**
```javascript
// Primary button (blue)
<ModernButton 
  title="Submit" 
  onPress={handleSubmit}
  variant="primary" 
/>

// Secondary button (outline)
<ModernButton 
  title="Cancel" 
  variant="secondary" 
/>

// Props: variant, size, loading, disabled
```

#### **ModernInput.js**
```javascript
// Text input with validation styling
<ModernInput 
  placeholder="Search customer..."
  value={searchTerm}
  onChangeText={setSearchTerm}
  error={errorMessage}
/>
```

#### **ModernCard.js**
```javascript
// Card container with shadows
<ModernCard>
  <Text>Card content</Text>
</ModernCard>
```

#### **ModernSearchBar.js**
```javascript
// Search input with icon
<ModernSearchBar 
  value={searchTerm}
  onChangeText={setSearchTerm}
  onSubmit={handleSearch}
/>
```

#### **ModernModal.js**
```javascript
// Modal dialog with modern styling
<ModernModal 
  visible={isOpen}
  onClose={handleClose}
  title="Add Customer"
>
  {/* Modal content */}
</ModernModal>
```

#### **ModernBadge.js**
```javascript
// Status badge (success, warning, error, info)
<ModernBadge status="success" text="Paid" />
```

#### **ModernLoading.js**
```javascript
// Loading spinner
<ModernLoading size="large" />
```

#### **ModernEmptyState.js**
```javascript
// Empty state placeholder with icon and message
<ModernEmptyState 
  icon="inbox"
  title="No Customers Found"
  message="Try searching or adding a new customer"
/>
```

#### **ModernToast.js**
```javascript
// Toast notifications
toastSuccess('Customer added successfully')
toastError('Failed to save customer')
toastInfo('Loading customer data...')
```

---

## 🏢 Business Domain Components

### **CustomerCard.js**
- Displays customer summary in list
- Shows: name, phone, balance, last activity
- Touchable to navigate to details
- Props: customer, onPress

### **AddCustomerModal.js**
- Form to add new customer
- Fields: name, phone, address, balance, notes
- Validation
- API integration (createCustomer)

### **QadAndamList.js**
- Lists tailored items for customer
- QAD Andam = custom garment/item
- Shows: type, measurements, dates, status
- Props: qadAndams, onAddNew, onSelectItem

### **AddQadAndamModal.js**
- Form to create new QAD Andam
- Fields: type, measurements, amount, dates
- Types: Kala, Darishi, Waskat, Kurti
- API integration (createQadAndam)

### **InvoiceList.js**
- Lists invoices for customer
- Shows: date, amount, payment status
- Props: invoices, onSelectInvoice

### **InvoiceForm.js**
- Form to create invoice
- Auto-calculates from QAD Andam
- Fields: invoice items, total, discount, notes
- API integration (createInvoice)

### **PaymentModal.js**
- Record payment for invoice
- Fields: amount, method, date, notes
- Updates invoice status
- API integration (recordPayment)

### **BarcodeScanner.js**
- Camera-based barcode scanning
- Scans customer codes
- Returns scanned data
- Uses expo-camera

### **SendMessageModal.js**
- SMS sending interface
- Template selection
- Phone number auto-filled
- Message preview
- API integration (logMessageHistory, SMS service)

---

## 📊 State Management (Zustand)

### **customerStore.js**
```javascript
{
  selectedCustomer: {},      // Current customer object
  qadAndams: [],            // List of QAD Andams
  invoices: [],             // List of invoices
  balance: 0,               // Customer balance
  loading: false,           // Loading state
  error: null,              // Error message

  // Methods:
  selectCustomer(customerId)      // Load customer data
  refreshCustomerData(customerId) // Refresh all customer data
  recordPayment(paymentData)      // Record payment
}
```

### **searchStore.js**
```javascript
{
  searchTerm: '',           // Current search term
  searchResults: [],        // Search results
  loading: false,           // Search loading state
  error: null,              // Error message

  // Methods:
  setSearchTerm(term)       // Set search term
  searchCustomer(term)      // Perform search
  clearSearch()             // Clear search results
}
```

### **invoiceStore.js**
```javascript
{
  invoices: [],            // List of invoices
  selectedInvoice: null,   // Current invoice
  loading: false,          // Loading state
  error: null,             // Error message

  // Methods:
  fetchInvoices()          // Load invoices
  selectInvoice(id)        // Select invoice
  createInvoice(data)      // Create new invoice
}
```

---

## 🔌 Services & API

### **api.js** (Axios Client)
**Base URL:** Configured dynamically via ServerSetupScreen  
**Authentication:** Bearer token from AsyncStorage

**Key Endpoints:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v1/customers` | Search customers (paginated) |
| POST | `/v1/customers` | Create new customer |
| GET | `/v1/customers/{id}` | Get customer details |
| GET | `/v1/customers/{id}/balance` | Get customer balance |
| GET | `/v1/qad-andam/customer/{id}` | Get QAD Andams |
| POST | `/v1/qad-andam` | Create QAD Andam |
| POST | `/v1/qad-andam/invoice` | Create invoice |
| GET | `/v1/qad-andam/invoices/customer/{id}` | Get customer invoices |
| POST | `/v1/customers/payments` | Record payment |
| GET/POST | `/v1/messages` | SMS messaging |

### **smsService.js & nativeSmsService.js**
- SMS sending functionality
- Template support
- Message logging

### **errorHandler.js**
- Centralized error handling
- Error message formatting
- Toast notifications for errors

### **serverConfigService.js**
- Server configuration management
- URL validation
- Connection testing

---

## 🛠️ Tech Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | React Native | 0.81.4 |
| **Platform** | Expo | 54.0 |
| **React** | React | 19.1.0 |
| **State** | Zustand | 5.0.8 |
| **Form** | React Hook Form | 7.65.0 |
| **Validation** | Zod | 4.1.12 |
| **HTTP** | Axios | 1.12.2 |
| **Navigation** | React Navigation | 7.x |
| **Icons** | Lucide + Expo Icons | ^0.548 / ^15.0 |
| **Storage** | AsyncStorage | 1.24.0 |
| **Camera** | Expo Camera | 17.0.8 |
| **SMS** | Expo SMS | 14.0.7 |
| **Styling** | Custom (Material Design 3) | - |

---

## 📱 App Flow

```
┌─────────────────┐
│   App Starts    │
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│ Check Setup Status   │
│ Initialize API       │
└────────┬─────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
[Setup?]  [Configured]
    │          │
    ▼          ▼
┌──────────┐ ┌────────────────┐
│ Setup    │ │ SearchScreen   │
│ Screen   │ │ (Main/Home)    │
└────┬─────┘ └────────┬───────┘
     │                │
     └────────┬───────┘
              │
              ▼
    ┌───────────────────┐
    │ Customer Selected │
    └────────┬──────────┘
             │
             ▼
    ┌─────────────────────┐
    │ CustomerDetails     │
    │ Screen              │
    └────────┬────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌──────────┐   ┌────────────┐
│ Create   │   │ Add/View   │
│ Invoice  │   │ QAD Andam  │
└──────────┘   └────────────┘
```

---

## 🚀 Key Features by Screen

| Screen | Features |
|--------|----------|
| **Search** | 🔍 Real-time search, 📱 Barcode scan, ➕ Add customer, 💬 Send SMS, 📂 Customer list |
| **Details** | 👤 Customer profile, 📋 QAD Andam list, 💰 Invoices, 💳 Record payment, ⚖️ Balance |
| **Invoice** | 📝 Create invoice, 🧮 Auto-calc, 📊 Line items, ✅ Submission, 🔗 Linked data |
| **Setup** | ⚙️ Server config, 🔗 URL input, 🧪 Connection test, 💾 Save config |

---

## 📝 File Summary

**Total Files:** 40+

| Category | Files | Purpose |
|----------|-------|---------|
| Screens | 5 | User interface views |
| UI Components | 9 | Reusable UI elements |
| Business Components | 8 | Domain-specific components |
| Theme | 3 | Design system |
| Store | 3 | State management |
| Services | 5 | API & business logic |
| Utils | 5 | Helper functions |
| Config | 5 | App configuration |

---

## 🎯 Development Notes

- **No External UI Library:** App uses custom Modern Design components instead of native-base
- **Material Design 3 Compliant:** Colors, typography, spacing follow MD3 standards
- **Responsive Layout:** Components use flex and spacing scales for all devices
- **Tailor Business:** App is specifically built for tailor shops (QAD Andam = custom garment)
- **Rtl-Ready:** Structure supports right-to-left languages (Arabic UI visible)
- **Type-Safe:** TypeScript support with expo-env.d.ts