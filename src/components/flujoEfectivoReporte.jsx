import React, { useMemo } from 'react';

// --- Helper: Fila para el reporte de flujo ---
// Muestra el concepto y el monto. Si es un subtotal, lo pone en negrita.
const FlujoRow = ({ label, monto, isSubtotal = false, isTotal = false }) => {
    const montoClase = monto >= 0 ? 'text-title' : 'text-red-500';
    const formatoMonto = `C$ ${monto.toFixed(2)}`;

    if (isTotal) {
        return (
            <div className="flex justify-between items-center py-2 mt-2 p-2 rounded-lg">
                <span className="text-md font-semibold text-title">{label}</span>
                <span className={`text-md font-semibold ${montoClase}`}>{formatoMonto}</span>
            </div>
        );
    }

    return (
        <div className={`flex justify-between items-center py-1.5 ${isSubtotal ? 'font-semibold border-t border-secondary pt-2' : ''}`}>
            <span className={`text-sm ${isSubtotal ? 'text-title' : 'text-subtitle'} ${!isSubtotal ? 'pl-4' : ''}`}>
                {label}
            </span>
            <span className={`text-sm ${montoClase}`}>{formatoMonto}</span>
        </div>
    );
};

// --- Helper: Función para encontrar el saldo de una cuenta por su nombre ---
// (Busca dentro de los objetos 'agrupados' que ya creaste)
const findSaldo = (agrupados, nombre) => {
    if (!agrupados) return 0;
    for (const subtipo in agrupados) {
        if (agrupados[subtipo].cuentas) {
            const cuenta = agrupados[subtipo].cuentas.find(c => c.cuenta === nombre);
            if (cuenta) return cuenta.saldo;
        }
    }
    return 0;
};

// --- Helper: Función para encontrar el saldo en el array de Patrimonio ---
const findSaldoPatrimonio = (patrimonioArray, nombre) => {
    if (!patrimonioArray) return 0;
    const cuenta = patrimonioArray.find(c => c.cuenta === nombre);
    return cuenta ? cuenta.saldo : 0;
};


