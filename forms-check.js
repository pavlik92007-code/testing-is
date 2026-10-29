const BASE = process.argv[2] || 'http://localhost:3000';
const suffix = String(Date.now()).slice(-7);
const okUser = { login: 'tester' + suffix, password: 'Test12345', email: 'tester@mail.ru', phone: '+79001234567' };

async function post(url, body, raw) {
  const res = await fetch(BASE + url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: raw !== undefined ? raw : JSON.stringify(body),
  });
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  return { status: res.status, data };
}

const reg = (patch) => post('/api/register', { ...okUser, login: 'u' + Math.random().toString(36).slice(2, 10), ...patch });

const cases = [
  ['R-01', 'Все поля верны', () => post('/api/register', okUser), 201],
  ['R-02', 'Логин из 2 символов', () => reg({ login: 'ab' }), 422],
  ['R-03', 'Логин из 3 символов (граница)', () => reg({ login: 'abc' + suffix.slice(0, 2) }), 201],
  ['R-04', 'Логин кириллицей', () => reg({ login: 'Ярослав' }), 422],
  ['R-05', 'Логин с пробелом', () => reg({ login: 'ab cd' }), 422],
  ['R-06', 'Логин 21 символ (больше границы)', () => reg({ login: 'a'.repeat(21) }), 422],
  ['R-07', 'Логин с тегом <script>', () => reg({ login: '<script>' }), 422],
  ['R-08', 'Логин уже занят', () => post('/api/register', okUser), 422],
  ['R-09', 'Тот же логин другим регистром', () => post('/api/register', { ...okUser, login: okUser.login.toUpperCase() }), 422],
  ['R-10', 'Email без символа @', () => reg({ email: 'tester.mail.ru' }), 422],
  ['R-11', 'Email без домена верхнего уровня (a@b)', () => reg({ email: 'a@b' }), 422],
  ['R-12', 'Телефон из 5 цифр', () => reg({ phone: '+79001' }), 422],
  ['R-13', 'Телефон с буквами', () => reg({ phone: '+7900abcdefg' }), 422],
  ['R-14', 'Телефон с пробелами и дефисами', () => reg({ phone: '+7 900 123-45-67' }), 201],
  ['R-15', 'Пароль 7 символов', () => reg({ password: '1234567' }), 422],
  ['R-16', 'Пароль 8 символов (граница)', () => reg({ password: '12345678' }), 201],
  ['R-17', 'Пароль из 8 пробелов', () => reg({ password: '        ' }), 422],
  ['R-18', 'Пароль 73 символа', () => reg({ password: 'a'.repeat(73) }), 422],
  ['R-19', 'Все поля пустые', () => post('/api/register', {}), 422],
  ['A-01', 'Верный логин и пароль', () => post('/api/login', { login: okUser.login, password: okUser.password }), 200],
  ['A-02', 'Верный логин, неверный пароль', () => post('/api/login', { login: okUser.login, password: 'wrongpass1' }), 401],
  ['A-03', 'Несуществующий логин', () => post('/api/login', { login: 'nobody_here', password: 'whatever12' }), 401],
  ['A-04', 'Пустые поля', () => post('/api/login', { login: '', password: '' }), 401],
  ['A-05', 'Логин в другом регистре', () => post('/api/login', { login: okUser.login.toUpperCase(), password: okUser.password }), 200],
  ['A-06', "SQL-инъекция в логине: ' OR '1'='1", () => post('/api/login', { login: "' OR '1'='1", password: "' OR '1'='1" }), 401],
  ['A-07', 'Тело запроса null', () => post('/api/login', null, 'null'), 401],
  ['A-08', 'Тело запроса не JSON', () => post('/api/login', null, 'login=admin'), 400],
];

(async () => {
  console.log('ID     Проверка                                           Ждали  Получили  Итог');
  let fail = 0;
  for (const [id, name, run, want] of cases) {
    const r = await run();
    const ok = r.status === want;
    if (!ok) fail++;
    console.log(`${id}  ${name.padEnd(50)} ${String(want).padEnd(6)} ${String(r.status).padEnd(9)} ${ok ? 'пройден' : 'НЕ ПРОЙДЕН'}`);
  }
  const burst = [];
  for (let i = 0; i < 10; i++) burst.push((await post('/api/login', { login: okUser.login, password: 'bad' + i })).status);
  const limited = burst.includes(429);
  if (!limited) fail++;
  console.log(`A-09  10 неверных паролей подряд, коды: ${burst.join(' ')}  ${limited ? 'пройден' : 'НЕ ПРОЙДЕН'}`);
  console.log(`Не пройдено: ${fail}`);
})();
