import { getImageUrl } from "@/lib/s3";
import { getTodayTopOrderedDishes } from "../actions/dashboard";
import AdminSummary from "./AdminSummary";

export default async function AdminPage() {
    const data = await getTodayTopOrderedDishes();
    const dishData = data.filter((item) => item.cegrateId === null);
    const cegrateData = data.filter((item) => item.cegrateId !== null);
    const totalDishRevenue = dishData.reduce((acc, item) => acc + item.totalPrice, 0);
    const totalCegrateRevenue = cegrateData.reduce((acc, item) => acc + item.totalPrice, 0);


    return (
        <div className="p-6">
            <AdminSummary />
            <div className=" flex gap-4 justify-between">
                <h1 className="text-2xl font-bold mb-6">Today's Ordered Dishes</h1>
                <p className="text-lg">Rs. {totalDishRevenue} / - </p>
            </div>
            <div className="overflow-x-auto bg-white border border-gray-200 shadow-sm rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Orders</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {dishData.map((dish) => (
                            <tr key={dish.dishId}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {dish.imageUrl ? (
                                        <img src={getImageUrl(dish.imageUrl)} alt={dish.name} className="w-12 h-12 object-cover rounded" />
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">N/A</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dish.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dish.totalOrders}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dish.totalPrice}</td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No dishes ordered today.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className=" flex gap-4 mt-10 justify-between">
                <h1 className="text-2xl font-bold mb-6">Today's Ordered Cigrates</h1>
                <p className="text-lg">Rs. {totalCegrateRevenue} / -</p>
            </div>
            <div className="overflow-x-auto bg-white border border-gray-200 shadow-sm rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Orders</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {cegrateData.map((dish) => (
                            <tr key={dish.dishId}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {dish.imageUrl ? (
                                        <img src={getImageUrl(dish.imageUrl)} alt={dish.name} className="w-12 h-12 object-cover rounded" />
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">N/A</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dish.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dish.totalOrders}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dish.totalPrice}</td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No dishes ordered today.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}