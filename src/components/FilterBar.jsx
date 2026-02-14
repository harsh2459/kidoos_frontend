// src/components/FilterBar.jsx
import { Search, ChevronDown, SortAsc, SortDesc, Clock } from "lucide-react";

export default function FilterBar({ q, setQ, sort, setSort }) {
  return (
    <div className="w-full bg-white rounded-3xl shadow-lg border border-[#E3E8E5] p-4 md:p-6 lg:p-8 xl:p-10 flex flex-col md:flex-row items-stretch md:items-center gap-4 lg:gap-6 transition-all relative overflow-hidden">
      
      {/* Decorative Background Images */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 lg:w-52 lg:h-52 xl:w-64 xl:h-64 opacity-10 pointer-events-none bg-contain bg-no-repeat"
        style={{ backgroundImage: "url('/images-webp/grape-vine.webp')" }}
      ></div>
      <div 
        className="absolute bottom-0 left-0 w-28 h-28 md:w-36 md:h-36 lg:w-48 lg:h-48 xl:w-56 xl:h-56 opacity-10 pointer-events-none bg-contain bg-no-repeat"
        style={{ backgroundImage: "url('/images-webp/golden-plant.webp')" }}
      ></div>

      {/* Search Input */}
      <div className="relative flex-1 group z-10">
        <div className="absolute inset-y-0 left-0 pl-4 lg:pl-5 xl:pl-6 flex items-center pointer-events-none">
          <Search className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8 text-[#8BA699] group-focus-within:text-[#4A7C59] transition-colors" />
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, author, or tag..."
          className="block w-full pl-12 md:pl-14 lg:pl-16 xl:pl-20 pr-5 lg:pr-6 xl:pr-8 py-4 md:py-5 lg:py-6 xl:py-7 bg-[#F4F7F5] border-transparent rounded-xl md:rounded-2xl lg:rounded-3xl text-[#2C3E38] placeholder-[#8BA699] focus:bg-white focus:border-[#DCE4E0] focus:ring-2 focus:ring-[#1A3C34]/10 focus:outline-none transition-all text-base md:text-lg lg:text-xl xl:text-2xl"
        />
      </div>

      {/* Sort Dropdown (Custom Styled Select) */}
      <div className="relative min-w-[200px] md:min-w-[260px] lg:min-w-[300px] xl:min-w-[340px] z-10">
        <div className="absolute inset-y-0 left-0 pl-4 lg:pl-5 xl:pl-6 flex items-center pointer-events-none">
          {sort === 'new' && <Clock className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8 text-[#4A7C59]" />}
          {sort === 'priceAsc' && <SortAsc className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8 text-[#4A7C59]" />}
          {sort === 'priceDesc' && <SortDesc className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8 text-[#4A7C59]" />}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="block w-full pl-12 md:pl-14 lg:pl-16 xl:pl-20 pr-12 lg:pr-14 xl:pr-16 py-4 md:py-5 lg:py-6 xl:py-7 bg-white border border-[#E3E8E5] rounded-xl md:rounded-2xl lg:rounded-3xl text-[#2C3E38] font-medium focus:border-[#1A3C34] focus:ring-2 focus:ring-[#1A3C34]/10 focus:outline-none appearance-none cursor-pointer transition-all text-base md:text-lg lg:text-xl xl:text-2xl hover:bg-[#F4F7F5]"
        >
          <option value="new">Newest Arrivals</option>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
        </select>
        <div className="absolute inset-y-0 right-0 pr-4 lg:pr-5 xl:pr-6 flex items-center pointer-events-none">
          <ChevronDown className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8 text-[#8BA699]" />
        </div>
      </div>

    </div>
  );
}