// --- Componente Principal del Reporte ---
export default function FlujoEfectivoReporte({ isLoading, datosActuales, datosAnteriores }) {

    // El corazón del Flujo de Efectivo: un 'useMemo' para calcular todo
    const flujo = useMemo(() => {
        // Objeto de retorno por defecto
        const f = {
            utilidadNeta: 0, gastoDepreciacion: 0,
            cambioClientes: 0, cambioInventario: 0, cambioProveedores: 0,
            f_operacion: 0,
            cambioActivosFijos: 0,
            f_inversion: 0,
            cambioPrestamos: 0, cambioCapital: 0,
            f_financiacion: 0,
            flujoNetoTotal: 0,
            cajaInicial: 0, cajaFinal: 0,
        };

        // Si no hay datos, retorna el objeto vacío
        if (!datosActuales || !datosAnteriores) return f;

        // --- 1. FLUJO DE OPERACIÓN ---

        // A. Utilidad Neta del PERÍODO
        f.utilidadNeta = (datosActuales.utilidadNeta || 0) - (datosAnteriores.utilidadNeta || 0);

        // B. Ajustes (Partidas no monetarias)
        const deprecActual = findSaldo(datosActuales.gastosAgrupados, "Gasto por Depreciación");
        const deprecAnterior = findSaldo(datosAnteriores.gastosAgrupados, "Gasto por Depreciación");
        f.gastoDepreciacion = deprecActual - deprecAnterior;

        // C. Cambios en Capital de Trabajo
        const clientesActual = findSaldo(datosActuales.activosAgrupados, "Clientes");
        const clientesAnterior = findSaldo(datosAnteriores.activosAgrupados, "Clientes");
        f.cambioClientes = clientesActual - clientesAnterior; // Aumento de Activo = Resta Flujo

        const inventarioActual = findSaldo(datosActuales.activosAgrupados, "Inventario");
        const inventarioAnterior = findSaldo(datosAnteriores.activosAgrupados, "Inventario");
        f.cambioInventario = inventarioActual - inventarioAnterior; // Aumento de Activo = Resta Flujo

        const proveedoresActual = findSaldo(datosActuales.pasivosAgrupados, "Proveedores");
        const proveedoresAnterior = findSaldo(datosAnteriores.pasivosAgrupados, "Proveedores");
        f.cambioProveedores = proveedoresActual - proveedoresAnterior; // Aumento de Pasivo = Suma Flujo

        // Total Operación
        f.f_operacion = f.utilidadNeta + f.gastoDepreciacion - f.cambioClientes - f.cambioInventario + f.cambioProveedores;

        // --- 2. FLUJO DE INVERSIÓN ---
        // (Simplificado: suma de cambios en Activos No Corrientes)
        const equipoOficinaActual = findSaldo(datosActuales.activosAgrupados, "Equipo de Oficina");
        const equipoOficinaAnterior = findSaldo(datosAnteriores.activosAgrupados, "Equipo de Oficina");
        const eqTransporteActual = findSaldo(datosActuales.activosAgrupados, "Equipo de Transporte");
        const eqTransporteAnterior = findSaldo(datosAnteriores.activosAgrupados, "Equipo de Transporte");

        f.cambioActivosFijos = (equipoOficinaActual + eqTransporteActual) - (equipoOficinaAnterior + eqTransporteAnterior);
        f.f_inversion = -f.cambioActivosFijos; // Aumento de Activo = Compra = Resta Flujo

        // --- 3. FLUJO DE FINANCIACIÓN ---
        const prestamosActual = findSaldo(datosActuales.pasivosAgrupados, "Documentos por pagar Largo plazo") || 0;
        const prestamosAnterior = findSaldo(datosAnteriores.pasivosAgrupados, "Documentos por pagar Largo plazo") || 0;
        f.cambioPrestamos = prestamosActual - prestamosAnterior; // Aumento de Pasivo = Suma Flujo

        const capitalActual = findSaldoPatrimonio(datosActuales.patrimonio, "Capital Social") || 0;
        const capitalAnterior = findSaldoPatrimonio(datosAnteriores.patrimonio, "Capital Social") || 0;
        f.cambioCapital = capitalActual - capitalAnterior; // Aumento de Patrimonio = Suma Flujo

        f.f_financiacion = f.cambioPrestamos + f.cambioCapital;

        // --- 4. TOTALES Y RECONCILIACIÓN ---
        f.flujoNetoTotal = f.f_operacion + f.f_inversion + f.f_financiacion;

        f.cajaInicial = findSaldo(datosAnteriores.activosAgrupados, "Caja");
        f.cajaFinal = findSaldo(datosActuales.activosAgrupados, "Caja");

        return f;

    }, [datosActuales, datosAnteriores]);


    if (isLoading) {
        return <p className="text-center text-subtitle mt-10">Cargando datos...</p>;
    }

    return (
        <div className="mt-4 rounded-xl border-1 border-secondary p-4 w-full md:w-2/3 mx-auto">
            <h1 className="text-title font-semibold text-lg">Flujo de Efectivo (Método Indirecto)</h1>
            <p className="text-subtitle">Análisis del movimiento de efectivo</p>

            <div className="mt-4">
                <h2 className="text-green-600 font-semibold">Actividades de Operación</h2>
                <div className="mt-2 flex flex-col gap-1">
                    <FlujoRow label="Utilidad Neta del Período" monto={flujo.utilidadNeta} />
                    <FlujoRow label="Gasto por Depreciación" monto={flujo.gastoDepreciacion} />
                    <FlujoRow label="Ajuste por Cuentas por Cobrar" monto={-flujo.cambioClientes} />
                    <FlujoRow label="Ajuste por Inventario" monto={-flujo.cambioInventario} />
                    <FlujoRow label="Ajuste por Cuentas por Pagar" monto={flujo.cambioProveedores} />
                    <FlujoRow label="Efectivo de Actividades de Operación" monto={flujo.f_operacion} isSubtotal={true} />
                </div>
            </div>

            <div className="mt-4">
                <h2 className="text-blue-500 font-semibold">Actividades de Inversión</h2>
                <div className="mt-2 flex flex-col gap-1">
                    <FlujoRow label="Compra de Activos Fijos" monto={-flujo.cambioActivosFijos} />
                    <FlujoRow label="Efectivo de Actividades de Inversión" monto={flujo.f_inversion} isSubtotal={true} />
                </div>
            </div>

            <div className="mt-4">
                <h2 className="text-purple-500 font-semibold">Actividades de Financiación</h2>
                <div className="mt-2 flex flex-col gap-1">
                    <FlujoRow label="Aumento (Disminución) de Préstamos" monto={flujo.cambioPrestamos} />
                    <FlujoRow label="Aumento (Disminución) de Capital" monto={flujo.cambioCapital} />
                    <FlujoRow label="Efectivo de Actividades de Financiación" monto={flujo.f_financiacion} isSubtotal={true} />
                </div>
            </div>

            <div className="mt-4">
                <FlujoRow label="Flujo Neto de Efectivo del Período" monto={flujo.flujoNetoTotal} isTotal={true} />
                <FlujoRow label="Saldo Inicial de Efectivo" monto={flujo.cajaInicial} isSubtotal={true} />
                <FlujoRow label="Saldo Final de Efectivo (Calculado)" monto={flujo.cajaInicial + flujo.flujoNetoTotal} isSubtotal={true} />
            </div>

            <div className="mt-4 border-t border-secondary pt-2">
                <FlujoRow label="Saldo Final en Balance (Real)" monto={flujo.cajaFinal} isSubtotal={true} />
            </div>
        </div>
    );
}