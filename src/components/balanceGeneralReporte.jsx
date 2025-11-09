import React from 'react';

// Movimos el componente CuentaRow aquí
const CuentaRow = ({ cuenta, tipoCuenta }) => (
    <div className="flex justify-between items-center py-1.5">
        <span className="text-sm text-title">{cuenta.cuenta}</span>
        <span className="text-sm text-title">
            C$ {(tipoCuenta !== 'Activo' ? (cuenta.saldo * -1) : cuenta.saldo).toFixed(2)}
        </span>
    </div>
);

export default function BalanceGeneralReporte({
    isLoading,
    activosAgrupados,
    pasivosAgrupados,
    patrimonio,
    totalActivos,
    totalPasivos,
    totalPatrimonioCuentas,
    utilidadNeta
}) {

    // --- Lógica de Ordenamiento ---
    const ordenActivos = [
        "Activo Corriente",
        "Activo No Corriente",
        "Otros Activos" // Fallback
    ];

    const ordenPasivos = [
        "Pasivo Corriente",
        "Pasivo No Corriente",
        "Otros Pasivos" // Fallback
    ];

    const getSortIndex = (ordenArray, nombreSubtipo) => {
        const index = ordenArray.indexOf(nombreSubtipo);
        return index === -1 ? 99 : index;
    };

    // --- Cálculo de Totales Finales ---
    const totalPatrimonioFinal = totalPatrimonioCuentas + utilidadNeta;
    const totalPasivoMasPatrimonio = totalPasivos + totalPatrimonioFinal;

    return (
        <div className="mt-4 flex flex-row justify-between gap-4">
            <div className="rounded-xl border-1 border-secondary p-4 w-full">
                <h1 className="text-green-600 font-semibold text-lg">Activos</h1>
                <p className="text-subtitle">Recursos controlados por la empresa</p>
                <div className="mt-4">
                    {isLoading ? <p>Cargando...</p> : (
                        Object.entries(activosAgrupados)
                            .sort(([a], [b]) => getSortIndex(ordenActivos, a) - getSortIndex(ordenActivos, b))
                            .map(([subtipoNombre, data]) => (
                                <div key={subtipoNombre} className="mb-3">
                                    <h2 className="text-title font-semibold mt-2">{subtipoNombre}</h2>
                                    {data.cuentas.map(cuenta => (
                                        <CuentaRow key={cuenta.id_cuenta} cuenta={cuenta} tipoCuenta="Activo" />
                                    ))}
                                    <div className="flex justify-between items-center py-1 mt-1 border-t border-secondary">
                                        <span className="text-sm font-semibold text-title">Total {subtipoNombre}</span>
                                        <span className="text-sm font-semibold text-title">
                                            C$ {data.total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))
                    )}
                    <div className="flex justify-between items-center py-2 mt-2 border-t border-secondary">
                        <span className="text-md font-semibold text-title">TOTAL ACTIVOS</span>
                        <span className="text-md font-semibold text-title">
                            C$ {totalActivos.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border-1 border-secondary p-4 w-full">
                <h1 className="text-red-700 font-semibold text-lg">Pasivos y Patrimonio</h1>
                <p className="text-subtitle">Obligaciones y capital de la empresa</p>
                <div className="mt-4">
                    {isLoading ? <p>Cargando...</p> : (
                        Object.entries(pasivosAgrupados)
                            .sort(([a], [b]) => getSortIndex(ordenPasivos, a) - getSortIndex(ordenPasivos, b))
                            .map(([subtipoNombre, data]) => (
                                <div key={subtipoNombre} className="mb-3">
                                    <h2 className="text-title font-semibold mt-2">{subtipoNombre}</h2>
                                    {data.cuentas.map(cuenta => (
                                        <CuentaRow key={cuenta.id_cuenta} cuenta={cuenta} tipoCuenta="Pasivo" />
                                    ))}
                                    <div className="flex justify-between items-center py-1 mt-1 border-t border-secondary">
                                        <span className="text-sm font-semibold text-title">Total {subtipoNombre}</span>
                                        <span className="text-sm font-semibold text-title">
                                            C$ {(data.total * -1).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))
                    )}
                    <div className="flex justify-between items-center py-1.5 mt-1 border-t border-secondary">
                        <span className="text-sm font-semibold text-title">Total Pasivos</span>
                        <span className="text-sm font-semibold text-title">
                            C$ {totalPasivos.toFixed(2)}
                        </span>
                    </div>

                    <h2 className="text-title mt-4">Patrimonio</h2>
                    {isLoading ? <p>Cargando...</p> : (
                        patrimonio.map(cuenta => (
                            <CuentaRow key={cuenta.id_cuenta} cuenta={cuenta} tipoCuenta="Patrimonio" />
                        ))
                    )}

                    <div className="flex justify-between items-center py-1.5">
                        <span className="text-sm text-title">Utilidad (o Pérdida) del Período</span>
                        <span className={`text-sm ${utilidadNeta >= 0 ? 'text-title' : 'text-red-500'}`}>
                            C$ {utilidadNeta.toFixed(2)}
                        </span>
                    </div>

                    <div className="flex justify-between items-center py-1.5 mt-1 border-t border-secondary">
                        <span className="text-sm font-semibold text-title">Total Patrimonio</span>
                        <span className="text-sm font-semibold text-title">
                            C$ {totalPatrimonioFinal.toFixed(2)}
                        </span>
                    </div>

                    <div className="flex justify-between items-center py-2 mt-2 border-t border-secondary">
                        <span className="text-md font-semibold text-title">TOTAL PASIVO + PATRIMONIO</span>
                        <span className="text-md font-semibold text-title">
                            C$ {totalPasivoMasPatrimonio.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}