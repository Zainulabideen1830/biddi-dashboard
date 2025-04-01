"use client";
import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { createProduct, updateProduct } from "@/lib/products";
import { toast } from "react-toastify";

const DEFAULT_DATA = {
  name: "",
  measurementUnit: "",
  unitsInHours: {
    units: "",
    hours: "",
  },
  labor: "",
  machineHours: "",
  costPerUnit: "",
  description: "",
};

const AddProductService = ({ product = null, onSuccess, open, setOpen }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;
  const [error, setError] = useState("");

  // State for form inputs
  const [formData, setFormData] = useState(DEFAULT_DATA);

  // Initialize form data when product prop changes
  useEffect(() => {
    if (product && open) {
      setFormData({
        name: product.name,
        measurementUnit: product.measurement_unit,
        unitsInHours: {
          units: product.units_in_hours.units,
          hours: product.units_in_hours.hours,
        },
        labor: product.labor_count,
        machineHours: product.machine_hours,
        costPerUnit: product.cost_per_unit,
        description: product.description || "",
      });
      setCurrentStep(1);
    }
  }, [product, open]);

  const { mutate: createMutate, isPending: isCreating } = useMutation({
    mutationFn: () => createProduct(formData),
    onSuccess: () => {
      setOpen(false);
      setFormData(DEFAULT_DATA);
      setCurrentStep(1);
      toast.success("Product created successfully");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Failed to create product");
    },
  });

  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: () => updateProduct(product?.id, formData),
    onSuccess: () => {
      setOpen(false);
      setFormData(DEFAULT_DATA);
      setCurrentStep(1);
      toast.success("Product updated successfully");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Failed to update product");
    },
  });

  const isPending = isCreating || isUpdating;

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          setError("Please enter a product name");
          return false;
        }
        break;
      case 2:
        if (!formData.measurementUnit) {
          setError("Please select a measurement unit");
          return false;
        }
        break;
      case 3:
        if (!formData.unitsInHours.units || !formData.unitsInHours.hours) {
          setError("Please enter both units and hours");
          return false;
        }
        break;
      case 4:
        if (!formData.labor) {
          setError("Please enter labor hours");
          return false;
        }
        break;
      case 5:
        if (!formData.machineHours) {
          setError("Please enter machine hours");
          return false;
        }
        break;
      case 6:
        if (!formData.costPerUnit) {
          setError("Please enter cost per unit");
          return false;
        }
        break;
      case 7:
        // Description is optional
        return true;
      case 8:
        return true;
      default:
        return true;
    }
    return true;
  };

  const handleInputChange =
    (field, subField = null) =>
    (e) => {
      setError(""); // Clear error when user types
      if (field === "measurementUnit") {
        setFormData((prev) => ({
          ...prev,
          [field]: e,
        }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        [field]: subField
          ? { ...prev[field], [subField]: e.target.value }
          : e.target.value,
      }));
    };

  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  const handleNext = () => {
    if (currentStep === totalSteps) {
      if (product) {
        updateMutate();
      } else {
        createMutate();
      }
    }
    if (validateStep(currentStep)) {
      setError("");
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const getStepContent = (step) => {
    switch (step) {
      case 1:
        return {
          question: "What is the name of this new product?",
          input: (
            <Input
              className={`w-full p-4 text-lg h-12 ${
                error ? "border-red-500" : ""
              }`}
              placeholder="Enter product name"
              value={formData.name}
              onChange={handleInputChange("name")}
            />
          ),
        };
      case 2:
        return {
          question: "What is the unit of measurement?",
          input: (
            <Select
              className={`w-full p-4 text-lg ${error ? "border-red-500" : ""}`}
              value={formData.measurementUnit}
              onValueChange={handleInputChange("measurementUnit")}
            >
              <SelectTrigger
                className={`h-12 ${error ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select a unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linear ft">Linear ft</SelectItem>
                <SelectItem value="sq ft">Sq ft</SelectItem>
                <SelectItem value="units">Units</SelectItem>
              </SelectContent>
            </Select>
          ),
        };
      case 3:
        return {
          question: `How many ${formData.measurementUnit} can be completed in how many hour(s)?`,
          input: (
            <div className="flex gap-4">
              <Input
                className={`w-full p-4 text-lg h-12 ${
                  error ? "border-red-500" : ""
                }`}
                placeholder={`Number of ${formData.measurementUnit}`}
                type="number"
                value={formData.unitsInHours.units}
                onChange={handleInputChange("unitsInHours", "units")}
              />
              <Input
                className={`w-full p-4 text-lg h-12 ${
                  error ? "border-red-500" : ""
                }`}
                placeholder="Number of hours"
                type="number"
                value={formData.unitsInHours.hours}
                onChange={handleInputChange("unitsInHours", "hours")}
              />
            </div>
          ),
        };
      case 4:
        return {
          question: `How many laborers are working to install ${formData.unitsInHours.units} ${formData.measurementUnit} in ${formData.unitsInHours.hours} hours?`,
          input: (
            <Input
              className={`w-full p-4 text-lg h-12 ${
                error ? "border-red-500" : ""
              }`}
              placeholder="Enter number of laborers"
              type="number"
              value={formData.labor}
              onChange={handleInputChange("labor")}
            />
          ),
        };
      case 5:
        return {
          question: `How many machine-hours are needed to do ${formData.unitsInHours.units} ${formData.measurementUnit} in ${formData.unitsInHours.hours} hours?`,
          input: (
            <Input
              className={`w-full p-4 text-lg h-12 ${
                error ? "border-red-500" : ""
              }`}
              placeholder="Enter machine hours"
              type="number"
              value={formData.machineHours}
              onChange={handleInputChange("machineHours")}
            />
          ),
        };
      case 6:
        return {
          question: `What is your material/product cost per ${formData.measurementUnit}?`,
          input: (
            <>
              <Input
                className={`w-full p-4 text-lg h-12 ${
                  error ? "border-red-500" : ""
                }`}
                placeholder="Enter cost per unit"
                type="number"
                value={formData.costPerUnit}
                onChange={handleInputChange("costPerUnit")}
              />
              <p className="text-[12px] font-semibold text-gray-500 mt-2">
                The cost is in USD
              </p>
            </>
          ),
        };
      case 7:
        return {
          question: "Add a description",
          input: (
            <Textarea
              className="w-full p-4 text-lg h-12"
              placeholder="Enter description"
              value={formData.description}
              onChange={handleInputChange("description")}
            />
          ),
        };
      case 8:
        return {
          //   question: "Review your answers",
          input: (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <p className="text-primary text-sm font-semibold mb-3">
                    Question #1
                  </p>
                  <p className="text-sm font-semibold">
                    What is the name of this new product?
                  </p>
                  <Input
                    className="w-full p-4 text-lg h-12 mt-4 bg-[#E0E0E0] border-2 border-gray-300 rounded-md"
                    value={formData.name}
                    disabled
                  />
                </div>

                <div>
                  <p className="text-primary text-sm font-semibold mb-3">
                    Question #2
                  </p>
                  <p className="text-sm font-semibold">
                    What is the unit of measurement?
                  </p>
                  <Input
                    className="w-full p-4 text-lg h-12 mt-4 bg-[#E0E0E0] border-2 border-gray-300 rounded-md"
                    value={formData.measurementUnit}
                    disabled
                  />
                </div>

                <div>
                  <p className="text-primary text-sm font-semibold mb-3">
                    Question #3
                  </p>
                  <p className="text-sm font-semibold">
                    How many {formData.measurementUnit} can be completed in how
                    many hours?
                  </p>
                  <Input
                    className="w-full p-4 text-lg h-12 mt-4 bg-[#E0E0E0] border-2 border-gray-300 rounded-md"
                    value={`${formData.unitsInHours.units} ${formData.measurementUnit} in ${formData.unitsInHours.hours} hours`}
                    disabled
                  />
                </div>

                <div>
                  <p className="text-primary text-sm font-semibold mb-3">
                    Question #4
                  </p>
                  <p className="text-sm font-semibold">
                    How many laborers are working?
                  </p>
                  <Input
                    className="w-full p-4 text-lg h-12 mt-4 bg-[#E0E0E0] border-2 border-gray-300 rounded-md"
                    value={formData.labor}
                    disabled
                  />
                </div>

                <div>
                  <p className="text-primary text-sm font-semibold mb-3">
                    Question #5
                  </p>
                  <p className="text-sm font-semibold">
                    How many machine-hours are needed?
                  </p>
                  <Input
                    className="w-full p-4 text-lg h-12 mt-4 bg-[#E0E0E0] border-2 border-gray-300 rounded-md"
                    value={formData.machineHours}
                    disabled
                  />
                </div>

                <div>
                  <p className="text-primary text-sm font-semibold mb-3">
                    Question #6
                  </p>
                  <p className="text-sm font-semibold">
                    What is your material/product cost per{" "}
                    {formData.measurementUnit}?
                  </p>
                  <Input
                    className="w-full p-4 text-lg h-12 mt-4 bg-[#E0E0E0] border-2 border-gray-300 rounded-md"
                    value={formData.costPerUnit}
                    disabled
                  />
                </div>

                <div>
                  <p className="text-primary text-sm font-semibold mb-3">
                    Question #7
                  </p>
                  <p className="text-sm font-semibold">Description</p>
                  <Textarea
                    className="w-full p-4 text-lg h-12 mt-4 bg-[#E0E0E0] border-2 border-gray-300 rounded-md"
                    value={formData.description}
                    disabled
                  />
                </div>
              </div>
            </div>
          ),
        };
      default:
        return {
          question: "",
          input: null,
        };
    }
  };

  const currentStepContent = getStepContent(currentStep);

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          setFormData(DEFAULT_DATA);
          setCurrentStep(1);
          setError("");
        }
      }}
    >
      <DialogContent
        className="sm:max-w-[600px]"
        onInteractOutside={(e) => (isPending ? e.preventDefault() : setOpen(false))}
      >
        <DialogHeader className="mb-10">
          <DialogTitle>
            {product ? "Edit Product/Service" : "Add New Product/Service"}
          </DialogTitle>
        </DialogHeader>
        {/* Stepper Navigation */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((step) => (
            <div
              key={step}
              className={`flex items-center ${
                step !== steps.length ? "flex-1" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                                ${
                                  currentStep === step
                                    ? "bg-blue-500 text-white"
                                    : currentStep > step
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 text-gray-500"
                                }`}
              >
                {step}
              </div>
              {step !== steps.length && (
                <div
                  className={`h-[2px] flex-1 mx-2 ${
                    currentStep > step ? "bg-blue-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Question Content */}
        <div className="space-y-6 px-10 min-h-[320px] max-h-[500px] overflow-y-auto">
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-primary mb-2">
              {currentStep === totalSteps ? "" : `Question #${currentStep}`}
            </h2>
            <h3 className="text-2xl font-bold text-[#0F172A]">
              {currentStepContent.question}
            </h3>
          </div>

          <div className="py-4">
            {currentStepContent.input}
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          </div>

          <div className="flex justify-between pt-6">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                ← Previous Step
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="primary" onClick={handleNext} disabled={isPending}>
              {isPending
                ? product
                  ? "Updating..."
                  : "Submitting..."
                : currentStep === totalSteps
                ? product
                  ? "Update"
                  : "Submit"
                : "Next Step →"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductService;
