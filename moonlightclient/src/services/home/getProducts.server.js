import connectDB from "@/db/mongodb/db";
import Product from "@/db/mongodb/product/productModule_fixed";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getProducts(query = "", pCategory = "", sCategory = "") {
  await connectDB();

  let filter = {};

  if (pCategory || sCategory) {
    const conditions = [];

    if (pCategory) {
      const category = pCategory.trim().replace(/-/g, " ").replace(/\s+/g, " ");
      conditions.push({
        category: { $regex: `^${escapeRegex(category)}$`, $options: "i" },
      });
    }

    if (sCategory) {
      const machineType = sCategory
        .trim()
        .split(/[-\s]+/)
        .map(escapeRegex)
        .join("[-\\s]+");
      conditions.push({
        machineType: { $regex: `^${machineType}$`, $options: "i" },
      });
    }

    filter = { $and: conditions };
  } else if (query) {
    const searchTerm = query.trim().replace(/-/g, " ").replace(/\s+/g, " ");
    const searchRegex = new RegExp(escapeRegex(searchTerm), "i");

    filter = {
      $or: [
        { name: { $regex: searchRegex } },
        { category: { $regex: searchRegex } },
        { machineType: { $regex: searchRegex } },
      ],
    };
  }

  return Product.find(filter)
    .select({
      _id: 0,
      name: 1,
      slug: 1,
      sku: 1,
      pricing: 1,
      images: 1,
      category: 1,
      machineType: 1,
    })
    .lean();
}
