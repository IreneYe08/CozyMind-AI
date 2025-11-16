export interface ResultRecord {
  id: string
  user_id: string
  before_image: string
  after_image: string
  prompt: string
  style: string
  budget: number | null
  size: string | null
  items: AmazonItem[] | null
  created_at: string
}

export interface AmazonItem {
  id: string
  title: string
  price: string
  image_url: string
  product_url: string
  rating?: number
}

export interface GenerateInitialAfterRequest {
  before_image_url: string
}

export interface GenerateInitialAfterResponse {
  after_image_url: string
}

export interface GenerateAfterProductListRequest {
  before_image_url: string
  prompt: string
  style: string
  budget?: number
  size?: string
  chat_messages?: string[]
}

export interface TodoItem {
  task: string
  reason?: string
}

export interface GenerateAfterProductListResponse {
  final_after_image_url: string
  amazon_items: AmazonItem[]
  todo_list: TodoItem[]
}

