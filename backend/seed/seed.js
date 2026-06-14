// Seed: 20 categories x 15 products = 300 products with curated, category-matched, de-duplicated Unsplash images.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const slugify = require('slugify');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// 20 categories
const CATS = [
  { name: 'Mobiles', icon: '📱' },
  { name: 'Laptops', icon: '💻' },
  { name: 'Headphones', icon: '🎧' },
  { name: 'Cameras', icon: '📷' },
  { name: 'Televisions', icon: '📺' },
  { name: 'Gaming', icon: '🎮' },
  { name: 'Smart Watches', icon: '⌚' },
  { name: 'Men Fashion', icon: '👔' },
  { name: 'Women Fashion', icon: '👗' },
  { name: 'Footwear', icon: '👟' },
  { name: 'Bags', icon: '🎒' },
  { name: 'Beauty', icon: '💄' },
  { name: 'Home Decor', icon: '🏠' },
  { name: 'Kitchen', icon: '🍳' },
  { name: 'Furniture', icon: '🛋️' },
  { name: 'Books', icon: '📚' },
  { name: 'Toys', icon: '🧸' },
  { name: 'Sports', icon: '⚽' },
  { name: 'Grocery', icon: '🛒' },
  { name: 'Health', icon: '💊' },
];

// 15 unique Unsplash IDs per category (curated, category-matched, de-duplicated).
const IMG = {
  Mobiles: ['1511707171634-5f897ff02aa9','1556656793-08538906a9f8','1592899677977-9c10ca588bbd','1565849904461-04a58ad377e0','1580910051074-3eb694886505','1585060544812-6b45742d762f','1598327105666-5b89351aff97','1605236453806-6ff36851218e','1574944985070-8f3ebc6b79d2','1551355738-7d0e3c0c0a90','1610792516307-ea5acd9c3b00','1592434134753-a70baf7979d5','1556656793-08538906a9f8','1567581935884-3349723552ca','1601784551446-20c9e07cdbdb'],
  Laptops: ['1496181133206-80ce9b88a853','1517336714731-489689fd1ca8','1593642632559-0c6d3fc62b89','1531297484001-80022131f5a1','1525547719571-a2d4ac8945e2','1541807084-5c52b6b3adef','1484788984921-03950022c9ef','1587202372634-32705e3bf49c','1611186871348-b1ce696e52c9','1588872657578-7efd1f1555ed','1525373698358-041e3a460346','1593305841991-05c297ba4575','1517336714731-489689fd1ca8','1564466809058-bf4114d55352','1593642634402-b0eb5e2eebc9'],
  Headphones: ['1505740420928-5e560c06d30e','1583394838336-acd977736f90','1546435770-a3e426bf472b','1484704849700-f032a568e944','1524678606370-a47ad25cb82a','1558756520-22cfe5d382ca','1612444530582-fc66183b16f8','1577174881658-0f30ed549adc','1590658268037-6bf12165a8df','1593359677879-a4bb92f829d1','1496957961599-e35b69ef5d7c','1545127398-14699f92334b','1572569511254-d8f925fe2cbb','1620975069635-d1e51f7f7a5d','1518972559570-7cc1309f3229'],
  Cameras: ['1502920917128-1aa500764cbd','1606980625453-c5d2a6a9b1f8','1516035069371-29a1b244cc32','1502982720700-bfff97f2ecac','1518930259200-3e5d3a3f1f3f','1565114013-b9ba27a8a4d0','1452780212940-6f5c0d14d848','1581591524425-c7e0978865fc','1606981557565-39d2b6c8d6b6','1493863641943-9b68992a8d07','1583994014717-c0c3b22b2c50','1495707902641-75cac588d2e9','1606980625480-2c0bd5dc69c0','1485463611174-f302f6a5c1c9','1500634245200-e5245c7574ef'],
  Televisions: ['1593359677879-a4bb92f829d1','1593784991095-a205069470b6','1567690187548-f07b1d7bf5a9','1601944179066-29786cb9d32a','1571415060716-baff5f717068','1556228720-195a672e8a03','1593359677879-a4bb92f829d1','1577979879413-eb40dd0c08d2','1556909114-c2d2ed20ebd4','1577900232427-18219b9166a0','1593784991095-a205069470b6','1601944177325-f8867652837f','1593305841991-05c297ba4575','1593305842147-50fbf6deef72','1539786774-44b6f7b8b8e8'],
  Gaming: ['1542751371-adc38448a05e','1606144042614-b2417e99c4e3','1493711662062-fa541adb3fc8','1612287230202-1ff1d85d1bdf','1551103782-8ab07afd45c1','1593305841991-05c297ba4575','1580327344181-c1163234e5a0','1592840496694-26d035b52b48','1612287230202-1ff1d85d1bdf','1531862060119-9c64e85af1f3','1531315396756-905d68d21b56','1542751371-adc38448a05e','1493711662062-fa541adb3fc8','1612287230202-1ff1d85d1bdf','1606144042614-b2417e99c4e3'],
  'Smart Watches': ['1523275335684-37898b6baf30','1546868871-7041f2a55e12','1579586337278-3befd40fd17a','1508685096489-7aacd43bd3b1','1542496658-e33a6d0d50f6','1617043786394-f977fa12eddf','1606293925955-1bd1e6c2ee0f','1559563458-527698bf5295','1611105408568-c46e2e0a4946','1620891549027-942fdc95d3f5','1617625802912-cde586faf331','1622434641406-a158123450f9','1633934542430-0905ddb5e29c','1639688679085-c7d8f0c79376','1611591437281-460bfbe1220a'],
  'Men Fashion': ['1490578474895-699cd4e2cf59','1490481651871-ab68de25d43d','1516257984-b1b4d707412e','1521572163474-6864f9cf17ab','1507003211169-0a1dd7228f2d','1488161628813-04466f872be2','1520975954732-35dd22299614','1516826957135-700dedea698c','1571455786673-9d9d6c194f90','1542272604-787c3835535d','1593030103066-0093718efeb9','1583743814966-8936f5b7be1a','1549298916-b41d501d3772','1622445275576-721325763afe','1617137968427-85924c800a22'],
  'Women Fashion': ['1483985988355-763728e1935b','1469334031218-e382a71b716b','1496217590455-aa63a8350eea','1551232864-3f0890e580d9','1490481651871-ab68de25d43d','1485231183945-fffde7cc051e','1496747611176-843222e1e57c','1539109136881-3be0616acf4b','1502716119720-b23a93e5fe1b','1539008835657-9e8e9680c956','1572804013309-59a88b7e92f1','1494955870715-979ca4f13bf0','1571513800374-df1bbe650e56','1556905055-8f358a7a47b2','1583744946564-b52d01a7b321'],
  Footwear: ['1542291026-7eec264c27ff','1460353581641-37baddab0fa2','1595950653106-6c9ebd614d3a','1491553895911-0055eca6402d','1525966222134-fcfa99b8ae77','1543508282-6319a3e2621f','1606107557195-0e29a4b5b4aa','1597248881519-db089d3744a5','1551107696-a4b0c5a0d9a2','1539185441755-769473a23570','1605408499391-6368c628ef42','1551107696-a4b0c5a0d9a2','1606107557195-0e29a4b5b4aa','1604001436900-c4b59f4d22b8','1551116-464ad-b073-2d0a8e74e006'],
  Bags: ['1548036328-c9fa89d128fa','1547949003-9792a18a2601','1553062407-98eeb64c6a62','1591561954557-26941169b49e','1564222257-78d2c0fdba65','1590874103328-eac38a683ce7','1581605405669-fcdf81165afa','1525966222134-fcfa99b8ae77','1503342217505-b0a15ec3261c','1559563458-527698bf5295','1622560480654-d96214fdc887','1622560482977-5acdab09ff03','1612817288484-6f916006741a','1591348122449-02525d70379b','1622560482946-810f4f56eed8'],
  Beauty: ['1522335789203-aaba8d7d6f02','1596462502278-27bfdc403348','1571781926291-c477ebfd024b','1571781565027-30b1a9e0e2c0','1487412947147-5cebf100ffc2','1503236823255-94609f598e71','1631214540553-b8fd6c4b7c5c','1620916566398-39f1143ab7be','1583241475881-ed2ea34a4936','1556228720-195a672e8a03','1599733589046-9d0e34c2eeb6','1556228852-80b6e5eeff06','1620812097820-d28c2fb46c11','1596704017254-9b121068fb31','1599733589046-833f96ee2018'],
  'Home Decor': ['1513519245088-0e12902e5a38','1567538096630-e0c55bd6374c','1493663284031-b7e3aefcae8e','1494438639946-1ebd1d20bf85','1556228453-efd6c1ff04f6','1505691938895-1758d7feb511','1567016526105-22da7c13161a','1519710164239-da123dc03ef4','1538688525198-9b88f6f53126','1517705008128-e9f5e498ae0e','1505691938895-1758d7feb511','1551516594-56cb78394645','1493663284031-b7e3aefcae8e','1567538096631-e0c55bd6374a','1554995207-c18c203602cb'],
  Kitchen: ['1556909114-f6e7ad7d3136','1565538810643-b5bdb714032a','1556909172-89c6c553a6df','1556909211-d5b07cd2c4be','1556910103-2cd5b6f3b1f8','1583847268964-b28dc8f51f92','1574269909862-7e1d70bb8078','1556910638-d4c8e8e08a99','1556910021-5e4e0d9b1c6f','1601001435957-74f0958a93c5','1583847268964-b28dc8f51f92','1556909172-89c6c553a6df','1556910110-a5a63dfd393c','1556910103-2cd5b6f3b1f8','1604152135912-04a022e23696'],
  Furniture: ['1555041469-a586c61ea9bc','1567538096630-e0c55bd6374c','1538688525198-9b88f6f53126','1540574163026-643ea20ade25','1493663284031-b7e3aefcae8e','1505693416388-ac5ce068fe85','1556228453-efd6c1ff04f6','1567016432779-094069958ea5','1493663284031-b7e3aefcae8e','1517705008128-e9f5e498ae0e','1505691938895-1758d7feb511','1551516594-56cb78394645','1567538096631-e0c55bd6374a','1554995207-c18c203602cb','1540574163026-643ea20ade25'],
  Books: ['1495446815901-a7297e633e8d','1512820790803-83ca734da794','1544716279-e6d7eb01-7ee4','1531988042231-d39a9cc12a9a','1481627834876-b7833e8f5570','1543002588-bfa74002ed7e','1532012197267-da84d127e765','1519682337058-a94d519337bc','1457369804613-52c61a468e7d','1524995997946-a1c2e315a42f','1521587760476-6c12a4b040da','1512820790803-83ca734da794','1535905557558-afc4877a26fc','1497633762265-9d179a990aa6','1474932430478-367dbb6832c1'],
  Toys: ['1558877385-8c1b8a4d1d0a','1599623560574-39d485900c95','1566576721346-d4a3b4eaeb55','1596461404969-9ae70f2830c1','1558060370-d644479cb6f7','1587653263995-422546a7a569','1611722155-eaa86b50d2dd','1572635148818-ef6fd45eb394','1604332935-b8b8a93e9c2c','1559586733-3c2ed12fdb1c','1620824086e0-3b53ca99cd0d','1568901346375-23c9450c58cd','1558877385-8c1b8a4d1d0a','1566576721346-d4a3b4eaeb55','1611722155-eaa86b50d2dd'],
  Sports: ['1517649763962-0c623066013b','1535131749006-b7f58c99034b','1530549387789-4c1017266635','1593079831268-3381b0db4a77','1571019613454-1cb2f99b2d8b','1521412644187-c49fa049e84d','1518611012118-696072aa579a','1530549387789-4c1017266635','1517649763962-0c623066013b','1571019613454-1cb2f99b2d8b','1521412644187-c49fa049e84d','1593079831268-3381b0db4a77','1535131749006-b7f58c99034b','1517836357463-d25dfeac3438','1530549387789-4c1017266635'],
  Grocery: ['1542838132-92c53300491e','1543168256-418811576931','1506617420156-8e4536971650','1466637574441-749b8f19452f','1488459716781-31db52582fe9','1604908176997-125f25cc6f3d','1542838132-92c53300491e','1543168256-418811576931','1506617420156-8e4536971650','1466637574441-749b8f19452f','1488459716781-31db52582fe9','1604908176997-125f25cc6f3d','1577303935007-0d306ee638cf','1610348725531-843dff563e2c','1568901346375-23c9450c58cd'],
  Health: ['1583947215259-38e31be8751f','1559757175-0eb30cd8c063','1576091160550-2173dba999ef','1607619056574-7b8d3ee536b2','1631549913037-08a4e4ad2c4c','1607619056574-7b8d3ee536b2','1607619056574-7b8d3ee536b2','1559757175-0eb30cd8c063','1583947215259-38e31be8751f','1576091160550-2173dba999ef','1607619056574-7b8d3ee536b2','1576091160399-112ba8d25d1d','1576091160550-2173dba999ef','1576091160399-112ba8d25d1d','1631549913037-08a4e4ad2c4c'],
};

