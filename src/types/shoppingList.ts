export interface ShoppingListItem {
  id: string
  shoppingListId: string
  ingredientId?: string
  name: string
  amount: number
  unit: string
  category?: string
  isPurchased: boolean
  estimatedPrice?: number
  notes?: string
  ingredient?: {
    id: string
    name: string
    category: string
  }
}

export interface ShoppingList {
  id: string
  userId: string
  mealPlanId?: string
  title: string
  status: 'active' | 'completed' | 'archived'
  totalEstimatedCost?: number
  createdAt: string
  updatedAt: string
  items?: ShoppingListItem[]
}

export interface CreateShoppingListRequest {
  mealPlanId?: string
  title: string
}

export interface UpdateShoppingListRequest {
  title?: string
  status?: string
}

export interface UpdateShoppingListItemRequest {
  isPurchased?: boolean
  estimatedPrice?: number
  notes?: string
}

export interface AddShoppingListItemRequest {
  ingredientId?: string
  name: string
  amount: number
  unit: string
  category?: string
  estimatedPrice?: number
  notes?: string
}
