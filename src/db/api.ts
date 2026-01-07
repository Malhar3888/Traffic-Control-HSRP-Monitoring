import { supabase } from './supabase';
import type {
  Profile,
  Camera,
  Vehicle,
  Violation,
  Payment,
  ActivityLog,
  DashboardStats,
  ViolationsByType,
  ViolationsByDate,
  CameraActivity,
  ViolationFilters,
  VehicleFilters,
  ViolationFormData,
  VehicleFormData,
  CameraFormData,
} from '@/types/types';

// ============= Profiles =============
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const getAllProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

// ============= Cameras =============
export const getAllCameras = async (): Promise<Camera[]> => {
  const { data, error } = await supabase
    .from('cameras')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const getCamera = async (id: string): Promise<Camera | null> => {
  const { data, error } = await supabase
    .from('cameras')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const createCamera = async (camera: CameraFormData): Promise<Camera | null> => {
  const { data, error } = await supabase
    .from('cameras')
    .insert(camera)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const updateCamera = async (id: string, updates: Partial<CameraFormData>): Promise<Camera | null> => {
  const { data, error } = await supabase
    .from('cameras')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const deleteCamera = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('cameras')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// ============= Vehicles =============
export const getAllVehicles = async (filters?: VehicleFilters): Promise<Vehicle[]> => {
  let query = supabase.from('vehicles').select('*');
  
  if (filters?.hasHsrp !== undefined) {
    query = query.eq('has_hsrp', filters.hasHsrp);
  }
  
  if (filters?.vehicleType) {
    query = query.eq('vehicle_type', filters.vehicleType);
  }
  
  if (filters?.plateNumber) {
    query = query.ilike('plate_number', `%${filters.plateNumber}%`);
  }
  
  if (filters?.expiredDocs) {
    const today = new Date().toISOString().split('T')[0];
    query = query.or(`rc_expiry.lt.${today},insurance_expiry.lt.${today},puc_expiry.lt.${today}`);
  }
  
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const getVehicle = async (id: string): Promise<Vehicle | null> => {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const getVehicleByPlate = async (plateNumber: string): Promise<Vehicle | null> => {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('plate_number', plateNumber)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const createVehicle = async (vehicle: VehicleFormData): Promise<Vehicle | null> => {
  const { data, error } = await supabase
    .from('vehicles')
    .insert(vehicle)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const updateVehicle = async (id: string, updates: Partial<VehicleFormData>): Promise<Vehicle | null> => {
  const { data, error } = await supabase
    .from('vehicles')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const deleteVehicle = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// ============= Violations =============
export const getAllViolations = async (filters?: ViolationFilters): Promise<Violation[]> => {
  let query = supabase
    .from('violations')
    .select(`
      *,
      vehicle:vehicles!violations_vehicle_id_fkey(*),
      camera:cameras!violations_camera_id_fkey(*)
    `);
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.type) {
    query = query.eq('violation_type', filters.type);
  }
  
  if (filters?.cameraId) {
    query = query.eq('camera_id', filters.cameraId);
  }
  
  if (filters?.dateFrom) {
    query = query.gte('violation_date', filters.dateFrom);
  }
  
  if (filters?.dateTo) {
    query = query.lte('violation_date', filters.dateTo);
  }
  
  if (filters?.plateNumber) {
    query = query.ilike('plate_number', `%${filters.plateNumber}%`);
  }
  
  query = query.order('violation_date', { ascending: false }).limit(100);
  
  const { data, error } = await query;
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const getViolation = async (id: string): Promise<Violation | null> => {
  const { data, error } = await supabase
    .from('violations')
    .select(`
      *,
      vehicle:vehicles!violations_vehicle_id_fkey(*),
      camera:cameras!violations_camera_id_fkey(*)
    `)
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const createViolation = async (violation: ViolationFormData): Promise<Violation | null> => {
  // Try to find vehicle by plate number
  const vehicle = await getVehicleByPlate(violation.plate_number);
  
  const { data, error } = await supabase
    .from('violations')
    .insert({
      ...violation,
      vehicle_id: vehicle?.id || null,
    })
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const updateViolation = async (id: string, updates: Partial<Violation>): Promise<Violation | null> => {
  const { data, error } = await supabase
    .from('violations')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const deleteViolation = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('violations')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// ============= Payments =============
export const getAllPayments = async (): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      violation:violations!payments_violation_id_fkey(*)
    `)
    .order('created_at', { ascending: false })
    .limit(100);
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const getPaymentsByViolation = async (violationId: string): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('violation_id', violationId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const createPayment = async (payment: Partial<Payment>): Promise<Payment | null> => {
  const { data, error } = await supabase
    .from('payments')
    .insert(payment)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const updatePayment = async (id: string, updates: Partial<Payment>): Promise<Payment | null> => {
  const { data, error } = await supabase
    .from('payments')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

// ============= Activity Logs =============
export const getActivityLogs = async (limit = 50): Promise<ActivityLog[]> => {
  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      *,
      user:profiles!activity_logs_user_id_fkey(*)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const createActivityLog = async (log: Partial<ActivityLog>): Promise<void> => {
  const { error } = await supabase
    .from('activity_logs')
    .insert(log);
  
  if (error) throw error;
};

// ============= Statistics =============
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const today = new Date().toISOString().split('T')[0];
  
  // Get total violations
  const { count: totalViolations } = await supabase
    .from('violations')
    .select('*', { count: 'exact', head: true });
  
  // Get pending violations
  const { count: pendingViolations } = await supabase
    .from('violations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');
  
  // Get today's violations
  const { count: todayViolations } = await supabase
    .from('violations')
    .select('*', { count: 'exact', head: true })
    .gte('violation_date', today);
  
  // Get HSRP violations
  const { count: hsrpViolations } = await supabase
    .from('violations')
    .select('*', { count: 'exact', head: true })
    .eq('violation_type', 'no_hsrp');
  
  // Get total fines
  const { data: finesData } = await supabase
    .from('violations')
    .select('fine_amount');
  
  const totalFines = finesData?.reduce((sum, v) => sum + (Number(v.fine_amount) || 0), 0) || 0;
  
  // Get collected fines
  const { data: paymentsData } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'completed');
  
  const collectedFines = paymentsData?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;
  
  // Get camera stats
  const { count: totalCameras } = await supabase
    .from('cameras')
    .select('*', { count: 'exact', head: true });
  
  const { count: activeCameras } = await supabase
    .from('cameras')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'online');
  
  return {
    totalViolations: totalViolations || 0,
    pendingViolations: pendingViolations || 0,
    totalFines,
    collectedFines,
    activeCameras: activeCameras || 0,
    totalCameras: totalCameras || 0,
    todayViolations: todayViolations || 0,
    hsrpViolations: hsrpViolations || 0,
  };
};

export const getViolationsByType = async (): Promise<ViolationsByType[]> => {
  const { data, error } = await supabase
    .from('violations')
    .select('violation_type, fine_amount');
  
  if (error) throw error;
  
  const grouped = (data || []).reduce((acc, v) => {
    const type = v.violation_type;
    if (!acc[type]) {
      acc[type] = { type, count: 0, amount: 0 };
    }
    acc[type].count++;
    acc[type].amount += Number(v.fine_amount) || 0;
    return acc;
  }, {} as Record<string, ViolationsByType>);
  
  return Object.values(grouped);
};

export const getViolationsByDate = async (days = 7): Promise<ViolationsByDate[]> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('violations')
    .select('violation_date')
    .gte('violation_date', startDate.toISOString());
  
  if (error) throw error;
  
  const grouped = (data || []).reduce((acc, v) => {
    const date = v.violation_date.split('T')[0];
    if (!acc[date]) {
      acc[date] = { date, count: 0 };
    }
    acc[date].count++;
    return acc;
  }, {} as Record<string, ViolationsByDate>);
  
  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
};

export const getCameraActivity = async (): Promise<CameraActivity[]> => {
  const { data: cameras } = await supabase
    .from('cameras')
    .select('id, name, location');
  
  if (!cameras) return [];
  
  const activity = await Promise.all(
    cameras.map(async (camera) => {
      const { count } = await supabase
        .from('violations')
        .select('*', { count: 'exact', head: true })
        .eq('camera_id', camera.id);
      
      return {
        camera_id: camera.id,
        camera_name: camera.name,
        location: camera.location,
        violation_count: count || 0,
      };
    })
  );
  
  return activity.sort((a, b) => b.violation_count - a.violation_count);
};
