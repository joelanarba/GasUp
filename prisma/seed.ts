import {
  PrismaClient,
  Role,
  CylinderSize,
  OrderStatus,
  PaymentStatus,
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

  // --- Hostels: 3 halls x 2 blocks = 6 rows (a block is its own row;
  //     pooling groups by (hostelId, block)) ---
  const halls = [
    { name: "Casford Hall", lat: 5.1131, lng: -1.2912 },
    { name: "Adehye Hall", lat: 5.1148, lng: -1.2895 },
    { name: "Valco Hall", lat: 5.1102, lng: -1.2934 },
  ];
  const blocks = ["A", "B"];
  const hostels = [];
  for (const hall of halls) {
    for (const block of blocks) {
      const hostel = await prisma.hostel.upsert({
        where: { name_block: { name: hall.name, block } },
        update: { campus: "UCC", lat: hall.lat, lng: hall.lng },
        create: {
          name: hall.name,
          block,
          campus: "UCC",
          lat: hall.lat,
          lng: hall.lng,
        },
      });
      hostels.push(hostel);
    }
  }

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
      },
      create: {
        userId: user.id,
        businessName: spec.businessName,
        vehicleType: spec.vehicleType,
        coverageArea: spec.coverageArea,
        pricePerKg: spec.pricePerKg,
        ratingAvg: spec.ratingAvg,
        ratingCount: spec.ratingCount,
      },
    });
    suppliers.push(supplier);
  }

  // --- Students with historical DELIVERED orders so prediction has data
  //     on day one. orderHistory = [daysAgo,...] (most recent last). ---
  const studentSpecs = [
    { email: "akua@gasup.app", fullName: "Akua Sarpong", householdSize: 1, hostelIdx: 0, room: "A12", size: CylinderSize.KG_6, history: [44, 22] },
    { email: "kofi@gasup.app", fullName: "Kofi Annan", householdSize: 2, hostelIdx: 1, room: "A07", size: CylinderSize.KG_6, history: [30, 12] },
    { email: "esi@gasup.app", fullName: "Esi Bonsu", householdSize: 3, hostelIdx: 2, room: "B03", size: CylinderSize.KG_12_5, history: [50, 20] },
    { email: "nana@gasup.app", fullName: "Nana Adjei", householdSize: 1, hostelIdx: 3, room: "B15", size: CylinderSize.KG_6, history: [16] },
    { email: "yaa@gasup.app", fullName: "Yaa Asantewaa", householdSize: 4, hostelIdx: 4, room: "A21", size: CylinderSize.KG_14_5, history: [38, 14] },
  ];

  for (let s = 0; s < studentSpecs.length; s++) {
    const spec = studentSpecs[s];
    const hostel = hostels[spec.hostelIdx];
    const student = await prisma.user.upsert({
      where: { email: spec.email },
      update: {
        role: Role.STUDENT,
        fullName: spec.fullName,
        hostelId: hostel.id,
        roomNumber: spec.room,
        householdSize: spec.householdSize,
      },
      create: {
        email: spec.email,
        fullName: spec.fullName,
        role: Role.STUDENT,
        phone: "0240000000",
        householdSize: spec.householdSize,
        hostelId: hostel.id,
        roomNumber: spec.room,
        passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
      },
    });

    const supplier = suppliers[s % suppliers.length];
    const kg = KG[spec.size];

    for (let i = 0; i < spec.history.length; i++) {
      const id = `seed-order-${s}-${i}`;
      const when = daysAgo(spec.history[i]);
      const data = {
        studentId: student.id,
        supplierId: supplier.id,
        hostelId: hostel.id,
        roomNumber: spec.room,
        cylinderSize: spec.size,
        requestedKg: kg,
        status: OrderStatus.DELIVERED,
        verifiedWeightKg: kg,
        weightConfirmed: true,
        feeGhs: Math.round(kg * supplier.pricePerKg),
        paymentStatus: PaymentStatus.PAID,
        createdAt: when,
        deliveredAt: when,
      };
      await prisma.order.upsert({ where: { id }, update: data, create: { id, ...data } });
    }
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
