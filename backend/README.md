# Dautari Adda Backend API

Production-ready FastAPI backend for the Dautari Adda Restaurant Management System.

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point (runnable directly)
│   ├── config.py            # Application configuration
│   ├── database.py          # Database setup and session management
│   ├── schemas.py           # Pydantic schemas for validation
│   ├── dependencies.py      # Authentication and authorization dependencies
│   ├── models/              # Database models organized by domain
│   │   ├── __init__.py      # Exports all models
│   │   ├── auth.py          # User authentication models
│   │   ├── customers.py     # Customer models
│   │   ├── menu.py          # Menu-related models (Category, MenuGroup, MenuItem)
│   │   ├── inventory.py     # Inventory models (Product, Unit, Transaction, BOM, Production)
│   │   ├── orders.py        # Order models (Order, OrderItem, KOT, Table, Session)
│   │   ├── purchase.py      # Purchase models (Supplier, PurchaseBill, PurchaseReturn)
│   │   └── delivery.py      # Delivery partner models
│   ├── services/            # Business logic services
│   │   ├── __init__.py      # Exports all services
│   │   ├── auth_service.py      # Authentication operations
│   │   ├── customer_service.py   # Customer operations
│   │   ├── menu_service.py      # Menu operations
│   │   ├── inventory_service.py  # Inventory operations
│   │   ├── order_service.py     # Order operations
│   │   ├── purchase_service.py   # Purchase operations
│   │   └── report_service.py    # Report generation
│   ├── api/                 # API routes
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py      # API router aggregation
│   │       ├── auth.py          # Authentication routes
│   │       ├── users.py         # User management routes
│   │       ├── customers.py     # Customer management routes
│   │       ├── menu.py          # Menu management routes
│   │       ├── inventory.py     # Inventory management routes
│   │       ├── purchase.py      # Purchase management routes
│   │       ├── orders.py        # Order management routes
│   │       ├── reports.py       # Reports and export routes
│   │       └── delivery.py      # Delivery partner routes
│   └── utils/               # Utility functions
│       ├── __init__.py
│       ├── pdf_generator.py     # PDF generation utilities
│       └── excel_generator.py   # Excel generation utilities
├── start_server.sh          # Linux/Mac startup script
├── start_server.bat         # Windows startup script
├── requirements.txt          # Python dependencies
├── .env                      # Environment variables
└── README.md                # This file
```

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables in `.env`:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/dautari_adda
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

3. Run the application:

**Option 1: Using the startup scripts**
```bash
# Linux/Mac
./start_server.sh

# Windows
start_server.bat
```

**Option 2: Run main.py directly**
```bash
python -m app.main
```

**Option 3: Using uvicorn directly**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Features

- **Modular Architecture**: Organized by domain (auth, users, customers, menu, etc.)
- **Production Ready**: Proper error handling, validation, and security
- **Type Safety**: Pydantic schemas for request/response validation
- **Database Models**: SQLAlchemy ORM models
- **Authentication**: JWT-based authentication with role-based access control
- **PDF/Excel Export**: Report generation utilities
- **Easy Debugging**: Clear separation of concerns makes debugging easier

## Development

The codebase is organized by domain for better maintainability:

### Models (`app/models/`)
Models are organized by domain:
- `auth.py` - User authentication and authorization
- `customers.py` - Customer management
- `menu.py` - Menu categories, groups, and items
- `inventory.py` - Products, units, transactions, BOM, production
- `orders.py` - Orders, order items, KOTs, tables, sessions
- `purchase.py` - Suppliers, purchase bills, returns
- `delivery.py` - Delivery partners

### Services (`app/services/`)
Business logic is separated into service classes:
- Each service handles operations for its domain
- Services can be reused across different API routes
- Makes testing and maintenance easier

### API Routes (`app/api/v1/`)
- Each route file handles HTTP requests for its domain
- Routes use services for business logic
- Clear separation between HTTP layer and business logic

### Utilities (`app/utils/`)
- Reusable utility functions (PDF/Excel generation, etc.)

This structure makes it easy to:
- Find and fix bugs (code is organized by domain)
- Add new features (clear separation of concerns)
- Test individual components (services can be tested independently)
- Maintain and scale the codebase (modular architecture)
