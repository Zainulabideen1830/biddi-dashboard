import { useAuthStore } from "@/store/auth-store";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export const createProduct = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${useAuthStore.getState().tokens?.accessToken}`,
      },
      body: JSON.stringify({
        name: formData.name,
        measurement_unit: formData.measurementUnit,
        units_in_hours: {
          units: formData.unitsInHours.units,
          hours: formData.unitsInHours.hours,
        },
        labor_count: formData.labor,
        machine_hours: formData.machineHours,
        cost_per_unit: formData.costPerUnit,
        description: formData.description,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create product");
    }

    const data = await response.json();

    return data.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const getProductsServices = async (page = 1, limit = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${useAuthStore.getState().tokens?.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async (productId, data) => {
  try {
    const transformedData = {
      name: data.name,
      measurement_unit: data.measurementUnit,
      units_in_hours: {
        units: Number(data.unitsInHours.units),
        hours: Number(data.unitsInHours.hours)
      },
      labor_count: Number(data.labor),
      machine_hours: Number(data.machineHours),
      cost_per_unit: Number(data.costPerUnit),
      description: data.description
    };

    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${useAuthStore.getState().tokens?.accessToken}`,
      },
      body: JSON.stringify(transformedData),
    });

    if (!response.ok) {
      throw new Error('Failed to update product');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${useAuthStore.getState().tokens?.accessToken}`,
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete product');
    }

    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};


