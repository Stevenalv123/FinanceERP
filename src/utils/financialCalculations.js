// /utils/financialCalculations.js

// Helper para encontrar saldos (sin cambios, el error no estaba aquí)
const findSaldo = (cuentas, nombres) => {
    const nombresLower = nombres.map(n => n.toLowerCase());
    let total = 0;

    // Maneja tanto los objetos (activosAgrupados) como los arrays (patrimonio)
    if (Array.isArray(cuentas)) {
        cuentas.forEach(cuenta => {
            if (nombresLower.includes(cuenta.cuenta?.toLowerCase())) {
                total += cuenta.saldo;
            }
        });
    } else if (typeof cuentas === 'object' && cuentas !== null) {
        Object.values(cuentas).forEach(subtipo => {
            subtipo.cuentas.forEach(cuenta => {
                if (nombresLower.includes(cuenta.cuenta?.toLowerCase())) {
                    total += cuenta.saldo;
                }
            });
        });
    }
    return total;
};

// Esta es la lógica que estaba dentro de tu FlujoEfectivoReporte.jsx
export const calcularFlujoDeEfectivo = (datosActuales, datosAnteriores) => {
    const f = {
        utilidadNeta: 0, gastoDepreciacion: 0,
        cambioClientes: 0, cambioInventario: 0, cambioProveedores: 0,
        f_operacion: 0,
        cambioActivosFijos: 0, f_inversion: 0,
        cambioPrestamos: 0, cambioCapital: 0,
        f_financiacion: 0,
        flujoNetoTotal: 0,
        cajaInicial: 0, cajaFinal: 0,
    };

    if (!datosActuales || !datosAnteriores) return f;

    // --- 1. FLUJO DE OPERACIÓN ---
    f.utilidadNeta = (datosActuales.utilidadNeta || 0) - (datosAnteriores.utilidadNeta || 0);

    // --- CORRECCIONES: Pasar arrays [] en lugar de strings ---
    const deprecActual = findSaldo(datosActuales.gastosAgrupados || [], ["Gasto por Depreciación"]);
    const deprecAnterior = findSaldo(datosAnteriores.gastosAgrupados || [], ["Gasto por Depreciación"]);
    f.gastoDepreciacion = deprecActual - deprecAnterior;

    const clientesActual = findSaldo(datosActuales.activosAgrupados || {}, ["Clientes"]);
    const clientesAnterior = findSaldo(datosAnteriores.activosAgrupados || {}, ["Clientes"]);
    f.cambioClientes = clientesActual - clientesAnterior;

    const inventarioActual = findSaldo(datosActuales.activosAgrupados || {}, ["Inventario"]);
    const inventarioAnterior = findSaldo(datosAnteriores.activosAgrupados || {}, ["Inventario"]);
    f.cambioInventario = inventarioActual - inventarioAnterior;

    const proveedoresActual = findSaldo(datosActuales.pasivosAgrupados || {}, ["Proveedores"]);
    const proveedoresAnterior = findSaldo(datosAnteriores.pasivosAgrupados || {}, ["Proveedores"]);
    f.cambioProveedores = proveedoresActual - proveedoresAnterior;

    f.f_operacion = f.utilidadNeta + f.gastoDepreciacion - f.cambioClientes - f.cambioInventario + f.cambioProveedores;

    // --- 2. FLUJO DE INVERSIÓN ---
    const afActual = (datosActuales.activosAgrupados["Activo No Corriente"]?.total || 0);
    const afAnterior = (datosAnteriores.activosAgrupados["Activo No Corriente"]?.total || 0);
    f.cambioActivosFijos = afActual - afAnterior;
    f.f_inversion = -f.cambioActivosFijos;

    // --- 3. FLUJO DE FINANCIACIÓN ---
    const prestamosActual = findSaldo(datosActuales.pasivosAgrupados || {}, ["Documentos por pagar largo plazo"]);
    const prestamosAnterior = findSaldo(datosAnteriores.pasivosAgrupados || {}, ["Documentos por pagar largo plazo"]);
    f.cambioPrestamos = prestamosActual - prestamosAnterior;

    const capitalActual = findSaldo(datosActuales.patrimonio || [], ["Capital Social"]);
    const capitalAnterior = findSaldo(datosAnteriores.patrimonio || [], ["Capital Social"]);
    f.cambioCapital = capitalActual - capitalAnterior;

    f.f_financiacion = f.cambioPrestamos + f.cambioCapital;

    // --- 4. TOTALES Y RECONCILIACIÓN (CORREGIDO) ---
    f.flujoNetoTotal = f.f_operacion + f.f_inversion + f.f_financiacion;
    // Combinar "Caja" y "Banco" para el efectivo
    f.cajaInicial = findSaldo(datosAnteriores.activosAgrupados || {}, ["Caja", "Banco"]);
    f.cajaFinal = findSaldo(datosActuales.activosAgrupados || {}, ["Caja", "Banco"]);

    return f;
};