import React, { Suspense } from "react";
import OrdersPage from "./orderpageClient";

const page = () => {
  return (
    <div>
      <Suspense>
        <OrdersPage />
      </Suspense>
    </div>
  );
};

export default page;
