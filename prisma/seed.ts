import {
  PrismaClient,
  Role,
  CylinderSize,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ApplicationStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY);

const KG: Record<CylinderSize, number> = {
  KG_3: 3,
  KG_6: 6,
  KG_12_5: 12.5,
  KG_14_5: 14.5,
};

// Demo password shared by all seeded students + suppliers (printed at the end).
const DEMO_PASSWORD = "Password123!";

// Platform pricing (mirrors src/lib/pricing.ts — kept local so the seed has no path-alias deps).
const GAS_PRICE_PER_KG = 14;
const DELIVERY_FEE_SOLO = 10;
const DELIVERY_FEE_POOLED = 5;

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@gasup.app").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";

  // --- Admin (seeded, never self-registers) ---
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN, fullName: "GasUp Admin" },
    create: {
      email: adminEmail,
      fullName: "GasUp Admin",
      role: Role.ADMIN,
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
  });

  // Private hostels in the communities around UCC (where students cook with gas) —
  // NOT the on-campus halls of residence (those students don't use LPG).
  const addresses = [
    { name: "Hamglor Hostel, Amamoma", lat: 5.1131, lng: -1.2912 },
    { name: "Ewusiwa Hostel, Amamoma", lat: 5.1148, lng: -1.2895 },
    { name: "Golden Royal Palace Hostel, Kwaprow", lat: 5.1102, lng: -1.2934 },
    { name: "NEST Hostel, Apewosika", lat: 5.1120, lng: -1.2900 },
    { name: "Topp Hostel, Amamoma", lat: 5.1150, lng: -1.2880 },
  ];

  // --- Suppliers (admin-created in real life; seeded here) ---
  const supplierSpecs = [
    {
      email: "swiftgas@gasup.app",
      fullName: "Kwame Mensah",
      businessName: "SwiftGas Cape Coast",
      vehicleType: "Motorbike",
      coverageArea: "UCC Campus & Amamoma",
      pricePerKg: 14,
      ratingAvg: 4.8,
      ratingCount: 52,
      lat: 5.1131,
      lng: -1.2912,
      partnerStation: "Total Amamoma",
    },
    {
      email: "campusgas@gasup.app",
      fullName: "Ama Owusu",
      businessName: "Campus Gas Express",
      vehicleType: "Tricycle",
      coverageArea: "UCC Campus, Apewosika, Kwaprow",
      pricePerKg: 15,
      ratingAvg: 4.5,
      ratingCount: 31,
      lat: 5.1120,
      lng: -1.2900,
      partnerStation: "GOIL Science Market",
    },
    {
      email: "flamefuel@gasup.app",
      fullName: "Yaw Boateng",
      businessName: "FlameFuel Logistics",
      vehicleType: "Vehicle",
      coverageArea: "Greater Cape Coast",
      pricePerKg: 16.5,
      ratingAvg: 4.2,
      ratingCount: 18,
      lat: 5.1102,
      lng: -1.2934,
      partnerStation: "Star Oil Kwaprow",
    },
  ];

  const suppliers = [];
  for (const spec of supplierSpecs) {
    const user = await prisma.user.upsert({
      where: { email: spec.email },
      update: { role: Role.SUPPLIER, fullName: spec.fullName },
      create: {
        email: spec.email,
        fullName: spec.fullName,
        role: Role.SUPPLIER,
        phone: "0550000000",
        passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
      },
    });
    const supplier = await prisma.supplier.upsert({
      where: { userId: user.id },
      update: {
        businessName: spec.businessName,
        vehicleType: spec.vehicleType,
        coverageArea: spec.coverageArea,
        pricePerKg: spec.pricePerKg,
        ratingAvg: spec.ratingAvg,
        ratingCount: spec.ratingCount,
        lat: spec.lat,
        lng: spec.lng,
        partnerStation: spec.partnerStation,
      },
      create: {
        userId: user.id,
        businessName: spec.businessName,
        vehicleType: spec.vehicleType,
        coverageArea: spec.coverageArea,
        pricePerKg: spec.pricePerKg,
        ratingAvg: spec.ratingAvg,
        ratingCount: spec.ratingCount,
        lat: spec.lat,
        lng: spec.lng,
        partnerStation: spec.partnerStation,
      },
    });
    suppliers.push(supplier);
  }

  // --- Students with historical DELIVERED orders so prediction has data
  //     on day one. orderHistory = [daysAgo,...] (most recent last). ---
  const studentSpecs = [
    { email: "akua@gasup.app", fullName: "Akua Sarpong", householdSize: 1, locIdx: 0, size: CylinderSize.KG_6, history: [44, 22] },
    // kofi shares Akua's loc (idx 0 — same hostel) so pooling can be demoed.
    { email: "kofi@gasup.app", fullName: "Kofi Annan", householdSize: 2, locIdx: 0, size: CylinderSize.KG_6, history: [30, 12] },
    { email: "esi@gasup.app", fullName: "Esi Bonsu", householdSize: 3, locIdx: 2, size: CylinderSize.KG_12_5, history: [50, 20] },
    { email: "nana@gasup.app", fullName: "Nana Adjei", householdSize: 1, locIdx: 3, size: CylinderSize.KG_6, history: [16] },
    { email: "yaa@gasup.app", fullName: "Yaa Asantewaa", householdSize: 4, locIdx: 4, size: CylinderSize.KG_14_5, history: [38, 14] },
  ];

  const seededStudents: { id: string; loc: (typeof addresses)[number]; size: CylinderSize }[] = [];

  for (let s = 0; s < studentSpecs.length; s++) {
    const spec = studentSpecs[s];
    const loc = addresses[spec.locIdx];
    const student = await prisma.user.upsert({
      where: { email: spec.email },
      update: {
        role: Role.STUDENT,
        fullName: spec.fullName,
        defaultAddress: loc.name,
        defaultLat: loc.lat,
        defaultLng: loc.lng,
        householdSize: spec.householdSize,
        defaultCylinderSize: spec.size,
        lastRefillAt: daysAgo(spec.history[spec.history.length - 1]),
      },
      create: {
        email: spec.email,
        fullName: spec.fullName,
        role: Role.STUDENT,
        phone: "0240000000",
        householdSize: spec.householdSize,
        defaultAddress: loc.name,
        defaultLat: loc.lat,
        defaultLng: loc.lng,
        defaultCylinderSize: spec.size,
        lastRefillAt: daysAgo(spec.history[spec.history.length - 1]),
        passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
      },
    });

    seededStudents.push({ id: student.id, loc, size: spec.size });

    const supplier = suppliers[s % suppliers.length];
    const kg = KG[spec.size];

    for (let i = 0; i < spec.history.length; i++) {
      const id = `seed-order-${s}-${i}`;
      const when = daysAgo(spec.history[i]);
      const data = {
        studentId: student.id,
        supplierId: supplier.id,
        address: loc.name,
        lat: loc.lat,
        lng: loc.lng,
        cylinderSize: spec.size,
        requestedKg: kg,
        status: OrderStatus.DELIVERED,
        verifiedWeightKg: kg,
        weightConfirmed: true,
        feeGhs: Math.round(kg * GAS_PRICE_PER_KG) + DELIVERY_FEE_SOLO,
        paymentStatus: PaymentStatus.PAID,
        createdAt: when,
        deliveredAt: when,
      };
      await prisma.order.upsert({ where: { id }, update: data, create: { id, ...data } });
    }
  }

  // --- Live demo data: OPEN orders on the rider dispatch board + pending applications ---
  const soloFee = (kg: number) => Math.round(kg * GAS_PRICE_PER_KG) + DELIVERY_FEE_SOLO;
  const pooledFee = (kg: number) => Math.round(kg * GAS_PRICE_PER_KG) + DELIVERY_FEE_POOLED;

  if (seededStudents.length >= 4) {
    const [akua, kofi, esi, nana] = seededStudents;

    // A pooled pair (akua + kofi share Hamglor Hostel, Amamoma) → "Pooled · 2 stops" on the board.
    const pool = await prisma.pool.upsert({
      where: { id: "seed-pool-demo" },
      update: { lat: akua.loc.lat, lng: akua.loc.lng },
      create: { id: "seed-pool-demo", lat: akua.loc.lat, lng: akua.loc.lng },
    });

    const openOrders = [
      {
        id: "seed-open-pool-0",
        studentId: akua.id,
        loc: akua.loc,
        size: akua.size,
        requestedKg: KG[akua.size],
        feeGhs: pooledFee(KG[akua.size]),
        paymentMethod: PaymentMethod.ONLINE,
        poolId: pool.id as string | null,
      },
      {
        id: "seed-open-pool-1",
        studentId: kofi.id,
        loc: kofi.loc,
        size: kofi.size,
        requestedKg: KG[kofi.size],
        feeGhs: pooledFee(KG[kofi.size]),
        paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
        poolId: pool.id as string | null,
      },
      {
        id: "seed-open-cash",
        studentId: esi.id,
        loc: esi.loc,
        size: esi.size,
        requestedKg: 4, // partial / custom amount
        feeGhs: soloFee(4),
        paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
        poolId: null as string | null,
      },
      {
        id: "seed-open-online",
        studentId: nana.id,
        loc: nana.loc,
        size: nana.size,
        requestedKg: KG[nana.size],
        feeGhs: soloFee(KG[nana.size]),
        paymentMethod: PaymentMethod.ONLINE,
        poolId: null as string | null,
      },
    ];

    for (const o of openOrders) {
      const data = {
        studentId: o.studentId,
        supplierId: null, // OPEN = unclaimed; reset on re-seed even if a demo accepted it
        address: o.loc.name,
        lat: o.loc.lat,
        lng: o.loc.lng,
        cylinderSize: o.size,
        requestedKg: o.requestedKg,
        status: OrderStatus.OPEN,
        feeGhs: o.feeGhs,
        paymentStatus: PaymentStatus.UNPAID,
        paymentMethod: o.paymentMethod,
        poolId: o.poolId,
      };
      await prisma.order.upsert({ where: { id: o.id }, update: data, create: { id: o.id, ...data } });
    }
  }

  // Pending rider applications for the admin Applications tab.
  const applications = [
    {
      id: "seed-app-0",
      fullName: "Kojo Asare",
      email: "kojo.rider@example.com",
      phone: "0201112222",
      businessName: "QuickGas Riders",
      vehicleType: "Motorbike",
      coverageArea: "UCC Campus, Apewosika",
      partnerStation: "Total Amamoma",
    },
    {
      id: "seed-app-1",
      fullName: "Abena Owusu",
      email: "abena.rider@example.com",
      phone: "0209998888",
      businessName: "Abena Gas Express",
      vehicleType: "Tricycle",
      coverageArea: "Kwaprow, Amamoma",
      partnerStation: null as string | null,
    },
  ];
  for (const a of applications) {
    await prisma.riderApplication.upsert({
      where: { id: a.id },
      update: { ...a, status: ApplicationStatus.PENDING, notes: null },
      create: { ...a, status: ApplicationStatus.PENDING },
    });
  }

  console.log("\n✅ Seed complete.\n");
  console.log("Login credentials (all non-admin passwords = " + DEMO_PASSWORD + "):");
  console.log("  ADMIN    ", adminEmail, "/", adminPassword);
  console.log("  SUPPLIER ", supplierSpecs.map((s) => s.email).join(", "));
  console.log("  STUDENT  ", studentSpecs.map((s) => s.email).join(", "));
  console.log("");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
