import Tabs from "../components/tabs";
import { useState, useMemo } from "react";
import { Zap } from "lucide-react";
import { supabase } from "../supabase/supabaseclient";
import { useEmpresa } from "../contexts/empresacontext";
import { toast } from "react-hot-toast";
import BalanceGeneralReporte from "../components/balanceGeneralReporte";
import EstadoResultadosReporte from "../components/estadoResultadosReporte";
import FlujoEfectivoReporte from "../components/flujoEfectivoReporte";

export default function EstadosFinancieros() {
    const [cuentasActuales, setCuentasActuales] = useState([]);
    const [cuentasAnteriores, setCuentasAnteriores] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
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

    const handleGenerarReporte = async () => {
        if (!fechaInicio || !fechaCierre) {
            toast.error("Seleccione fecha de inicio y cierre");
            return;
        }
        setIsLoading(true);

        let fechaAnterior = new Date(fechaInicio);
        fechaAnterior.setDate(fechaAnterior.getDate() - 1);
        const fechaInicioReporte = fechaAnterior.toISOString().split('T')[0];

        try {
            const { data: dataAnterior, error: errorAnterior } = await supabase.rpc('sp_get_balance_as_of_date', {
                p_id_empresa: empresaId,
                p_fecha_corte: fechaInicioReporte
            });
            if (errorAnterior) throw errorAnterior;
            setCuentasAnteriores(dataAnterior || []);

            const { data: dataActual, error: errorActual } = await supabase.rpc('sp_get_balance_as_of_date', {
                p_id_empresa: empresaId,
                p_fecha_corte: fechaCierre
            });
            if (errorActual) throw errorActual;
            setCuentasActuales(dataActual || []);

        } catch (error) {
            toast.error(`Error al generar reportes: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }; // <-- FIN DE handleGenerarReporte

    // --- TUS useMemo EN EL LUGAR CORRECTO ---
    const datosActuales = useMemo(() => {
        // ... (Toda la lógica de cálculo para cuentasActuales)
        const activos = cuentasActuales.filter(c => c.tipo === 'Activo' && c.saldo !== 0);
        const pasivos = cuentasActuales.filter(c => c.tipo === 'Pasivo' && c.saldo !== 0);
        const patrimonio = cuentasActuales.filter(c => c.tipo === 'Patrimonio' && c.saldo !== 0);
        const ingresos = cuentasActuales.filter(c => c.tipo === 'Ingreso' && c.saldo !== 0);
        const costos = cuentasActuales.filter(c => c.tipo === 'Costo' && c.saldo !== 0);
        const gastos = cuentasActuales.filter(c => c.tipo === 'Gasto' && c.saldo !== 0);

        const agruparPorSubtipo = (cuentasArray) => {
            return cuentasArray.reduce((acc, cuenta) => {
                const subtipo = cuenta.subtipo || 'Otros';
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
        const gastosAgrupados = agruparPorSubtipo(gastos);

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
            gastosAgrupados: gastosAgrupados,
            totalIngresos,
            totalCostos,
            totalGastos,
            utilidadNeta
        };
    }, [cuentasActuales]);

    const datosAnteriores = useMemo(() => {
        // ... (Lógica idéntica para cuentasAnteriores) ...
        const activos = cuentasAnteriores.filter(c => c.tipo === 'Activo' && c.saldo !== 0);
        const pasivos = cuentasAnteriores.filter(c => c.tipo === 'Pasivo' && c.saldo !== 0);
        const patrimonio = cuentasAnteriores.filter(c => c.tipo === 'Patrimonio' && c.saldo !== 0);
        const ingresos = cuentasAnteriores.filter(c => c.tipo === 'Ingreso' && c.saldo !== 0);
        const costos = cuentasAnteriores.filter(c => c.tipo === 'Costo' && c.saldo !== 0);
        const gastos = cuentasAnteriores.filter(c => c.tipo === 'Gasto' && c.saldo !== 0);

        const agruparPorSubtipo = (cuentasArray) => {
            return cuentasArray.reduce((acc, cuenta) => {
                const subtipo = cuenta.subtipo || 'Otros';
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
        const gastosAgrupados = agruparPorSubtipo(gastos);

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
            gastosAgrupados: gastosAgrupados,
            totalIngresos,
            totalCostos,
            totalGastos,
            utilidadNeta
        };
    }, [cuentasAnteriores]);

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
            handleGenerarReporte(); // Refresca los datos
        }
        setIsProcessing(false);
    };

    return (
        <div className="p-1 mt-4">

            {/* --- AQUÍ ESTÁN TUS BOTONES --- */}
            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-col text-title gap-1 mb-4 ">
                    <h4 className="font-semibold text-xl">Estados Financieros</h4>
                    <p className="text-subtitle">Empresa: Nombre de la empresa | Moneda: USD</p>
                </div>

                <div className="flex flex-row gap-4 justify-center items-center">
                    <h4 className="font-semibold text-sm">Periodo de inicio:</h4>
                    <input type="date" className="border-1 p-2 rounded-lg text-sm text-title" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
                    <h4 className="font-semibold text-sm">Periodo de cierre:</h4>
                    <input type="date" className="border-1 p-2 rounded-lg text-sm text-title" value={fechaCierre} onChange={(e) => setFechaCierre(e.target.value)} />
                    <button className="bg-button text-button px-4 py-2 rounded-lg font-semibold cursor-pointer text-sm hover:bg-primary-dark transition-colors duration-200 ease-in-out" onClick={handleGenerarReporte}>
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
                <BalanceGeneralReporte
                    isLoading={isLoading}
                    datosActuales={datosActuales}
                    datosAnteriores={datosAnteriores}
                />
            )}

            {activeTab === 'estadoResultados' && (
                <div className="mt-4">
                    <EstadoResultadosReporte
                        isLoading={isLoading}
                        datosActuales={datosActuales}
                        datosAnteriores={datosAnteriores}
                    />
                </div>
            )}

            {activeTab === 'flujoEfectivo' && (
                <div className="mt-4">
                    <FlujoEfectivoReporte
                        isLoading={isLoading}
                        datosActuales={datosActuales}
                        datosAnteriores={datosAnteriores}
                    />
                </div>
            )}
        </div>
    );
}