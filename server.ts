import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import {
  dbGetProducts,
  dbSaveProduct,
  dbDeleteProduct,
  dbGetOrders,
  dbSaveOrder,
  dbDeleteOrder,
  dbGetConfig,
  dbSaveConfig,
  seedFirebaseFromLocal
} from "./src/lib/firebase-server.js";

const PORT = 3000;
const ADMIN_EMAIL = "wudchannel12345@gmail.com";
const ADMIN_PASSWORD = "wud52590006";
const ADMIN_TOKEN = "ADMIN_SECURE_TOKEN_wudchannel52590006";

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const CATEGORIES_FILE = path.join(DATA_DIR, "categories.json");
const SLIDES_FILE = path.join(DATA_DIR, "slides.json");
const CARRIERS_FILE = path.join(DATA_DIR, "carriers.json");
const PAYMENTS_FILE = path.join(DATA_DIR, "payments.json");

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initial Settings
const defaultSettings = {
  shopName: "WUD SHOP",
  slogan: "ແຫຼ່ງລວມສິນຄ້າພຣີມ່ຽມ ແລະ ດີລສຸດພິເສດ",
  contactPhone: "020-52590006"
};

// Initial Categories
const defaultCategories = ["Gadgets", "Audio", "Kitchen", "Furniture", "ທົ່ວໄປ"];

// Initial Slider Images
const defaultSlides = [
  {
    id: "slide-1",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1200",
    title: "ຫູຟັງ ແລະ ເຄື່ອງສຽງລະດັບພຣີມ່ຽມ",
    subtitle: "ຫຼຸດສູງສຸດ 30% ສໍາລັບອາທິດນີ້"
  },
  {
    id: "slide-2",
    imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=1200",
    title: "ໂມງອັດສະລິຍະ Smart Watch Series 9",
    subtitle: "ຕິດຕາມສຸຂະພາບຂອງທ່ານໄດ້ຕະຫຼອດ 24 ຊົ່ວໂມງ"
  }
];

