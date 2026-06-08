import { format, parseISO, formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

// --- Даты ---

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'd MMMM yyyy', { locale: ru })
  } catch {
    return dateStr
  }
}

export function formatDateShort(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd.MM.yyyy')
  } catch {
    return dateStr
  }
}

export function formatRelative(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: ru })
  } catch {
    return dateStr
  }
}

export function formatDayOfWeek(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'EEEE', { locale: ru })
  } catch {
    return dateStr
  }
}

// --- Числа ---

export function formatCalories(value: number): string {
  return `${Math.round(value)} ккал`
}

export function formatGrams(value: number): string {
  return `${value.toFixed(1)} г`
}

export function formatPrice(value: number | null | undefined): string {
  if (value == null) return '—'
  return `${value.toFixed(0)} ₽`
}

// --- Текст ---

export function pluralize(count: number, one: string, few: string, many: string): string {
  const n = Math.abs(count) % 100
  const n1 = n % 10
  if (n > 10 && n < 20) return `${count} ${many}`
  if (n1 > 1 && n1 < 5) return `${count} ${few}`
  if (n1 === 1) return `${count} ${one}`
  return `${count} ${many}`
}

// --- Маппинг enum → русский текст ---

export const activityLabels: Record<string, string> = {
  sedentary: 'Сидячий',
  light: 'Лёгкая активность',
  moderate: 'Умеренная',
  active: 'Высокая',
  very_active: 'Очень высокая',
}

export const goalLabels: Record<string, string> = {
  lose_weight: 'Похудение',
  maintain: 'Поддержание',
  gain_weight: 'Набор веса',
  gain_muscle: 'Набор мышц',
}

export const mealTypeLabels: Record<string, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус',
}

export const difficultyLabels: Record<string, string> = {
  easy: 'Легко',
  medium: 'Средне',
  hard: 'Сложно',
}

export const categoryLabels: Record<string, string> = {
  vegetables: 'Овощи',
  fruits: 'Фрукты',
  meat: 'Мясо',
  dairy: 'Молочные',
  grains: 'Крупы',
  spices: 'Специи',
  other: 'Другое',
}

export const kitchenEquipmentOptions: { key: string; label: string; icon: string }[] = [
  { key: 'microwave', label: 'Микроволновка', icon: '📟' },
  { key: 'oven', label: 'Духовка', icon: '🍖' },
  { key: 'multicooker', label: 'Мультиварка', icon: '🍲' },
  { key: 'blender', label: 'Блендер', icon: '🧂' },
  { key: 'mixer', label: 'Миксер', icon: '🧁' },
  { key: 'steamer', label: 'Пароварка', icon: '♨️' },
  { key: 'air_fryer', label: 'Аэрогриль', icon: '🌬️' },
  { key: 'grill', label: 'Электрогриль', icon: '🪨' },
  { key: 'food_processor', label: 'Кухонный комбайн', icon: '⚙️' },
  { key: 'bread_maker', label: 'Хлебопечка', icon: '🍞' },
  { key: 'toaster', label: 'Тостер', icon: '🍞' },
  { key: 'waffle_maker', label: 'Вафельница', icon: '🧇' },
  { key: 'deep_fryer', label: 'Фритюрница', icon: '🍟' },
  { key: 'sous_vide', label: 'Су-вид', icon: '🌡️' },
]

export const roleLabels: Record<string, string> = {
  user: 'Пользователь',
  dietitian: 'Диетолог',
  admin: 'Администратор',
}

export const statusLabels: Record<string, string> = {
  draft: 'Черновик',
  active: 'Активный',
  completed: 'Завершён',
  archived: 'Архив',
}
