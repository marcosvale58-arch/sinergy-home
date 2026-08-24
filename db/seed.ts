import { db } from "./index";
import * as schema from "./schema";

async function seed() {
  console.log("🌱 Seeding database with Spanish localized data...");

  // 1. Clean existing records in reverse dependency order
  await db.delete(schema.screenTimeLogs);
  await db.delete(schema.chores);
  await db.delete(schema.calendarEvents);
  await db.delete(schema.goals);
  await db.delete(schema.inventoryItems);
  await db.delete(schema.investments);
  await db.delete(schema.distributionRules);
  await db.delete(schema.transactions);
  await db.delete(schema.session);
  await db.delete(schema.account);
  await db.delete(schema.user);
  await db.delete(schema.households);

  // 2. Household
  const [household] = await db
    .insert(schema.households)
    .values({
      id: "hh-1",
      name: "Mansión Sinergy",
      baseCurrency: "USD",
      createdAt: new Date("2026-01-15T12:00:00.000Z"),
    })
    .returning();

  console.log(`✅ Household created: ${household.name} (${household.id})`);

  // 3. Users
  const usersData = [
    {
      id: "u-1",
      name: "Juan Pérez",
      email: "juan@sinergy.home",
      emailVerified: true,
      role: "ADMIN",
      pointsBalance: 20,
      householdId: household.id,
      createdAt: new Date("2026-01-15T12:00:00.000Z"),
      updatedAt: new Date("2026-01-15T12:00:00.000Z"),
    },
    {
      id: "u-2",
      name: "María Pérez",
      email: "maria@sinergy.home",
      emailVerified: true,
      role: "ADMIN",
      pointsBalance: 50,
      householdId: household.id,
      createdAt: new Date("2026-01-15T12:00:00.000Z"),
      updatedAt: new Date("2026-01-15T12:00:00.000Z"),
    },
    {
      id: "u-3",
      name: "Emilia Pérez",
      email: "emilia@sinergy.home",
      emailVerified: true,
      role: "CHILD",
      pointsBalance: 350,
      householdId: household.id,
      createdAt: new Date("2026-01-15T12:00:00.000Z"),
      updatedAt: new Date("2026-01-15T12:00:00.000Z"),
    },
    {
      id: "u-4",
      name: "Leo Pérez",
      email: "leo@sinergy.home",
      emailVerified: true,
      role: "CHILD",
      pointsBalance: 120,
      householdId: household.id,
      createdAt: new Date("2026-01-15T12:00:00.000Z"),
      updatedAt: new Date("2026-01-15T12:00:00.000Z"),
    },
  ];

  await db.insert(schema.user).values(usersData);
  console.log(`✅ ${usersData.length} users created.`);

  // 4. Transactions
  const txData = [
    {
      id: "t-1",
      householdId: household.id,
      userId: "u-1",
      type: "INCOME",
      amount: "7500.00",
      baseAmount: "7500.00",
      originalAmount: "7500.00",
      originalCurrency: "USD",
      category: "Salario",
      date: new Date("2026-08-01T09:00:00.000Z"),
      notes: "Sueldo Principal Tech Corp",
      isRecurring: true,
      recurrenceInterval: "monthly",
    },
    {
      id: "t-2",
      householdId: household.id,
      userId: "u-2",
      type: "INCOME",
      amount: "5200.00",
      baseAmount: "5200.00",
      originalAmount: "5200.00",
      originalCurrency: "USD",
      category: "Salario",
      date: new Date("2026-08-02T10:00:00.000Z"),
      notes: "Factura Consultoría María",
      isRecurring: true,
      recurrenceInterval: "monthly",
    },
    {
      id: "t-3",
      householdId: household.id,
      userId: "u-1",
      type: "EXPENSE",
      amount: "2200.00",
      baseAmount: "2200.00",
      originalAmount: "2200.00",
      originalCurrency: "USD",
      category: "Vivienda",
      date: new Date("2026-08-03T12:00:00.000Z"),
      notes: "Pago Mensual de Hipoteca",
      isRecurring: true,
      recurrenceInterval: "monthly",
    },
    {
      id: "t-4",
      householdId: household.id,
      userId: "u-2",
      type: "EXPENSE",
      amount: "480.00",
      baseAmount: "480.00",
      originalAmount: "480.00",
      originalCurrency: "USD",
      category: "Servicios",
      date: new Date("2026-08-05T14:30:00.000Z"),
      notes: "Combo Electricidad, Gas y Agua",
      isRecurring: true,
      recurrenceInterval: "monthly",
    },
    {
      id: "t-5",
      householdId: household.id,
      userId: "u-1",
      type: "EXPENSE",
      amount: "650.00",
      baseAmount: "650.00",
      originalAmount: "650.00",
      originalCurrency: "USD",
      category: "Alimentos",
      date: new Date("2026-08-10T18:00:00.000Z"),
      notes: "Supermercado y Frutería Semanal",
      isRecurring: false,
    },
    {
      id: "t-6",
      householdId: household.id,
      userId: "u-1",
      type: "EXPENSE",
      amount: "120.00",
      baseAmount: "120.00",
      originalAmount: "120.00",
      originalCurrency: "USD",
      category: "Educación",
      date: new Date("2026-08-12T11:00:00.000Z"),
      notes: "Clases de Ballet Emilia",
      isRecurring: true,
      recurrenceInterval: "monthly",
    },
    {
      id: "t-7",
      householdId: household.id,
      userId: "u-2",
      type: "EXPENSE",
      amount: "15.99",
      baseAmount: "15.99",
      originalAmount: "15.99",
      originalCurrency: "USD",
      category: "Entretenimiento",
      date: new Date("2026-08-14T20:00:00.000Z"),
      notes: "Suscripción Familiar Netflix",
      isRecurring: true,
      recurrenceInterval: "monthly",
    },
    {
      id: "t-8",
      householdId: household.id,
      userId: "u-1",
      type: "EXPENSE",
      amount: "180.00",
      baseAmount: "180.00",
      originalAmount: "180.00",
      originalCurrency: "USD",
      category: "Salud",
      date: new Date("2026-08-15T15:00:00.000Z"),
      notes: "Consulta Odontológica Familiar",
      isRecurring: false,
    },
  ];
  await db.insert(schema.transactions).values(txData);
  console.log(`✅ ${txData.length} transactions created.`);

  // 5. Distribution Rules
  const rulesData = [
    { id: "dr-1", householdId: household.id, name: "Gastos y Necesidades", type: "PERCENTAGE", targetBucket: "Expenses", value: "50" },
    { id: "dr-2", householdId: household.id, name: "Inversión y Patrimonio", type: "PERCENTAGE", targetBucket: "Investment", value: "25" },
    { id: "dr-3", householdId: household.id, name: "Fondo de Emergencia / Ahorro", type: "PERCENTAGE", targetBucket: "Savings", value: "15" },
    { id: "dr-4", householdId: household.id, name: "Ocio y Gastos Personales", type: "PERCENTAGE", targetBucket: "Discretionary", value: "10" },
  ];
  await db.insert(schema.distributionRules).values(rulesData);
  console.log(`✅ ${rulesData.length} distribution rules created.`);

  // 6. Investments
  const investmentsData = [
    { id: "inv-1", householdId: household.id, assetName: "Vanguard S&P 500 ETF (VOO)", assetType: "Stocks", investedAmount: "45000.00", currentValue: "52400.00", expectedAnnualReturn: "9.50" },
    { id: "inv-2", householdId: household.id, assetName: "Apartamento en Alquiler Miami", assetType: "Real Estate", investedAmount: "30000.00", currentValue: "34500.00", expectedAnnualReturn: "7.20" },
    { id: "inv-3", householdId: household.id, assetName: "Billetera Bitcoin (BTC)", assetType: "Crypto", investedAmount: "15000.00", currentValue: "21200.00", expectedAnnualReturn: "18.00" },
    { id: "inv-4", householdId: household.id, assetName: "Cuenta de Alto Rendimiento (HYSA)", assetType: "Cash", investedAmount: "12000.00", currentValue: "12150.00", expectedAnnualReturn: "4.50" },
  ];
  await db.insert(schema.investments).values(investmentsData);
  console.log(`✅ ${investmentsData.length} investment holdings created.`);

  // 7. Inventory Items
  const inventoryData = [
    { id: "item-1", householdId: household.id, name: "Leche Entera Orgánica", category: "Pantry", currentQuantity: "1.00", minQuantity: "3.00", unit: "litros" },
    { id: "item-2", householdId: household.id, name: "Arroz Basmati", category: "Pantry", currentQuantity: "5.00", minQuantity: "2.00", unit: "kg" },
    { id: "item-3", householdId: household.id, name: "Cápsulas para Lavavajillas", category: "Cleaning", currentQuantity: "45.00", minQuantity: "15.00", unit: "cápsulas" },
    { id: "item-4", householdId: household.id, name: "Detergente de Lavandería", category: "Cleaning", currentQuantity: "0.50", minQuantity: "1.00", unit: "botellas" },
    { id: "item-5", householdId: household.id, name: "Papel Higiénico Premium", category: "Toiletries", currentQuantity: "12.00", minQuantity: "16.00", unit: "rollos" },
    { id: "item-6", householdId: household.id, name: "Crema Dental Sensodyne", category: "Toiletries", currentQuantity: "3.00", minQuantity: "1.00", unit: "tubos" },
    { id: "item-7", householdId: household.id, name: "Jarabe Infantil Paracetamol", category: "Medicine", currentQuantity: "1.00", minQuantity: "1.00", unit: "frascos" },
    { id: "item-8", householdId: household.id, name: "Gomitas Vitamina C 1000mg", category: "Medicine", currentQuantity: "40.00", minQuantity: "20.00", unit: "gomitas" },
  ];
  await db.insert(schema.inventoryItems).values(inventoryData);
  console.log(`✅ ${inventoryData.length} inventory supplies created.`);

  // 8. Goals
  const goalsData = [
    { id: "g-1", householdId: household.id, title: "Vacaciones Familiares en Europa", targetAmount: "8000.00", currentAmount: "5400.00", deadline: "2027-06-15", timeframe: "SHORT", category: "Vacaciones", priority: "HIGH" },
    { id: "g-2", householdId: household.id, title: "Fondo de Emergencia de 6 Meses", targetAmount: "24000.00", currentAmount: "18500.00", deadline: "2028-12-31", timeframe: "MEDIUM", category: "Fondo de Emergencia", priority: "HIGH" },
    { id: "g-3", householdId: household.id, title: "Inicial de Auto Eléctrico", targetAmount: "15000.00", currentAmount: "4200.00", deadline: "2027-11-20", timeframe: "SHORT", category: "Vehículo", priority: "MEDIUM" },
    { id: "g-4", householdId: household.id, title: "Inicial para Casa de Campo", targetAmount: "120000.00", currentAmount: "35000.00", deadline: "2031-09-01", timeframe: "LONG", category: "Compra de Vivienda", priority: "MEDIUM" },
  ];
  await db.insert(schema.goals).values(goalsData);
  console.log(`✅ ${goalsData.length} goals created.`);

  // 9. Calendar Events
  const calendarData = [
    { id: "ev-1", householdId: household.id, title: "Pago Automático de Hipoteca", dueDate: new Date("2026-08-03T12:00:00.000Z"), amount: "2200.00", type: "BILL", status: "PAID" },
    { id: "ev-2", householdId: household.id, title: "Factura Internet Fibra Óptica", dueDate: new Date("2026-08-18T10:00:00.000Z"), amount: "89.99", type: "BILL", status: "UNPAID" },
    { id: "ev-3", householdId: household.id, title: "Cuota de Impuesto Inmobiliario", dueDate: new Date("2026-08-25T00:00:00.000Z"), amount: "1450.00", type: "TAX", status: "UNPAID" },
    { id: "ev-4", householdId: household.id, title: "Plan Familiar Gimnasio", dueDate: new Date("2026-08-28T09:00:00.000Z"), amount: "110.00", type: "SUBSCRIPTION", status: "UNPAID" },
    { id: "ev-5", householdId: household.id, title: "Renovación Seguro de Auto", dueDate: new Date("2026-08-10T12:00:00.000Z"), amount: "320.00", type: "BILL", status: "PAID" },
    { id: "ev-6", householdId: household.id, title: "Servicio Anual de Agua y Drenaje", dueDate: new Date("2026-08-12T12:00:00.000Z"), amount: "450.00", type: "TAX", status: "OVERDUE" },
  ];
  await db.insert(schema.calendarEvents).values(calendarData);
  console.log(`✅ ${calendarData.length} calendar events created.`);

  // 10. Chores
  const choresData = [
    { id: "ch-1", householdId: household.id, assignedToUserId: "u-3", title: "Vaciar el lavavajillas por completo", pointsReward: 30, status: "PENDING", dueDate: new Date("2026-08-17T18:00:00.000Z") },
    { id: "ch-2", householdId: household.id, assignedToUserId: "u-3", title: "Pasear a Toby y limpiar sus patas", pointsReward: 20, status: "COMPLETED", dueDate: new Date("2026-08-16T12:00:00.000Z") },
    { id: "ch-3", householdId: household.id, assignedToUserId: "u-4", title: "Ordenar los juguetes de la sala", pointsReward: 40, status: "PENDING", dueDate: new Date("2026-08-16T20:00:00.000Z") },
    { id: "ch-4", householdId: household.id, assignedToUserId: "u-3", title: "Preparar lonchera para la escuela", pointsReward: 50, status: "COMPLETED", dueDate: new Date("2026-08-15T21:00:00.000Z") },
    { id: "ch-5", householdId: household.id, assignedToUserId: "u-4", title: "Alimentar a Toby (Mañana y Noche)", pointsReward: 15, status: "COMPLETED", dueDate: new Date("2026-08-16T19:00:00.000Z") },
    { id: "ch-6", householdId: household.id, assignedToUserId: "u-4", title: "Hacer la guía de matemáticas ejercicio 4", pointsReward: 60, status: "PENDING", dueDate: new Date("2026-08-18T15:00:00.000Z") },
  ];
  await db.insert(schema.chores).values(choresData);
  console.log(`✅ ${choresData.length} chores created.`);

  // 11. Screen Time Logs
  const screenTimeData = [
    { id: "st-1", childUserId: "u-3", date: "2026-08-16", minutesUsed: 85, dailyLimitMinutes: 120 },
    { id: "st-2", childUserId: "u-4", date: "2026-08-16", minutesUsed: 110, dailyLimitMinutes: 90 },
  ];
  await db.insert(schema.screenTimeLogs).values(screenTimeData);
  console.log(`✅ ${screenTimeData.length} screen time logs created.`);

  console.log("🎉 Database seeding completed successfully in Spanish!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
