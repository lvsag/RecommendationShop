import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { explainRecommendationQuery } from '../api/client';
import {
  X,
  Database,
  Code2,
  GitBranch,
  Activity,
  Copy,
  Check,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

interface Neo4jInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCustomer: Customer | null;
}

export const Neo4jInspectorModal: React.FC<Neo4jInspectorModalProps> = ({
  isOpen,
  onClose,
  selectedCustomer,
}) => {
  const [activeTab, setActiveTab] = useState<'cypher' | 'profile' | 'schema' | 'script'>('cypher');
  const [copied, setCopied] = useState(false);
  const [explainData, setExplainData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const customerId = selectedCustomer?.id || 'CUST-001';

  const cypherQuery = `// =========================================================
// THUẬT TOÁN COLLABORATIVE FILTERING TRÊN NEO4J CYPHER (SV2)
// Input: customerId = '${customerId}'
// =========================================================
MATCH (c1:Customer {id: '${customerId}'})
MATCH (c1)-[r1:BOUGHT|VIEWED]->(p1:Product)
MATCH (p1)<-[r_shared:BOUGHT|VIEWED]-(c2:Customer)
WHERE c2.id <> c1.id
MATCH (c2)-[r2:BOUGHT|VIEWED]->(p2:Product)
WHERE p2.id <> p1.id
  AND NOT (c1)-[:BOUGHT]->(p2)
  AND NOT (c1)-[:VIEWED]->(p2)
WITH p2,
     count(DISTINCT CASE WHEN type(r2) = 'BOUGHT' THEN c2 END) AS coBoughtCount,
     count(DISTINCT CASE WHEN type(r2) = 'VIEWED' THEN c2 END) AS coViewedCount,
     count(DISTINCT c2) AS totalCoCustomers
WITH p2, coBoughtCount, coViewedCount, totalCoCustomers,
     round((coBoughtCount * 3.0 + coViewedCount * 1.0), 2) AS recommendationScore
OPTIONAL MATCH (p2)-[:BELONGS_TO]->(cat:Category)
RETURN p2.name AS name,
       p2.price AS price,
       cat.name AS categoryName,
       recommendationScore AS score,
       coBoughtCount,
       coViewedCount
ORDER BY recommendationScore DESC, p2.soldCount DESC
LIMIT 10;`;

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      explainRecommendationQuery(customerId)
        .then((res) => setExplainData(res))
        .catch((err) => console.error('Explain query error:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, customerId]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(cypherQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#1e1e2e] text-gray-200 rounded-lg shadow-2xl max-w-4xl w-full overflow-hidden border border-gray-700 animate-scale-up my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#181825] px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-yellow-400/20 text-yellow-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Neo4j Graph Recommendation Inspector
                <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded">
                  Active User: {selectedCustomer?.name || 'CUST-001'}
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Công cụ hỗ trợ SV1, SV2, SV3 trình chiếu câu truy vấn Cypher và phân tích hiệu năng
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 bg-[#181825]/50 px-6 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('cypher')}
            className={`py-3 px-3 font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'cypher'
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            1. Cypher Query & Scoring
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            2. Phân Tích PROFILE / EXPLAIN
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-3 font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'schema'
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            3. Mô Hình Đồ Thị (Graph Schema)
          </button>

          <button
            onClick={() => setActiveTab('script')}
            className={`py-3 px-3 font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'script'
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            4. Kịch Bản Báo Cáo 3 SV
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-sm space-y-4">
          {/* TAB 1: CYPHER */}
          {activeTab === 'cypher' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">
                  Câu lệnh Cypher chạy ngầm khi gọi API <code>/api/recommendations/{customerId}</code>:
                </span>
                <button
                  onClick={handleCopy}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs px-2.5 py-1 rounded flex items-center gap-1.5 border border-gray-600 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã copy Cypher!' : 'Copy Cypher'}</span>
                </button>
              </div>

              <pre className="bg-[#11111b] p-4 rounded-md text-xs font-mono text-green-300 overflow-x-auto border border-gray-800 leading-relaxed">
                {cypherQuery}
              </pre>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-xs">
                <div className="bg-[#181825] p-3 rounded border border-gray-700">
                  <h4 className="font-bold text-yellow-400 mb-1 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    Trọng số hành vi (Domain Weights)
                  </h4>
                  <p className="text-gray-300 leading-relaxed">
                    - Hành vi <strong>MUA (BOUGHT)</strong>: nhân trọng số <strong>3.0</strong> (hành vi chi tiền, độ tin cậy cao nhất).<br />
                    - Hành vi <strong>XEM (VIEWED)</strong>: nhân trọng số <strong>1.0</strong> (hành vi quan tâm/tiềm năng).
                  </p>
                </div>

                <div className="bg-[#181825] p-3 rounded border border-gray-700">
                  <h4 className="font-bold text-yellow-400 mb-1 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5" />
                    Cơ chế loại trừ (Negative Filtering)
                  </h4>
                  <p className="text-gray-300 leading-relaxed">
                    - <code>p2.id &lt;&gt; p1.id</code>: Không gợi ý lại sản phẩm gốc.<br />
                    - <code>NOT (c1)-[:BOUGHT]-&gt;(p2)</code> và <code>NOT (c1)-[:VIEWED]-&gt;(p2)</code>: Loại trừ các sản phẩm mà khách hàng hiện tại đã từng mua hoặc đã xem gần đây.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE & EXPLAIN */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="bg-[#181825] p-4 rounded border border-gray-700">
                <h4 className="font-bold text-yellow-400 mb-2 text-xs uppercase tracking-wider">
                  CÁC TOÁN TỬ TRONG EXECUTION PLAN (SV2 PHÂN TÍCH)
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded bg-[#11111b] border-l-4 border-green-500">
                    <strong className="text-green-400">1. NodeIndexSeek:</strong> Sử dụng Unique Constraint B-Tree Index trên <code>Customer(id)</code> để định vị chính xác node xuất phát <code>c1</code> chỉ với <strong>1 DB Hit</strong>, đạt độ phức tạp $O(1)$.
                  </div>
                  <div className="p-2.5 rounded bg-[#11111b] border-l-4 border-blue-500">
                    <strong className="text-blue-400">2. Expand(All):</strong> Tận dụng tính chất <strong>Index-free Adjacency</strong> của Neo4j. Engine duyệt trực tiếp qua con trỏ bộ nhớ RAM giữa các Node mà không cần thực hiện phép tích Descartes hay Multi-Table JOIN tốn kém như SQL.
                  </div>
                  <div className="p-2.5 rounded bg-[#11111b] border-l-4 border-yellow-500">
                    <strong className="text-yellow-400">3. Filter:</strong> Loại bỏ các sản phẩm khách hàng đã sở hữu (Anti-Semi Apply).
                  </div>
                  <div className="p-2.5 rounded bg-[#11111b] border-l-4 border-purple-500">
                    <strong className="text-purple-400">4. Top (Min-Heap):</strong> Giới hạn Top 10 sản phẩm điểm cao nhất bằng giải thuật Min-Heap kích thước 10 mà không phải Sort toàn bộ tập kết quả, tiết kiệm tối đa dung lượng bộ nhớ Heap.
                  </div>
                </div>
              </div>

              {explainData?.plan && (
                <div className="bg-[#11111b] p-3 rounded border border-gray-800 text-xs">
                  <span className="text-gray-400 block mb-1 font-mono">Operator Tree từ Neo4j Engine:</span>
                  <pre className="font-mono text-gray-300 max-h-48 overflow-y-auto">
                    {JSON.stringify(explainData.plan, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SCHEMA */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="bg-[#181825] p-4 rounded border border-gray-700">
                <h4 className="font-bold text-yellow-400 mb-2 text-xs uppercase tracking-wider">
                  MÔ HÌNH THỰC THỂ & QUAN HỆ ĐỒ THỊ (SV1 DESIGN)
                </h4>
                <div className="p-4 bg-[#11111b] rounded text-center font-mono text-xs text-gray-300 border border-gray-800 leading-loose">
                  <div className="text-blue-400 font-bold">(:Customer {`{id, name, email, avatar}`})</div>
                  <div className="text-gray-500">│</div>
                  <div className="text-yellow-400">
                    ├── [:BOUGHT {`{timestamp, quantity, priceAtPurchase}`}] ──▶ (:Product)
                  </div>
                  <div className="text-yellow-400">
                    └── [:VIEWED {`{createdAt, lastViewedAt, viewCount}`}] ──▶ (:Product)
                  </div>
                  <div className="text-gray-500">│</div>
                  <div className="text-green-400 font-bold">(:Product) ──[:BELONGS_TO]──▶ (:Category {`{id, name, icon}`})</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-[#181825] p-3 rounded border border-gray-700">
                  <span className="font-bold text-white block mb-1">Ràng buộc (Constraints):</span>
                  <ul className="list-disc pl-4 text-gray-400 space-y-0.5">
                    <li><code>Customer(id) IS UNIQUE</code></li>
                    <li><code>Product(id) IS UNIQUE</code></li>
                    <li><code>Category(id) IS UNIQUE</code></li>
                  </ul>
                </div>
                <div className="bg-[#181825] p-3 rounded border border-gray-700">
                  <span className="font-bold text-white block mb-1">Chỉ mục (Indexes):</span>
                  <ul className="list-disc pl-4 text-gray-400 space-y-0.5">
                    <li>Index trên <code>Product(name)</code></li>
                    <li>Index trên <code>Product(price)</code></li>
                    <li>Index trên <code>Product(rating)</code></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KỊCH BẢN THUYẾT TRÌNH */}
          {activeTab === 'script' && (
            <div className="space-y-3 text-xs">
              <div className="bg-blue-900/20 border border-blue-700/40 p-3 rounded">
                <h5 className="font-bold text-blue-300">BƯỚC 1: SV1 (Data Architect & CRUD Lead)</h5>
                <p className="text-gray-300 mt-1">
                  - Thao tác: Chọn dropdown <strong>User A (CUST-001 - Nguyễn Văn An)</strong>.<br />
                  - Trình bày: Giới thiệu mô hình đồ thị Neo4j gồm 3 Node Label (`Customer`, `Product`, `Category`) và 3 Relationship (`BOUGHT`, `VIEWED`, `BELONGS_TO`). Bấm vào xem 1 sản phẩm để chứng minh API CRUD và cơ chế tự động Merge cạnh `[:VIEWED]`.
                </p>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-700/40 p-3 rounded">
                <h5 className="font-bold text-yellow-300">BƯỚC 2: SV2 (Advanced Query Specialist)</h5>
                <p className="text-gray-300 mt-1">
                  - Thao tác: Bấm nút <strong>Inspect Graph</strong> để hiện Tab 1 & Tab 2.<br />
                  - Trình bày: Giải thích thuật toán Collaborative Filtering Cypher: Đường đi 3 bước qua khách hàng đồng sở thích $c2$. Giải thích công thức trọng số <code>(BOUGHT * 3.0 + VIEWED * 1.0)</code> và chứng minh hiệu năng với <code>NodeIndexSeek</code> và <code>Top Heap</code>.
                </p>
              </div>

              <div className="bg-green-900/20 border border-green-700/40 p-3 rounded">
                <h5 className="font-bold text-green-300">BƯỚC 3: SV3 (Fullstack Integrator & UI/UX)</h5>
                <p className="text-gray-300 mt-1">
                  - Thao tác: Bấm <strong>"Mua Ngay"</strong> một sản phẩm trên Web Shopee. Mục "GỢI Ý HÔM NAY" lập tức cập nhật lại theo thời gian thực.<br />
                  - Tiếp tục: Đổi sang <strong>User CUST-004 (Cold-Start)</strong> để chứng minh thuật toán Fallback sang Top sản phẩm bán chạy nhất!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#181825] px-6 py-3 border-t border-gray-700 flex items-center justify-between text-xs">
          <span className="text-gray-400">
            Truy cập Neo4j Browser: <a href="http://localhost:7474" target="_blank" rel="noreferrer" className="text-yellow-400 underline">http://localhost:7474</a>
          </span>
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1.5 rounded transition"
          >
            Đóng bảng phân tích
          </button>
        </div>
      </div>
    </div>
  );
};
