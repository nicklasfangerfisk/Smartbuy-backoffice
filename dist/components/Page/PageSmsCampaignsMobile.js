import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import GeneralTableMobile from '../general/GeneralTableMobile';
const PageSmsCampaignsMobile = ({ campaigns }) => {
    return (_jsx(GeneralTableMobile, { items: campaigns, renderItem: (campaign) => (_jsxs(Box, { children: [_jsxs(Typography, { fontWeight: "bold", children: ["Name: ", campaign.name] }), _jsxs(Typography, { children: ["Sent: ", campaign.sent] }), _jsxs(Typography, { children: ["Status: ", campaign.status] }), _jsxs(Typography, { children: ["Date: ", campaign.date] })] })), ariaLabel: "SMS Campaigns Mobile View" }));
};
export default PageSmsCampaignsMobile;
