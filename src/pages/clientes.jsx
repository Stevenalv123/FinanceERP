import StatsCards from "../components/statscards";
import Tabs from "../components/tabs";
import NuevoCliente from "../components/nuevoCliente";
import { useState } from "react";
import { Box, DollarSign, TrendingDown, CircleAlert, ArrowLeftRight, Plus, ShoppingBasket } from "lucide-react";
import { useClientes } from "../hooks/useClientes";
import ClientesCards from "../components/clientesCards"

export default function Clientes() {
    const tabs = [
        { key: "clientes", label: "Clientes", icon: <ShoppingBasket size={16} /> },
        { key: "cuentasporcobrar", label: "Cuentas por Cobrar", icon: <ArrowLeftRight size={16} /> }
    ];

    const [activeTab, setActiveTab] = useState("clientes");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { clientes } = useClientes();
    const valorTotalInventario = 0;

    return (
        <div>
            <div className="flex flex-row gap-4 justify-between mt-6">
                <StatsCards title={"Total Clientes"} icon={<Box className="text-title" />} value={<span>{clientes.length}</span>} />
                <StatsCards title={"Cuentas por Cobrar"} icon={<DollarSign className="text-title" />} value={`C$${valorTotalInventario.toFixed(2)}`} />
                <StatsCards title={"Clientes Morosos"} icon={<CircleAlert color="red" />} value={0} />
                <StatsCards title={"Pagos Pendientes"} icon={<TrendingDown className="text-title" />} value={"0"} />
            </div>

            <div className="mt-6">
                <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} width="18%" />
                <div className="mt-8 border border-secondary rounded-2xl p-5">
                    {activeTab === "clientes" && (
                        <>
                            <div className="flex flex-row justify-between items-center">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-title text-xl font-bold">Gestión de Clientes</h3>
                                    <p className="text-subtitle text-s">Administra el catálogo de clientes</p>
                                </div>
                                <button className="btn-new bg-button text-button flex flex-row h-10 gap-3 p-2 rounded-xl items-center cursor-pointer hover:opacity-95 hover:scale-110 transition" onClick={() => setIsModalOpen(true)}>
                                    <span className="icon"><Plus /></span> Nuevo Cliente
                                </button>
                            </div>

                            {clientes.length === 0 ? (
                                <p className="text-center text-subtitle">No hay clientes registrados</p>
                            ) : (
                                <div className="mt-8 flex flex-col gap-4">
                                    {clientes.map(cliente => (
                                        <ClientesCards key={cliente.id_cliente} {...cliente} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-sm">
                    <div className="absolute inset-0" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative z-10 mx-4">
                        <NuevoCliente onClose={() => setIsModalOpen(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}
