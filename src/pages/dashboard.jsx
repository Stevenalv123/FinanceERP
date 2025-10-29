import { User, LogOut, ShoppingBag, ShoppingCart, Building2, UserCheck, Package, Users, Wallet, Wrench, FileSpreadsheetIcon, ChartColumn, TrendingUp, Bot, Sun, Moon } from "lucide-react"
import { useState } from "react"
import { useAuth } from "../contexts/authcontext"
import Tabs from "../components/tabs"
import Empresas from "./empresas"
import Inventario from "./inventario"
import OnBuilding from "../components/onbuiliding"
import Proveedores from "./proveedores"
import { useEmpresa } from "../contexts/empresacontext"
import { useEmpresas } from "../hooks/useEmpresas"
import Clientes from "./clientes"
import { useTheme } from "../contexts/themecontext"
import Ventas from "./ventas"
import tippy from "tippy.js"
import BotComponent from "../components/bot"

export default function Dashboard() {
    const { session } = useAuth();
    const { theme, toggleTheme } = useTheme()
    const { empresas } = useEmpresas();
    const { empresaId } = useEmpresa();
    const empresaSeleccionada = empresas.find(e => e.id_empresa === empresaId);
    const tabs = [
        { key: "empresas", label: "Empresas", icon: <Building2 size={16} /> },
        { key: 'ventas', label: 'Ventas', icon: <ShoppingCart size={16} /> },
        { key: 'compras', label: 'Compras', icon: <ShoppingBag size={16} /> },
        { key: 'clientes', label: 'Clientes', icon: <UserCheck size={16} /> },
        { key: 'inventario', label: 'Inventario', icon: <Package size={16} /> },
        { key: 'proveedores', label: 'Proveedores', icon: <Users size={16} /> },
        { key: 'cajabancos', label: 'Cajas/Bancos', icon: <Wallet size={16} /> },
        { key: 'activosFijos', label: 'Activos Fijos', icon: <Wrench size={16} /> },
        { key: 'estadosFinancieros', label: 'Estados Financieros', icon: <FileSpreadsheetIcon size={16} /> },
        { key: 'analisis', label: 'Análisis', icon: <ChartColumn size={16} /> },
        { key: 'reportes', label: 'Reportes', icon: <TrendingUp size={16} /> },
    ];
    const [activeTab, setActiveTab] = useState("empresas")
    const [showBot, setShowBot] = useState(false)

    tippy('#bot-button', {
        content: "Saludos, soy FinancialBot. Tu asistente financiero con IA",
        placement: 'top-start',
        arrow: true,
        animation: 'perspective',
        theme: 'bot',
    })

    return (
        <>
            <div className="bg-primary min-h-screen flex flex-col">
                <header className="flex flex-row border-b-1 border-secondary p-3 justify-between items-center">
                    <div className="flex">
                        <img src="LogoFinanceERP.png" alt="Logo de la pagina web" className="h-14 mr-4" />
                        <div className="flex flex-col">
                            <h3 className="text-title text-2xl font-bold">Finance ERP</h3>
                            <span className="text-subtitle text-l">{empresaSeleccionada ? empresaSeleccionada.nombre : "No hay empresas seleccionadas"}</span>
                        </div>
                    </div>
                    <div className="flex gap-10 items-center">
                        <div className="flex gap-2">
                            <User className="text-title" />
                            <span className="text-subtitle">{session.user.user_metadata.fullName}</span>
                        </div>
                        {/* Tema toggle */}
                        <button onClick={toggleTheme} className="text-title flex gap-3 border-1 p-2 rounded-xl w-30 items-center justify-center cursor-pointer hover:bg-secondary transition-transform duration-200 ease-in-out hover:scale-110">
                            {theme === 'dark' ? <Sun color="white" /> : <Moon color="black" />}
                            {theme === 'dark' ? 'Light' : 'Dark'}
                        </button>
                        <button className="text-title flex gap-3 border-1 p-2 rounded-xl w-30 items-center justify-center cursor-pointer hover:bg-secondary transition-transform duration-200 ease-in-out hover:scale-110">
                            <LogOut className="text-title" />
                            Salir
                        </button>
                    </div>
                </header>

                <div className="w-[95%] mx-auto mt-4 flex flex-col gap-4">
                    <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} width="100%" />
                    {activeTab === 'empresas' && (
                        <>
                            <Empresas />
                        </>
                    )}
                    {activeTab === 'ventas' && (
                        <>
                            <Ventas />
                        </>
                    )}
                    {activeTab === 'compras' && (
                        <>
                            <OnBuilding />
                        </>
                    )}
                    {activeTab === 'clientes' && (
                        <>
                            <Clientes />
                        </>
                    )}
                    {activeTab === 'inventario' && (
                        <>
                            <Inventario />
                        </>
                    )}

                    {activeTab === 'proveedores' && (
                        <>
                            <Proveedores />
                        </>
                    )}
                    {activeTab === 'cajabancos' && (
                        <>
                            <OnBuilding />
                        </>
                    )}
                    {activeTab === 'activosFijos' && (
                        <>
                            <OnBuilding />
                        </>
                    )}
                    {activeTab === 'estadosFinancieros' && (
                        <>
                            <OnBuilding />
                        </>
                    )}
                    {activeTab === 'analisis' && (
                        <>
                            <OnBuilding />
                        </>
                    )}
                    {activeTab === 'reportes' && (
                        <>
                            <OnBuilding />
                        </>
                    )}
                </div>

                <div className="fixed bottom-6 right-6 z-50">
                    <button id="bot-button" className="bg-button rounded-full w-16 h-16 flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform" onClick={()=> setShowBot(true)}>
                        <Bot className="text-button w-8 h-8" />
                    </button>
                </div>

                {showBot && (
                    <div className="fixed bottom-28 right-8 z-50">
                        <BotComponent onClose={() => setShowBot(false)} />
                    </div>
                )}

                <footer className="fixed bottom-0 left-0 w-full border-t-1 border-secondary p-4 text-center text-subtitle bg-primary z-40">
                    &copy; {new Date().getFullYear()} Finance ERP. Todos los derechos reservados. Solución tecnológica desarrollada por Steven Alvarez.
                </footer>
            </div>
        </>
    )
}