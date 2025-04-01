"use client";
import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
// import data from "./data.json";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getProductsServices, deleteProduct } from "@/lib/products";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import AddProductService from "./AddProductService";
import { Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "react-toastify";

const ProductsServicesTable = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["products-services", currentPage, itemsPerPage],
    queryFn: () => getProductsServices(currentPage, itemsPerPage),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      refetch();
      // If we're on a page with only one item and deleting it, go back to previous page
      if (data?.data?.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete product");
    },
  });

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id);
    }
    setDeleteDialogOpen(false);
  };

  const handleNextPage = () => {
    if (data?.pagination?.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (data?.pagination?.hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (isError) return <div>Error: {error.message}</div>;

  // Calculate items range for display
  const startItem = data?.pagination
    ? (data.pagination.currentPage - 1) * data.pagination.limit + 1
    : 0;
  const endItem = data?.pagination
    ? Math.min(startItem + data.pagination.limit - 1, data.pagination.total)
    : 0;
  const totalItems = data?.pagination?.total || 0;

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-end items-center mb-4 -mt-16">
          <Button variant="primary" size="xl" onClick={handleAddNew}>
            <Plus className="size-4" />
            Add New Product/Service
          </Button>
        </div>

        <div className="bg-white dark:bg-backgroundSecondary rounded-lg shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Name</TableHead>
                <TableHead>Measurement</TableHead>
                <TableHead>Material cost</TableHead>
                <TableHead>Man hours</TableHead>
                <TableHead>Machine hours</TableHead>
                <TableHead>Date last updated</TableHead>
                <TableHead>Updated by</TableHead>
                <TableHead className="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching &&
                Array.from({ length: itemsPerPage }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={8} className="text-center">
                      <Skeleton className="w-full h-10" />
                    </TableCell>
                  </TableRow>
                ))}
              {!isFetching &&
                !isError &&
                data?.data?.map((item) => (
                  <TableRow key={item.id} className="text-[#747474]">
                    <TableCell className="pl-4 text-[#0F172A] font-semibold flex items-center gap-4">
                      <div className="w-[3px] h-6 bg-[#07A04A] rounded-full"></div>
                      {item.name}
                    </TableCell>
                    <TableCell>{item.measurement_unit}</TableCell>
                    <TableCell>{item.cost_per_unit}</TableCell>
                    <TableCell>{item.units_in_hours?.hours}</TableCell>
                    <TableCell>{item.machine_hours}</TableCell>
                    <TableCell>
                      {format(new Date(item.updated_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{item.created_by?.name}</TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center gap-3 justify-end">
                        <Button
                          variant="outline"
                          className="p-2 outline-none border-none"
                          onClick={() => handleEdit(item)}
                        >
                          <Icon icon="mdi:pencil" className="h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          className="p-2 outline-none border-none text-red-500"
                          onClick={() => handleDeleteClick(item)}
                          disabled={deleteMutation.isPending}
                        >
                          <Icon icon="mdi:trash" className="h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              {!isFetching &&
                !isError &&
                (!data?.data || data.data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No products found
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </div>
        {/* table pagination info */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {totalItems > 0
              ? `Showing ${startItem} to ${endItem} of ${totalItems} items`
              : "No items to display"}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-gray-500"
              onClick={handlePreviousPage}
              disabled={!data?.pagination?.hasPreviousPage}
            >
              <Icon icon="mdi:chevron-left" className="h-4" />
              Previous
            </Button>
            <Button
              variant="primary"
              onClick={handleNextPage}
              disabled={!data?.pagination?.hasNextPage}
            >
              Next
              <Icon icon="mdi:chevron-right" className="h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Add/Edit Product Dialog */}
      <AddProductService
        product={selectedProduct}
        open={modalOpen}
        setOpen={setModalOpen}
        onSuccess={() => {
          setSelectedProduct(null);
          setModalOpen(false);
          refetch();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete "{productToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProductsServicesTable;
