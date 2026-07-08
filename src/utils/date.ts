// src/utils/date.ts

/**
 * 格式化日期
 * @param date - 日期字符串、Date 对象、null 或 undefined
 * @param format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串，如果日期无效则返回空字符串
 */
export function formatDate(
  date: string | Date | null | undefined,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string {
  // ✅ 处理 null、undefined
  if (!date) {
    return ''
  }

  let d: Date
  if (typeof date === 'string') {
    d = new Date(date)
  } else if (date instanceof Date) {
    d = date
  } else {
    return ''
  }

  // ✅ 检查日期是否有效
  if (isNaN(d.getTime())) {
    return ''
  }

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 获取相对时间描述
 * @param date - 日期字符串、Date 对象、null 或 undefined
 * @returns 相对时间描述，如"刚刚"、"5分钟前"等
 */
export function getRelativeTime(
  date: string | Date | null | undefined
): string {
  // ✅ 处理 null、undefined
  if (!date) {
    return ''
  }

  let d: Date
  if (typeof date === 'string') {
    d = new Date(date)
  } else if (date instanceof Date) {
    d = date
  } else {
    return ''
  }

  if (isNaN(d.getTime())) {
    return ''
  }

  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 30) return `${days} 天前`
  if (months < 12) return `${months} 个月前`
  return `${years} 年前`
}

/**
 * 格式化日期为短格式（年-月-日）
 */
export function formatDateShort(
  date: string | Date | null | undefined
): string {
  return formatDate(date, 'YYYY-MM-DD')
}

/**
 * 格式化日期为时间格式（时:分:秒）
 */
export function formatTime(
  date: string | Date | null | undefined
): string {
  return formatDate(date, 'HH:mm:ss')
}

/**
 * 格式化日期为友好的中文格式
 */
export function formatDateChinese(
  date: string | Date | null | undefined
): string {
  const result = formatDate(date, 'YYYY年MM月DD日 HH:mm')
  if (!result) return ''
  return result
}

/**
 * 检查日期是否有效
 */
export function isValidDate(date: any): boolean {
  if (!date) return false

  let d: Date
  if (typeof date === 'string') {
    d = new Date(date)
  } else if (date instanceof Date) {
    d = date
  } else {
    return false
  }

  return !isNaN(d.getTime())
}

/**
 * 获取今天的日期字符串
 */
export function getToday(): string {
  return formatDateShort(new Date())
}

/**
 * 获取当前时间字符串
 */
export function getNow(): string {
  return formatDate(new Date())
}

/**
 * 获取日期时间戳（毫秒）
 */
export function getTimestamp(
  date: string | Date | null | undefined
): number {
  if (!date) return 0

  let d: Date
  if (typeof date === 'string') {
    d = new Date(date)
  } else if (date instanceof Date) {
    d = date
  } else {
    return 0
  }

  if (isNaN(d.getTime())) {
    return 0
  }

  return d.getTime()
}

/**
 * 判断两个日期是否为同一天
 */
export function isSameDay(
  date1: string | Date | null | undefined,
  date2: string | Date | null | undefined
): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2

  if (!d1 || !d2 || isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return false
  }

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

/**
 * 判断日期是否为今天
 */
export function isToday(date: string | Date | null | undefined): boolean {
  return isSameDay(date, new Date())
}