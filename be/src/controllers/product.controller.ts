// be/src/controllers/product.controller.ts
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import Product from "../models/Product";
import { es } from "../search/es";
import { ES_INDEX, indexProduct } from "../search/indexer";

// const sampleProducts = [
//   {
//     name: "Áo thun nam basic",
//     price: 199000,
//     originalPrice: 250000,
//     image: "https://picsum.photos/200?random=1",
//     rating: 4.5,
//     sold: 120,
//     discount: 20,
//     category: "Thời trang",
//     views: 500,
//   },
//   {
//     name: "Giày sneaker trắng",
//     price: 599000,
//     originalPrice: 750000,
//     image: "https://picsum.photos/200?random=2",
//     rating: 4.8,
//     sold: 300,
//     discount: 15,
//     category: "Giày dép",
//     views: 800,
//   },
//   {
//     name: "Laptop Acer Aspire 7",
//     price: 15990000,
//     originalPrice: 17990000,
//     image: "https://picsum.photos/200?random=3",
//     rating: 4.7,
//     sold: 50,
//     discount: 10,
//     category: "Điện tử",
//     views: 2000,
//   },
//   {
//     name: "Điện thoại iPhone 14 Pro",
//     price: 27990000,
//     originalPrice: 29990000,
//     image: "https://picsum.photos/200?random=4",
//     rating: 4.9,
//     sold: 500,
//     discount: 7,
//     category: "Điện thoại",
//     views: 3000,
//   },
//   {
//     name: "Bàn phím cơ Keychron K2",
//     price: 2200000,
//     originalPrice: 2500000,
//     image: "https://picsum.photos/200?random=5",
//     rating: 4.6,
//     sold: 150,
//     discount: 12,
//     category: "Phụ kiện",
//     views: 1200,
//   },
//   {
//     name: "Tai nghe AirPods Pro 2",
//     price: 5490000,
//     originalPrice: 5990000,
//     image: "https://picsum.photos/200?random=6",
//     rating: 4.8,
//     sold: 400,
//     discount: 8,
//     category: "Phụ kiện",
//     views: 1800,
//   },
//   {
//     name: "Túi xách nữ cao cấp",
//     price: 899000,
//     originalPrice: 1200000,
//     image: "https://picsum.photos/200?random=7",
//     rating: 4.5,
//     sold: 200,
//     discount: 25,
//     category: "Thời trang",
//     views: 900,
//   },
//   {
//     name: "Đồng hồ Casio MTP-1374",
//     price: 1499000,
//     originalPrice: 1800000,
//     image: "https://picsum.photos/200?random=8",
//     rating: 4.6,
//     sold: 350,
//     discount: 17,
//     category: "Phụ kiện",
//     views: 1600,
//   },
//   {
//     name: "Sách: Clean Code",
//     price: 350000,
//     originalPrice: 400000,
//     image: "https://picsum.photos/200?random=9",
//     rating: 5.0,
//     sold: 600,
//     discount: 12,
//     category: "Sách",
//     views: 2200,
//   },
//   {
//     name: "Bình giữ nhiệt Lock&Lock",
//     price: 299000,
//     originalPrice: 350000,
//     image: "https://picsum.photos/200?random=10",
//     rating: 4.7,
//     sold: 500,
//     discount: 14,
//     category: "Đồ gia dụng",
//     views: 1000,
//   },
// ];

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
    Product.countDocuments(),
  ]);

  res.json({
    page,
    limit,
    total,
    hasMore: page * limit < total,
    products: products.map((p) => ({
      id: p.id.toString(),
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      image: p.image,
      rating: p.rating,
      sold: p.sold,
      discount: p.discount,
      category: p.category,
      views: p.views,
    })),
  });
});

export const addProduct = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    price,
    originalPrice,
    image,
    rating,
    sold,
    discount,
    category,
    views,
  } = req.body;

  const doc = await Product.create({
    name,
    price,
    originalPrice,
    image,
    rating,
    sold,
    discount,
    category,
    views,
  });

  // index vào ES
  await indexProduct({
    id: doc.id.toString(),
    name: doc.name,
    price: doc.price,
    originalPrice: doc.originalPrice,
    image: doc.image,
    rating: doc.rating,
    sold: doc.sold,
    discount: doc.discount || 0,
    category: doc.category || "other",
    views: doc.views || 0,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });

  res.status(201).json({ message: "Product created", product: doc });
});

// 🔎 Fuzzy Search + Filters
export const searchProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      minDiscount,
      minViews,
      sort, // "popular" | "price_asc" | "price_desc" | "newest"
      page = "1",
      limit = "20",
    } = req.query as Record<string, string>;

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const size = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    const from = (pageNum - 1) * size;

    // build query
    const must: any[] = [];
    const filter: any[] = [];

    if (q && q.trim()) {
      must.push({
        multi_match: {
          query: q,
          type: "best_fields",
          fields: ["name^3", "description", "category"],
          fuzziness: "AUTO", // Fuzzy
          operator: "and",
        },
      });
    }

    if (category) {
      filter.push({ term: { category } });
    }
    if (minPrice || maxPrice) {
      filter.push({
        range: {
          price: {
            gte: minPrice ? Number(minPrice) : undefined,
            lte: maxPrice ? Number(maxPrice) : undefined,
          },
        },
      });
    }
    if (minDiscount) {
      filter.push({ range: { discount: { gte: Number(minDiscount) } } });
    }
    if (minViews) {
      filter.push({ range: { views: { gte: Number(minViews) } } });
    }

    // sort
    let sortClause: any[] = [];
    switch (sort) {
      case "price_asc":
        sortClause = [{ price: "asc" }];
        break;
      case "price_desc":
        sortClause = [{ price: "desc" }];
        break;
      case "newest":
        sortClause = [{ createdAt: "desc" }];
        break;
      default:
        sortClause = [{ views: "desc" }, { sold: "desc" }]; // popular
    }

    const resp = await es.search({
      index: ES_INDEX,
      from,
      size,
      query:
        must.length || filter.length
          ? {
              bool: {
                must: must.length ? must : undefined,
                filter: filter.length ? filter : undefined,
              },
            }
          : { match_all: {} },
      sort: sortClause,
    });

    const hits = (resp.hits.hits || []) as any[];
    const total =
      typeof resp.hits.total === "number"
        ? resp.hits.total
        : resp.hits.total?.value || 0;

    const products = hits.map((h) => {
      const s = h._source;
      return {
        id: s.id,
        name: s.name,
        price: s.price,
        originalPrice: s.originalPrice,
        image: s.image,
        rating: s.rating,
        sold: s.sold,
        discount: s.discount,
        category: s.category,
        views: s.views,
      };
    });

    res.json({
      page: pageNum,
      limit: size,
      total,
      hasMore: pageNum * size < total,
      products,
    });
  }
);
