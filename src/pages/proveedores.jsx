import StatsCards from "../components/statscards"
import Tabs from "../components/tabs"
import NuevoProveedor from "../components/nuevoProveedor"
import { useState } from "react"
import { DollarSign, ShoppingCart, UsersRound, Plus, ShoppingBasket } from "lucide-react"
import { useProveedores } from "../hooks/useProveedores"

export default function Inventario() {
    const tabs = [
        { key: "proveedores", label: "Proveedores", icon: <UsersRound size={16} /> },
        { key: "compras", label: "Compras", icon: <ShoppingBasket size={16} /> }
    ];
    const [activeTab, setActiveTab] = useState("proveedores");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { proveedores, isLoading } = useProveedores();

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-NI', {
            style: 'currency',
            currency: 'NIO',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value).replace('C$', 'C$ ');
    };

    return (
        <div>
            <div className="flex flex-row gap-4 justify-between mt-6">
                <StatsCards title={"Total Proveedores"} icon={<span className="icon"><UsersRound className="text-title" /></span>} value={proveedores.length} />
                <StatsCards title={"Proveedores Activos"} icon={<span className="icon text-green-400"><UsersRound className="text-title" /></span>} value={proveedores.filter(p => p.estado === 1).length} />
                <StatsCards title={"Cuentas por Pagar"} icon={<span className="icon text-red-400"><DollarSign className="text-title" /></span>} value={"C$0"} />
                <StatsCards title={"Movimientos hoy"} icon={<span className="icon"><ShoppingCart className="text-title" /></span>} value={"0"} />
            </div>

            <div className="mt-6">
                <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} width="15%" />
                <div className="mt-8 border-1 border-secondary rounded-2xl p-5">
                    {activeTab === "proveedores" && (
                        <>
                            <div className="flex flex-row justify-between">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-title text-xl font-bold">Gestión de Proveedores</h3>
                                    <p className="text-subtitle text-s">Administra tu cartera de proveedores</p>
                                </div>
                                <button
                                    className="bg-button text-button flex flex-row h-10 text-s gap-3 p-2 rounded-xl items-center hover:bg-[#E8E8E8] transition-transform duration-200 ease-in-out hover:scale-110 cursor-pointer"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    <Plus />
                                    Nuevo Proveedor
                                </button>
                            </div>

                            <div className="mt-8 overflow-x-auto mb-8">
                                {isLoading ? (
                                    <p className="text-title p-4">Cargando proveedores...</p>
                                ) : proveedores.length === 0 ? (
                                    <p className="text-title p-4">No hay proveedores registrados.</p>
                                ) : (
                                    < table className="text-title min-w-[1400px] border-collapse">
                                        <thead>
                                            <tr className="border-b border-secondary/50 text-sm font-semibold text-subtitle">
                                                <th className="py-3 px-2 w-12 text-center">Código</th>
                                                <th className="py-3 px-2 w-40 text-center">Nombre</th>
                                                <th className="py-3 px-2 w-60 text-center">Razon Social</th>
                                                <th className="py-3 px-2 w-36 text-center">Categoria</th>
                                                <th className="py-3 px-2 w-30 text-center">Email</th>
                                                <th className="py-3 px-2 w-36 text-center">Telefono</th>
                                                <th className="py-3 px-2 w-60 text-center">Direccion</th>
                                                <th className="py-3 px-2 w-28 text-center">Pais</th>
                                                <th className="py-3 px-2 w-28 text-center">Ciudad</th>
                                                <th className="py-3 px-2 w-32 text-center">Días de Pago</th>
                                                <th className="py-3 px-2 w-40 text-center">Limite de Credito</th>
                                                <th className="py-3 px-2 w-32 text-center">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {proveedores.map((p) => (
                                                <tr key={p.id} className="border-t border-secondary text-sm hover:bg-secondary transition-colors">
                                                    <td className="py-3 px-2 font-mono text-center">{p.id}</td>
                                                    <td className="py-3 px-2 font-medium text-center">{p.nombre_comercial}</td>
                                                    <td className="py-3 px-2 text-subtitle text-center">{p.razon_social}</td>
                                                    <td className="py-3 px-2 text-center">{p.categoria}</td>
                                                    <td className="py-3 px-2 text-blue-400 truncate text-center">{p.email}</td>
                                                    <td className="py-3 px-2 text-center">{p.telefono}</td>
                                                    <td className="py-3 px-2 text-subtitle/80 text-center">{p.direccion}</td>
                                                    <td className="py-3 px-2 ">{p.pais}</td>
                                                    <td className="py-3 px-2 ">{p.ciudad}</td>
                                                    <td className="py-3 px-2 text-center">{p.dias_de_pago}</td>
                                                    <td className="py-3 px-2 font-semibold text-center">
                                                        {formatCurrency(p.limite_credito)}
                                                    </td>
                                                    <td className="py-3 px-2 text-center">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.estado === 1 ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                                                            {p.estado === 1 ? "Activo" : "Inactivo"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === "compras" && (
                        <>
                            <div className="flex flex-row justify-between">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-title text-xl font-bold">Registro de Compras</h3>
                                    <p className="text-subtitle text-s">Administra tu cartera de proveedores</p>
                                </div>
                                <button className="bg-title text-primary flex flex-row h-10 text-s gap-3 p-2 rounded-xl items-center hover:bg-[#E8E8E8] transition-transform duration-200 ease-in-out hover:scale-110 cursor-pointer">
                                    <Plus />
                                    Nueva Compra
                                </button>
                            </div>
                            <div className="mt-8 overflow-x-auto">
                                <table className="text-title min-w-[800px] border-collapse">
                                    <thead>
                                        <tr className="border-b border-secondary/50 text-sm font-semibold text-subtitle">
                                            <th className="py-3 px-2 w-32 **text-center**">Orden</th>
                                            <th className="py-3 px-2 w-96 **text-left**">Proveedor</th>
                                            <th className="py-3 px-2 w-32 **text-center**">Fecha</th>
                                            <th className="py-3 px-2 w-32 **text-center**">Vencimiento</th>
                                            <th className="py-3 px-2 w-32 **text-right**">Total</th>
                                            <th className="py-3 px-2 w-32 **text-center**">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colSpan="6" className="text-center py-8 text-subtitle">No hay compras registradas.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {
                isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-sm">
                        <div className="absolute inset-0" onClick={() => setIsModalOpen(false)}></div>
                        <div className="relative z-10 mx-4">
                            <NuevoProveedor onClose={() => setIsModalOpen(false)} />
                        </div>
                    </div>
                )
            }
        </div >
    )
}