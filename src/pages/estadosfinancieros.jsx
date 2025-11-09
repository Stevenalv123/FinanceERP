import Tabs from "../components/tabs";
import { useState, useMemo } from "react";
import { useCuentas } from "../hooks/useCuentas";
import { Zap } from "lucide-react";
import { supabase } from "../supabase/supabaseclient";
import { useEmpresa } from "../contexts/empresacontext";
import { toast } from "react-hot-toast";
import BalanceGeneralReporte from "../components/balanceGeneralReporte";
import EstadoResultadosReporte from "../components/estadoResultadosReporte";

export default function EstadosFinancieros() {
    const { cuentas, isLoading, fetchCuentas } = useCuentas();
    const [tabs, setTabs] = useState([
        { key: 'balanceGeneral', label: 'Balance General' },
        { key: 'estadoResultados', label: 'Estado de Resultados' },
        { key: 'flujoEfectivo', label: 'Flujo de Efectivo' },
    ]);
    const [activeTab, setActiveTab] = useState('balanceGeneral');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaCierre, setFechaCierre] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const { empresaId } = useEmpresa();

    // 3. Toda la lógica de 'useMemo' se queda en el componente padre
    const {
        activosAgrupados,
        pasivosAgrupados,
        patrimonio,
        totalActivos,
        totalPasivos,
        totalPatrimonioCuentas,
        utilidadNeta,

        // Variables del Estado de Resultados (P&L)
        ingresosAgrupados,
        costosAgrupados,
        gastosAgrupados,
        totalIngresos,
        totalCostos,
        totalGastos
    } = useMemo(() => {
        const activos = cuentas.filter(c => c.tipo === 'Activo' && c.saldo !== 0);
        const pasivos = cuentas.filter(c => c.tipo === 'Pasivo' && c.saldo !== 0);
        const patrimonio = cuentas.filter(c => c.tipo === 'Patrimonio' && c.saldo !== 0);
        const ingresos = cuentas.filter(c => c.tipo === 'Ingreso' && c.saldo !== 0);
        const costos = cuentas.filter(c => c.tipo === 'Costo' && c.saldo !== 0);
        const gastos = cuentas.filter(c => c.tipo === 'Gasto' && c.saldo !== 0);

        const agruparPorSubtipo = (cuentasArray) => {
            return cuentasArray.reduce((acc, cuenta) => {
                const subtipo = cuenta.subtipo || 'Otros'; // Fallback
                if (!acc[subtipo]) {
                    acc[subtipo] = { cuentas: [], total: 0 };
                }
                acc[subtipo].cuentas.push(cuenta);
                acc[subtipo].total += cuenta.saldo;
                return acc;
            }, {});
        };

        const activosAgrupados = agruparPorSubtipo(activos);
        const pasivosAgrupados = agruparPorSubtipo(pasivos);
        // const ingresosAgrupados = agruparPorSubtipo(ingresos); // <-- FALTABA ESTE
        // const costosAgrupados = agruparPorSubtipo(costos);   // <-- FALTABA ESTE
        // const gastosAgrupados = agruparPorSubtipo(gastos);

        const totalActivos = activos.reduce((sum, c) => sum + c.saldo, 0);
        const totalPasivos = pasivos.reduce((sum, c) => sum + c.saldo, 0);
        const totalPatrimonioCuentas = patrimonio.reduce((sum, c) => sum + c.saldo, 0);
        const totalIngresos = ingresos.reduce((sum, c) => sum + c.saldo, 0);
        const totalCostos = costos.reduce((sum, c) => sum + c.saldo, 0);
        const totalGastos = gastos.reduce((sum, c) => sum + c.saldo, 0);
        const utilidadNeta = (totalIngresos * -1) - totalCostos - totalGastos;

        return {
            activosAgrupados,
            pasivosAgrupados,
            patrimonio,
            totalActivos,
            totalPasivos: totalPasivos * -1,
            totalPatrimonioCuentas: totalPatrimonioCuentas * -1,
            ingresosAgrupados: ingresos,
            costosAgrupados: costos,
            gastosAgrupados: gastos,
            totalIngresos,
            totalCostos,
            totalGastos,
            utilidadNeta
        };
    }, [cuentas]);

    const handleRegistrarDepreciacion = async () => {
        if (!fechaCierre) {
            toast.error("Por favor, selecciona la 'Fecha de cierre' para el proceso.");
            return;
        }

        setIsProcessing(true);
        toast.loading("Registrando depreciación...");

        const { error } = await supabase.rpc('sp_registrar_depreciacion_mensual', {
            p_id_empresa: empresaId,
            p_fecha_proceso: fechaCierre
        });

        toast.dismiss();
        if (error) {
            toast.error(`Error al procesar: ${error.message}`);
        } else {
            toast.success("¡Depreciación registrada con éxito!");
            // ¡CRÍTICO! Vuelve a cargar las cuentas para que el 'useMemo' se recalcule
            if (fetchCuentas) {
                fetchCuentas();
            }
        }
        setIsProcessing(false);
    };

    return (
        <div className="p-1 mt-4">
            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-col text-title gap-1 mb-4 ">
                    <h4 className="font-semibold text-xl">Estados Financieros</h4>
                    <p className="text-subtitle">Empresa: Nombre de la empresa | Moneda: USD</p>
                </div>

                <div className="flex flex-row gap-4 justify-center items-center">
                    <h4 className="font-semibold text-sm">Periodo de inicio:</h4>
                    <input type="date" className="border-1 p-2 rounded-lg text-sm text-title" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)}/>
                    <h4 className="font-semibold text-sm">Periodo de cierre:</h4>
                    <input type="date" className="border-1 p-2 rounded-lg text-sm text-title" value={fechaCierre} onChange={(e) => setFechaCierre(e.target.value)}/>
                    <button className="bg-button text-button px-4 py-2 rounded-lg font-semibold cursor-pointer text-sm hover:bg-primary-dark transition-colors duration-200 ease-in-out">
                        Generar
                    </button>
                    <button
                        className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer hover:bg-yellow-400 transition-colors duration-200 ease-in-out flex items-center gap-2"
                        onClick={handleRegistrarDepreciacion}
                        disabled={isProcessing} 
                    >
                        <Zap size={16} />
                        {isProcessing ? "Procesando..." : "Registrar Depreciación"}
                    </button>
                </div>
            </div>

            <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} width="30%" />

            {activeTab === 'balanceGeneral' && (
                // 5. Renderiza el nuevo componente pasándole los props
                <BalanceGeneralReporte
                    isLoading={isLoading}
                    activosAgrupados={activosAgrupados}
                    pasivosAgrupados={pasivosAgrupados}
                    patrimonio={patrimonio}
                    totalActivos={totalActivos}
                    totalPasivos={totalPasivos}
                    totalPatrimonioCuentas={totalPatrimonioCuentas}
                    utilidadNeta={utilidadNeta}
                />
            )}

            {activeTab === 'estadoResultados' && (
                <div className="mt-4">
                    <EstadoResultadosReporte
                        isLoading={isLoading}
                        ingresosAgrupados={ingresosAgrupados}
                        costosAgrupados={costosAgrupados}
                        gastosAgrupados={gastosAgrupados}
                        totalIngresos={totalIngresos}
                        totalCostos={totalCostos}
                        totalGastos={totalGastos}
                    />
                </div>
            )}
            {activeTab === 'flujoEfectivo' && (
                <div className="mt-4">
                    <h1>Flujo de Efectivo (Aún por construir)</h1>
                </div>
            )}
        </div>
    );
}