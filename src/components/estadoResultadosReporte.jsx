import React from 'react';

// --- COMPONENTE DE FILA (7 COLUMNAS) ---
const CuentaRowComparativa = ({ cuenta, tipo, datosAnteriores, baseVerticalActual, baseVerticalAnterior }) => {
    // 1. SALDOS
    const cuentaAnterior = datosAnteriores?.cuentas?.find(c => c.id_cuenta === cuenta.id_cuenta);
    // Los saldos P&L (Ingreso, Costo, Gasto) del periodo anterior son 0. Los saldos del P&L no se "arrastran" como el balance.
    // Solo calculamos el saldo actual.
    const saldoActual = (tipo === 'Ingreso' ? (cuenta.saldo * -1) : cuenta.saldo);
    const saldoAnterior = 0; // El P&L del periodo anterior (inicio) es siempre 0.

    // 2. ANÁLISIS HORIZONTAL (No aplica para P&L de esta forma)
    const varAbsoluta = saldoActual - saldoAnterior;
    const varRelativa = saldoAnterior !== 0 ? (varAbsoluta / saldoAnterior) * 100 : 0;

    // 3. ANÁLISIS VERTICAL (Base: Total de Ingresos)
    const verticalActual = baseVerticalActual !== 0 ? (saldoActual / baseVerticalActual) * 100 : 0;
    // const verticalAnterior = 0; // No aplica

    return (
        <div className="grid grid-cols-7 items-center py-1.5 text-right">
            <span className="text-sm text-title col-span-1 text-left">{cuenta.cuenta}</span>
            <span className="text-sm text-title col-span-1">C$ {saldoActual.toFixed(2)}</span>
            <span className="text-sm text-subtitle col-span-1">{verticalActual.toFixed(1)}%</span>
            <span className="text-sm text-title col-span-1">C$ 0.00</span>
            <span className="text-sm text-subtitle col-span-1">0.0%</span>
            <span className="text-sm col-span-1">{varAbsoluta.toFixed(2)}</span>
            <span className="text-sm col-span-1">---</span>
        </div>
    );
};

// --- COMPONENTE DE FILA DE TOTAL (7 COLUMNAS) ---
const TotalRowComparativa = ({ label, totalActual, totalAnterior, tipo = 'Ingreso', baseVerticalActual, baseVerticalAnterior, isMainTotal = false }) => {
    const saldoActual = (tipo === 'Ingreso' ? (totalActual * -1) : totalActual);
    const saldoAnterior = (tipo === 'Ingreso' ? (totalAnterior * -1) : totalAnterior);

    const varAbsoluta = saldoActual - saldoAnterior;
    const varRelativa = saldoAnterior !== 0 ? (varAbsoluta / saldoAnterior) * 100 : 0;

    const verticalActual = baseVerticalActual !== 0 ? (saldoActual / baseVerticalActual) * 100 : 0;
    const verticalAnterior = baseVerticalAnterior !== 0 ? (saldoAnterior / baseVerticalAnterior) * 100 : 0;

    const borderClass = isMainTotal ? 'border-t-2 border-secondary' : 'border-t border-secondary';
    const colorClass = (monto) => monto >= 0 ? 'text-green-500' : 'text-red-500';

    return (
        <div className={`grid grid-cols-7 items-center py-1.5 mt-1 font-semibold text-right ${borderClass}`}>
            <span className="text-sm text-title col-span-1 text-left">{label}</span>
            <span className={`text-sm col-span-1 ${isMainTotal ? colorClass(saldoActual) : 'text-title'}`}>C$ {saldoActual.toFixed(2)}</span>
            <span className={`text-sm col-span-1 ${isMainTotal ? colorClass(saldoActual) : 'text-title'}`}>{verticalActual.toFixed(1)}%</span>
            <span className={`text-sm col-span-1 ${isMainTotal ? colorClass(saldoAnterior) : 'text-subtitle'}`}>C$ {saldoAnterior.toFixed(2)}</span>
            <span className={`text-sm col-span-1 ${isMainTotal ? colorClass(saldoAnterior) : 'text-subtitle'}`}>{verticalAnterior.toFixed(1)}%</span>
            <span className={`text-sm col-span-1 ${colorClass(varAbsoluta)}`}>{varAbsoluta.toFixed(2)}</span>
            <span className={`text-sm col-span-1 ${colorClass(varRelativa)}`}>{varRelativa.toFixed(1)}%</span>
        </div>
    );
};


