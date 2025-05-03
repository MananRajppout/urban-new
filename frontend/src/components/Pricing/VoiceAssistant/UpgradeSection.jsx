import PricingCard from '../components/PricingCard';
import PricingTable from '../components/PricingTable';
import CostEstimator from '../components/CostEstimator';
import PricingDetail from './PricingDetail';


export default function UpgradeSection() { 
  return (
    <div className="text-white bg-black p-10">
      <div className="container mx-auto">
        <PricingCard />
        <PricingTable />
        <PricingDetail/>
        <CostEstimator />
      </div>
    </div>
  );
}
