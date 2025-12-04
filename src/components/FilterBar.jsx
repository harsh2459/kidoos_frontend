// src/components/FilterBar.jsx
import { Search, ChevronDown, SortAsc, SortDesc, Clock } from "lucide-react";

export default function FilterBar({ q, setQ, sort, setSort }) {
  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-[#E3E8E5] p-2 md:p-3 flex flex-col md:flex-row items-stretch md:items-center gap-3 transition-all">
      
      {/* Search Input */}
      <div className="relative flex-1 group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, author, or tag..."
          className="block w-full pl-11 pr-4 py-3 bg-[#F4F7F5] border-transparent rounded-xl text-[#2C3E38] placeholder-[#8BA699] focus:bg-white focus:border-[#DCE4E0] focus:ring-2 focus:ring-[#1A3C34]/10 focus:outline-none transition-all text-sm md:text-base"
        />
      </div>

      {/* Sort Dropdown (Custom Styled Select) */}
      <div className="relative min-w-[180px] md:min-w-[220px]">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          {sort === 'new' && <Clock className="h-4 w-4 text-[#4A7C59]" />}
          {sort === 'priceAsc' && <SortAsc className="h-4 w-4 text-[#4A7C59]" />}
          {sort === 'priceDesc' && <SortDesc className="h-4 w-4 text-[#4A7C59]" />}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="block w-full pl-10 pr-10 py-3 bg-white border border-[#E3E8E5] rounded-xl text-[#2C3E38] font-medium focus:border-[#1A3C34] focus:ring-2 focus:ring-[#1A3C34]/10 focus:outline-none appearance-none cursor-pointer transition-all text-sm md:text-base hover:bg-[#F4F7F5]"
        >
          <option value="new">Newest Arrivals</option>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDown className="h-4 w-4 text-[#8BA699]" />
        </div>
      </div>

    </div>
  );
}