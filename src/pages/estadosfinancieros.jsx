import Tabs from "../components/tabs";
import { useState, useMemo } from "react";
import { useCuentas } from "../hooks/useCuentas";

const CuentaRow = ({ cuenta, tipoCuenta }) => (
    <div className="flex justify-between items-center py-1.5">
        <span className="text-sm text-subtitle">{cuenta.cuenta} ({cuenta.codigo || 'S/C'})</span>
        <span className="text-sm font-mono text-title">
            C$ {(tipoCuenta !== 'Activo' ? (cuenta.saldo * -1) : cuenta.saldo).toFixed(2)}
        </span>
    </div>
);

export default function EstadosFinancieros() {
    const { cuentas, isLoading } = useCuentas();
    const [tabs, setTabs] = useState([
        { key: 'balanceGeneral', label: 'Balance General' },
        { key: 'estadoResultados', label: 'Estado de Resultados' },
        { key: 'flujoEfectivo', label: 'Flujo de Efectivo' },
    ]);
    const [activeTab, setActiveTab] = useState('balanceGeneral');

    const {
        activosAgrupados,
        pasivosAgrupados,
        patrimonio,
        totalActivos,
        totalPasivos,
        totalPatrimonio
    } = useMemo(() => {
        const activos = cuentas.filter(c => c.tipo === 'Activo' && c.saldo !== 0);
        const pasivos = cuentas.filter(c => c.tipo === 'Pasivo' && c.saldo !== 0);
        const patrimonio = cuentas.filter(c => c.tipo === 'Patrimonio' && c.saldo !== 0);

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

        const totalActivos = activos.reduce((sum, c) => sum + c.saldo, 0);
        const totalPasivos = pasivos.reduce((sum, c) => sum + c.saldo, 0);
        const totalPatrimonio = patrimonio.reduce((sum, c) => sum + c.saldo, 0);

        return {
            activosAgrupados,
            pasivosAgrupados,
            patrimonio,
            totalActivos,
            totalPasivos: totalPasivos * -1,
            totalPatrimonio: totalPatrimonio * -1
        };
    }, [cuentas]);

    return (
        <div className="p-1 mt-4">
            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-col text-title gap-1 mb-4 ">
                    <h4 className="font-semibold text-xl">Estados Financieros</h4>
                    <p className="text-subtitle">Empresa: Nombre de la empresa | Moneda: USD</p>
                </div>

                <div className="flex flex-row gap-4 justify-center items-center">
                    <h4 className="font-semibold text-sm">Periodo de inicio:</h4>
                    <input type="date" className="border-1 p-2 rounded-lg text-sm text-title" />
                    <h4 className="font-semibold text-sm">Periodo de cierre:</h4>
                    <input type="date" className="border-1 p-2 rounded-lg text-sm text-title" />
                    <button className="bg-button text-button px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary-dark transition-colors duration-200 ease-in-out">
                        Generar
                    </button>
                </div>

            </div>

            <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} width="30%" />

            {activeTab === 'balanceGeneral' && (
                <div className="mt-4 flex flex-row justify-between gap-4">
                    <div className="rounded-xl border-1 border-secondary p-4 w-full">
                        <h1 className="text-green-600 font-semibold text-lg">Activos</h1>
                        <p className="text-subtitle">Recursos controlados por la empresa</p>
                        <div className="mt-4">
                            {isLoading ? <p>Cargando...</p> : (
                                Object.entries(activosAgrupados).map(([subtipoNombre, data]) => (
                                    <div key={subtipoNombre} className="mb-3">
                                        <h2 className="text-title font-semibold mt-2">{subtipoNombre}</h2>
                                        {data.cuentas.map(cuenta => (
                                            <CuentaRow key={cuenta.id_cuenta} cuenta={cuenta} tipoCuenta="Activo" />
                                        ))}
                                        <div className="flex justify-between items-center py-1 mt-1">
                                            <span className="text-sm font-semibold text-title">Total {subtipoNombre}</span>
                                            <span className="text-sm font-semibold font-mono text-title">
                                                C$ {data.total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div className="flex justify-between items-center py-2 mt-2 border-t border-secondary">
                                <span className="text-md font-semibold text-title">TOTAL ACTIVOS</span>
                                <span className="text-md font-semibold font-mono text-title">
                                    C$ {totalActivos.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border-1 border-secondary p-4 w-full">
                        <h1 className="text-red-700 font-semibold text-lg">Pasivos y Patrimonio</h1>
                        <p className="text-subtitle">Obligaciones y capital de la empresa</p>
                        <div className="mt-4">
                            <h2 className="text-title">Pasivos</h2>
                            {isLoading ? <p>Cargando...</p> : (
                                Object.entries(pasivosAgrupados).map(([subtipoNombre, data]) => (
                                    <div key={subtipoNombre} className="mb-3">
                                        <h2 className="text-title font-semibold mt-2">{subtipoNombre}</h2>
                                        {data.cuentas.map(cuenta => (
                                            <CuentaRow key={cuenta.id_cuenta} cuenta={cuenta} tipoCuenta="Pasivo" />
                                        ))}
                                        <div className="flex justify-between items-center py-1 mt-1 border-t border-secondary/50">
                                            <span className="text-sm font-semibold text-title">Total {subtipoNombre}</span>
                                            <span className="text-sm font-semibold font-mono text-title">
                                                C$ {(data.total * -1).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div className="flex justify-between items-center py-1.5 mt-1 border-t border-secondary/50">
                                <span className="text-sm font-semibold text-title">Total Pasivos</span>
                                <span className="text-sm font-semibold font-mono text-title">
                                    C$ {totalPasivos.toFixed(2)}
                                </span>
                            </div>

                            <h2 className="text-title mt-4">Patrimonio</h2>
                            {isLoading ? <p>Cargando...</p> : (
                                patrimonio.map(cuenta => (
                                    <CuentaRow key={cuenta.id_cuenta} cuenta={cuenta} tipoCuenta="Patrimonio" />
                                ))
                            )}
                            <div className="flex justify-between items-center py-1.5 mt-1 border-t border-secondary/50">
                                <span className="text-sm font-semibold text-title">Total Patrimonio</span>
                                <span className="text-sm font-semibold font-mono text-title">
                                    C$ {totalPatrimonio.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2 mt-2 border-t border-secondary">
                                <span className="text-md font-semibold text-title">TOTAL PASIVO + PATRIMONIO</span>
                                <span className="text-md font-semibold font-mono text-title">
                                    C$ {(totalPasivos + totalPatrimonio).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}