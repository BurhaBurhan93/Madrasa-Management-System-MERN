import React from 'react';

const StaffPageLayout = ({ eyebrow, title, subtitle, actions, children }) => {
  return (
    <div className="min-h-screen w-full ">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section>
          <div className="">
          
            {actions && <div className="">{actions}</div>}
          </div>
        </section>
        <div className="mt-8 space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default StaffPageLayout;
