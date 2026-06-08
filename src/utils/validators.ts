// --- Валидаторы для форм ---

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isMinLength(value: string, min: number): boolean {
  return value.length >= min
}

export function isMaxLength(value: string, max: number): boolean {
  return value.length <= max
}

export function isPositive(value: number): boolean {
  return value > 0
}

export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

// --- Валидация с сообщениями ---

export interface ValidationResult {
  valid: boolean
  message: string
}

export function validateEmail(value: string): ValidationResult {
  if (!value) return { valid: false, message: 'Введите email' }
  if (!isEmail(value)) return { valid: false, message: 'Некорректный email' }
  return { valid: true, message: '' }
}

export function validatePassword(value: string): ValidationResult {
  if (!value) return { valid: false, message: 'Введите пароль' }
  if (value.length < 8) return { valid: false, message: 'Минимум 8 символов' }
  if (value.length > 128) return { valid: false, message: 'Максимум 128 символов' }
  return { valid: true, message: '' }
}

export function validateRequired(value: string | number | null | undefined, fieldName = 'Поле'): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: `${fieldName} обязательно` }
  }
  return { valid: true, message: '' }
}

export function validateHeight(value: number): ValidationResult {
  if (!value) return { valid: false, message: 'Введите рост' }
  if (!isInRange(value, 50, 300)) return { valid: false, message: 'Рост: 50–300 см' }
  return { valid: true, message: '' }
}

export function validateWeight(value: number): ValidationResult {
  if (!value) return { valid: false, message: 'Введите вес' }
  if (!isInRange(value, 20, 500)) return { valid: false, message: 'Вес: 20–500 кг' }
  return { valid: true, message: '' }
}
