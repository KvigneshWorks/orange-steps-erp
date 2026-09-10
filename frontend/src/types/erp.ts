// ERP-specific shared TypeScript interfaces

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
}

export interface SubCategory {
  id: number;
  name: string;
  category_id: number;
}

export interface BioData {
  id: number;
  name: string;
  category_id?: number;
  sub_category_id?: number;
  is_active?: boolean | number;
}

export interface SubName {
  id: number;
  alternate_name: string;
  bio_data_id: number;
}

export interface IdType {
  id: number;
  type_name: string;
}

export interface MasterDataResponse {
  success: boolean;
  categories: Category[];
  sub_categories: SubCategory[];
  bio_data: BioData[];
  sub_names: SubName[];
  id_types: IdType[];
}

export interface Worker {
  id: number;
  name: string;
  worker_code: string;
  worker_type?: string;
  trade: string;
  site?: string;
  phone?: string;
  contractor_name?: string;
  salary_type: 'daily' | 'weekly' | 'monthly';
  daily_rate?: number;
  monthly_salary?: number;
  description?: string;
  is_active: boolean;
  category_id?: number;
  sub_category_id?: number;
  bio_data_id?: number;
}

export interface Attendance {
  id: number;
  worker_id: number;
  date: string;
  shifts: number;
  site?: string;
  remarks?: string;
}

export interface DaybookEntry {
  id: number;
  entry_date: string;
  category_id: number;
  sub_category_id?: number;
  bio_data_id?: number;
  amount: number;
  type: 'income' | 'expense';
  description?: string;
  reference_no?: string;
}

export interface StatCard {
  label: string;
  value: string | number;
  change?: string;
  icon?: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon?: string;
}
