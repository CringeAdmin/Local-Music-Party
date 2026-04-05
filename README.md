# Local Music Party — Landing Page

---
## Хостинг на верселе:
### https://local-music-party.vercel.app/#

---
## Рабочий проект фронтендеров в Figma:
### https://www.figma.com/design/c1D4TIc4nVHSiGPmswpkwj/%D0%90%D0%B4%D0%BC%D0%B8%D0%BD%D0%BA%D0%B0_4-%D0%BA%D1%83%D1%80%D1%81-%D0%9F%D0%A0%D0%9E%D0%95%D0%9A%D0%A2?node-id=453-1167&t=bQ4CiR530GqnirRe-0

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
