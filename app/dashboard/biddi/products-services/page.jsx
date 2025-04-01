import AddProductService from '@/components/dashboard/biddi/products-services/AddProductService'
import ProductsServicesTable from '@/components/dashboard/biddi/products-services/ProductServicesTable'
import SectionHeading from '@/components/shared/section-heading'
import React from 'react'

const ProductsServicesPage = () => {
  return (
    <div className="space-y-6 custom_container">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Products & Services</h1>
          <p className="text-muted-foreground">Manage products and services in your organization</p>
        </div>
        <AddProductService />
      </div>
      <ProductsServicesTable />
    </div>
  )
}

export default ProductsServicesPage