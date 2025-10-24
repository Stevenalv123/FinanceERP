import StatsCards from "../components/statscards";
import Tabs from "../components/tabs";
import NuevoCliente from "../components/nuevoCliente";
import { useState } from "react";
import { FileSpreadsheet, DollarSign, TrendingDown, CircleAlert, ArrowLeftRight, Plus, ShoppingBasket, Pencil, Trash } from "lucide-react";
import { useClientes } from "../hooks/useClientes";
import VentasCards from "../components/ventasCards"

export default function Ventas() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    //const { ventas } = useClientes();
    const valorTotalInventario = 0;

    return (
        <div>
            <div className="flex flex-row gap-4 justify-between mt-6">
                <StatsCards title={"Total Ventas"} icon={<DollarSign className="text-title" />} value={`C$${valorTotalInventario.toFixed(2)}`} />
                <StatsCards title={"Facturas Emitidas"} icon={<FileSpreadsheet className="text-title" />} value={`0`} />
                <StatsCards title={"Por Cobrar"}  value={0} />
                <StatsCards title={"Borradores"} value={"0"} />
            </div>

            <div className="mt-6">
                <div className="mt-8 border border-secondary rounded-2xl p-5">
                     <div className="flex flex-row justify-between items-center">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-title text-xl font-bold">Gestión de Ventas</h3>
                                    <p className="text-subtitle text-s">Registra y administra tus ventas</p>
                                </div>
                                <button className="btn-new bg-button text-button flex flex-row h-10 gap-3 p-2 rounded-xl items-center cursor-pointer hover:opacity-95 hover:scale-110 transition" onClick={() => setIsModalOpen(true)}>
                                    <span className="icon"><Plus /></span> Nueva Venta
                                </button>
                            </div>

                            
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
