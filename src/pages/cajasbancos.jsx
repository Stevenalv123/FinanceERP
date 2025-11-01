import StatsCards from "../components/statscards";
import Tabs from "../components/tabs";
import NuevoMovCajas from "../components/nuevomovcajas";
import { useState } from "react";
import { TrendingUp, TrendingDown, Plus, Pencil, Trash, DollarSign, Banknote, Wallet } from "lucide-react";
import { useCajasBancos } from "../hooks/useCajasBancos"; 
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";
import {format} from "date-fns/format" 

export default function CajasBancos() {
    const tabs = [
        { key: "movimientos", label: "Movimientos", icon: <DollarSign size={16} /> },
        { key: "cuentasBancarias", label: "Cuentas Bancarias", icon: <Banknote size={16} /> }
    ];

    const [activeTab, setActiveTab] = useState("movimientos");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { 
        movimientos, 
        isLoading, 
        eliminarMovimiento, 
        isDeletingMov 
    } = useCajasBancos();

    const handleEliminarMovimiento = async (id, descripcion) => {
        const descText = descripcion || "este movimiento";
        
        Swal.fire({
            title: '¿Estás seguro?',
            text: `Esta acción no se puede revertir. Se eliminará ${descText}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#262626',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar',
            background: '#090909',
            color: '#fff',
            customClass: {
                popup: 'border border-secondary rounded-2xl'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { success, message } = await eliminarMovimiento(id);

                if (success) {
                    toast.success('✅ Movimiento eliminado correctamente');
                } else {
                    toast.error(`⚠️ Error al eliminar: ${message}`);
                }
            }
        });
    };

    return (
        <div>
            <div className="flex flex-row gap-4 justify-between mt-6">
                <StatsCards title={"Saldo en Caja"} icon={<Wallet className="text-title" />} value={`C$0`} />
                <StatsCards title={"Saldo en Bancos"} icon={<DollarSign className="text-title" />} value={`C$0`} />
                <StatsCards title={"Ingresos"} icon={<TrendingUp color="green" />} value={"$0"} />
                <StatsCards title={"Egresos"} icon={<TrendingDown color="red" className="text-title" />} value={"$0"} />
            </div>

            <div className="mt-6">
                <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} width="20%" />
                <div className="mt-8 border border-secondary rounded-2xl p-5">
                    {activeTab === "movimientos" && (
                        <>
                            <div className="flex flex-row justify-between items-center">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-title text-xl font-bold">Movimientos de Caja y Bancos</h3>
                                    <p className="text-subtitle text-s">Registra ingresos y egresos</p>
                                </div>
                                <button className="btn-new bg-button text-button flex flex-row h-10 text-s gap-3 p-2 rounded-xl items-center cursor-pointer hover:opacity-95 hover:scale-110 transition" onClick={() => setIsModalOpen(true)}>
                                    <span className="icon"><Plus /></span> Nuevo Movimiento
                                </button>
                            </div>

                            <div className="mt-8 overflow-x-auto">
                                {isLoading ? (
                                    <p className="p-4 text-center text-gray-400">Cargando movimientos...</p>
                                ) : movimientos.length === 0 ? (
                                    <p className="p-4 text-center text-gray-400">No hay movimientos registrados. ¡Agrega uno nuevo!</p>
                                ) : (
                                    <div className="inline-block min-w-full align-middle">
                                        <div className="overflow-hidden rounded-lg mb-8">
                                            <table className="min-w-full text-title">
                                                <thead className="bg-secondary/10">
                                                    <tr className="border-b border-secondary/50 text-sm font-semibold text-subtitle">
                                                        <th className="py-3 px-4 text-center">Fecha</th>
                                                        <th className="py-3 px-4 text-center">Cuenta</th>
                                                        <th className="py-3 px-4 text-center">Descripción</th>
                                                        <th className="py-3 px-4 text-center">Tipo</th>
                                                        <th className="py-3 px-4 text-center">Monto</th>
                                                        <th className="py-3 px-4 text-center">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {movimientos.map((m) => (
                                                        <tr key={m.id_movimiento} className="border-t border-secondary text-sm hover:bg-secondary/10 transition-colors">
                                                            <td className="py-4 px-4 font-medium text-title text-center">{format(new Date(m.fecha), 'dd/MM/yyyy')}</td>
                                                            <td className="py-4 px-4 text-title text-center">{m.cuentas_empresa?.nombre || "N/A"}</td>
                                                            <td className="py-4 px-4 text-title text-center">{m.descripcion || "-"}</td>
                                                            <td className="py-4 px-4 text-center">
                                                                <span className={`px-2.5 py-1 rounded-full text-sm font-semibold ${
                                                                    m.tipo === 'DEBE'
                                                                    ? 'bg-green-600/20 text-white-400'
                                                                    : 'bg-red-600/20 text-white-400'
                                                                }`}>
                                                                    {m.tipo}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-4 font-mono text-title text-center">C${parseFloat(m.monto).toFixed(2)}</td>
                                                            <td className="py-4 px-4">
                                                                <div className="flex justify-center gap-8">
                                                                    <button title="Editar Movimiento" className="text-blue-400 hover:text-blue-300 transition-colors transform hover:scale-110 cursor-pointer">
                                                                        <Pencil size={18}/>
                                                                    </button>
                                                                    <button 
                                                                        title="Eliminar Movimiento" 
                                                                        className="text-red-500 hover:text-red-400 transition-colors transform hover:scale-110 cursor-pointer" 
                                                                        onClick={() => handleEliminarMovimiento(m.id_movimiento, m.descripcion)}
                                                                        disabled={isDeletingMov}
                                                                    >
                                                                        <Trash size={18}/>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-sm">
                    <div className="absolute inset-0" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative z-10 mx-4">
                        <NuevoMovCajas 
                            onClose={() => setIsModalOpen(false)} 
                            onMovimientoAgregado={() => setIsModalOpen(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
