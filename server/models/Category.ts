// server/models/Category.ts
import mongoose, { type Document } from 'mongoose'

export interface ICategory extends Document {
  name: string
  color: string
  icon: string
  order: number
  isDefault: boolean
  userId?: mongoose.Types.ObjectId | null
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new mongoose.Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      // NOTE: uniqueness is enforced per-user via the compound index below,
      // NOT globally — remove the old unique:true here.
    },
    color: {
      type: String,
      required: true,
      default: '#6366F1',
    },
    icon: {
      type: String,
      required: true,
      default: 'mdi:folder',
    },
    order: {
      type: Number,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Compound unique index: same name is allowed for different users,
// but not for the same user.
CategorySchema.index({ name: 1, userId: 1 }, { unique: true })

export const Category =
  (mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema)) as mongoose.Model<ICategory>
