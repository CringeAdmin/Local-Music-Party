# Local Music Party — Landing Page

---
## Запуск локально

### Вариант 1 — Docker
```bash
docker compose up --build
```
Сайт откроется на [http://localhost:8080](http://localhost:8080)


### Вариант 2 — любой статический сервер
```bash
# Python
python3 -m http.server 8080
# Node.js (npx)
npx serve .
```

---

## Просмотр заявок из формы
В Supabase Dashboard → **Table Editor → contact_submissions**  
Все поля: `id`, `name`, `contact`, `message`, `created_at`
