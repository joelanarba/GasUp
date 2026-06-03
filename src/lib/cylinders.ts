import { type CylinderSize } from "@prisma/client";

export type CylinderOption = {
  value: CylinderSize;
  kg: number;
  label: string;
  blurb: string;
};

// The four cylinder sizes the app supports (mirrors the CylinderSize enum).
export const CYLINDERS: CylinderOption[] = [
  { value: "KG_3", kg: 3, label: "3 kg", blurb: "Single, light use" },
  { value: "KG_6", kg: 6, label: "6 kg", blurb: "Most students" },
  { value: "KG_12_5", kg: 12.5, label: "12.5 kg", blurb: "Shared / heavy use" },
  { value: "KG_14_5", kg: 14.5, label: "14.5 kg", blurb: "Large household" },
];

const KG: Record<CylinderSize, number> = {
  KG_3: 3,
  KG_6: 6,
  KG_12_5: 12.5,
  KG_14_5: 14.5,
};

export function kgFor(size: CylinderSize): number {
  return KG[size];
}

export function cylinderLabel(size: CylinderSize): string {
  return CYLINDERS.find((c) => c.value === size)?.label ?? `${KG[size]} kg`;
}