// Initial Shipping Carriers
const defaultCarriers = [
  { id: "carrier-1", name: "Anousith Express", logo: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=120&h=120&fit=crop", desc: "ຈັດສົ່ງດ່ວນ ທົ່ວປະເທດລາວ (1-2 ວັນ)" },
  { id: "carrier-2", name: "HAL Logistics", logo: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=120&h=120&fit=crop", desc: "ບໍລິການຂົນສົ່ງເຄື່ອງໄວ ທັນໃຈ (1-3 ວัน)" },
  { id: "carrier-3", name: "Mixay Express", logo: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=120&h=120&fit=crop", desc: "ຈັດສົ່ງປອດໄພ ໄວ້ວາງໃຈໄດ້ (2-3 ວັນ)" }
];

// Initial Payment Methods
const defaultPayments = [
  { id: "payment-1", name: "BCEL One", accountName: "WUD CHANNEL SHOP", accountNumber: "160-12-00-52590006", qrImageUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=WUD%20SHOP%20BCEL%20ONE%20PAYMENT" },
  { id: "payment-2", name: "LDB Trust", accountName: "WUD CHANNEL SHOP", accountNumber: "102-15-11-20412345", qrImageUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=WUD%20SHOP%20LDB%20PAYMENT" }
];

// Seed Products in Lao
const initialProducts = [
  {
    id: "prod-1",
    name: "ໂມງອັດສະລິຍະ Smart Watch Series 9",
    description: "ໂມງອັດສະລິຍະໜ້າຈໍ AMOLED ຄົມຊັດ ຟັງຊັນສຸຂະພາບຄົບຊຸດ ວັດແທກອັດຕາການເຕັ້ນຂອງຫົວໃຈ ອົກຊີເຈນໃນເລືອດ ໂໝດອອກກຳລັງກາຍຫຼາຍກວ່າ 100 ໂໝດ ກັນນ້ຳລະດັບ 5ATM ແບັດເຕີຣີໃຊ້ໄດ້ດົນເຖິງ 14 ວັນ",
    price: 990000,
    originalPrice: 1290000,
    imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=600",
    stock: 25,
    category: "Gadgets",
    discountBadge: "ຫຼຸດ 23%"
  },
  {
    id: "prod-2",
    name: "ຫູຟັງໄຮ້ສາຍ Bluetooth Headphones ANC",
    description: "ຫູຟັງຄອບຫູໄຮ້ສາຍພ້ອມລະບົບຕັດສຽງລົບກວນ ANC ພະລັງສຽງເບສແໜ້ນ ລາຍລະອຽດສຽງຄົມຊັດ ໃສ່ສະບາຍດ້ວຍເມມໂມຣີໂຟມນຸ່ມພິເສດ ແບັດເຕີຣີໃຊ້ງານຕໍ່ເນື່ອງ 40 ຊົ່ວໂມງ",
    price: 350000,
    originalPrice: 450000,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
    stock: 15,
    category: "Audio",
    discountBadge: "ຂາຍດີ"
  },
  {
    id: "prod-3",
    name: "ຕັ່ງເພື່ອສຸຂະພາບ Ergonomic Office Chair",
    description: "ຕັ່ງເຮັດວຽກເພື່ອສຸຂະພາບ ອອກແບບຕາມຫຼັກສີລະສາດ ຮອງຮັບກະດູກສັນຫຼັງ ແລະ ແຜ່ນຫຼັງສ່ວນລຸ່ມ ປັບລະດັບຄວາມສູງ ບ່ອນວางແຂນ ແລະ ອົງສາການເອນໄດ້ ຕາໜ່າງລະບາຍອາກາດດີເລີດ",
    price: 420000,
    originalPrice: 590000,
    imageUrl: "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=600",
    stock: 10,
    category: "Furniture",
    discountBadge: "ແນະນຳ"
  },
  {
    id: "prod-4",
    name: "ຄີບອດກົນໄກ Mechanical Keyboard Wireless",
    description: "ຄີບອດກົນໄກໄຮ້ສາຍຂະໜາດ 75% ສະວິດສຳຜັດນຸ່ມນວນ (Brown Switch) ຮອງຮັບການເຊື່ອມຕໍ່ 3 ໂໝດ (Bluetooth, 2.4G, Type-C) ໄຟ RGB ປັບແຕ່ງໄດ້ຫຼາກຫຼາຍ",
    price: 290000,
    originalPrice: 390000,
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600",
    stock: 18,
    category: "Gadgets",
    discountBadge: "ຫຼຸດ 25%"
  },
  {
    id: "prod-5",
    name: "ລຳໂພງບູທູດພົກພາ Portable Speaker Pro",
    description: "ລຳໂພງບູທູດພົກພາຂະໜາດນ້ອຍແຕ່ພະລັງສຽງຊົງພະລັງ ກັນນ້ຳລະດັບ IPX7 ເໝາะສຳລັບການເດີນທາງ ແລະ ກິດຈະກຳກາງແຈ້ງ ເຊື່ອມຕໍ່ສະຖຽນດ້ວຍ Bluetooth 5.3",
    price: 185000,
    originalPrice: 249000,
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=600",
    stock: 30,
    category: "Audio",
    discountBadge: "ຄຸ້ມຄ່າສຸດໆ"
  },
  {
    id: "prod-6",
    name: "ກາຕົ້ມນ້ຳກາເຟດຣິບສະແຕนເລດ Pour-Over Coffee Kettle",
    description: "ກາຕົ້ມນ້ຳດຣິບກາເຟໄຟຟ້າ ຄວບຄຸມອຸນຫະພູມໄດ້ຢ່າງຊັດເຈນ ຫົວຄໍຫ່ານເທນ້ຳໄດ້ສະໝ່ຳສະເໝີ ຜະລິດຈາກສະແຕນເລດເກຣດ 304 ຄຸນນະພາບສູງ ປອດໄພ ທົນທານ",
    price: 220000,
    originalPrice: 290000,
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600",
    stock: 12,
    category: "Kitchen",
    discountBadge: "ສິນຄ້າໃໝ່"
  }
];

// Helper Functions using Firebase Firestore
async function getProducts() {
  return await dbGetProducts();
}
async function saveProducts(data: any[]) {
  const currentInDb = await dbGetProducts();
  const currentIds = data.map(p => p.id);
  for (const item of currentInDb) {
    if (!currentIds.includes(item.id)) {
      await dbDeleteProduct(item.id);
    }
  }
  for (const item of data) {
    const { id, ...fields } = item;
    await dbSaveProduct(id, fields);
  }
}

async function getOrders() {
  return await dbGetOrders();
}
async function saveOrders(data: any[]) {
  const currentInDb = await dbGetOrders();
  const currentIds = data.map(o => o.id);
  for (const item of currentInDb) {
    if (!currentIds.includes(item.id)) {
      await dbDeleteOrder(item.id);
    }
  }
  for (const item of data) {
    const { id, ...fields } = item;
    await dbSaveOrder(id, fields);
  }
}

async function getSettings() {
  return await dbGetConfig("settings", defaultSettings);
}
async function saveSettings(data: any) {
  await dbSaveConfig("settings", data);
}

async function getCategories() {
  return await dbGetConfig("categories", defaultCategories);
}
async function saveCategories(data: any[]) {
  await dbSaveConfig("categories", data);
}

async function getSlides() {
  return await dbGetConfig("slides", defaultSlides);
}
async function saveSlides(data: any[]) {
  await dbSaveConfig("slides", data);
}

async function getCarriers() {
  return await dbGetConfig("carriers", defaultCarriers);
}
async function saveCarriers(data: any[]) {
  await dbSaveConfig("carriers", data);
}

async function getPayments() {
  return await dbGetConfig("payments", defaultPayments);
}
async function savePayments(data: any[]) {
  await dbSaveConfig("payments", data);
}


async function startServer() {
  // Seed/migrate database if empty on startup
  await seedFirebaseFromLocal(
    initialProducts,
    defaultSettings,
    defaultCategories,
    defaultSlides,
    defaultCarriers,
    defaultPayments
  );

  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use("/uploads", express.static(UPLOADS_DIR));

  // CORS Headers
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Admin auth middleware
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${ADMIN_TOKEN}`) {
      res.status(401).json({ success: false, message: "ບໍ່ມີສິດເຂົ້າເຖິງ (Unauthorized)" });
      return;
    }
    next();
  };

  // --- API Routes ---

  // Auth: Login
  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      res.json({
        success: true,
        token: ADMIN_TOKEN,
        message: "ເຂົ້າສູ່ລະບົບສຳເລັດ"
      });
    } else {
      res.status(401).json({
        success: false,
        message: "ອີເມລ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ"
      });
    }
  });

  // Products: Get list (public)
  app.get("/api/products", async (req, res) => {
    res.json(await getProducts());
  });

  // Products: Create (Admin)
  app.post("/api/products", requireAdmin, async (req, res) => {
    const { name, description, price, originalPrice, imageUrl, stock, category, discountBadge } = req.body;
    
    if (!name || price === undefined || stock === undefined) {
      res.status(400).json({ success: false, message: "ກະລຸນາກອກຂໍ້ມູນທີ່ຈຳເປັນໃຫ້ຄົບຖ້ວນ (ຊື່, ລາຄາ, ສະຕັອກ)" });
      return;
    }

    const products = await getProducts();
    const newProduct = {
      id: "prod-" + Date.now(),
      name,
      description: description || "",
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=600",
      stock: Number(stock),
      category: category || "ທົ່ວໄປ",
      discountBadge: discountBadge || ""
    };

    products.push(newProduct);
    await saveProducts(products);
    res.status(201).json({ success: true, product: newProduct });
  });

  // Products: Edit (Admin)
  app.put("/api/products/:id", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, description, price, originalPrice, imageUrl, stock, category, discountBadge } = req.body;

    const products = await getProducts();
    const index = products.findIndex((p: any) => p.id === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: "ບໍ່ພົບສິນຄ້າທີ່ຕ້ອງການແກ້ໄຂ" });
      return;
    }

    products[index] = {
      ...products[index],
      name: name !== undefined ? name : products[index].name,
      description: description !== undefined ? description : products[index].description,
      price: price !== undefined ? Number(price) : products[index].price,
      originalPrice: originalPrice !== undefined ? (originalPrice ? Number(originalPrice) : undefined) : products[index].originalPrice,
      imageUrl: imageUrl !== undefined ? imageUrl : products[index].imageUrl,
      stock: stock !== undefined ? Number(stock) : products[index].stock,
      category: category !== undefined ? category : products[index].category,
      discountBadge: discountBadge !== undefined ? discountBadge : products[index].discountBadge
    };

    await saveProducts(products);
    res.json({ success: true, product: products[index] });
  });

  // Products: Delete (Admin)
  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const products = await getProducts();
    const filtered = products.filter((p: any) => p.id !== id);

    if (products.length === filtered.length) {
      res.status(404).json({ success: false, message: "ບໍ່ພົບສິນຄ້າທີ່ຕ້ອງການລົບ" });
      return;
    }

    await saveProducts(filtered);
    res.json({ success: true, message: "ລົບສິນຄ້າຮຽບຮ້ອຍແລ້ວ" });
  });

  // Orders: Get list (Admin)
  app.get("/api/orders", requireAdmin, async (req, res) => {
    const orders = await getOrders();
    orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(orders);
  });

  // Orders: Create (Public - Place order)
  app.post("/api/orders", async (req, res) => {
    const { customerName, contactPhone, shippingAddress, shippingProvider, items, paymentMethod, paymentSlip } = req.body;

    if (!customerName || !contactPhone || !shippingAddress || !shippingProvider || !items || !items.length || !paymentSlip) {
      res.status(400).json({ success: false, message: "ກະລຸນາກອກຂໍ້ມູນການສັ່ງຊື້, ຈັດສົ່ງ ແລະ ແນບສະລິບການໂอนເງິນໃຫ້ຄົບຖ້ວນ" });
      return;
    }

    const orders = await getOrders();
    const products = await getProducts();

    let totalAmount = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const product = products.find((p: any) => p.id === item.productId);
      if (!product) {
        res.status(400).json({ success: false, message: `ບໍ່ພົບສິນຄ້ານີ້ໃນລະບົບ` });
        return;
      }

      if (product.stock < item.quantity) {
        res.status(400).json({ success: false, message: `ສິນຄ້າ '${product.name}' ມີສະຕັອກບໍ່ພຽງພໍ (ເຫຼືອ ${product.stock} ຊິ້ນ)` });
        return;
      }

      product.stock -= item.quantity;
      const itemPrice = product.price;
      totalAmount += itemPrice * item.quantity;

      orderItems.push({
        productId: product.id,
        name: product.name,
        price: itemPrice,
        quantity: item.quantity,
        imageUrl: product.imageUrl
      });
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");
    const rand = String(Math.floor(1000 + Math.random() * 9000));
    const orderNumber = `ORD-${year}${month}${date}-${rand}`;

    const newOrder = {
      id: "order-" + Date.now(),
      orderNumber,
      customerName,
      contactPhone,
      shippingAddress,
      shippingProvider,
      items: orderItems,
      totalAmount,
      status: "ລໍຖ້າດຳເນີນການ",
      createdAt: new Date().toISOString(),
      paymentMethod: paymentMethod || "BCEL One",
      paymentSlip
    };

    orders.push(newOrder);
    await saveOrders(orders);
    await saveProducts(products);

    res.status(201).json({
      success: true,
      message: "ສັ່ງຊື້ສິນຄ້າຮຽບຮ້ອຍແລ້ວ",
      order: newOrder
    });
  });

  // Orders: Update Status (Admin)
  app.put("/api/orders/:id/status", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["ລໍຖ້າດຳເນີນການ", "ກຳລັງຈັດສົ່ງ", "ຈັດສົ່ງສຳເລັດ", "ຍົກເລີກ"];
    if (!status || !allowedStatuses.includes(status)) {
      res.status(400).json({ success: false, message: "ສະຖານະອໍເດີ້ບໍ່ຖືກຕ້ອງ" });
      return;
    }

    const orders = await getOrders();
    const index = orders.findIndex((o: any) => o.id === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: "ບໍ່ພົບອໍເດີ້ທີ່ຕ້ອງການ" });
      return;
    }

    // Restore stock if cancelled
    if (status === "ຍົກເລີກ" && orders[index].status !== "ຍົກເລີກ") {
      const products = await getProducts();
      for (const item of orders[index].items) {
        const prodIndex = products.findIndex((p: any) => p.id === item.productId);
        if (prodIndex !== -1) {
          products[prodIndex].stock += item.quantity;
        }
      }
      await saveProducts(products);
    } 
    // Deduct stock if un-cancelled
    else if (orders[index].status === "ຍົກເລີກ" && status !== "ຍົກເລີກ") {
      const products = await getProducts();
      for (const item of orders[index].items) {
        const prodIndex = products.findIndex((p: any) => p.id === item.productId);
        if (prodIndex !== -1) {
          if (products[prodIndex].stock < item.quantity) {
            res.status(400).json({ 
              success: false, 
              message: `ບໍ່ສາມາດປ່ຽນສະຖານະໄດ້ເນື່ອງຈາກສະຕັອກສິນຄ້າ '${products[prodIndex].name}' ບໍ່ພຽງພໍ` 
            });
            return;
          }
          products[prodIndex].stock -= item.quantity;
        }
      }
      await saveProducts(products);
    }

    orders[index].status = status;
    await saveOrders(orders);

    res.json({ success: true, order: orders[index] });
  });

  // --- Dynamic Settings Routes ---
  app.get("/api/settings", async (req, res) => {
    res.json(await getSettings());
  });

  app.put("/api/settings", requireAdmin, async (req, res) => {
    const { shopName, slogan, contactPhone } = req.body;
    const settings = {
      shopName: shopName || defaultSettings.shopName,
      slogan: slogan || defaultSettings.slogan,
      contactPhone: contactPhone || defaultSettings.contactPhone
    };
    await saveSettings(settings);
    res.json({ success: true, settings });
  });

  // --- Dynamic Categories Routes ---
  app.get("/api/categories", async (req, res) => {
    res.json(await getCategories());
  });

  app.post("/api/categories", requireAdmin, async (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: "ກະລຸນາລະບຸຊື່ໝວດໝູ່" });
      return;
    }
    const categories = await getCategories();
    if (categories.includes(name.trim())) {
      res.status(400).json({ success: false, message: "ໝວດໝູ່ນີ້ມີຢູ່ແລ້ວ" });
      return;
    }
    categories.push(name.trim());
    await saveCategories(categories);
    res.status(201).json({ success: true, categories });
  });

  app.delete("/api/categories/:name", requireAdmin, async (req, res) => {
    const { name } = req.params;
    let categories = await getCategories();
    const originalLength = categories.length;
    categories = categories.filter((c: string) => c !== name);
    if (categories.length === originalLength) {
      res.status(404).json({ success: false, message: "ບໍ່ພົບໝວດໝູ່ທີ່ຕ້ອງການລົບ" });
      return;
    }
    await saveCategories(categories);
    res.json({ success: true, categories });
  });

  // --- Dynamic Slides Routes ---
  app.get("/api/slides", async (req, res) => {
    res.json(await getSlides());
  });

  app.post("/api/slides", requireAdmin, async (req, res) => {
    const { imageUrl, title, subtitle } = req.body;
    if (!imageUrl) {
      res.status(400).json({ success: false, message: "ກະລຸນາໃສ່ລິ້ງຮູບພາບສະໄລ້" });
      return;
    }
    const slides = await getSlides();
    const newSlide = {
      id: "slide-" + Date.now(),
      imageUrl,
      title: title || "",
      subtitle: subtitle || ""
    };
    slides.push(newSlide);
    await saveSlides(slides);
    res.status(201).json({ success: true, slide: newSlide });
  });

  app.delete("/api/slides/:id", requireAdmin, async (req, res) => {
    const { id } = req.params;
    let slides = await getSlides();
    const filtered = slides.filter((s: any) => s.id !== id);
    if (slides.length === filtered.length) {
      res.status(404).json({ success: false, message: "ບໍ່ພົບສະໄລ້ທີ່ຕ້ອງການລົບ" });
      return;
    }
    await saveSlides(filtered);
    res.json({ success: true, message: "ລົບສະໄລ້ຮຽບຮ້ອຍແລ້ວ" });
  });

  app.put("/api/slides/:id", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { imageUrl, title, subtitle } = req.body;
    const slides = await getSlides();
    const index = slides.findIndex((s: any) => s.id === id);
    if (index === -1) {
      res.status(404).json({ success: false, message: "ບໍ່ພົບສະໄລ້ທີ່ຕ້ອງການແກ້ໄຂ" });
      return;
    }
    slides[index] = {
      ...slides[index],
      imageUrl: imageUrl !== undefined ? imageUrl : slides[index].imageUrl,
      title: title !== undefined ? title : slides[index].title,
      subtitle: subtitle !== undefined ? subtitle : slides[index].subtitle
    };
    await saveSlides(slides);
    res.json({ success: true, slide: slides[index] });
  });

  // --- Dynamic Shipping Carriers Routes ---
  app.get("/api/carriers", async (req, res) => {
    res.json(await getCarriers());
  });

  app.post("/api/carriers", requireAdmin, async (req, res) => {
    const { name, logo, desc } = req.body;
    if (!name || !logo) {
      res.status(400).json({ success: false, message: "ກະລຸນາກອກຊື່ຂົນສົ່ງ ແລະ ໃສ່ຮູບພາບຂົນສົ່ງ" });
      return;
    }
    const carriers = await getCarriers();
    const newCarrier = {
      id: "carrier-" + Date.now(),
      name,
      logo,
      desc: desc || ""
    };
    carriers.push(newCarrier);
    await saveCarriers(carriers);
    res.status(201).json({ success: true, carrier: newCarrier });
  });

  app.delete("/api/carriers/:id", requireAdmin, async (req, res) => {
    const { id } = req.params;
    let carriers = await getCarriers();
    const filtered = carriers.filter((c: any) => c.id !== id);
    if (carriers.length === filtered.length) {
      res.status(404).json({ success: false, message: "ບໍ່ພົບຂົນສົ່ງທີ່ຕ້ອງການລົບ" });
      return;
    }
    await saveCarriers(filtered);
    res.json({ success: true, message: "ລົບຂົນສົ່ງຮຽບຮ້ອຍແລ້ວ" });
  });

  app.put("/api/carriers/:id", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, logo, desc } = req.body;
    const carriers = await getCarriers();
    const index = carriers.findIndex((c: any) => c.id === id);
    if (index === -1) {
      res.status(404).json({ success: false, message: "ບໍ່ພົບຂົນສົ່ງທີ່ຕ້ອງການແກ້ໄຂ" });
      return;
    }
    carriers[index] = {
      ...carriers[index],
      name: name !== undefined ? name : carriers[index].name,
      logo: logo !== undefined ? logo : carriers[index].logo,
      desc: desc !== undefined ? desc : carriers[index].desc
    };
    await saveCarriers(carriers);
    res.json({ success: true, carrier: carriers[index] });
  });

  // --- Dynamic Payment Methods Routes ---
  app.get("/api/payments", async (req, res) => {
    res.json(await getPayments());
  });

  app.post("/api/payments", requireAdmin, async (req, res) => {
    const { name, accountName, accountNumber, qrImageUrl } = req.body;
    if (!name || !accountName || !accountNumber || !qrImageUrl) {
      res.status(400).json({ success: false, message: "ກະລຸນາກອກຂໍ້ມູນໃຫ້ຄົບຖ້ວນ (ຊື່ວິທີຊຳລະ, ຊື່ບັນຊີ, ເລກບັນຊີ, URL QR Code)" });
      return;
    }
    const payments = await getPayments();
    const newPayment = {
      id: "payment-" + Date.now(),
      name,
      accountName,
      accountNumber,
      qrImageUrl
    };
    payments.push(newPayment);
    await savePayments(payments);
    res.status(201).json({ success: true, payment: newPayment });
  });

  app.delete("/api/payments/:id", requireAdmin, async (req, res) => {
    const { id } = req.params;
    let payments = await getPayments();
    const filtered = payments.filter((p: any) => p.id !== id);
    if (payments.length === filtered.length) {
      res.status(404).json({ success: false, message: "ບໍ່ພົບວິທີການຊຳລະເງິນທີ່ຕ້ອງການລົບ" });
      return;
    }
    await savePayments(filtered);
    res.json({ success: true, message: "ລົບວິທີການຊຳລະເງິນຮຽບຮ້ອຍແລ້ວ" });
  });

  app.put("/api/payments/:id", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, accountName, accountNumber, qrImageUrl } = req.body;
    const payments = await getPayments();
    const index = payments.findIndex((p: any) => p.id === id);
    if (index === -1) {
      res.status(404).json({ success: false, message: "ບໍ່ພົບວິທີການຊຳລະເງິນທີ່ຕ້ອງການແກ້ໄຂ" });
      return;
    }
    payments[index] = {
      ...payments[index],
      name: name !== undefined ? name : payments[index].name,
      accountName: accountName !== undefined ? accountName : payments[index].accountName,
      accountNumber: accountNumber !== undefined ? accountNumber : payments[index].accountNumber,
      qrImageUrl: qrImageUrl !== undefined ? qrImageUrl : payments[index].qrImageUrl
    };
    await savePayments(payments);
    res.json({ success: true, payment: payments[index] });
  });

  // --- Dynamic Base64 Upload Route for Payment Slips ---
  app.post("/api/upload-base64", (req, res) => {
    const { base64Data } = req.body;
    if (!base64Data) {
      res.status(400).json({ success: false, message: "ບໍ່ມີຂໍ້ມູນຮູບພາບ" });
      return;
    }

    try {
      // Decode Base64 data: data:image/png;base64,iVBORw0KGgoAAAANS...
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        res.status(400).json({ success: false, message: "ຮູບແບບຂໍ້ມູນ Base64 ບໍ່ຖືກຕ້ອງ" });
        return;
      }

      const fileType = matches[1];
      const buffer = Buffer.from(matches[2], "base64");
      
      // Determine extension
      let extension = "png";
      if (fileType.includes("jpeg") || fileType.includes("jpg")) {
        extension = "jpg";
      } else if (fileType.includes("gif")) {
        extension = "gif";
      } else if (fileType.includes("webp")) {
        extension = "webp";
      }

      const name = `slip-${Date.now()}.${extension}`;
      const filePath = path.join(UPLOADS_DIR, name);
      fs.writeFileSync(filePath, buffer);

      res.json({
        success: true,
        imageUrl: `/uploads/${name}`
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ success: false, message: "ບໍ່ສາມາດບັນທຶກຮູບພາບໄດ້" });
    }
  });


  // Vite Integration in Express
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
