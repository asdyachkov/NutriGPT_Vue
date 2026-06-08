// =============================================================================
// NutriGPT — TypeScript API Types
// Сгенерировано на основе Go DTO (internal/dto/request + response)
// =============================================================================

// ==================== Auth ====================

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  first_name: string
  last_name?: string
  consent_given: boolean
}

export interface RefreshRequest {
  refresh_token: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  new_password: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface UserResponse {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'user' | 'dietitian' | 'admin'
  is_active: boolean
  consent_given: boolean
  created_at: string
}

export interface AuthResponse {
  user: UserResponse
  tokens: TokenResponse
}

export interface MessageResponse {
  message: string
}

export interface ErrorResponse {
  error: string
  details?: string
}

// ==================== Profile ====================

export interface UpdateProfileRequest {
  gender?: 'male' | 'female'
  birth_date?: string
  height_cm?: number
  weight_kg?: number
  activity_level?: ActivityLevel
  goal?: Goal
  dietary_restrictions?: string[]
  allergies?: string[]
  cuisine_preferences?: string[]
  kitchen_equipment?: string[]
}

export interface NutritionResponse {
  bmr: number
  tdee: number
  target_calories: number
  target_protein: number
  target_fat: number
  target_carbs: number
}

export interface ProfileResponse {
  id: string
  user_id: string
  gender: string
  birth_date: string | null
  height_cm: number
  weight_kg: number
  activity_level: string
  goal: string
  dietary_restrictions: string[]
  allergies: string[]
  cuisine_preferences: string[]
  kitchen_equipment: string[]
  nutrition: NutritionResponse
  created_at: string
  updated_at: string
}

// ==================== Family ====================

export interface CreateFamilyRequest {
  name: string
  monthly_budget?: number
}

export interface UpdateFamilyRequest {
  name?: string
  monthly_budget?: number
}

export interface AddMemberRequest {
  email: string
}

export interface UpdateMemberRoleRequest {
  role: 'admin' | 'member'
}

export interface FamilyMemberResponse {
  id: string
  user_id: string
  email: string
  first_name: string
  last_name: string
  role: string
  joined_at: string
}

export interface FamilyResponse {
  id: string
  name: string
  admin_user_id: string
  monthly_budget: number | null
  members: FamilyMemberResponse[]
  created_at: string
  updated_at: string
}

export interface FamilyListResponse {
  id: string
  name: string
  monthly_budget: number | null
  member_count: number
  my_role: string
}

// ==================== Ingredient ====================

export interface CreateIngredientRequest {
  name: string
  category?: IngredientCategory
  calories_per_100g: number
  protein_per_100g: number
  fat_per_100g: number
  carbs_per_100g: number
  default_unit?: string
  avg_price_per_unit?: number
  is_allergen: boolean
  allergen_type?: string
}

export interface UpdateIngredientRequest {
  name?: string
  category?: IngredientCategory
  calories_per_100g?: number
  protein_per_100g?: number
  fat_per_100g?: number
  carbs_per_100g?: number
  default_unit?: string
  avg_price_per_unit?: number
  is_allergen?: boolean
  allergen_type?: string
}

export interface IngredientResponse {
  id: string
  name: string
  category: string
  calories_per_100g: number
  protein_per_100g: number
  fat_per_100g: number
  carbs_per_100g: number
  default_unit: string
  avg_price_per_unit: number | null
  is_allergen: boolean
  allergen_type: string | null
  created_at: string
}

export interface IngredientListResponse {
  items: IngredientResponse[]
  total_count: number
  limit: number
  offset: number
}

// ==================== Recipe ====================

export interface RecipeIngredientInput {
  ingredient_id: string
  amount: number
  unit: string
  is_optional: boolean
  notes?: string
}

export interface CreateRecipeRequest {
  title: string
  description?: string
  instructions: string
  cooking_time_min?: number
  servings?: number
  difficulty?: Difficulty
  cuisine?: string
  meal_type?: MealType
  image_url?: string
  ingredients?: RecipeIngredientInput[]
}

export interface UpdateRecipeRequest {
  title?: string
  description?: string
  instructions?: string
  cooking_time_min?: number
  servings?: number
  difficulty?: Difficulty
  cuisine?: string
  meal_type?: MealType
  image_url?: string
  ingredients?: RecipeIngredientInput[]
}

export interface RecipeIngredientResponse {
  id: string
  ingredient_id: string
  ingredient_name: string
  category: string
  amount: number
  unit: string
  is_optional: boolean
  notes: string | null
  calories: number
  protein: number
  fat: number
  carbs: number
  estimated_price: number | null
}

export interface RecipeResponse {
  id: string
  user_id: string | null
  title: string
  description: string
  cooking_time_min: number
  servings: number
  difficulty: string
  cuisine: string
  meal_type: string
  total_calories: number
  total_protein: number
  total_fat: number
  total_carbs: number
  estimated_cost: number | null
  image_url: string | null
  is_approved: boolean
  is_ai_generated: boolean
  source: string
  created_at: string
}

export interface RecipeDetailResponse extends RecipeResponse {
  instructions: string
  ingredients: RecipeIngredientResponse[]
  updated_at: string
}

export interface RecipeListResponse {
  items: RecipeResponse[]
  total_count: number
  limit: number
  offset: number
}

// ==================== Meal Plan ====================

export interface GenerateMealPlanRequest {
  days?: number
  family_id?: string
  budget?: number
  special_requests?: string
  title?: string
}

export interface GenerateTaskResponse {
  task_id: string
  status: string
  message: string
}

export interface TaskStatusResponse {
  task_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  meal_plan_id?: string
  error?: string
}

export interface MealPlanRecipeResponse {
  id: string
  meal_type: MealType
  servings: number
  sort_order: number
  is_substituted: boolean
  notes: string | null
  recipe_id: string
  recipe_title: string
  total_calories: number
  total_protein: number
  total_fat: number
  total_carbs: number
  estimated_cost: number | null
  image_url: string | null
  cooking_time_min: number
  difficulty: string
}

export interface MealPlanDayResponse {
  id: string
  date: string
  day_calories: number | null
  day_protein: number | null
  day_fat: number | null
  day_carbs: number | null
  meals: MealPlanRecipeResponse[]
}

export interface MealPlanResponse {
  id: string
  title: string
  start_date: string
  end_date: string
  status: MealPlanStatus
  total_estimated_cost: number | null
  day_count: number
  family_id: string | null
  created_at: string
}

export interface MealPlanDetailResponse {
  id: string
  title: string
  start_date: string
  end_date: string
  status: MealPlanStatus
  total_estimated_cost: number | null
  family_id: string | null
  days: MealPlanDayResponse[]
  created_at: string
  updated_at: string
}

export interface MealPlanListResponse {
  items: MealPlanResponse[]
  total_count: number
  limit: number
  offset: number
}

// ==================== Shopping List ====================

export interface CreateShoppingListRequest {
  meal_plan_id: string
  title?: string
}

export interface UpdateShoppingListRequest {
  title?: string
  status?: ShoppingListStatus
}

export interface AddShoppingListItemRequest {
  name: string
  amount: number
  unit: string
  category?: string
  ingredient_id?: string
  estimated_price?: number
  notes?: string
}

export interface UpdateShoppingListItemRequest {
  name?: string
  amount?: number
  unit?: string
  category?: string
  is_purchased?: boolean
  estimated_price?: number
  notes?: string
}

export interface ShoppingListItemResponse {
  id: string
  ingredient_id: string | null
  name: string
  amount: number
  unit: string
  category: string
  is_purchased: boolean
  estimated_price: number | null
  notes: string | null
}

export interface ShoppingListResponse {
  id: string
  meal_plan_id: string | null
  title: string
  status: ShoppingListStatus
  total_estimated_cost: number | null
  item_count: number
  purchased_count: number
  items: ShoppingListItemResponse[]
  created_at: string
  updated_at: string
}

export interface ShoppingListSummaryResponse {
  id: string
  meal_plan_id: string | null
  title: string
  status: ShoppingListStatus
  total_estimated_cost: number | null
  item_count: number
  purchased_count: number
  created_at: string
}

export interface ShoppingListListResponse {
  items: ShoppingListSummaryResponse[]
  total_count: number
  limit: number
  offset: number
}

// ==================== Enums / Unions ====================

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type Goal = 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle'
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type IngredientCategory = 'vegetables' | 'fruits' | 'meat' | 'dairy' | 'grains' | 'spices' | 'other'
export type MealPlanStatus = 'draft' | 'active' | 'completed' | 'archived'
export type ShoppingListStatus = 'active' | 'completed' | 'archived'
export type UserRole = 'user' | 'dietitian' | 'admin'
export type RecipeSource = 'manual' | 'gpt' | 'imported'

// ==================== Kitchen Equipment ====================

export type KitchenEquipmentKey = 'microwave' | 'oven' | 'multicooker' | 'blender' | 'mixer' | 'steamer' | 'air_fryer' | 'grill' | 'food_processor' | 'bread_maker' | 'toaster' | 'waffle_maker' | 'deep_fryer' | 'sous_vide'

export interface KitchenEquipmentOption {
  key: KitchenEquipmentKey
  label: string
  icon: string
}

// ==================== Admin ====================

export interface AdminUserSearchParams {
  search?: string
  role?: UserRole
  limit?: number
  offset?: number
}

export interface AdminUpdateUserRequest {
  role?: UserRole
  is_active?: boolean
}

export interface AdminUserResponse {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  is_active: boolean
  created_at: string
}

export interface AdminUserListResponse {
  items: AdminUserResponse[]
  total_count: number
  limit: number
  offset: number
}

export interface AdminStatsResponse {
  total_users: number
  total_recipes: number
  approved_recipes: number
  pending_recipes: number
  total_meal_plans: number
  total_ingredients: number
}

// ==================== Pagination ====================

export interface PaginationParams {
  limit?: number
  offset?: number
}

export interface RecipeSearchParams extends PaginationParams {
  search?: string
  meal_type?: MealType
  cuisine?: string
  difficulty?: Difficulty
  source?: RecipeSource
  only_mine?: boolean
}

export interface IngredientSearchParams extends PaginationParams {
  search?: string
  category?: IngredientCategory
}
