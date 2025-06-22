import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import GeneralTableMobile from '../general/GeneralTableMobile';
const PagePurchaseOrderMobile = ({ orders }) => {
    return (_jsx(GeneralTableMobile, { items: orders, renderItem: (order) => (_jsxs(Box, { children: [_jsxs(Typography, { fontWeight: "bold", children: ["Order Number: ", order.order_number] }), _jsxs(Typography, { children: ["Order Date: ", order.order_date] }), _jsxs(Typography, { children: ["Status: ", order.status] }), _jsxs(Typography, { children: ["Total: $", order.total.toFixed(2)] }), _jsxs(Typography, { children: ["Supplier: ", order.supplier_name] })] })), ariaLabel: "Purchase Orders Mobile View" }));
};
export default PagePurchaseOrderMobile;
