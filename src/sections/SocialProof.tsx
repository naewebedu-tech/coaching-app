
const SocialProof = () => {
  return (
    <section className="py-10 border-y border-slate-100 bg-white">
      <div className="container mx-auto px-6 text-center">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">
          Trusted by 500+ Top Institutes
        </p>
        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-60">
          {['Apex Academy', 'Future Minds', 'TechTutors', 'Global Learning', 'Scholars Hub'].map((brand, i) => (
            <span key={i} className="text-xl font-bold font-serif text-slate-700">{brand}</span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;