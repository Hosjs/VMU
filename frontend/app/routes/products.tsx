import { Header } from '~/components/Header';

export default function Products() {
  const categories = [
    {
      name: 'Phụ tùng động cơ',
      products: ['Lọc dầu', 'Lọc gió', 'Bugi', 'Dây đai'],
      image: '🔩',
    },
    {
      name: 'Phụ tùng phanh',
      products: ['Má phanh', 'Đĩa phanh', 'Dầu phanh', 'Piston phanh'],
      image: '🛞',
    },
    {
      name: 'Phụ tùng điện',
      products: ['Bình ắc quy', 'Đèn pha', 'Cảm biến', 'Đèn xi nhan'],
      image: '💡',
    },
    {
      name: 'Dầu nhớt',
      products: ['Dầu động cơ', 'Dầu hộp số', 'Dầu trợ lực', 'Nước làm mát'],
      image: '🛢️',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Phụ tùng chính hãng</h1>
            <p className="text-xl text-blue-100">
              Cung cấp phụ tùng chính hãng cho mọi hãng xe với giá cả cạnh tranh
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition">
                <div className="text-5xl mb-4">{category.image}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{category.name}</h3>
                <ul className="space-y-2">
                  {category.products.map((product, i) => (
                    <li key={i} className="text-gray-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      {product}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Các thương hiệu chính hãng
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {['Toyota', 'Honda', 'Hyundai', 'Ford', 'Mazda', 'KIA'].map((brand) => (
              <div key={brand} className="bg-gray-50 rounded-lg p-6 flex items-center justify-center hover:bg-gray-100 transition">
                <p className="font-bold text-gray-700">{brand}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

