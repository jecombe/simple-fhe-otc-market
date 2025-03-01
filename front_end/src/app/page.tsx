import Navbar from "@/components/NavBar";
import Swap from "@/components/Swap";
import OTCOrders from "@/components/OTCOrders"; 
import AcceptSwap from "@/components/AcceptSwap";
import { useFHEVM } from "@/context/FHEVMContext";

const Home: React.FC = () => {


  return (
    <div>
      <Navbar />
      <main className="p-8 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2">
          <Swap />
        </div>

        <div className="w-full md:w-1/2">
          <AcceptSwap />
        </div>
      </main>

      <div className="mt-8 flex justify-center">
        <div className="w-full md:w-2/3">
          <OTCOrders />
        </div>
      </div>
    </div>
  );
};

export default Home;
