import React, { Suspense } from "react";
import { OrdersPage } from "./searchPage";

const Page = () => {
  return (
    <Suspense>
      <OrdersPage />
    </Suspense>
  );
};

export default Page;
