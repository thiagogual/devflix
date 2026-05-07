import InitialBannerEditor from '../components/InitialBannerEditor';

const AdminInitialBanner = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Banner Inicial</h1>
      <InitialBannerEditor />
    </div>
  );
};

export default AdminInitialBanner;