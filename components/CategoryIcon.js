"use client";

import {
  ShoppingCart,
  Car,
  Fuel,
  Home,
  Zap,
  Heart,
  Film,
  Shirt,
  GraduationCap,
  PiggyBank,
  Baby,
  MoreHorizontal,
} from "lucide-react";

const ICONS = {
  "shopping-cart": ShoppingCart,
  car: Car,
  fuel: Fuel,
  home: Home,
  zap: Zap,
  heart: Heart,
  film: Film,
  shirt: Shirt,
  "graduation-cap": GraduationCap,
  "piggy-bank": PiggyBank,
  baby: Baby,
  "more-horizontal": MoreHorizontal,
};

export default function CategoryIcon({ icon, size = 18, className = "" }) {
  const Icon = ICONS[icon] || MoreHorizontal;
  return <Icon size={size} className={className} />;
}
