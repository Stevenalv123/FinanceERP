import StatsCards from "../components/statscards";
import { useState } from "react";
import { Wrench, TrendingDown, Plus } from "lucide-react";
import NuevoActivoFijo from "../components/nuevoactivofijo";

export default function ActivosFijos() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div>
            <div className="flex flex-row gap-4 justify-between mt-6">
                <StatsCards title={"Total Activos"} icon={<Wrench className="text-title" />} value={<span>0</span>} />
                <StatsCards title={"Valor Actual"} icon={<TrendingDown className="text-title" />} value={`C$0`} />
                <StatsCards title={"Depreciación Acumulada"} icon={<TrendingDown color="red" />} value={0} />
                <StatsCards title={"En Mantenimiento"} icon={<Wrench color="orange" className="text-title" />} value={"0"} />
            </div>

            <div className="mt-6">
                <div className="mt-8 border border-secondary rounded-2xl p-5">
                    <div className="flex flex-row justify-between items-center">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-title text-xl font-bold">Gestión de Activos Fijos</h3>
                            <p className="text-subtitle text-s">Administra los activos fijos y su depreciación</p>
                        </div>
                        <button className="btn-new bg-button text-button flex flex-row h-10 gap-3 p-2 rounded-xl items-center cursor-pointer hover:opacity-95 hover:scale-110 transition" onClick={() => setIsModalOpen(true)}>
                            <span className="icon"><Plus /></span> Nuevo Activo
                        </button>
                    </div>

                    {/* {clientes.length === 0 ? (
                        <p className="text-center text-subtitle">No hay activos registrados</p>
                    ) : (
                        <div className="mt-8 flex flex-col gap-4">
                            {clientes.map(cliente => (
                                <ClientesCards key={cliente.id_cliente} {...cliente} />
                            ))}
                        </div>
                    )} */}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-sm">
                    <div className="absolute inset-0" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative z-10 mx-4">
                        <NuevoActivoFijo onClose={() => setIsModalOpen(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}
