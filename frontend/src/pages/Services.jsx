import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyServices,
  createService,
  updateService,
  deleteService,
  setMyServicesPage,
  resetActionState,
  selectMyServices,
  selectActionLoading
} from "../redux/slices/serviceSlice";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import ServiceCard from "../components/ui/ServiceCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Pagination from "../components/common/Pagination";
import { Plus } from "lucide-react";

const Services = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      duration: "",
      price: "",
    },
  });

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const myServices = useSelector(selectMyServices);
  const actionLoading = useSelector(selectActionLoading);
  
  const { 
    data: services = [], 
    pagination, 
    loading
  } = myServices;

  const isProvider = user?.role === "provider";

  useEffect(() => {
    if (isProvider) {
      fetchServices();
    }
  }, [isProvider]);

  const fetchServices = (page = 1) => {
    if (!isProvider) return;
    
    const params = {
      page,
      limit: pagination.limit || 10,
    };
    dispatch(getMyServices(params));
  };

  const handlePageChange = (page) => {
    dispatch(setMyServicesPage(page));
    fetchServices(page);
  };

  const onSubmit = async (data) => {
    const serviceData = {
      ...data,
      duration: parseInt(data.duration),
      price: parseFloat(data.price),
    };

    try {
      if (editingService) {
        await dispatch(
          updateService({ id: editingService._id, ...serviceData })
        ).unwrap();
        setEditingService(null);
      } else {
        await dispatch(createService(serviceData)).unwrap();
      }
      resetForm();
      setShowForm(false);
      fetchServices(pagination.currentPage);
      dispatch(resetActionState());
    } catch (error) {
      //! Error is handled by Redux thunk
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setShowForm(true);
    reset({
      name: service.name,
      description: service.description || "",
      duration: service.duration,
      price: service.price,
    });
  };

  const handleAddService = () => {
    setEditingService(null);
    resetForm();
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await dispatch(deleteService(id)).unwrap();
        fetchServices(pagination.currentPage);
        dispatch(resetActionState());
      } catch (error) {
        //! Error is handled by Redux thunk
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingService(null);
    resetForm();
    dispatch(resetActionState());
  };

  const resetForm = () => {
    reset({
      name: "",
      description: "",
      duration: "",
      price: "",
    });
  };

  if (!isProvider) {
    return (
      <Card className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Provider Access Required
        </h2>
        <p className="text-gray-600">
          Only service providers can manage services.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Services</h1>
          <p className="text-gray-600 mt-1">Manage your services and pricing</p>
        </div>
        <Button onClick={handleAddService} disabled={actionLoading}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/*----------------- Add/Edit Service Form ----------------------------*/}
      {showForm && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {editingService ? "Edit Service" : "Add New Service"}
            </h2>
            {editingService && (
              <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Editing: {editingService.name}
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Service Name *"
              error={errors.name?.message}
              {...register("name", { required: "Service name is required" })}
              placeholder="e.g., Haircut, Consultation"
              disabled={actionLoading}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                {...register("description")}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                placeholder="Brief description of the service"
                disabled={actionLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Duration (minutes) *"
                type="number"
                error={errors.duration?.message}
                {...register("duration", {
                  required: "Duration is required",
                  min: { value: 15, message: "Minimum 15 minutes" },
                  max: { value: 480, message: "Maximum 8 hours" },
                })}
                placeholder="30"
                disabled={actionLoading}
              />

              <Input
                label="Price ($) *"
                type="number"
                step="0.01"
                error={errors.price?.message}
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0, message: "Price must be positive" },
                })}
                placeholder="50.00"
                disabled={actionLoading}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={actionLoading}
                disabled={actionLoading}
              >
                {editingService ? "Update Service" : "Create Service"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/*------------------------ Loading State --------------------------*/}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : services.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Plus className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No services found
          </h3>
          <p className="text-gray-600 mb-4">
            Add your first service to get started
          </p>
          <Button onClick={handleAddService} disabled={actionLoading}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </Card>
      ) : (
        <>

          {/*------------------------ Services List --------------------------*/}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Showing {services.length} of {pagination.totalItems} services
              </span>
              <span className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
            </div>
            
            {services.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isOwner
              />
            ))}
          </div>

          {/*------------------------ Pagination --------------------------*/}
          {pagination.totalPages > 1 && (
            <Card>
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                onPageChange={handlePageChange}
                limit={pagination.limit}
                hasNextPage={pagination.hasNextPage}
                hasPrevPage={pagination.hasPrevPage}
              />
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Services;