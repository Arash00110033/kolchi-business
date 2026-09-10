# Kolchi Business Audit Report

- Generated: 2026-09-09 21:05:26
- Root: frontend-next
- Branch: master
- Last commit: 9b5fd94 test: align catalog and order API tests

## Summary

| Metric | Value |
|---|---:|
| PASS | 73 |
| WARN | 18 |
| FAIL | 0 |
| BLOCKER | 0 |
| INFO | 1 |
| TOTAL | 92 |
| Verified Audit Score | 79% |
| Production Readiness | 42% |

## Codebase

- Backend files: 86
- Backend lines: 3566
- Frontend files: 50
- Frontend lines: 4976
- Total active files: 136
- Total active lines: 8542

## Security

- Static security maturity: 100%
- Hardening readiness: 0%

## Features

- Feature coverage: 17%

## Results

| Area | Check | Status | Message |
|---|---|---|---|
| STRUCTURE | Backend | PASS | backend/ exists |
| STRUCTURE | Next.js frontend | PASS | frontend-next/ exists |
| STRUCTURE | Legacy frontend | PASS | Old frontend/ directory removed |
| SIZE | Active codebase inventory | PASS | 136 active files / 8542 active lines |
| GIT | Branch | PASS | master |
| GIT | Last commit | PASS | 9b5fd94 test: align catalog and order API tests |
| GIT | Working tree | PASS | Working tree clean |
| NEXT.JS | package.json | PASS | package.json detected |
| NEXT.JS | package-lock | PASS | package-lock.json detected |
| NEXT.JS | Next config | PASS | next.config.mjs detected |
| NEXT.JS | JavaScript config | PASS | jsconfig.json detected |
| NEXT.JS | Pages Router | PASS | src/pages exists |
| NEXT.JS | Components | PASS | src/components exists |
| NEXT.JS | Services | PASS | src/services exists |
| NEXT.JS | Styles | PASS | src/styles exists |
| DJANGO | manage.py | PASS | backend/manage.py exists |
| DJANGO | settings.py | PASS | backend/config/settings.py exists |
| DJANGO | requirements.txt | PASS | requirements.txt exists |
| DJANGO | core app | PASS | backend/apps/core exists |
| DJANGO | users app | PASS | backend/apps/users exists |
| DJANGO | catalog app | PASS | backend/apps/catalog exists |
| DJANGO | cart app | PASS | backend/apps/cart exists |
| DJANGO | inventory app | PASS | backend/apps/inventory exists |
| DJANGO | orders app | PASS | backend/apps/orders exists |
| DJANGO | payments app | PASS | backend/apps/payments exists |
| DJANGO | manage.py check | PASS | Django system check passed |
| DJANGO | Migration state | PASS | All migrations applied; no pending operations |
| INFRA | Docker Compose | PASS | backend/docker-compose.yml detected |
| INFRA | Backend Dockerfile | WARN | backend/Dockerfile not found |
| INFRA | PostgreSQL configuration | PASS | PostgreSQL reference detected in Compose |
| INFRA | Docker engine | PASS | Docker version 29.6.2, build dfc4efb |
| INFRA | PostgreSQL container | PASS | kolchi-postgres\|Up 8 days (healthy) |
| API | Route resolution | PASS | 20 API routes resolved from Django URL resolver |
| API | api/v1/health/ | PASS | api/v1/health/\|health-check\|function\|GET |
| API | api/v1/categories/ | PASS | api/v1/categories/\|category-list\|CategoryListAPIView\|GET,OPTIONS |
| API | api/v1/products/ | PASS | api/v1/products/\|product-list\|ProductListAPIView\|GET,OPTIONS api/v1/products/<slug:slug>/\|product-detail\|ProductDetailAPIView\|GET,OPTIONS |
| API | api/v1/products/<slug:slug>/ | PASS | api/v1/products/<slug:slug>/\|product-detail\|ProductDetailAPIView\|GET,OPTIONS |
| API | api/v1/auth/register/ | PASS | api/v1/auth/register/\|auth-register\|RegisterAPIView\|POST,OPTIONS |
| API | api/v1/auth/login/ | PASS | api/v1/auth/login/\|auth-login\|LoginAPIView\|POST,OPTIONS |
| API | api/v1/auth/logout/ | PASS | api/v1/auth/logout/\|auth-logout\|LogoutAPIView\|POST,OPTIONS |
| API | api/v1/auth/refresh/ | PASS | api/v1/auth/refresh/\|auth-refresh\|RefreshTokenAPIView\|POST,OPTIONS |
| API | api/v1/auth/me/ | PASS | api/v1/auth/me/\|auth-me\|MeAPIView\|GET,OPTIONS |
| API | api/v1/cart/ | PASS | api/v1/cart/\|cart-detail\|CartAPIView\|GET,OPTIONS api/v1/cart/clear/\|cart-clear\|CartClearAPIView\|DELETE,OPTIONS api/v1/cart/items/\|cart-item-create\|CartItemCreateAPIView\|POST,OPTIONS api/v1/cart/items/<int:item_id>/delete/\|cart-item-delete\|CartItemDeleteAPIView\|DELETE,OPTIONS api/v1/cart/items/<int:item_id>/\|cart-item-update\|CartItemUpdateAPIView\|PATCH,OPTIONS |
| API | api/v1/cart/clear/ | PASS | api/v1/cart/clear/\|cart-clear\|CartClearAPIView\|DELETE,OPTIONS |
| API | api/v1/cart/items/ | PASS | api/v1/cart/items/\|cart-item-create\|CartItemCreateAPIView\|POST,OPTIONS api/v1/cart/items/<int:item_id>/delete/\|cart-item-delete\|CartItemDeleteAPIView\|DELETE,OPTIONS api/v1/cart/items/<int:item_id>/\|cart-item-update\|CartItemUpdateAPIView\|PATCH,OPTIONS |
| API | api/v1/cart/items/<int:item_id>/delete/ | PASS | api/v1/cart/items/<int:item_id>/delete/\|cart-item-delete\|CartItemDeleteAPIView\|DELETE,OPTIONS |
| API | api/v1/cart/items/<int:item_id>/ | PASS | api/v1/cart/items/<int:item_id>/delete/\|cart-item-delete\|CartItemDeleteAPIView\|DELETE,OPTIONS api/v1/cart/items/<int:item_id>/\|cart-item-update\|CartItemUpdateAPIView\|PATCH,OPTIONS |
| API | api/v1/orders/ | PASS | api/v1/orders/\|order-list-create\|OrderListCreateAPIView\|GET,POST,OPTIONS api/v1/orders/<int:pk>/\|order-detail\|OrderDetailAPIView\|GET,OPTIONS |
| API | api/v1/orders/<int:pk>/ | PASS | api/v1/orders/<int:pk>/\|order-detail\|OrderDetailAPIView\|GET,OPTIONS |
| API | Payments routing | PASS | api/v1/payments/\|payment-list-create\|PaymentListCreateAPIView\|GET,POST,OPTIONS |
| API | Inventory routing | WARN | No inventory API route currently registered |
| API | HTTP method mapping | PASS | Resolved API views have detected HTTP handlers |
| RUNTIME | Health | PASS | HTTP 200, response size 67 bytes |
| RUNTIME | Categories | PASS | HTTP 200, response size 430 bytes |
| RUNTIME | Products | PASS | HTTP 200, response size 3657 bytes |
| FRONTEND | Service layer | PASS | 8 frontend service file(s) detected |
| FRONTEND | fetch usage | PASS | fetch() detected in 1 file(s) |
| FRONTEND | Axios usage | PASS | No Axios usage detected |
| FRONTEND | API client | PASS | Central API client detected |
| CONTRACT | Frontend endpoint references | PASS | 11 endpoint reference(s) detected |
| SECURITY | Root gitignore | PASS | .gitignore exists |
| SECURITY | Backend env ignored | PASS | backend/.env is referenced in .gitignore |
| SECURITY | Frontend env ignored | PASS | frontend-next/.env is referenced in .gitignore |
| SECURITY | SECRET_KEY configuration | PASS | SECRET_KEY configuration detected |
| SECURITY | DEBUG configuration | PASS | DEBUG configuration detected |
| SECURITY | ALLOWED_HOSTS | PASS | ALLOWED_HOSTS configuration detected |
| SECURITY | CORS configuration | PASS | CORS configuration detected |
| SECURITY | CSRF configuration | PASS | CSRF configuration detected |
| SECURITY | JWT/authentication app | PASS | Users/authentication module exists |
| SECURITY | Local backend env | WARN | backend/.env exists locally; it must remain untracked |
| TESTS | Test inventory | WARN | No test/spec files detected |
| BUILD | Next.js production build | WARN | package.json not found |
| CI/CD | GitHub Actions | WARN | .github/workflows not found |
| MONITORING | Monitoring directory | WARN | monitoring/ not found |
| MONITORING | Health endpoint implementation | WARN | Health-check implementation not statically detected |
| DOCS | Root README | PASS | README.md exists |
| DOCS | Frontend README | INFO | Frontend README not found |
| DOCS | Documentation directory | WARN | docs/ not found |
| HARDENING | Env secrets | WARN | Production hardening indicator not detected |
| HARDENING | DEBUG config | WARN | Production hardening indicator not detected |
| HARDENING | Allowed hosts | WARN | Production hardening indicator not detected |
| HARDENING | CORS | WARN | Production hardening indicator not detected |
| HARDENING | CSRF | WARN | Production hardening indicator not detected |
| HARDENING | JWT/Auth | WARN | Production hardening indicator not detected |
| HARDENING | Production config | WARN | Production hardening indicator not detected |
| HARDENING | Rate limiting | WARN | Production hardening indicator not detected |
| HARDENING | Security headers | WARN | Production hardening indicator not detected |
| WORKFLOW | Catalog | PASS | Required API surface detected |
| WORKFLOW | Authentication | PASS | Required API surface detected |
| WORKFLOW | Cart | PASS | Required API surface detected |
| WORKFLOW | Orders | PASS | Required API surface detected |
| WORKFLOW | Payments | PASS | Required API surface detected |
| FINAL | Critical issues | PASS | No BLOCKER or FAIL result detected |
