import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db, initSchema } from './database';

async function main() {
  await initSchema();

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  await db.batch(
    [
      'DELETE FROM reservations',
      'DELETE FROM events',
      'DELETE FROM users',
      "DELETE FROM sqlite_sequence WHERE name IN ('users','events','reservations')",
    ],
    'write'
  );

  const PASSWORD = 'demo1234';
  const pwHash = hash(PASSWORD);

  const organizers = [
    { email: 'organizer@demo.bg',           name: 'Организатор Демо' },
    { email: 'maria.popova@artsofia.bg',    name: 'Мария Попова' },
    { email: 'ivan.dimitrov@techbg.bg',     name: 'Иван Димитров' },
    { email: 'elena.todorova@sportbg.bg',   name: 'Елена Тодорова' },
  ];

  const users = [
    { email: 'user@demo.bg',                 name: 'Потребител Демо' },
    { email: 'georgi.petrov@gmail.com',      name: 'Георги Петров' },
    { email: 'ana.kovacheva@gmail.com',      name: 'Анна Ковачева' },
    { email: 'nikolay.stoyanov@abv.bg',      name: 'Николай Стоянов' },
    { email: 'svetla.angelova@gmail.com',    name: 'Светла Ангелова' },
    { email: 'petar.iliev@yahoo.com',        name: 'Петър Илиев' },
    { email: 'tsvetelina.geneva@abv.bg',     name: 'Цветелина Генева' },
    { email: 'dimitar.kostov@gmail.com',     name: 'Димитър Костов' },
  ];

  const organizerIds: Record<string, number> = {};
  for (const o of organizers) {
    const r = await db.execute({
      sql: 'INSERT INTO users (email, password_hash, full_name, role) VALUES (?,?,?,?)',
      args: [o.email, pwHash, o.name, 'organizer'],
    });
    organizerIds[o.email] = Number(r.lastInsertRowid);
  }
  const userIds: Record<string, number> = {};
  for (const u of users) {
    const r = await db.execute({
      sql: 'INSERT INTO users (email, password_hash, full_name, role) VALUES (?,?,?,?)',
      args: [u.email, pwHash, u.name, 'user'],
    });
    userIds[u.email] = Number(r.lastInsertRowid);
  }

  const now = new Date();
  const at = (days: number, hour = 19, minute = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };

  type EventSeed = {
    organizerEmail: string;
    title: string;
    description: string;
    location: string;
    startAt: string;
    capacity: number;
    status?: 'active' | 'cancelled';
  };

  // лято 2026 - събитията на открито, по морето и в планината
  const events: EventSeed[] = [
    // Elena Todorova - спорт на открито
    {
      organizerEmail: 'elena.todorova@sportbg.bg',
      title: 'Йога на плажа при изгрев',
      description: 'Сутрешна сесия на пясъка преди жегата. Подходяща за всички нива.',
      location: 'Плаж Слънчев бряг',
      startAt: at(2, 7, 0),
      capacity: 50,
    },
    // Maria Popova - култура на открито
    {
      organizerEmail: 'maria.popova@artsofia.bg',
      title: 'Лято на открито: Симфоничен концерт',
      description: 'Класика под звездите. София Филхармония в парка на НДК.',
      location: 'Парк пред НДК, София',
      startAt: at(3, 20, 30),
      capacity: 1200,
    },
    // Ivan Dimitrov - технологии
    {
      organizerEmail: 'ivan.dimitrov@techbg.bg',
      title: 'Rooftop Tech Meetup: Лято edition',
      description: 'Кратки доклади, студена бира и нетуъркинг на покрив с гледка.',
      location: 'Betahaus рууфтоп, София',
      startAt: at(5, 19, 0),
      capacity: 90,
    },
    // Elena Todorova - планина
    {
      organizerEmail: 'elena.todorova@sportbg.bg',
      title: 'Изгрев на Черни връх',
      description: 'Нощен преход до върха на Витоша, за да посрещнем изгрева.',
      location: 'Витоша, старт от Алеко',
      startAt: at(7, 4, 0),
      capacity: 60,
    },
    // Maria Popova - фестивал
    {
      organizerEmail: 'maria.popova@artsofia.bg',
      title: 'A to JazZ фестивал 2026',
      description: 'Три вечери с български и международни джаз имена. Вход свободен.',
      location: 'Южен парк, София',
      startAt: at(10, 18, 0),
      capacity: 5000,
    },
    // Ivan Dimitrov - уъркшоп
    {
      organizerEmail: 'ivan.dimitrov@techbg.bg',
      title: 'Уъркшоп: React Native за начинаещи',
      description: 'Практическа сесия - мобилно приложение от нулата за един ден.',
      location: 'SoftUni кампус, София',
      startAt: at(14, 10, 0),
      capacity: 45,
    },
    // Elena Todorova - плаж
    {
      organizerEmail: 'elena.todorova@sportbg.bg',
      title: 'Турнир по плажен волейбол',
      description: 'Аматьорски турнир 2x2 на плажа. Награди за първите три отбора.',
      location: 'Централен плаж, Бургас',
      startAt: at(21, 9, 0),
      capacity: 128,
    },
    // Maria Popova - кино на открито
    {
      organizerEmail: 'maria.popova@artsofia.bg',
      title: 'Кино на открито: "Малкият принц"',
      description: 'Прожекция под звездите. Донесете си одеяло и стол.',
      location: 'Летен театър, Пловдив',
      startAt: at(28, 21, 0),
      capacity: 300,
    },
    // Ivan Dimitrov - хакатон
    {
      organizerEmail: 'ivan.dimitrov@techbg.bg',
      title: 'Летен Hack Camp 2026',
      description: 'Двудневен хакатон край морето. Кодим до залез, къмпинг вечер.',
      location: 'Кампус край Созопол',
      startAt: at(45, 9, 30),
      capacity: 120,
    },
    // Demo organizer - фестивал на морето
    {
      organizerEmail: 'organizer@demo.bg',
      title: 'Фестивал на морето Варна',
      description: 'Улична храна, крафт бира и живо изпълнение на плажа.',
      location: 'Морска градина, Варна',
      startAt: at(60, 18, 0),
      capacity: 1500,
    },
    // Past event - отминало
    {
      organizerEmail: 'maria.popova@artsofia.bg',
      title: 'Лятно откриване: Соул вечер',
      description: 'Концерт на открито в началото на сезона.',
      location: 'Летен театър, Варна',
      startAt: at(-14, 20, 0),
      capacity: 700,
    },
    // Cancelled event
    {
      organizerEmail: 'organizer@demo.bg',
      title: 'Drone шоу над езерото',
      description: 'Отменено поради ограничения за въздушното пространство.',
      location: 'Панчаревско езеро',
      startAt: at(30, 21, 0),
      capacity: 800,
      status: 'cancelled',
    },
  ];

  const eventIds: number[] = [];
  for (const e of events) {
    const r = await db.execute({
      sql: `INSERT INTO events (organizer_id, title, description, location, start_at, capacity, status)
            VALUES (?,?,?,?,?,?,?)`,
      args: [
        organizerIds[e.organizerEmail],
        e.title,
        e.description,
        e.location,
        e.startAt,
        e.capacity,
        e.status ?? 'active',
      ],
    });
    eventIds.push(Number(r.lastInsertRowid));
  }

  const reserve = async (
    eventIdx: number,
    userEmail: string,
    seats = 1,
    status: 'confirmed' | 'cancelled' = 'confirmed'
  ) => {
    await db.execute({
      sql: 'INSERT INTO reservations (event_id, user_id, seats, status) VALUES (?,?,?,?)',
      args: [eventIds[eventIdx], userIds[userEmail], seats, status],
    });
  };

  // 0 - Йога на плажа
  await reserve(0, 'svetla.angelova@gmail.com', 1);
  await reserve(0, 'ana.kovacheva@gmail.com', 2);
  await reserve(0, 'user@demo.bg', 1);

  // 1 - Симфоничен концерт на открито
  await reserve(1, 'user@demo.bg', 2);
  await reserve(1, 'georgi.petrov@gmail.com', 1);
  await reserve(1, 'ana.kovacheva@gmail.com', 4);
  await reserve(1, 'nikolay.stoyanov@abv.bg', 2);
  await reserve(1, 'tsvetelina.geneva@abv.bg', 1, 'cancelled');

  // 2 - Rooftop Tech Meetup
  await reserve(2, 'georgi.petrov@gmail.com', 1);
  await reserve(2, 'nikolay.stoyanov@abv.bg', 1);
  await reserve(2, 'user@demo.bg', 1);

  // 3 - Изгрев на Черни връх
  await reserve(3, 'petar.iliev@yahoo.com', 1);
  await reserve(3, 'tsvetelina.geneva@abv.bg', 1);
  await reserve(3, 'dimitar.kostov@gmail.com', 1);

  // 4 - A to JazZ фестивал
  await reserve(4, 'user@demo.bg', 3);
  await reserve(4, 'georgi.petrov@gmail.com', 2);
  await reserve(4, 'svetla.angelova@gmail.com', 2);
  await reserve(4, 'ana.kovacheva@gmail.com', 1);

  // 5 - React Native уъркшоп
  await reserve(5, 'user@demo.bg', 1);
  await reserve(5, 'georgi.petrov@gmail.com', 1);
  await reserve(5, 'nikolay.stoyanov@abv.bg', 1);
  await reserve(5, 'petar.iliev@yahoo.com', 1);
  await reserve(5, 'dimitar.kostov@gmail.com', 1);

  // 6 - Плажен волейбол
  await reserve(6, 'petar.iliev@yahoo.com', 2);
  await reserve(6, 'dimitar.kostov@gmail.com', 2);
  await reserve(6, 'nikolay.stoyanov@abv.bg', 4);

  // 7 - Кино на открито
  await reserve(7, 'tsvetelina.geneva@abv.bg', 2);
  await reserve(7, 'svetla.angelova@gmail.com', 2);
  await reserve(7, 'user@demo.bg', 2);

  // 8 - Летен Hack Camp
  await reserve(8, 'georgi.petrov@gmail.com', 1);
  await reserve(8, 'ana.kovacheva@gmail.com', 1);
  await reserve(8, 'dimitar.kostov@gmail.com', 1);

  // 9 - Фестивал на морето Варна
  await reserve(9, 'user@demo.bg', 2);
  await reserve(9, 'georgi.petrov@gmail.com', 3);
  await reserve(9, 'tsvetelina.geneva@abv.bg', 4);

  // 10 - Лятно откриване (минало)
  await reserve(10, 'user@demo.bg', 2);
  await reserve(10, 'svetla.angelova@gmail.com', 1);

  console.log('✅ Seed готов:');
  console.log('');
  console.log('=== Организатори ===');
  for (const o of organizers) console.log(`   ${o.email}  /  ${PASSWORD}   (${o.name})`);
  console.log('');
  console.log('=== Потребители ===');
  for (const u of users) console.log(`   ${u.email}  /  ${PASSWORD}   (${u.name})`);
  console.log('');
  console.log(`📅  ${events.length} събития (${events.filter(e => e.status === 'cancelled').length} отменени, 1 минало)`);
  const total = await db.execute('SELECT COUNT(*) as c FROM reservations');
  console.log(`🎟️   ${Number(total.rows[0].c)} резервации`);
  console.log('');
  console.log('🔑  Всички пароли са: ' + PASSWORD);
  console.log('📄  Виж TEST_ACCOUNTS.md в gatherly-backend/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
