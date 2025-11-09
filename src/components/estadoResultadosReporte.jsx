import React from 'react';

// (Pega el componente CuentaRowPnl que te mostré arriba aquí)
const CuentaRowPnl = ({ cuenta, tipoCuenta }) => (
    <div className="flex justify-between items-center py-1.5">
        <span className="text-sm text-title">{cuenta.cuenta}</span>
        <span className="text-sm text-title">
            C$ {(tipoCuenta === 'Ingreso' ? (cuenta.saldo * -1) : cuenta.saldo).toFixed(2)}
        </span>
    </div>
);


export default function EstadoResultadosReporte({
    isLoading,
    ingresosAgrupados,      // Objeto con los ingresos agrupados
    costosAgrupados,        // Objeto con los costos agrupados
    gastosAgrupados,        // Objeto con los gastos agrupados
    totalIngresos,          // Número (asumido negativo, ej: -10000)
    totalCostos,            // Número (asumido positivo, ej: 4000)
    totalGastos             // Número (asumido positivo, ej: 2000)
}) {

    // --- Cálculo de Totales Finales ---
    // (totalIngresos * -1) -> 10000
    // totalCostos -> 4000
    // totalGastos -> 2000
    const utilidadBruta = (totalIngresos * -1) - totalCostos; // 10000 - 4000 = 6000
    const utilidadAntesDeImpuestos = utilidadBruta - totalGastos;
    const impuestoIR = (utilidadAntesDeImpuestos > 0) ? (utilidadAntesDeImpuestos * 0.30) : 0;
    // La Utilidad Neta es DESPUÉS de impuestos
    const utilidadNeta = utilidadAntesDeImpuestos - impuestoIR;

    // Función para colorear la utilidad (Verde si > 0, Rojo si < 0)
    const utilidadClass = (monto) =>
        monto >= 0 ? 'text-green-600' : 'text-red-600';

    return (
        // Usamos la misma "tarjeta" principal del Balance, pero solo una
        <div className="mt-4 rounded-xl border-1 border-secondary p-4 w-full">

            {/* --- SECCIÓN DE INGRESOS --- */}
            <h1 className="text-green-600 font-semibold text-lg">Ingresos</h1>
            <div className="mt-2 mb-3">
                {isLoading ? <p>Cargando...</p> : (
                    ingresosAgrupados.map(cuenta => (
                        <CuentaRowPnl key={cuenta.id_cuenta} cuenta={cuenta} tipoCuenta="Ingreso" />
                    ))
                )}

                {isLoading ? <p>Cargando...</p> : (
                    costosAgrupados.map(cuenta => (
                        <CuentaRowPnl key={cuenta.id_cuenta} cuenta={cuenta} tipoCuenta="Costo" />
                    ))
                )}
                {/* Total General de Ingresos */}
                <div className="flex justify-between items-center py-2 mt-2 border-t border-secondary">
                    <span className="text-sm font-semibold text-title">UTILIDAD BRUTA</span>
                    <span className={`text-md font-semibold ${utilidadClass(utilidadBruta)}`}>
                        C$ {utilidadBruta.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* --- SECCIÓN DE GASTOS --- */}
            <h1 className="text-red-700 font-semibold text-lg mt-4">Gastos Operativos</h1>
            <div className="mt-2 mb-3">
                {isLoading ? <p>Cargando...</p> : (
                    gastosAgrupados.map(cuenta => (
                        <CuentaRowPnl key={cuenta.id_cuenta} cuenta={cuenta} tipoCuenta="Gasto" />
                    ))
                )}

                {/* Total General de Gastos */}
                <div className="flex justify-between items-center py-2 mt-2 border-t border-secondary">
                    <span className="text-sm font-semibold text-title">TOTAL GASTOS</span>
                    <span className="text-sm font-semibold text-title">
                        (C$ {totalGastos.toFixed(2)})
                    </span>
                </div>
            </div>

            {/* --- RESULTADO FINAL: UTILIDAD NETA --- */}
            {/* Usamos un borde más grueso y un fondo ligero para destacarlo */}
            <div className="flex justify-between items-center py-2 mt-2 border-t-2 border-secondary">
                <span className="text-md font-semibold text-title">UTILIDAD ANTES DE IMPUESTOS</span>
                <span className={`text-md font-semibold ${utilidadClass(utilidadAntesDeImpuestos)}`}>
                    C$ {utilidadAntesDeImpuestos.toFixed(2)}
                </span>
            </div>

            {/* Mostramos el Impuesto (IR) */}
            <div className="flex justify-between items-center py-1.5">
                <span className="text-sm text-title">(-) Impuesto Sobre la Renta (30%)</span>
                <span className="text-sm text-title">
                    (C$ {impuestoIR.toFixed(2)})
                </span>
            </div>

            <div className="flex justify-between items-center py-2 mt-2 border-t-2 border-secondary bg-secondary/20 p-2 rounded-lg">
                <span className="text-md font-semibold text-title">UTILIDAD NETA (O PÉRDIDA)</span>
                <span className={`text-md font-semibold ${utilidadClass(utilidadNeta)}`}>
                    C$ {utilidadNeta.toFixed(2)}
                </span>
            </div>

        </div>
    );
}