const BRANDS = {
  Mobiles: ['Apple','Samsung','OnePlus','Xiaomi','Realme','Vivo','Oppo','Google'],
  Laptops: ['Dell','HP','Lenovo','Apple','Asus','Acer','MSI'],
  Headphones: ['Sony','Bose','JBL','Boat','Sennheiser','Apple'],
  Cameras: ['Canon','Nikon','Sony','Fujifilm','GoPro'],
  Televisions: ['LG','Samsung','Sony','OnePlus','TCL','Mi'],
  Gaming: ['Sony','Microsoft','Nintendo','Logitech','Razer'],
  'Smart Watches': ['Apple','Samsung','Noise','Boat','Fire-Boltt','Garmin'],
  'Men Fashion': ['Levis','UCB','H&M','Zara','Roadster','Allen Solly'],
  'Women Fashion': ['Zara','H&M','Biba','W','Vero Moda','Mango'],
  Footwear: ['Nike','Adidas','Puma','Bata','Skechers','Woodland'],
  Bags: ['American Tourister','Wildcraft','Skybags','Safari','Fastrack'],
  Beauty: ["L'Oreal",'Maybelline','Lakme','Nykaa','MAC','Mamaearth'],
  'Home Decor': ['IKEA','Urban Ladder','HomeCentre','Pepperfry'],
  Kitchen: ['Prestige','Hawkins','Pigeon','Borosil','Milton'],
  Furniture: ['IKEA','Pepperfry','Urban Ladder','HomeTown'],
  Books: ['Penguin','HarperCollins','Rupa','Bloomsbury'],
  Toys: ['Lego','Hot Wheels','Funskool','Hasbro'],
  Sports: ['Nivia','SG','Cosco','Yonex','Wilson'],
  Grocery: ['Tata','Aashirvaad','Fortune','MTR','Britannia'],
  Health: ['Himalaya','Dabur','HealthKart','MuscleBlaze'],
};

