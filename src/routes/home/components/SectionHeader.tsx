import { Link } from "react-router-dom";

type SectionHeaderProps = {
  title: string;
  seeAllTo?: string;
};

const SectionHeader = ({ title, seeAllTo }: SectionHeaderProps) => (
  <div className="flex justify-between items-center mb-8">
    <h2 className="text-3xl font-bold">{title}</h2>
    {seeAllTo && (
      <Link
        to={seeAllTo}
        className="text-blue-600 font-semibold hover:underline"
      >
        See All →
      </Link>
    )}
  </div>
);

export default SectionHeader;
