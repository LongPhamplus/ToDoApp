// Patches legacy icon strings → Iconify i-mdi- format for all existing category docs
import { Category } from '../../models/Category'
import { connectDB } from '../../utils/mongoose'

// Maps any legacy format to the correct i-mdi- Iconify name for @nuxt/ui UIcon
const ICON_MAP: Record<string, string> = {
  // mdi: prefix (old seed)
  'mdi:briefcase': 'i-mdi-briefcase',
  'mdi:account':   'i-mdi-account',
  'mdi:school':    'i-mdi-school',
  'mdi:cart':      'i-mdi-cart',
  'mdi:home':      'i-mdi-home',
  'mdi:heart':     'i-mdi-heart',
  'mdi:star':      'i-mdi-star',
  'mdi:flag':      'i-mdi-flag',
  'mdi:tag':       'i-mdi-tag',
  'mdi:book':      'i-mdi-book',
  'mdi:pen':       'i-mdi-pen',
  'mdi:code-tags': 'i-mdi-code-tags',
  'mdi:dumbbell':  'i-mdi-dumbbell',
  'mdi:music':     'i-mdi-music',
  'mdi:camera':    'i-mdi-camera',
  // emoji fallbacks (second seed attempt)
  '💼': 'i-mdi-briefcase',
  '👤': 'i-mdi-account',
  '🎓': 'i-mdi-school',
  '�': 'i-mdi-cart',
}

function needsMigration(icon: string) {
  return icon?.startsWith('mdi:') || !!ICON_MAP[icon]
}

export default defineEventHandler(async () => {
  await connectDB()

  const categories = await Category.find({}).lean()
  const toMigrate = categories.filter((c: any) => needsMigration(c.icon))

  if (!toMigrate.length) {
    return { migrated: 0, message: 'No legacy icons found — all good!' }
  }

  let migrated = 0
  for (const cat of toMigrate as any[]) {
    const newIcon = ICON_MAP[cat.icon] ?? 'i-mdi-folder'
    await Category.updateOne({ _id: cat._id }, { $set: { icon: newIcon } } as any)
    migrated++
  }

  return { migrated, message: `Patched ${migrated} categories to Iconify format` }
})
