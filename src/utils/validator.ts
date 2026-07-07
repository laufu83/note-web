/**
 * 验证是否为有效的邮箱
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * 验证密码强度
 */
export function isStrongPassword(password: string): boolean {
  return password.length >= 6
}

/**
 * 验证是否为有效的 UUID
 */
export function isValidUUID(id: string): boolean {
  const regex = /^[0-9a-f]{32}$/i
  return regex.test(id)
}

/**
 * 验证是否为有效的 URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 验证是否为有效的手机号（中国）
 */
export function isValidPhone(phone: string): boolean {
  const regex = /^1[3-9]\d{9}$/
  return regex.test(phone)
}

/**
 * 验证是否为空字符串
 */
export function isEmptyString(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0
}