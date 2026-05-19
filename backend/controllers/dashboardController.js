import Property from "../models/Property.js";
import Enquiry from "../models/Enquiry.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalProperties, totalEnquiries,
    availableProperties, soldProperties, featuredProperties,
    newEnquiries, contactedEnquiries,
    recentEnquiries, recentProperties,
  ] = await Promise.all([
    Property.countDocuments(),
    Enquiry.countDocuments(),
    Property.countDocuments({ status: "Available" }),
    Property.countDocuments({ status: "Sold" }),
    Property.countDocuments({ featured: true }),
    Enquiry.countDocuments({ status: "New" }),
    Enquiry.countDocuments({ status: "Contacted" }),
    Enquiry.find().sort("-createdAt").limit(5),
    Property.find().sort("-createdAt").limit(5),
  ]);

  sendSuccess(res, {
    stats: {
      totalProperties, totalEnquiries,
      availableProperties, soldProperties, featuredProperties,
      newEnquiries, contactedEnquiries,
    },
    recentEnquiries,
    recentProperties,
  }, "Dashboard stats fetched");
});
