# Выступление KZ Travel: 4 минуты 45 секунд

Группа SE-2501. Все три участника говорят и показывают свою часть. Текст ниже - основа для репетиции, а не обещание точной длительности без тренировки. Включите секундомер, заранее откройте сайт, DevTools с размерами устройств и резервные скриншоты. На презентации не редактируйте код: финальная инструкция просит показывать готовую версию.

## 0:00-0:30 - Ramazan, слайд 1

“Hello. We are KZ Travel from SE-2501: Ramazan Utegen, Ziyadinkhan Kudaibergenuly and Ruzimuhammad. Our project is a travel guide to Kazakhstan. It helps first-time visitors and students compare destinations, plan a short route and check the weather before travelling.”

Покажите главную. Не тратьте время на прокрутку всей страницы.

## 0:30-1:15 - Ramazan, слайд 2

“We continued the same team project. The final website has nine connected pages: six travel and team pages, plus signup, login and profile. The design uses our original photographs, consistent typography and a shared colour palette. Bootstrap, Flexbox and Grid let the layout adapt to desktop, tablet and phone. Light and dark modes share the same layout, and the choice stays saved when we move between pages.”

Откройте размеры 1440, 1024 и 390 px, покажите меню на телефоне. Переключите тему и перейдите на страницу города. После этого верните обычный размер.

## 1:15-2:05 - Ziyadinkhan, слайд 3

“The travel notebook demonstrates local authentication without a backend. Signup saves a name, email, phone number and a salted password verifier on this browser. Login checks the credentials and opens the profile. The profile shows the saved user details and links to cities saved on the browser. Reloading keeps the session. Logout removes it, and opening Profile without a session returns to Login. This is a teaching simulation, not a production authentication service.”

Зарегистрируйте заранее отрепетированные тестовые данные. Затем войдите и покажите имя/email/телефон. Не раскрывайте и не используйте реальный личный пароль.

## 2:05-2:45 - Ziyadinkhan, слайд 4

“Validation is implemented in JavaScript. The forms use novalidate and do not depend on native required, pattern or length constraints. We check empty fields, email format, phone digits, password length and complexity, and matching confirmation. Errors appear next to the fields. During processing, the submit button and validated fields are disabled to prevent repeated submission or changing data after validation.”

Покажите заранее открытый signup с неправильным email, коротким телефоном и слабым паролем; затем исправьте их. Не проходите регистрацию второй раз целиком. Для вопросов откройте `js/validation.js`.

## 2:45-3:35 - Ruzimuhammad, слайд 5

“Discovery combines live search with category filters. jQuery updates cards as we type, shows keyboard suggestions and highlights matches safely. Hearts save destinations locally, so the same saved guide appears in the profile. Our route planner validates the destination, traveller name and number of days, then builds a short itinerary. The route can be copied to the clipboard, with a confirmation message. We also retain galleries, ratings and optional sound.”

Найдите Almaty, покажите фильтр, сохраните город. Пройдите планировщик с одним именем, создайте маршрут на три дня и нажмите Copy. Покажите ненавязчивый hover или уведомление, не останавливаясь на каждой анимации.

## 3:35-4:20 - Ruzimuhammad, слайд 6

“The public Open-Meteo API fits the travel topic. It supplies current conditions and a three-day outlook for Aktau, Astana, Almaty and Shymkent. Fetch and async/await retrieve JSON without freezing the interface. The page shows loading, success and retry states. A short local cache reduces repeated requests. If an update fails, a dated saved forecast can be shown, while an unavailable forecast is never replaced with invented data.”

Покажите настоящий прогноз и смените город. Если сеть не работает, используйте `screenshots/weather-real.png` или резервный слайд. Не выдавайте тестовые данные за текущий прогноз.

## 4:20-4:45 - Ramazan, слайд 7

“KZ Travel combines a complete city guide with useful planning features in one consistent interface. We tested the final version on desktop, tablet and mobile, including login, validation and API failure states. Future work would add a real backend, secure server accounts and personalised saved routes. Thank you. The live website and repository links are included in our submission.”

Завершите на слайде со ссылками. Цель - 4:30-5:00. При репетиции сокращайте переходы, а не необходимые демонстрации. Не превышайте пять минут.

## Перед выходом

- У каждого участника есть ZIP, PDF и TXT; каждый загружает их отдельно в Final Exam Folder.
- Прогноз может меняться. Проверяйте сервис перед выступлением, держите скриншоты под рукой.
- Заранее очистите только тестовую учётную запись/тестовый профиль браузера, а не весь Local Storage общего браузера.
- Соль и хеш можно показать в DevTools как структуру, но исходный пароль хранить или выводить не нужно.
- Данные для репетиции: Demo Traveller, demo.traveller@example.com, +7 777 123 45 67. Выберите собственный одноразовый учебный пароль по показанным правилам.