// --- COMPONENTE DE REPORTE PRINCIPAL ---
export default function EstadoResultadosReporte({
    isLoading,
    datosActuales,
    datosAnteriores
}) {

    // --- 1. DESTRUCTURA LOS DATOS (¡LA CORRECCIÓN!) ---
    const {
        ingresosAgrupados = [],
        costosAgrupados = [],
        gastosAgrupados = {},
        totalIngresos = 0,
        totalCostos = 0,
        totalGastos = 0
    } = datosActuales || {};

    // --- 2. DESTRUCTURA LOS DATOS ANTERIORES ---
    const {
        totalIngresos: totalIngresosAnterior = 0,
        totalCostos: totalCostosAnterior = 0,
        totalGastos: totalGastosAnterior = 0
    } = datosAnteriores || {};

    // --- 3. CÁLCULO DE TOTALES (PARA AMBOS PERÍODOS) ---
    // Periodo Actual
    const utilidadBruta = (totalIngresos * -1) - totalCostos;
    const utilidadAntesDeImpuestos = utilidadBruta - totalGastos;
    const impuestoIR = (utilidadAntesDeImpuestos > 0) ? (utilidadAntesDeImpuestos * 0.30) : 0;
    const utilidadNeta = utilidadAntesDeImpuestos - impuestoIR;
    const baseVerticalActual = (totalIngresos * -1); // Base para % Vertical es Total Ingresos

    // Periodo Anterior
    const utilidadBrutaAnterior = (totalIngresosAnterior * -1) - totalCostosAnterior;
    const utilidadAntesDeImpuestosAnterior = utilidadBrutaAnterior - totalGastosAnterior;
    const impuestoIRAnterior = (utilidadAntesDeImpuestosAnterior > 0) ? (utilidadAntesDeImpuestosAnterior * 0.30) : 0;
    const utilidadNetaAnterior = utilidadAntesDeImpuestosAnterior - impuestoIRAnterior;
    const baseVerticalAnterior = (totalIngresosAnterior * -1);

    // Encabezados de Columna (7 COLUMNAS)
    const Encabezados = () => (
        <div className="grid grid-cols-7 items-center py-2 mt-4 border-b border-secondary text-right min-w-[700px]">
            <span className="text-sm font-semibold text-title col-span-1 text-left">Cuenta</span>
            <span className="text-sm font-semibold text-title col-span-1">Actual</span>
            <span className="text-sm font-semibold text-title col-span-1">% Actual</span>
            <span className="text-sm font-semibold text-title col-span-1">Anterior</span>
            <span className="text-sm font-semibold text-title col-span-1">% Anterior</span>
            <span className="text-sm font-semibold text-title col-span-1">Var. Abs.</span>
            <span className="text-sm font-semibold text-title col-span-1">Var. Rel. %</span>
        </div>
    );

    return (
        <div className="mt-4 rounded-xl border-1 border-secondary p-4 w-full">
            <h1 className="text-green-600 font-semibold text-lg">Ingresos</h1>
            <Encabezados />
            <div className="mt-2 mb-3 min-w-[700px]">
                {isLoading ? <p>Cargando...</p> : (
                    ingresosAgrupados.map(cuenta => (
                        <CuentaRowComparativa
                            key={cuenta.id_cuenta}
                            cuenta={cuenta}
                            tipo="Ingreso"
                            datosAnteriores={{ cuentas: datosAnteriores?.ingresosAgrupados || [] }}
                            baseVerticalActual={baseVerticalActual}
                            baseVerticalAnterior={baseVerticalAnterior}
                        />
                    ))
                )}

                {isLoading ? <p>Cargando...</p> : (
                    costosAgrupados.map(cuenta => (
                        <CuentaRowComparativa
                            key={cuenta.id_cuenta}
                            cuenta={cuenta}
                            tipo="Costo"
                            datosAnteriores={{ cuentas: datosAnteriores?.costosAgrupados || [] }}
                            baseVerticalActual={baseVerticalActual}
                            baseVerticalAnterior={baseVerticalAnterior}
                        />
                    ))
                )}
            </div>

            <div className="min-w-[700px]">
                <TotalRowComparativa
                    label="UTILIDAD BRUTA"
                    totalActual={utilidadBruta}
                    totalAnterior={utilidadBrutaAnterior}
                    tipo="Resultado"
                    baseVerticalActual={baseVerticalActual}
                    baseVerticalAnterior={baseVerticalAnterior}
                    isMainTotal={true}
                />
            </div>

            <h1 className="text-red-700 font-semibold text-lg mt-4">Gastos Operativos</h1>
            <div className="mt-2 mb-3 min-w-[700px]">
                {isLoading ? <p>Cargando...</p> : (
                    // --- 4. CORREGIDO: GASTOS ES UN OBJETO AGRUPADO ---
                    Object.entries(gastosAgrupados).map(([subtipoNombre, data]) => {
                        const dataAnterior = datosAnteriores?.gastosAgrupados?.[subtipoNombre] || { cuentas: [], total: 0 };
                        return (
                            <div key={subtipoNombre} className="mb-1">
                                {data.cuentas.map(cuenta => (
                                    <CuentaRowComparativa
                                        key={cuenta.id_cuenta}
                                        cuenta={cuenta}
                                        tipo="Gasto"
                                        datosAnteriores={dataAnterior}
                                        baseVerticalActual={baseVerticalActual}
                                        baseVerticalAnterior={baseVerticalAnterior}
                                    />
                                ))}
                            </div>
                        )
                    })
                )}
                <TotalRowComparativa
                    label="TOTAL GASTOS"
                    totalActual={totalGastos}
                    totalAnterior={totalGastosAnterior}
                    tipo="Gasto" // Tipo Gasto (positivo)
                    baseVerticalActual={baseVerticalActual}
                    baseVerticalAnterior={baseVerticalAnterior}
                />
            </div>

            <div className="min-w-[700px]"> 
                <TotalRowComparativa
                    label="UTILIDAD ANTES DE IMPUESTOS"
                    totalActual={utilidadAntesDeImpuestos}
                    totalAnterior={utilidadAntesDeImpuestosAnterior}
                    tipo="Resultado"
                    baseVerticalActual={baseVerticalActual}
                    baseVerticalAnterior={baseVerticalAnterior}
                    isMainTotal={true}
                />


                <TotalRowComparativa
                    label="(-) Impuesto Sobre la Renta (30%)"
                    totalActual={impuestoIR}
                    totalAnterior={impuestoIRAnterior}
                    tipo="Gasto"
                    baseVerticalActual={baseVerticalActual}
                    baseVerticalAnterior={baseVerticalAnterior}
                />
            </div>

            <div className="bg-secondary/20 p-2 rounded-lg mt-2 min-w-[700px]">
                <TotalRowComparativa
                    label="UTILIDAD NETA (O PÉRDIDA)"
                    totalActual={utilidadNeta}
                    totalAnterior={utilidadNetaAnterior}
                    tipo="Resultado"
                    baseVerticalActual={baseVerticalActual}
                    baseVerticalAnterior={baseVerticalAnterior}
                    isMainTotal={true}
                />
            </div>

        </div>
    );
}