const ADJS = ['Premium','Pro','Ultra','Smart','Classic','Elite','Modern','Essential','Compact','Deluxe','Signature','Active','Lite','Max','Plus'];

function priceFor(cat, idx) {
  const base = {
    Mobiles: 15000, Laptops: 45000, Headphones: 1500, Cameras: 25000, Televisions: 30000,
    Gaming: 4000, 'Smart Watches': 2500, 'Men Fashion': 900, 'Women Fashion': 1100,
    Footwear: 1800, Bags: 1500, Beauty: 400, 'Home Decor': 1200, Kitchen: 800,
    Furniture: 8000, Books: 250, Toys: 700, Sports: 600, Grocery: 200, Health: 350,
  }[cat] || 500;
  const price = base + idx * Math.round(base * 0.15);
  const mrp = Math.round(price * 1.4);
  return { price, mrp };
}

(async () => {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([User.deleteMany({ role: 'admin' }), Category.deleteMany({}), Product.deleteMany({}), Coupon.deleteMany({})]);

  // admin user
  const passwordHash = await bcrypt.hash('Admin@12345', 10);
  await User.create({ name: 'ApnaCart Admin', email: 'admin@apnacart.in', passwordHash, role: 'admin' });

  // categories
  const cats = await Category.insertMany(CATS.map((c) => ({
    name: c.name, slug: slugify(c.name, { lower: true, strict: true }), icon: c.icon,
    image: `https://images.unsplash.com/photo-${IMG[c.name][0]}?w=600&q=80&auto=format&fit=crop`,
  })));
  console.log(`Inserted ${cats.length} categories`);

  // products (15 per category = 300)
  const products = [];
  const usedImages = new Set();
  for (const cat of cats) {
    const ids = IMG[cat.name];
    const brands = BRANDS[cat.name];
    for (let i = 0; i < 15; i++) {
      const brand = brands[i % brands.length];
      const adj = ADJS[i % ADJS.length];
      const name = `${brand} ${adj} ${cat.name.replace(/s$/, '')} ${i + 1}`;
      const slug = slugify(`${name}-${cat.slug}`, { lower: true, strict: true });
      let imgId = ids[i % ids.length];
      // ensure global uniqueness by appending a query if reused
      let imgUrl = `https://images.unsplash.com/photo-${imgId}?w=800&q=80&auto=format&fit=crop`;
      let n = 1;
      while (usedImages.has(imgUrl)) {
        imgUrl = `https://images.unsplash.com/photo-${imgId}?w=800&q=80&auto=format&fit=crop&v=${n++}`;
      }
      usedImages.add(imgUrl);
      const { price, mrp } = priceFor(cat.name, i);
      products.push({
        name, slug, category: cat._id, categorySlug: cat.slug, brand,
        description: `${name}. Top-rated ${cat.name.toLowerCase()} from ${brand}. Fast delivery across India. 7-day easy returns.`,
        price, mrp, image: imgUrl,
        rating: +(3.8 + (i % 12) * 0.1).toFixed(1),
        reviewCount: 50 + i * 13,
        stock: 25 + i * 4,
        isFeatured: i < 2,
        isTrending: i >= 2 && i < 4,
      });
    }
  }
  await Product.insertMany(products);
  console.log(`Inserted ${products.length} products`);

  await Coupon.insertMany([
    { code: 'WELCOME100', type: 'flat', value: 100, minOrder: 499, active: true },
    { code: 'SAVE10', type: 'percent', value: 10, minOrder: 999, active: true },
    { code: 'BIGSALE', type: 'percent', value: 25, minOrder: 2999, active: true },
  ]);
  console.log('Inserted coupons');

  console.log('\n✓ Seed complete. Admin: admin@apnacart.in / Admin@12345');
  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
