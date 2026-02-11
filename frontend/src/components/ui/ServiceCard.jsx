import Card from "../common/Card";
import Button from "../common/Button";

const ServiceCard = ({ service, onEdit, onDelete, isOwner = false }) => {
  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">
            {service.name}
          </h3>
          {service.description && (
            <p className="text-gray-600 mt-1 text-sm">{service.description}</p>
          )}
          <div className="flex items-center gap-4 mt-3">
            <span className="text-sm text-gray-700">
              {formatDuration(service.duration)}
            </span>
            <span className="text-sm font-medium text-primary-600">
              ${service.price}
            </span>
          </div>
        </div>

        {isOwner && (
          <div className="flex gap-2 ml-4">
            <Button
              variant="ghost"
              size="small"
              onClick={() => onEdit(service)}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="small"
              onClick={() => onDelete(service._id)}
            >
              Delete
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ServiceCard;
