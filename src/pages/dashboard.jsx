import {
    User, LogOut, HardHat, ShoppingCart, Building2, UserCheck, Package,
    Users, Wallet, Wrench, FileSpreadsheetIcon, ChartColumn, TrendingUp,
    Bot, Sun, Moon, Lightbulb, Menu, X // Importa Menu y X
} from "lucide-react";
import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom"; // <-- ¡Importante!
import { useAuth } from "../contexts/authcontext";
import { useEmpresa } from "../contexts/empresacontext";
import { useEmpresas } from "../hooks/useEmpresas";
import { useTheme } from "../contexts/themecontext";
import tippy from "tippy.js";
import BotComponent from "../components/bot";

// Define tus enlaces de navegación aquí.
// 'to' debe coincidir con la ruta en tu archivo router.jsx
const navLinks = [
    { to: "empresas", key: "empresas", label: "Empresas", icon: Building2 },
    { to: "ventas", key: 'ventas', label: 'Ventas', icon: ShoppingCart },
    { to: "clientes", key: 'clientes', label: 'Clientes', icon: UserCheck },
    { to: "inventario", key: 'inventario', label: 'Inventario', icon: Package },
    { to: "proveedores", key: 'proveedores', label: 'Proveedores', icon: Users },
    { to: "cajabancos", key: 'cajabancos', label: 'Cajas/Bancos', icon: Wallet },
    { to: "activosFijos", key: 'activosFijos', label: 'Activos Fijos', icon: Wrench },
    { to: "gastosFijos", key: 'gastosFijos', label: 'Gastos Fijos', icon: Lightbulb },
    { to: "personal", key: 'personal', label: 'Personal', icon: HardHat },
    { to: "estadosFinancieros", key: 'estadosFinancieros', label: 'Estados Financieros', icon: FileSpreadsheetIcon },
    { to: "analisis", key: 'analisis', label: 'Análisis', icon: ChartColumn },
    { to: "reportes", key: 'reportes', label: 'Reportes', icon: TrendingUp },
];

// Componente de enlace reutilizable
const AppLink = ({ to, icon: Icon, label, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
            `flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                ? "bg-button text-button"
                : "text-subtitle hover:bg-secondary/50 hover:text-title"
            }`
        }
    >
        <Icon size={18} />
        <span>{label}</span>
    </NavLink>
);

export default function Dashboard() {
    const { session } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { empresas } = useEmpresas();
    const { empresaId } = useEmpresa();
    const empresaSeleccionada = empresas.find(e => e.id_empresa === empresaId);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showBot, setShowBot] = useState(false);

    tippy('#bot-button', { /* ... (tu código de tippy) ... */ });

    return (
        <>
            <div className="bg-primary min-h-screen flex flex-col md:flex-row">

                {/* --- BARRA LATERAL (VISIBLE EN ESCRITORIO) --- */}
                <aside className="hidden md:flex md:flex-col w-64 bg-primary border-r border-secondary p-4">
                    <div className="flex flex-col mb-6">
                        <h3 className="text-title text-2xl font-bold">Finance ERP</h3>
                        <span className="text-subtitle text-l truncate" title={empresaSeleccionada ? empresaSeleccionada.nombre : "Seleccione empresa"}>
                            {empresaSeleccionada ? empresaSeleccionada.nombre : "Seleccione empresa"}
                        </span>
                    </div>
                    <nav className="flex-1 flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <AppLink key={link.key} {...link} />
                        ))}
                    </nav>
                </aside>

                {/* --- CONTENIDO PRINCIPAL (HEADER MÓVIL + CONTENIDO) --- */}
                <div className="flex-1 flex flex-col">

                    {/* --- HEADER RESPONSIVO --- */}
                    <header className="flex flex-row border-b-1 border-secondary p-3 justify-between items-center sticky top-0 bg-primary z-10">

                        {/* Botón de Menú Hamburguesa (solo en móvil) */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="text-title p-1 md:hidden"
                        >
                            <Menu size={24} />
                        </button>

                        {/* Logo y Título (se oculta en móvil) */}
                        <div className="hidden md:flex">
                            <img src="LogoFinanceERP.png" alt="Logo" className="h-14 mr-4" />
                            <div className="flex flex-col">
                                <h3 className="text-title text-2xl font-bold">Finance ERP</h3>
                                <span className="text-subtitle text-l">{empresaSeleccionada ? empresaSeleccionada.nombre : "..."}</span>
                            </div>
                        </div>

                        {/* Título de Empresa (solo en móvil, para centrarlo) */}
                        <span className="text-subtitle text-l md:hidden truncate">{empresaSeleccionada ? empresaSeleccionada.nombre : "..."}</span>

                        {/* Botones de Usuario (se adaptan) */}
                        <div className="flex gap-2 md:gap-4 items-center">
                            <div className="flex gap-2 items-center">
                                <User className="text-title" />
                                <span className="text-subtitle hidden md:block">{session?.user?.user_metadata?.fullName || "Cargando..."}</span>
                            </div>
                            <button onClick={toggleTheme} className="text-title flex gap-2 border-1 p-2 rounded-xl items-center justify-center cursor-pointer hover:bg-secondary transition-transform duration-200 ease-in-out hover:scale-110">
                                {theme === 'dark' ? <Sun color="white" /> : <Moon color="black" />}
                                <span className="hidden md:block">{theme === 'dark' ? 'Light' : 'Dark'}</span>
                            </button>
                            <button className="text-title flex gap-2 border-1 p-2 rounded-xl items-center justify-center cursor-pointer hover:bg-secondary transition-transform duration-200 ease-in-out hover:scale-110">
                                <LogOut className="text-title" />
                                <span className="hidden md:block">Salir</span>
                            </button>
                        </div>
                    </header>

                    {/* --- CONTENIDO DE LA PÁGINA --- */}
                    <main className="w-[95%] mx-auto mt-4 flex flex-col gap-4 mb-20">
                        <Outlet />
                    </main>

                    {/* ... (tus elementos fixed: Bot, Modal de Bot, Footer) ... */}
                    <div className="fixed bottom-6 right-6 z-50">
                        <button id="bot-button" className="bg-button rounded-full w-16 h-16 flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform" onClick={() => setShowBot(true)}>
                            <Bot className="text-button w-8 h-8" />
                        </button>
                    </div>

                    {showBot && (
                        <div className="fixed bottom-28 right-8 z-50">
                            <BotComponent onClose={() => setShowBot(false)} />
                        </div>
                    )}

                    <footer className="fixed bottom-0 left-0 w-full border-t-1 border-secondary p-4 text-center text-subtitle bg-primary z-40">
                        &copy; {new Date().getFullYear()} Finance ERP. Todos los derechos reservados.
                    </footer>

                </div>

                {/* --- PANEL DE MENÚ MÓVIL (SOBREPUESTO) --- */}
                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="fixed top-0 left-0 h-full w-64 bg-primary p-4 shadow-lg z-50" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-title font-bold text-lg">Finance ERP</span>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-title p-1"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <nav className="flex-1 flex flex-col gap-2">
                                {navLinks.map((link) => (
                                    // Cierra el menú al hacer clic en un enlace
                                    <AppLink key={link.key} {...link} onClick={() => setIsMobileMenuOpen(false)} />
                                ))}
                            </nav>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}