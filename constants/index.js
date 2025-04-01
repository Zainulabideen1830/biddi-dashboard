import {
    SquareTerminal,
    LayoutGrid,
    Calendar,
    Settings,
    UserPlus,
    LogOut,
    HelpCircle,
} from "lucide-react"

export const navLinks = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutGrid,
    },
    {
        title: "biddi",
        url: "#",
        icon: SquareTerminal,
        items: [
            {
                title: "Estimates",
                url: "#",
            },
            {
                title: "Invoices",
                url: "#",
            },
            {
                title: "Customers",
                url: "#",
            },
            {
                title: "Products & Services",
                url: "/dashboard/biddi/products-services",
            },
            {
                title: "Rules",
                url: "/dashboard/biddi/rules",
            },
            {
                title: "Companies",
                url: "#",
            },
        ],
    },
    {
        title: "Calendar",
        url: "/dashboard/calendar",
        icon: Calendar,
    },
    {
        title: "Settings",
        url: "#",
        icon: Settings,
        items: [
            {
                title: "Manage Users",
                url: "/dashboard/settings/users",
            },
            {
                title: "Roles & Permissions",
                url: "/dashboard/settings/roles",
            },
        ],
    },
    {
        title: "Refer a Friend",
        url: "#",
        icon: UserPlus, // announce mic icon
    },
    {
        title: "Logout",
        url: "#",
        icon: LogOut,
    },
    // I want add a SidebarSeparator after the Logout link
    {
        type: "separator",
    },
    {
        title: "Help",
        url: "#",
        icon: HelpCircle,
        items: [
            {
                title: "FAQ",
                url: "#",
            },
            {
                title: "How-to Videos",
                url: "#",
            },
            {
                title: "Suggestions",
                url: "#",
            },
        ],
    },
]