const DEPARTMENT_COLORS = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
]

const AVATAR_GRADIENTS = [
  'bg-gradient-to-br from-blue-500 to-indigo-500 text-white',
  'bg-gradient-to-br from-emerald-500 to-cyan-600 text-white',
  'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
  'bg-gradient-to-br from-pink-500 to-rose-600 text-white',
  'bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white',
  'bg-gradient-to-br from-indigo-400 to-cyan-500 text-white',
]

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

export function getDepartmentColor(name: string): string {
  if (!name) return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  const index = hashString(name) % DEPARTMENT_COLORS.length
  return DEPARTMENT_COLORS[index]
}

export function getAvatarGradient(identifier: string): string {
  if (!identifier) return 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
  const index = hashString(identifier) % AVATAR_GRADIENTS.length
  return AVATAR_GRADIENTS[index]
}
