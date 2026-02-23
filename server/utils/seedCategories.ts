// server/utils/seedCategories.ts
import { Category } from '../models/Category'

const defaultCategories = [
  {
    name: 'Công việc',
    color: '#3B82F6',
    icon: 'i-mdi-briefcase',
    order: 1,
    isDefault: true,
  },
  {
    name: 'Cá nhân',
    color: '#8B5CF6',
    icon: 'i-mdi-account',
    order: 2,
    isDefault: true,
  },
  {
    name: 'Học tập',
    color: '#10B981',
    icon: 'i-mdi-school',
    order: 3,
    isDefault: true,
  },
  {
    name: 'Mua sắm',
    color: '#F59E0B',
    icon: 'i-mdi-cart',
    order: 4,
    isDefault: true,
  },
]

export async function seedCategories(userId: string) {
  try {
    const count = await Category.countDocuments({ userId })
    if (count === 0) {
      await Category.insertMany(defaultCategories.map(c => ({ ...c, userId })) as any)
      console.log('✅ Seeded default categories for user', userId)
    }
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
  }
}
